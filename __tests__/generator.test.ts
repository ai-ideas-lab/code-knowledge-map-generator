import { describe, it, expect, beforeAll, afterEach } from 'jest';
import { DocumentGenerator } from '../src/generator.js';
import { AnalysisConfig, AnalysisResult } from '../src/types.js';
import fs from 'fs-extra';
import path from 'path';

describe('DocumentGenerator', () => {
  let testDir: string;
  let outputDir: string;
  let mockResult: AnalysisResult;

  beforeAll(async () => {
    testDir = path.join(__dirname, 'test-output');
    outputDir = path.join(testDir, 'output');
    await fs.ensureDir(outputDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  beforeEach(() => {
    mockResult = {
      structure: [
        {
          name: 'index.ts',
          type: 'file',
          path: '/src/index.ts',
          size: 1024,
          lines: 50,
          language: 'typescript',
          dependencies: [],
          functions: [
            {
              name: 'main',
              line: 1,
              parameters: [],
              returnType: 'string',
              complexity: 3,
              isAsync: false,
              isExported: true,
              documentation: undefined
            }
          ],
          classes: [],
          lastModified: new Date()
        },
        {
          name: 'src',
          type: 'directory',
          path: '/src',
          size: 2048,
          lines: 0,
          language: 'directory',
          dependencies: [],
          lastModified: new Date()
        }
      ],
      dependencies: {
        totalDependencies: 1,
        directDependencies: ['lodash'],
        indirectDependencies: [],
        dependencyGraph: {
          '/src/index.ts': ['lodash']
        },
        circularDependencies: [],
        outdatedDependencies: []
      },
      metrics: {
        totalFiles: 10,
        totalLines: 500,
        totalFunctions: 25,
        totalClasses: 5,
        averageComplexity: 2.5,
        largestFiles: [{ path: 'index.ts', size: 1024, lines: 50 }],
        mostComplexFunctions: [{ name: 'complexFunc', complexity: 8, path: 'index.ts' }]
      },
      insights: [
        '项目结构清晰，模块化程度良好',
        '依赖管理规范，无循环依赖'
      ],
      recommendations: [
        '考虑添加TypeScript配置文件',
        '建议增加单元测试覆盖率'
      ],
      aiSummary: '这是一个结构良好的TypeScript项目，具有清晰的代码组织。'
    };
  });

  it('should generate markdown document correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      outputPath: outputDir,
      format: 'markdown',
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    const generator = new DocumentGenerator(config, mockResult);
    await generator.generate();
    
    const mdFile = path.join(outputDir, 'README.md');
    expect(await fs.pathExists(mdFile)).toBe(true);
    
    const content = await fs.readFile(mdFile, 'utf8');
    expect(content).toContain('# 代码库知识地图');
    expect(content).toContain('## 📊 总体统计');
    expect(content).toContain('## 🔍 AI洞察');
  });

  it('should generate JSON document correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      outputPath: outputDir,
      format: 'json',
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    const generator = new DocumentGenerator(config, mockResult);
    await generator.generate();
    
    const jsonFile = path.join(outputDir, 'knowledge-map.json');
    expect(await fs.pathExists(jsonFile)).toBe(true);
    
    const content = await fs.readFile(jsonFile, 'utf8');
    const data = JSON.parse(content);
    expect(data).toHaveProperty('metadata');
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('structure');
  });

  it('should generate HTML document correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      outputPath: outputDir,
      format: 'html',
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    const generator = new DocumentGenerator(config, mockResult);
    await generator.generate();
    
    const htmlFile = path.join(outputDir, 'index.html');
    expect(await fs.pathExists(htmlFile)).toBe(true);
    
    const content = await fs.readFile(htmlFile, 'utf8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<title>代码库知识地图</title>');
  });

  it('should handle output directory creation', async () => {
    const newOutputDir = path.join(testDir, 'new-dir');
    const config: AnalysisConfig = {
      projectPath: testDir,
      outputPath: newOutputDir,
      format: 'markdown',
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    const generator = new DocumentGenerator(config, mockResult);
    await generator.generate();
    
    expect(await fs.pathExists(newOutputDir)).toBe(true);
  });

  it('should throw error for invalid format', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      outputPath: outputDir,
      format: 'invalid' as any,
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    const generator = new DocumentGenerator(config, mockResult);
    
    await expect(generator.generate()).rejects.toThrow('不支持的格式');
  });
});