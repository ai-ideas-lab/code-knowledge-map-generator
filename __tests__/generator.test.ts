import { describe, it, expect, beforeAll, afterEach } from 'jest';
import { DocumentGenerator } from '../src/generator.js';
import { AnalysisResult } from '../src/types.js';
import fs from 'fs-extra';
import path from 'path';

describe('DocumentGenerator', () => {
  let testDir: string;
  let outputDir: string;
  let generator: DocumentGenerator;
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
          type: 'file',
          name: 'index.ts',
          path: '/src/index.ts',
          size: 1024,
          language: 'typescript',
          lines: 50,
          functions: 2,
          complexity: 3
        },
        {
          type: 'directory',
          name: 'src',
          path: '/src',
          size: 2048,
          files: 3,
          subdirectories: 1
        }
      ],
      dependencies: {
        directDependencies: [
          'lodash'
        ],
        indirectDependencies: [],
        circular: [],
        outdated: []
      },
      metrics: {
        totalFiles: 10,
        totalLines: 500,
        averageComplexity: 2.5,
        largestFiles: [{ path: 'index.ts', size: 1024, lines: 50 }],
        averageFileSize: 512
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

    generator = new DocumentGenerator({ projectPath: testDir, outputPath: testDir, 
      projectPath: testDir,
      outputPath: outputDir,
      format: 'markdown'
    }, mockResult);
  });

  it('should generate markdown document correctly', async () => {
    await generator.generate();
    
    const mdFile = path.join(outputDir, 'README.md');
    expect(await fs.pathExists(mdFile)).toBe(true);
    
    const content = await fs.readFile(mdFile, 'utf8');
    expect(content).toContain('# Code Knowledge Map');
    expect(content).toContain('## 项目统计');
    expect(content).toContain('## AI洞察');
  });

  it('should generate JSON document correctly', async () => {
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
    await generator.generate();
    
    const htmlFile = path.join(outputDir, 'index.html');
    expect(await fs.pathExists(htmlFile)).toBe(true);
    
    const content = await fs.readFile(htmlFile, 'utf8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<title>Code Knowledge Map</title>');
  });

  it('should handle output directory creation', async () => {
    const newGenerator = new DocumentGenerator({ projectPath: testDir, outputPath: testDir, 
      outputDir: path.join(testDir, 'new-dir'),
      format: 'markdown'
    });
    
    await generator.generate();');
    expect(await fs.pathExists(path.join(testDir, 'new-dir'))).toBe(true);
  });

  it('should handle invalid format gracefully', async () => {
    const invalidGenerator = new DocumentGenerator({ projectPath: testDir, outputPath: testDir, 
      outputDir: outputDir,
      format: 'invalid' as any
    });
    
    // 应该处理无效格式或抛出错误
    await generator.generate();
      .rejects.toThrow();
  });

  it('should generate with custom configuration', async () => {
    const customGenerator = new DocumentGenerator({ projectPath: testDir, outputPath: testDir, 
      outputDir: outputDir,
      format: 'markdown',
      includeMetrics: true,
      includeInsights: true,
      maxDepth: 5,
      theme: 'dark'
    });
    
    await generator.generate();');
    
    const mdFile = path.join(outputDir, 'README.md');
    const content = await fs.readFile(mdFile, 'utf8');
    expect(content).toContain('## 项目统计');
    expect(content).toContain('## AI洞察');
  });
});