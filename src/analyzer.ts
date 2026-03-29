import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'glob';
import { load } from 'js-yaml';
import { parse } from 'node-html-parser';
import { AnalysisConfig, AnalysisResult, CodeStructure, DependencyAnalysis, CodeMetrics, PackageInfo } from './types.js';

const execAsync = promisify(exec);

export class CodeAnalyzer {
  private config: AnalysisConfig;

  constructor(config: AnalysisConfig) {
    this.config = config;
  }

  async analyze(): Promise<AnalysisResult> {
    console.log('🔍 开始代码分析...');

    const startTime = Date.now();

    // 1. 扫描目录结构
    const structure = await this.scanStructure();

    // 2. 分析依赖关系
    const dependencies = await this.analyzeDependencies(structure);

    // 3. 计算代码指标
    const metrics = this.calculateMetrics(structure);

    // 4. AI智能分析
    const aiAnalysis = await this.performAIAnalysis(structure, metrics);

    const processingTime = Date.now() - startTime;

    return {
      structure,
      dependencies,
      metrics,
      insights: aiAnalysis.insights,
      recommendations: aiAnalysis.recommendations,
      aiSummary: aiAnalysis.summary
    };
  }

  private async scanStructure(): Promise<CodeStructure[]> {
    const structure: CodeStructure[] = [];
    const files = await this.scanFiles(this.config.targetPath);

    for (const file of files) {
      const stat = await fs.stat(file);
      const relativePath = path.relative(this.config.targetPath, file);

      if (stat.isDirectory()) {
        structure.push({
          name: path.basename(file),
          type: 'directory',
          path: relativePath,
          size: 0,
          lines: 0,
          language: 'directory',
          dependencies: [],
          lastModified: stat.mtime
        });
      } else {
        const content = await fs.readFile(file, 'utf-8');
        const language = this.detectLanguage(file);
        const lines = content.split('\n').length;
        const dependencies = this.extractDependencies(content, language);

        structure.push({
          name: path.basename(file),
          type: 'file',
          path: relativePath,
          size: stat.size,
          lines,
          language,
          dependencies,
          functions: this.extractFunctions(content, language),
          classes: this.extractClasses(content, language),
          lastModified: stat.mtime
        });
      }
    }

    return structure;
  }

  private async scanFiles(dir: string): Promise<string[]> {
    const pattern = this.config.includeTests
      ? '**/*.{js,ts,jsx,tsx,vue,py,java,go,rs,cpp,c,h}'
      : '**/*.{js,ts,jsx,tsx,vue,py,java,go,rs,cpp,c,h}';

    const options = {
      cwd: dir,
      nodir: false,
      ignore: this.config.excludePatterns || ['node_modules', '.git', 'dist', 'build']
    };

    return await glob(pattern, options);
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'javascript',
      '.tsx': 'typescript',
      '.vue': 'vue',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.h': 'c'
    };

