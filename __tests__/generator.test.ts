import { CodeKnowledgeMapGenerator } from '../src/index';
import { AnalysisConfig } from '../src/types';
import fs from 'fs-extra';
import path from 'path';

describe('CodeKnowledgeMapGenerator', () => {
  const testConfig: AnalysisConfig = {
    targetPath: './test-project',
    outputPath: './test-output',
    format: 'markdown',
    includeTests: false,
    excludePatterns: ['node_modules', '.git'],
    aiModel: 'gpt-4'
  };

  beforeEach(async () => {
    // 创建测试项目
    const testProjectPath = testConfig.targetPath;
    await fs.ensureDir(testProjectPath);
    
    // 创建测试文件
    await fs.writeFile(
      path.join(testProjectPath, 'index.js'),
      `
// 示例JavaScript文件
function greet(name) {
  return "Hello, " + name + "!";
}

class Greeter {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    return greet(this.name);
  }
}

export default Greeter;
`
    );
    
    await fs.writeFile(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
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

  test('应该创建实例', () => {
    const generator = new CodeKnowledgeMapGenerator(testConfig);
    expect(generator).toBeDefined();
  });

  test('应该能够生成知识地图', async () => {
    const generator = new CodeKnowledgeMapGenerator(testConfig);
    const result = await generator.generate();
    
    expect(result).toBeDefined();
    expect(result.format).toBe('markdown');
    expect(result.stats.totalFiles).toBeGreaterThan(0);
    expect(result.generatedFiles).toContain(path.join(testConfig.outputPath, 'README.md'));
  });

  test('应该能够进行分析', async () => {
    const generator = new CodeKnowledgeMapGenerator(testConfig);
    const analysis = await generator.analyze();
    
    expect(analysis).toBeDefined();
    expect(analysis.structure).toBeDefined();
    expect(analysis.dependencies).toBeDefined();
    expect(analysis.metrics).toBeDefined();
  });

  test('应该支持重点分析', async () => {
    const generator = new CodeKnowledgeMapGenerator(testConfig);
    const analysis = await generator.analyzeWithFocus(['architecture', 'dependencies']);
    
    expect(analysis).toBeDefined();
    // 重点分析应该返回特殊的结果
    expect(analysis.structure).toBeDefined();
  });
});