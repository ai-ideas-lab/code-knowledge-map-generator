#!/usr/bin/env node

import { Command } from 'commander';
import { CodeKnowledgeMapGenerator } from './dist/index.js';
import { AnalysisConfig } from './dist/types.js';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('code-knowledge-map')
  .description('AI驱动的代码库知识地图生成器')
  .version('1.0.0');

program
  .command('generate')
  .description('生成代码库知识地图')
  .option('-t, --target <path>', '目标代码库路径', '.')
  .option('-o, --output <path>', '输出目录路径', './knowledge-map')
  .option('-f, --format <format>', '输出格式 (markdown|json|html)', 'markdown')
  .option('--include-tests', '包含测试文件', false)
  .option('--exclude <patterns...>', '排除的文件模式', ['node_modules', '.git', 'dist', 'build'])
  .option('--ai-model <model>', 'AI模型', 'gpt-4')
  .option('--focus <areas...>', '重点分析领域', ['architecture', 'dependencies', 'patterns'])
  .action(async (options) => {
    try {
      const config = {
        targetPath: path.resolve(options.target),
        outputPath: path.resolve(options.output),
        format: options.format,
        includeTests: options.includeTests,
        excludePatterns: options.exclude,
        aiModel: options.aiModel,
        focusAreas: options.focus
      };

      console.log('🚀 开始生成代码库知识地图...');
      console.log(`📂 目标路径: ${config.targetPath}`);
      console.log(`📤 输出路径: ${config.outputPath}`);
      console.log(`📋 输出格式: ${config.format}`);

      const generator = new CodeKnowledgeMapGenerator(config);
      const result = await generator.generate();

      console.log('✅ 生成完成!');
      console.log(`📊 处理时间: ${result.processingTime}ms`);
      console.log(`📁 生成文件: ${result.generatedFiles.length}个`);
      console.log(`📈 总文件数: ${result.stats.totalFiles}`);
      console.log(`💻 总代码行数: ${result.stats.totalLines.toLocaleString()}`);
      
      if (result.insights.length > 0) {
        console.log('\n🔍 AI洞察:');
        result.insights.forEach(insight => console.log(`  • ${insight}`));
      }

    } catch (error) {
      console.error('❌ 生成失败:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('分析代码库')
  .option('-t, --target <path>', '目标代码库路径', '.')
  .option('--include-tests', '包含测试文件', false)
  .option('--exclude <patterns...>', '排除的文件模式', ['node_modules', '.git', 'dist', 'build'])
  .option('--ai-model <model>', 'AI模型', 'gpt-4')
  .option('--focus <areas...>', '重点分析领域', ['architecture', 'dependencies', 'patterns'])
  .action(async (options) => {
    try {
      const config = {
        targetPath: path.resolve(options.target),
        outputPath: './analysis-output',
        format: 'json',
        includeTests: options.includeTests,
        excludePatterns: options.exclude,
        aiModel: options.aiModel,
        focusAreas: options.focus
      };

      console.log('🔍 开始分析代码库...');
      console.log(`📂 目标路径: ${config.targetPath}`);

      const generator = new CodeKnowledgeMapGenerator(config);
      const result = await generator.analyze();

      console.log('✅ 分析完成!');
      console.log(`📊 总文件数: ${result.metrics.totalFiles}`);
      console.log(`💻 总代码行数: ${result.metrics.totalLines.toLocaleString()}`);
      console.log(`🔧 平均复杂度: ${result.metrics.averageComplexity.toFixed(2)}`);
      console.log(`📈 依赖总数: ${result.dependencies.totalDependencies}`);
      
      if (result.insights.length > 0) {
        console.log('\n🔍 AI洞察:');
        result.insights.forEach(insight => console.log(`  • ${insight}`));
      }

    } catch (error) {
      console.error('❌ 分析失败:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();