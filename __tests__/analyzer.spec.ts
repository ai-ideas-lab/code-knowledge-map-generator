import { describe, it, expect, beforeAll, afterEach } from 'jest';
import { CodeAnalyzer } from '../src/analyzer.js';
import { AnalysisConfig } from '../src/types.js';
import fs from 'fs-extra';
import path from 'path';

describe('CodeAnalyzer', () => {
  let testDir: string;
  let analyzer: CodeAnalyzer;

  beforeAll(async () => {
    // 创建测试目录
    testDir = path.join(__dirname, 'test-project');
    await fs.ensureDir(testDir);
    
    // 创建测试项目结构
    const testStructure = {
      'src/index.ts': `import { hello } from './utils';
console.log(hello());

export function main() {
  return 'Hello World';
}`,
      'src/utils.ts': `export function hello() {
  return 'Hello from utils';
}`,
      'package.json': JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          'lodash': '^4.17.21'
        }
      }, null, 2),
      'README.md': '# Test Project'
    };

    for (const [filePath, content] of Object.entries(testStructure)) {
      await fs.writeFile(path.join(testDir, filePath), content);
    }
  });

  afterEach(async () => {
    // 清理测试目录
    await fs.remove(testDir);
  });

  it('should analyze project structure correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      includeTests: false,
      excludePatterns: ['node_modules/**'],
      depth: 3,
      focusAreas: ['architecture', 'dependencies']
    };

    analyzer = new CodeAnalyzer(config);
    const result = await analyzer.analyze();

    expect(result).toBeDefined();
    expect(result.structure).toBeDefined();
    expect(result.dependencies).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.structure.length).toBeGreaterThan(0);
  });

  it('should detect dependencies correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    analyzer = new CodeAnalyzer(config);
    const result = await analyzer.analyze();

    expect(result.dependencies).toBeDefined();
    if (result.dependencies) {
      expect(result.dependencies.direct).toBeDefined();
      expect(result.dependencies.direct.length).toBeGreaterThan(0);
    }
  });

  it('should calculate metrics correctly', async () => {
    const config: AnalysisConfig = {
      projectPath: testDir,
      includeTests: false,
      excludePatterns: ['node_modules/**']
    };

    analyzer = new CodeAnalyzer(config);
    const result = await analyzer.analyze();

    expect(result.metrics).toBeDefined();
    if (result.metrics) {
      expect(result.metrics.totalFiles).toBeGreaterThan(0);
      expect(result.metrics.totalLines).toBeGreaterThan(0);
    }
  });

  it('should handle empty directories gracefully', async () => {
    const emptyDir = path.join(testDir, 'empty');
    await fs.ensureDir(emptyDir);

    const config: AnalysisConfig = {
      projectPath: emptyDir,
      includeTests: false,
      excludePatterns: []
    };

    analyzer = new CodeAnalyzer(config);
    const result = await analyzer.analyze();

    expect(result).toBeDefined();
    expect(result.structure).toEqual([]);
    expect(result.metrics).toBeDefined();
  });

  it('should handle invalid directory paths gracefully', async () => {
    const config: AnalysisConfig = {
      projectPath: '/non/existent/path',
      includeTests: false,
      excludePatterns: []
    };

    analyzer = new CodeAnalyzer(config);
    
    // 应该抛出错误或返回空结果
    await expect(analyzer.analyze()).rejects.toThrow();
  });
});