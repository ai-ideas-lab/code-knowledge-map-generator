import { CodeAnalyzer } from '../src/analyzer';
import { AnalysisConfig } from '../src/types';
import fs from 'fs-extra';
import path from 'path';

describe('CodeAnalyzer', () => {
  const testConfig: AnalysisConfig = {
    targetPath: './test-analyze-project',
    outputPath: './test-analyze-output',
    format: 'json',
    includeTests: false,
    excludePatterns: ['node_modules', '.git'],
    aiModel: 'gpt-4'
  };

  beforeEach(async () => {
    // 创建测试项目
    const testProjectPath = testConfig.targetPath;
    await fs.ensureDir(testProjectPath);
    
    // 创建不同语言的测试文件
    await fs.writeFile(
      path.join(testProjectPath, 'main.js'),
      `
// JavaScript 示例
function calculateSum(a, b) {
  if (a > 0 && b > 0) {
    return a + b;
  }
  return 0;
}

export { calculateSum };
`
    );

    await fs.writeFile(
      path.join(testProjectPath, 'app.py'),
      `
# Python 示例
def greet(name):
    """问候函数"""
    if name:
        return f"Hello, {name}!"
    return "Hello, World!"

class Greeter:
    def __init__(self, name):
        self.name = name
    
    def say_hello(self):
        return greet(self.name)
`
    );

    await fs.writeFile(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify({
        name: 'test-analyze-project',
        version: '1.0.0',
        dependencies: {
          'express': '^4.18.0',
          'lodash': '^4.17.21'
        }
      }, null, 2)
    );
  });

  afterEach(async () => {
    // 清理测试文件
    await fs.remove(testConfig.targetPath);
    await fs.remove(testConfig.outputPath);
  });

  test('应该能够扫描文件结构', async () => {
    const analyzer = new CodeAnalyzer(testConfig);
    const structure = await analyzer['scanStructure']();
    
    expect(structure).toBeDefined();
    expect(structure.length).toBeGreaterThan(0);
    expect(structure.some((item: any) => item.path === 'main.js')).toBe(true);
    expect(structure.some((item: any) => item.path === 'app.py')).toBe(true);
  });

  test('应该能够检测文件语言', () => {
    const analyzer = new CodeAnalyzer(testConfig);
    
    // 测试JavaScript检测
    const jsLang = analyzer['detectLanguage']('test.js');
    expect(jsLang).toBe('javascript');
    
    // 测试TypeScript检测
    const tsLang = analyzer['detectLanguage']('test.ts');
    expect(tsLang).toBe('typescript');
    
    // 测试Python检测
    const pyLang = analyzer['detectLanguage']('test.py');
    expect(pyLang).toBe('python');
  });

  test('应该能够提取依赖', () => {
    const analyzer = new CodeAnalyzer(testConfig);
    
    const jsContent = `
import express from 'express';
import _ from 'lodash';
import fs from 'fs';
`;
    
    const dependencies = analyzer['extractDependencies'](jsContent, 'javascript');
    expect(dependencies).toContain('express');
    expect(dependencies).toContain('lodash');
    expect(dependencies).toContain('fs');
  });

  test('应该能够分析依赖关系', async () => {
    const analyzer = new CodeAnalyzer(testConfig);
    const structure = await analyzer['scanStructure']();
    const dependencies = await analyzer['analyzeDependencies'](structure);
    
    expect(dependencies).toBeDefined();
    expect(dependencies.totalDependencies).toBeGreaterThan(0);
    expect(dependencies.dependencyGraph).toBeDefined();
    expect(Array.isArray(dependencies.directDependencies)).toBe(true);
    expect(Array.isArray(dependencies.indirectDependencies)).toBe(true);
  });

  test('应该能够计算代码指标', () => {
    const analyzer = new CodeAnalyzer(testConfig);
    const structure = [
      {
        name: 'test.js',
        type: 'file' as const,
        path: 'test.js',
        size: 1000,
        lines: 50,
        language: 'javascript',
        dependencies: ['express'],
        lastModified: new Date()
      }
    ];
    
    const metrics = analyzer['calculateMetrics'](structure);
    
    expect(metrics).toBeDefined();
    expect(metrics.totalFiles).toBe(1);
    expect(metrics.totalLines).toBe(50);
    expect(metrics.totalFunctions).toBe(0); // 简化版，实际应该计算
    expect(metrics.averageComplexity).toBeGreaterThan(0);
  });
});