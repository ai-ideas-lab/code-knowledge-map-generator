import fs from 'fs-extra';
import path from 'path';
import { AnalysisConfig, GenerateResult, AnalysisResult } from './types.js';

export class DocumentGenerator {
  private config: AnalysisConfig;
  private analysisResult: AnalysisResult;

  constructor(config: AnalysisConfig, analysisResult: AnalysisResult) {
    this.config = config;
    this.analysisResult = analysisResult;
  }

  async generate(): Promise<GenerateResult> {
    const format = this.config.format || "markdown" || 'markdown';
    console.log(`📄 生成${format.toUpperCase()}格式文档...`);
    
    const startTime = Date.now();
    const generatedFiles: string[] = [];
    
    // 确保输出目录存在
    await fs.ensureDir(this.config.outputPath || "./knowledge-map");
    
    switch (format) {
      case 'markdown':
        generatedFiles.push(...await this.generateMarkdown());
        break;
      case 'json':
        generatedFiles.push(...await this.generateJSON());
        break;
      case 'html':
        generatedFiles.push(...await this.generateHTML());
        break;
      default:
        throw new Error(`不支持的格式: ${this.config.format || "markdown"}`);
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      outputPath: this.config.outputPath || "./knowledge-map",
      format: this.config.format || "markdown",
      stats: this.analysisResult.metrics,
      insights: this.analysisResult.insights,
      generatedFiles,
      processingTime
    };
  }

  private async generateMarkdown(): Promise<string[]> {
    const files: string[] = [];
    const timestamp = new Date().toISOString().split('T')[0];
    
    // 主文档
    const mainDoc = `# 代码库知识地图 - ${timestamp}

> AI驱动的代码库分析和文档生成工具

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 总文件数 | ${this.analysisResult.metrics.totalFiles} |
| 总代码行数 | ${this.analysisResult.metrics.totalLines.toLocaleString()} |
| 函数总数 | ${this.analysisResult.metrics.totalFunctions} |
| 类总数 | ${this.analysisResult.metrics.totalClasses} |
| 平均复杂度 | ${this.analysisResult.metrics.averageComplexity.toFixed(2)} |
| 依赖总数 | ${this.analysisResult.dependencies.totalDependencies} |

## 🔍 AI洞察

${this.analysisResult.insights.map(insight => `- ${insight}`).join('\n')}

## 💡 改进建议

${this.analysisResult.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📁 项目结构

${this.generateStructureMarkdown()}

## 🏗️ 依赖分析

${this.generateDependencyMarkdown()}

## 📈 代码质量指标

${this.generateMetricsMarkdown()}

## 🤖 AI架构总结

${this.analysisResult.aiSummary}

---
*由Code Knowledge Map Generator生成*
`;
    
    const mainPath = path.join(this.config.outputPath || "./knowledge-map", 'README.md');
    await fs.writeFile(mainPath, mainDoc);
    files.push(mainPath);
    
    // 生成详细的结构文档
    const structurePath = path.join(this.config.outputPath || "./knowledge-map", 'structure.md');
    await fs.writeFile(structurePath, this.generateDetailedStructureMarkdown());
    files.push(structurePath);
    
    // 生成依赖文档
    const dependencyPath = path.join(this.config.outputPath || "./knowledge-map", 'dependencies.md');
    await fs.writeFile(dependencyPath, this.generateDetailedDependencyMarkdown());
    files.push(dependencyPath);
    
    // 生成质量报告
    const qualityPath = path.join(this.config.outputPath || "./knowledge-map", 'quality-report.md');
    await fs.writeFile(qualityPath, this.generateQualityReportMarkdown());
    files.push(qualityPath);
    
    return files;
  }

  private generateStructureMarkdown(): string {
    const structure = this.analysisResult.structure;
    const directories = structure.filter(item => item.type === 'directory');
    const files = structure.filter(item => item.type === 'file');
    
    let markdown = '### 目录结构\n\n';
    markdown += '```\n';
    markdown += this.generateTreeStructure(structure);
    markdown += '\n```\n\n';
    
    markdown += '### 文件统计\n\n';
    markdown += '#### 按语言分布\n\n';
    
    const languageCount: Record<string, number> = {};
    files.forEach(file => {
      languageCount[file.language] = (languageCount[file.language] || 0) + 1;
    });
    
    Object.entries(languageCount).forEach(([lang, count]) => {
      markdown += `- **${lang}**: ${count}个文件\n`;
    });
    
    markdown += '\n#### 最大文件\n\n';
    this.analysisResult.metrics.largestFiles.forEach((file, index) => {
      markdown += `${index + 1}. **${file.path}** - ${this.formatFileSize(file.size)} (${file.lines.toLocaleString()}行)\n`;
    });
    
    return markdown;
  }

