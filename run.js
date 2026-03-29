#!/usr/bin/env node

import { CodeKnowledgeMapGenerator } from './dist/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('用法:');
    console.log('  node run.js generate <path> [options]');
    console.log('  node run.js analyze <path> [options]');
    console.log('');
    console.log('选项:');
    console.log('  --output <path>    输出目录 (默认: ./knowledge-map)');
    console.log('  --format <format>  输出格式: markdown|json|html (默认: markdown)');
    console.log('  --help             显示帮助');
    return;
  }

  const command = args[0];
  
  if (command === 'generate') {
    if (args.length < 2) {
      console.error('错误: 需要指定目标路径');
      console.log('用法: node run.js generate <path> [options]');
      process.exit(1);
    }

    const targetPath = args[1];
    const outputPath = args.find(arg => arg.startsWith('--output'))?.split('=')[1] || './knowledge-map';
    const format = args.find(arg => arg.startsWith('--format'))?.split('=')[1] || 'markdown';

    const config = {
      targetPath,
      outputPath,
      format: format,
      includeTests: false,
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
      aiModel: 'gpt-4'
    };

    try {
      console.log('🚀 开始生成代码库知识地图...');
      console.log(`目标路径: ${targetPath}`);
      console.log(`输出格式: ${format}`);
      console.log(`输出目录: ${outputPath}`);
      console.log('');

      const generator = new CodeKnowledgeMapGenerator(config);
      const result = await generator.generate();

      console.log('✅ 生成完成!');
      console.log(`📄 生成了 ${result.generatedFiles.length} 个文件`);
      console.log(`⏱️  处理时间: ${result.processingTime}ms`);
      console.log('');
      
      if (result.insights.length > 0) {
        console.log('🔍 AI洞察:');
        result.insights.forEach(insight => console.log(`  • ${insight}`));
        console.log('');
      }
      
      if (result.recommendations.length > 0) {
        console.log('💡 改进建议:');
        result.recommendations.forEach(rec => console.log(`  • ${rec}`));
        console.log('');
      }

    } catch (error) {
      console.error('❌ 生成失败:', error.message);
      process.exit(1);
    }
  } else if (command === 'analyze') {
    if (args.length < 2) {
      console.error('错误: 需要指定目标路径');
      console.log('用法: node run.js analyze <path> [options]');
      process.exit(1);
    }

    const targetPath = args[1];
    const config = {
      targetPath,
      outputPath: './analysis-output',
      format: 'json',
      includeTests: false,
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
      aiModel: 'gpt-4'
    };

    try {
      console.log('🔍 开始代码分析...');
      console.log(`目标路径: ${targetPath}`);
      console.log('');

      const generator = new CodeKnowledgeMapGenerator(config);
      const result = await generator.analyze();

      console.log('✅ 分析完成!');
      console.log(`📊 总文件数: ${result.metrics.totalFiles}`);
      console.log(`📈 总代码行数: ${result.metrics.totalLines.toLocaleString()}`);
      console.log(`🔧 函数总数: ${result.metrics.totalFunctions}`);
      console.log(`🏗️ 类总数: ${result.metrics.totalClasses}`);
      console.log(`📊 平均复杂度: ${result.metrics.averageComplexity.toFixed(2)}`);
      console.log('');

      if (result.insights.length > 0) {
        console.log('🔍 AI洞察:');
        result.insights.forEach(insight => console.log(`  • ${insight}`));
        console.log('');
      }

    } catch (error) {
      console.error('❌ 分析失败:', error.message);
      process.exit(1);
    }
  } else {
    console.error(`未知命令: ${command}`);
    console.log('可用命令: generate, analyze');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ 运行失败:', error.message);
  process.exit(1);
});