#!/usr/bin/env node

import { Command } from 'commander';
import { CodeKnowledgeMapGenerator } from './index.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('code-knowledge-map')
  .description('AI驱动的代码库知识地图生成器')
  .version('1.0.0');

program
  .command('generate')
  .description('生成代码库知识地图')
  .argument('<path>', '代码库路径')
  .option('-o, --output <path>', '输出目录', './knowledge-map')
  .option('-f, --format <format>', '输出格式', 'markdown')
  .option('--include-tests', '包含测试文件')
  .option('--exclude-patterns <patterns...>', '排除的文件模式')
  .option('--ai-model <model>', 'AI模型', 'gpt-4')
  .action(async (path: string, options) => {
    try {
      console.log(chalk.blue('🚀 开始生成代码库知识地图...'));
      
      const generator = new CodeKnowledgeMapGenerator({
        targetPath: path,
        outputPath: options.output,
        format: options.format as 'markdown' | 'json' | 'html',
        includeTests: options.includeTests,
        excludePatterns: options.excludePatterns,
        aiModel: options.aiModel
      });

      const result = await generator.generate();
      
      console.log(chalk.green('✅ 知识地图生成完成！'));
      console.log(chalk.yellow(`📄 输出位置: ${result.outputPath}`));
      console.log(chalk.blue(`📊 分析统计: ${result.stats.totalFiles} 个文件, ${result.stats.totalLines} 行代码`));
      
      if (result.insights.length > 0) {
        console.log(chalk.magenta('\n🔍 关键洞察:'));
        result.insights.forEach(insight => {
          console.log(`  • ${insight}`);
        });
      }
      
    } catch (error) {
      console.error(chalk.red('❌ 生成失败:'), error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('分析特定文件或目录')
  .argument('<path>', '分析路径')
  .option('--depth <number>', '分析深度', '3')
  .option('--focus <areas...>', '分析重点', ['architecture', 'dependencies', 'patterns'])
  .action(async (path: string, options) => {
    try {
      console.log(chalk.blue('🔍 开始代码分析...'));
      
      const generator = new CodeKnowledgeMapGenerator({
        targetPath: path,
        analyzeDepth: parseInt(options.depth),
        focusAreas: options.focus
      });

      const analysis = await generator.analyze();
      
      console.log(chalk.green('✅ 分析完成！'));
      console.log(JSON.stringify(analysis, null, 2));
      
    } catch (error) {
      console.error(chalk.red('❌ 分析失败:'), error);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('交互式知识地图生成')
  .action(async () => {
    try {
      const { default: inquirer } = await import('inquirer');
      
      console.log(chalk.blue('🎯 交互式代码库知识地图生成器'));
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'targetPath',
          message: '请输入代码库路径:',
          default: process.cwd()
        },
        {
          type: 'input',
          name: 'outputPath',
          message: '输出目录:',
          default: './knowledge-map'
        },
        {
          type: 'list',
          name: 'format',
          message: '输出格式:',
          choices: ['markdown', 'json', 'html'],
          default: 'markdown'
        },
        {
          type: 'confirm',
          name: 'includeTests',
          message: '包含测试文件?',
          default: false
        },
        {
          type: 'checkbox',
          name: 'focusAreas',
          message: '分析重点:',
          choices: [
            'architecture',
            'dependencies',
            'patterns',
            'performance',
            'security',
            'testing'
          ],
          default: ['architecture', 'dependencies']
        }
      ]);

      const generator = new CodeKnowledgeMapGenerator({
        targetPath: answers.targetPath,
        outputPath: answers.outputPath,
        format: answers.format,
        includeTests: answers.includeTests,
        focusAreas: answers.focusAreas
      });

      console.log(chalk.yellow('⏳ 正在生成知识地图，请稍候...'));
      
      const result = await generator.generate();
      
      console.log(chalk.green('✅ 知识地图生成完成！'));
      console.log(chalk.yellow(`📄 输出位置: ${result.outputPath}`));
      
    } catch (error) {
      console.error(chalk.red('❌ 交互模式失败:'), error);
      process.exit(1);
    }
  });

program.parse();