  private generateDetailedStructureMarkdown(): string {
    const structure = this.analysisResult.structure;
    const files = structure.filter(item => item.type === 'file');
    
    let markdown = '# 详细项目结构\n\n';
    
    // 按语言分组
    const languageGroups: Record<string, typeof files> = {};
    files.forEach(file => {
      if (!languageGroups[file.language]) {
        languageGroups[file.language] = [];
      }
      languageGroups[file.language].push(file);
    });
    
    Object.entries(languageGroups).forEach(([language, langFiles]) => {
      markdown += `## ${language} 文件\n\n`;
      
      langFiles
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 20) // 只显示前20个最大的文件
        .forEach(file => {
          markdown += `### ${file.path}\n\n`;
          markdown += `- **大小**: ${this.formatFileSize(file.size)}\n`;
          markdown += `- **行数**: ${file.lines.toLocaleString()}\n`;
          markdown += `- **依赖**: ${file.dependencies.length}个\n`;
          markdown += `- **修改时间**: ${file.lastModified.toLocaleDateString()}\n\n`;
          
          if (file.functions && file.functions.length > 0) {
            markdown += `#### 函数 (${file.functions.length})\n\n`;
            file.functions.slice(0, 5).forEach(func => {
              markdown += `- \`${func.name}()\` - 第${func.line}行 (复杂度: ${func.complexity})\n`;
            });
            if (file.functions.length > 5) {
              markdown += `- ... 还有 ${file.functions.length - 5} 个函数\n`;
            }
            markdown += '\n';
          }
          
          if (file.classes && file.classes.length > 0) {
            markdown += `#### 类 (${file.classes.length})\n\n`;
            file.classes.slice(0, 3).forEach(cls => {
              markdown += `- \`${cls.name}\` - 第${cls.line}行\n`;
            });
            if (file.classes.length > 3) {
              markdown += `- ... 还有 ${file.classes.length - 3} 个类\n`;
            }
            markdown += '\n';
          }
        });
    });
    
