#!/usr/bin/env node

// 临时CommonJS入口文件
const { CodeKnowledgeMapGenerator } = require('./dist/index.js');

const config = {
  targetPath: '/Users/wangshihao/.openclaw/workspace',
  outputPath: './test-output',
  format: 'markdown',
  includeTests: false,
  excludePatterns: ['node_modules', '.git'],
  aiModel: 'gpt-4'
};

async function test() {
  console.log('🧪 开始测试 CodeKnowledgeMapGenerator...');
  
  try {
    const generator = new CodeKnowledgeMapGenerator(config);
    const result = await generator.generate();
    
    console.log('✅ 测试成功!');
    console.log(`📊 生成文件数: ${result.generatedFiles.length}`);
    console.log(`📈 处理时间: ${result.processingTime}ms`);
    console.log(`📁 输出目录: ${result.outputPath}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

test();