    return languageMap[ext] || 'unknown';
  }

  private extractDependencies(content: string, language: string): string[] {
    const dependencies: string[] = [];

    if (language === 'javascript' || language === 'typescript') {
      // CommonJS/ES Modules imports
      const importMatches = content.match(/(?:import|require)\s*['"`]([^'"`]+)['"`]/g);
      if (importMatches) {
        dependencies.push(...importMatches.map(match =>
          match.match(/['"`]([^'"`]+)['"`]/)?.[1] || ''
        ).filter(Boolean));
      }
    } else if (language === 'python') {
      // Python imports
      const importMatches = content.match(/(?:import|from)\s+([^\s]+)/g);
      if (importMatches) {
        dependencies.push(...importMatches.map(match =>
          match.match(/(?:import|from)\s+([^\s]+)/)?.[1] || ''
        ).filter(Boolean));
      }
    } else if (language === 'java') {
      // Java imports
      const importMatches = content.match(/import\s+([^\s;]+)/g);
      if (importMatches) {
        dependencies.push(...importMatches.map(match =>
          match.match(/import\s+([^\s;]+)/)?.[1] || ''
        ).filter(Boolean));
      }
    }

    return dependencies.filter(dep => !dep.startsWith('./') && !dep.startsWith('../'));
  }

  private extractFunctions(content: string, language: string) {
    const functions = [];
    let match;

    // 语言特定的函数提取
    if (language === 'javascript' || language === 'typescript') {
      // JS/TS: function declaration, function expression, arrow function, method
      const functionRegex = /(?:function\s+([^\s(]+)\s*\([^)]*\)\s*{)|(?:([^\s(]+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|=>))/g;

      while ((match = functionRegex.exec(content)) !== null) {
        const name = match[1] || match[2];
        if (name && !name.startsWith('(')) { // 排除箭头函数无名情况
          functions.push({
            name,
            line: this.getLineNumber(content, match.index),
            parameters: [], // 简化版，实际应该解析参数
            returnType: 'unknown',
            complexity: this.calculateComplexity(content, match.index),
            isAsync: content.includes('async', match.index - 100),
            isExported: this.isExported(content, match.index),
            documentation: this.extractDocumentation(content, match.index)
          });
        }
      }
    } else if (language === 'python') {
      // Python: def statements
      const functionRegex = /def\s+([^\s(]+)\s*\([^)]*\)\s*:/g;

      while ((match = functionRegex.exec(content)) !== null) {
        functions.push({
          name: match[1],
          line: this.getLineNumber(content, match.index),
          parameters: [],
          returnType: 'unknown',
          complexity: 1,
          isAsync: content.includes('async', match.index - 100),
          isExported: this.isExported(content, match.index),
          documentation: this.extractDocumentation(content, match.index)
        });
      }
    } else if (language === 'java') {
      // Java: method declarations
      const functionRegex = /(?:public|private|protected)?\s*(?:static\s+)?(?:async\s+)?(?:[\w<>]+\s+)?([^\s(]+)\s*\([^)]*\)\s*(?:throws\s+[\w\s,]+)?\s*{/g;

      while ((match = functionRegex.exec(content)) !== null) {
        functions.push({
          name: match[1],
          line: this.getLineNumber(content, match.index),
          parameters: [],
          returnType: 'unknown',
          complexity: this.calculateComplexity(content, match.index),
          isAsync: content.includes('async', match.index - 100),
          isExported: this.isExported(content, match.index),
          documentation: this.extractDocumentation(content, match.index)
        });
      }
    }

    return functions;
  }

  private extractClasses(content: string, language: string) {
    const classes = [];
    let match;
    
    // 语言特定的类提取
    if (language === 'javascript' || language === 'typescript') {
      // JS/TS: class declarations
      const classRegex = /(?:export\s+)?(?:abstract\s+)?class\s+([^\s{]+)/g;
      
      while ((match = classRegex.exec(content)) !== null) {
        classes.push({
          name: match[1],
          line: this.getLineNumber(content, match.index),
          methods: [], // 简化版，实际应该提取方法
          properties: [], // 简化版，实际应该提取属性
          extends: this.extractExtends(content, match.index),
          implements: [], // 简化版
          documentation: this.extractDocumentation(content, match.index)
        });
      }
    } else if (language === 'python') {
      // Python: class declarations
      const classRegex = /class\s+([^\s(:]+)/g;
      
      while ((match = classRegex.exec(content)) !== null) {
        classes.push({
          name: match[1],
          line: this.getLineNumber(content, match.index),
          methods: [],
          properties: [],
          extends: this.extractExtends(content, match.index),
          implements: [],
          documentation: this.extractDocumentation(content, match.index)
        });
      }
    } else if (language === 'java') {
      // Java: class declarations
      const classRegex = /(?:public|private|protected)?\s*class\s+([^\s{]+)/g;
      
      while ((match = classRegex.exec(content)) !== null) {
        classes.push({
          name: match[1],
          line: this.getLineNumber(content, match.index),
          methods: [],
          properties: [],
          extends: this.extractExtends(content, match.index),
          implements: [],
          documentation: this.extractDocumentation(content, match.index)
        });
      }
    }
    
    return classes;
  }

  private extractDocumentation(content: string, position: number): string {
    const linesBefore = content.substring(0, position).split('\n');
    const docComments = [];

    // 向上查找文档注释
    for (let i = linesBefore.length - 1; i >= Math.max(0, linesBefore.length - 10); i--) {
      const line = linesBefore[i].trim();
      if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        docComments.unshift(line.replace(/^\/\/\/?\s*/, '').replace(/^\*\s*/, ''));
      } else if (line && !line.startsWith('*')) {
        break;
      }
    }

    return docComments.join('\n');
  }

  private getLineNumber(content: string, position: number): number {
    return content.substring(0, position).split('\n').length;
  }

  private calculateComplexity(content: string, position: number): number {
    // 简化的复杂度计算，统计控制结构
    const localContent = content.substring(0, position + 100);
    const controlStructures = (localContent.match(/\b(if|for|while|switch|case|catch|try)\b/g) || []).length;
    return Math.max(1, controlStructures);
  }

  private isExported(content: string, position: number): boolean {
    const localContent = content.substring(Math.max(0, position - 100), position);
    return localContent.includes('export') || localContent.includes('module.exports');
  }

  private extractExtends(content: string, position: number): string | null {
    const localContent = content.substring(position, position + 200);
    const extendsMatch = localContent.match(/extends\s+([^\s{]+)/);
    return extendsMatch ? extendsMatch[1] : null;
  }

  private async analyzeDependencies(structure: CodeStructure[]): Promise<DependencyAnalysis> {
    const allDependencies = new Set<string>();
    const directDependencies = new Set<string>();
    const dependencyGraph: Record<string, string[]> = {};
    const circularDependencies: string[][] = [];

    // 收集所有依赖
    structure.filter(item => item.type === 'file').forEach(file => {
      const validDependencies = file.dependencies.filter(dep => dep && typeof dep === 'string');
      validDependencies.forEach(dep => allDependencies.add(dep));
      dependencyGraph[file.path] = validDependencies;

      // 识别直接依赖（项目内部依赖）
      file.dependencies.forEach(dep => {
        if (!dep.startsWith('@') && !dep.startsWith('.') && !dep.startsWith('http')) {
          directDependencies.add(dep);
        }
      });
    });

    // 检测循环依赖（简化版）
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (node: string, path: string[] = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          circularDependencies.push([...path.slice(cycleStart), node]);
        }
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const deps = dependencyGraph[node] || [];
      deps.forEach(dep => detectCycle(dep, [...path, node]));

      recursionStack.delete(node);
    };

    Object.keys(dependencyGraph).forEach(node => detectCycle(node));

    // 检查过时的依赖（简化版）
    const outdatedDependencies = await this.checkOutdatedDependencies(Array.from(directDependencies));

    return {
      totalDependencies: allDependencies.size,
      directDependencies: Array.from(directDependencies),
      indirectDependencies: Array.from(allDependencies).filter(dep => !directDependencies.has(dep)),
      dependencyGraph,
      circularDependencies,
      outdatedDependencies
    };
  }

  private async checkOutdatedDependencies(dependencies: string[]): Promise<PackageInfo[]> {
    // 简化的过时依赖检查，实际应该使用npm outdated或类似工具
    const outdated: PackageInfo[] = [];

    for (const dep of dependencies) {
      try {
        // 这里应该调用实际的包管理器API
        // 简化版本，返回示例数据
        outdated.push({
          name: dep,
          current: '1.0.0',
          latest: '2.0.0',
          isDeprecated: false
        });
      } catch (error) {
        // 忽略检查失败的依赖
      }
    }

    return outdated;
  }

  private calculateMetrics(structure: CodeStructure[]): CodeMetrics {
    const totalFiles = structure.filter(item => item.type === 'file').length;
    const totalLines = structure.reduce((sum, item) => sum + item.lines, 0);
    const totalFunctions = structure.reduce((sum, item) => sum + (item.functions?.length || 0), 0);
    const totalClasses = structure.reduce((sum, item) => sum + (item.classes?.length || 0), 0);

    // 计算平均复杂度
    const allComplexities = structure
      .flatMap(item => item.functions || [])
      .map(func => func?.complexity || 1);

    const averageComplexity = allComplexities.length > 0
      ? allComplexities.reduce((sum, comp) => sum + comp, 0) / allComplexities.length
      : 1;

    // 找出最大的文件
    const largestFiles = structure
      .filter(item => item.type === 'file')
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(file => ({
        path: file.path,
        size: file.size,
        lines: file.lines
      }));

    // 找出最复杂的函数
    const mostComplexFunctions = structure
      .flatMap(item =>
        (item.functions || []).map(func => ({
          name: func.name,
          complexity: func.complexity,
          path: item.path
        }))
      )
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);

    return {
      totalFiles,
      totalLines,
      totalFunctions,
      totalClasses,
      averageComplexity,
      largestFiles,
      mostComplexFunctions
    };
  }

  private async performAIAnalysis(structure: CodeStructure[], metrics: CodeMetrics) {
    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const prompt = `
你是一位资深的代码架构专家。请基于以下代码库信息，提供深入的分析和洞察：

代码结构概览：
- 总文件数: ${metrics.totalFiles}
- 总代码行数: ${metrics.totalLines}
- 函数总数: ${metrics.totalFunctions}
- 类总数: ${metrics.totalClasses}
- 平均复杂度: ${metrics.averageComplexity}

文件分布（按语言）：
${this.getLanguageDistribution(structure)}

架构特点：
${this.getArchitectureSummary(structure)}

请提供：
1. 3-5个关键洞察
2. 3-5个改进建议
3. 一段整体架构总结（200字以内）

请用JSON格式返回，包含字段：insights, recommendations, summary
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "你是一位资深的软件架构专家，擅长分析代码库结构和提供专业建议。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const parsed = JSON.parse(content);
        return {
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || [],
          summary: parsed.summary || ''
        };
      } catch {
        // 如果解析失败，进行简单文本处理
        return {
          insights: ['代码库分析完成'],
          recommendations: ['继续优化代码结构'],
          summary: (content || '').substring(0, 200) + '...'
        };
      }

    } catch (error) {
      console.warn('AI分析失败，使用基础分析:', error);
      return {
        insights: [
          `代码库包含${metrics.totalFiles}个文件`,
          `总代码行数: ${metrics.totalLines}`,
          `平均复杂度: ${metrics.averageComplexity.toFixed(2)}`
        ],
        recommendations: [
          '考虑降低代码复杂度',
          '增加单元测试覆盖率',
          '优化依赖结构'
        ],
        summary: '代码库结构分析完成，建议进一步优化架构设计。'
      };
    }
  }

  private getLanguageDistribution(structure: CodeStructure[]): string {
    const languageCount: Record<string, number> = {};

    structure.forEach(item => {
      if (item.type === 'file') {
        languageCount[item.language] = (languageCount[item.language] || 0) + 1;
      }
    });

    return Object.entries(languageCount)
      .map(([lang, count]) => `  - ${lang}: ${count}个文件`)
      .join('\n');
  }

  private getArchitectureSummary(structure: CodeStructure[]): string {
    const directories = structure.filter(item => item.type === 'directory');
    const files = structure.filter(item => item.type === 'file');

    return [
      `目录结构: ${directories.length}个目录`,
      `文件分布: ${files.length}个代码文件`,
      `平均文件大小: ${Math.round(files.reduce((sum, f) => sum + f.size, 0) / files.length || 0)}字节`
    ].join('\n');
  }
}