    return markdown;
  }

  private generateDependencyMarkdown(): string {
    const deps = this.analysisResult.dependencies;
    
    let markdown = '# 依赖分析\n\n';
    markdown += `## 依赖统计\n\n`;
    markdown += `- **直接依赖**: ${deps.directDependencies.length}个\n`;
    markdown += `- **间接依赖**: ${deps.indirectDependencies.length}个\n`;
    markdown += `- **总依赖数**: ${deps.totalDependencies}个\n\n`;
    
    if (deps.circularDependencies.length > 0) {
      markdown += `## ⚠️ 循环依赖警告\n\n`;
      deps.circularDependencies.forEach((cycle, index) => {
        markdown += `${index + 1}. ${cycle.join(' → ')}\n`;
      });
      markdown += '\n';
    }
    
    markdown += `## 直接依赖列表\n\n`;
    deps.directDependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    
    if (deps.outdatedDependencies && deps.outdatedDependencies.length > 0) {
      markdown += `\n## 🔄 过时依赖\n\n`;
      deps.outdatedDependencies.forEach(dep => {
        markdown += `- **${dep.name}**: ${dep.current} → ${dep.latest} ${dep.isDeprecated ? '(已废弃)' : ''}\n`;
      });
    }
    
    return markdown;
  }

  private generateDetailedDependencyMarkdown(): string {
    const deps = this.analysisResult.dependencies;
    
    let markdown = '# 详细依赖分析\n\n';
    
    // 依赖关系图
    markdown += '## 依赖关系图\n\n';
    markdown += '```mermaid\n';
    markdown += 'graph TD\n';
    
    Object.entries(deps.dependencyGraph).forEach(([file, dependencies]) => {
      const shortName = path.basename(file);
      dependencies.forEach(dep => {
        const shortDep = path.basename(dep);
        markdown += `  ${shortName} --> ${shortDep}\n`;
      });
    });
    
    markdown += '```\n\n';
    
    // 依赖深度分析
    markdown += '## 依赖深度分析\n\n';
    const dependencyDepth: Record<string, number> = {};
    
    Object.entries(deps.dependencyGraph).forEach(([file, dependencies]) => {
      dependencyDepth[file] = this.calculateDependencyDepth(file, deps.dependencyGraph, dependencyDepth);
    });
    
    const sortedByDepth = Object.entries(dependencyDepth)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    sortedByDepth.forEach(([file, depth]) => {
      markdown += `- **${file}**: 深度 ${depth}\n`;
    });
    
    return markdown;
  }

  private calculateDependencyDepth(file: string, graph: Record<string, string[]>, depthCache: Record<string, number>): number {
    if (depthCache[file] !== undefined) {
      return depthCache[file];
    }
    
    const dependencies = graph[file] || [];
    if (dependencies.length === 0) {
      depthCache[file] = 0;
      return 0;
    }
    
    const maxDepth = Math.max(...dependencies.map(dep => 
      this.calculateDependencyDepth(dep, graph, depthCache)
    ));
    
    depthCache[file] = maxDepth + 1;
    return depthCache[file];
  }

  private generateMetricsMarkdown(): string {
    const metrics = this.analysisResult.metrics;
    
    let markdown = '# 代码质量指标\n\n';
    
    // 复杂度分析
    markdown += '## 复杂度分析\n\n';
    markdown += `- **平均函数复杂度**: ${metrics.averageComplexity.toFixed(2)}\n`;
    
    if (metrics.mostComplexFunctions.length > 0) {
      markdown += '\n### 最复杂的函数\n\n';
      metrics.mostComplexFunctions.forEach((func, index) => {
        markdown += `${index + 1}. **${func.name}** (复杂度: ${func.complexity}) - ${func.path}\n`;
      });
    }
    
    // 文件大小分析
    markdown += '\n## 文件大小分析\n\n';
    markdown += `- **最大文件**: ${this.formatFileSize(metrics.largestFiles[0]?.size || 0)} (${metrics.largestFiles[0]?.path || 'N/A'})\n`;
    markdown += `- **平均文件大小**: ${this.formatFileSize(metrics.largestFiles.reduce((sum, f) => sum + f.size, 0) / metrics.largestFiles.length || 0)}\n`;
    
    // 代码行数分析
    markdown += '\n## 代码行数分析\n\n';
    markdown += `- **总代码行数**: ${metrics.totalLines.toLocaleString()}\n`;
    markdown += `- **平均每文件**: ${(metrics.totalLines / metrics.totalFiles).toFixed(0)}行\n`;
    
    return markdown;
  }

  private generateQualityReportMarkdown(): string {
    const metrics = this.analysisResult.metrics;
    const deps = this.analysisResult.dependencies;
    
    let markdown = '# 代码质量报告\n\n';
    
    // 总体评分
    const complexityScore = metrics.averageComplexity < 5 ? '优秀' : 
                           metrics.averageComplexity < 10 ? '良好' : '需要改进';
    
    const dependencyScore = deps.circularDependencies.length === 0 ? '优秀' :
                           deps.circularDependencies.length < 3 ? '良好' : '需要改进';
    
    const fileCountScore = metrics.totalFiles < 50 ? '优秀' :
                          metrics.totalFiles < 200 ? '良好' : '大型项目';
    
    markdown += '## 总体评分\n\n';
    markdown += `| 维度 | 评分 | 说明 |\n`;
    markdown += `|------|------|------|\n`;
    markdown += `| 代码复杂度 | ${complexityScore} | 平均复杂度: ${metrics.averageComplexity.toFixed(2)} |\n`;
    markdown += `| 依赖结构 | ${dependencyScore} | 循环依赖: ${deps.circularDependencies.length}个 |\n`;
    markdown += `| 项目规模 | ${fileCountScore} | 文件数: ${metrics.totalFiles}个 |\n\n`;
    
    // 改进建议
    markdown += '## 改进建议\n\n';
    
    if (metrics.averageComplexity > 10) {
      markdown += '### 🔧 降低复杂度\n\n';
      markdown += `- 考虑拆分大函数\n`;
      markdown += `- 减少嵌套层级\n`;
      markdown += `- 使用设计模式简化代码结构\n\n`;
    }
    
    if (deps.circularDependencies.length > 0) {
      markdown += '### 🔄 解决循环依赖\n\n';
      markdown += `- 重构相关模块\n`;
      markdown += `- 引入依赖注入\n`;
      markdown += `- 创建抽象层\n\n`;
    }
    
    if (metrics.totalFiles > 200) {
      markdown += '### 📂 项目结构优化\n\n';
      markdown += `- 考虑模块化拆分\n`;
      markdown += `- 建立清晰的分层架构\n`;
      markdown += `- 减少模块间耦合\n\n`;
    }
    
    return markdown;
  }

  private async generateJSON(): Promise<string[]> {
    const files: string[] = [];
    
    const mainData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        format: 'json',
        projectPath: this.config.projectPath,
        outputPath: this.config.outputPath || "./knowledge-map"
      },
      summary: {
        totalFiles: this.analysisResult.metrics.totalFiles,
        totalLines: this.analysisResult.metrics.totalLines,
        totalFunctions: this.analysisResult.metrics.totalFunctions,
        totalClasses: this.analysisResult.metrics.totalClasses,
        averageComplexity: this.analysisResult.metrics.averageComplexity
      },
      insights: this.analysisResult.insights,
      recommendations: this.analysisResult.recommendations,
      aiSummary: this.analysisResult.aiSummary,
      structure: this.analysisResult.structure,
      dependencies: this.analysisResult.dependencies,
      metrics: this.analysisResult.metrics
    };
    
    const mainPath = path.join(this.config.outputPath || "./knowledge-map", 'knowledge-map.json');
    await fs.writeFile(mainPath, JSON.stringify(mainData, null, 2));
    files.push(mainPath);
    
    // 生成结构数据
    const structurePath = path.join(this.config.outputPath || "./knowledge-map", 'structure.json');
    await fs.writeFile(structurePath, JSON.stringify({
      structure: this.analysisResult.structure,
      metrics: this.analysisResult.metrics
    }, null, 2));
    files.push(structurePath);
    
    // 生成依赖数据
    const dependencyPath = path.join(this.config.outputPath || "./knowledge-map", 'dependencies.json');
    await fs.writeFile(dependencyPath, JSON.stringify({
      dependencies: this.analysisResult.dependencies,
      circularDependencies: this.analysisResult.dependencies.circularDependencies,
      outdatedDependencies: this.analysisResult.dependencies.outdatedDependencies
    }, null, 2));
    files.push(dependencyPath);
    
    return files;
  }

  private async generateHTML(): Promise<string[]> {
    const files: string[] = [];
    
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码库知识地图</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #007bff; margin: 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .insight, .recommendation { background: #e8f4fd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .recommendation { background: #fff3cd; border-left-color: #ffc107; }
        .code-block { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: 'Courier New', monospace; }
        .file-tree { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre; }
        .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 代码库知识地图</h1>
            <p>AI驱动的代码库分析和文档生成工具</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${this.analysisResult.metrics.totalFiles}</div>
                <div class="stat-label">总文件数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.analysisResult.metrics.totalLines.toLocaleString()}</div>
                <div class="stat-label">总代码行数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.analysisResult.metrics.totalFunctions}</div>
                <div class="stat-label">函数总数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${this.analysisResult.metrics.averageComplexity.toFixed(2)}</div>
                <div class="stat-label">平均复杂度</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🔍 AI洞察</h2>
            ${this.analysisResult.insights.map(insight => `<div class="insight">${insight}</div>`).join('')}
        </div>
        
        <div class="section">
            <h2>💡 改进建议</h2>
            ${this.analysisResult.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
        </div>
        
        <div class="section">
            <h2>📁 项目结构</h2>
            <div class="file-tree">${this.generateTreeStructure(this.analysisResult.structure)}</div>
        </div>
        
        <div class="section">
            <h2>🏗️ 依赖分析</h2>
            <div class="code-block">
                直接依赖: ${this.analysisResult.dependencies.directDependencies.length}个<br>
                间接依赖: ${this.analysisResult.dependencies.indirectDependencies.length}个<br>
                循环依赖: ${this.analysisResult.dependencies.circularDependencies.length}个
            </div>
        </div>
        
        <div class="section">
            <h2>🤖 AI架构总结</h2>
            <div class="insight">${this.analysisResult.aiSummary}</div>
        </div>
        
        <div class="footer">
            <p>由 Code Knowledge Map Generator 于 ${new Date().toLocaleString()} 生成</p>
        </div>
    </div>
</body>
</html>`;
    
    const mainPath = path.join(this.config.outputPath || "./knowledge-map", 'index.html');
    await fs.writeFile(mainPath, htmlTemplate);
    files.push(mainPath);
    
    return files;
  }

  private generateTreeStructure(structure: any[]): string {
    const directories = structure.filter(item => item.type === 'directory');
    const files = structure.filter(item => item.type === 'file');
    
    let tree = '';
    
    // 添加根目录
    tree += '📁 项目根目录\n';
    
    // 添加主要目录
    directories.slice(0, 10).forEach(dir => {
      tree += `  📁 ${dir.name}\n`;
    });
    
    if (directories.length > 10) {
      tree += `  📁 ... 还有 ${directories.length - 10} 个目录\n`;
    }
    
    // 添加主要文件
    files
      .sort((a, b) => b.size - a.size)
      .slice(0, 20)
      .forEach(file => {
        const icon = this.getFileIcon(file.language);
        tree += `  ${icon} ${file.name}\n`;
      });
    
    if (files.length > 20) {
      tree += `  📄 ... 还有 ${files.length - 20} 个文件\n`;
    }
    
    return tree;
  }

  private getFileIcon(language: string): string {
    const iconMap: Record<string, string> = {
      javascript: '📜',
      typescript: '📝',
      vue: '💚',
      python: '🐍',
      java: '☕',
      go: '🔵',
      rust: '🦀',
      cpp: '⚡',
      c: '🔧'
    };
    
    return iconMap[language] || '📄';
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}