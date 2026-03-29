#!/usr/bin/env node

/**
 * 配置验证脚本
 * 用于验证项目配置文件的正确性和完整性
 */

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ConfigValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * 验证项目配置
   */
  async validate(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    console.log('🔍 开始验证项目配置...');

    // 验证基本文件结构
    await this.validateFileStructure();
    
    // 验证package.json
    await this.validatePackageJson();
    
    // 验证TypeScript配置
    await this.validateTypeScriptConfig();
    
    // 验证Git配置
    await this.validateGitConfig();
    
    // 验证GitHub配置
    await this.validateGitHubConfig();
    
    // 验证依赖完整性
    await this.validateDependencies();
    
    // 验证环境变量
    await this.validateEnvironmentVariables();

    const suggestions = this.generateSuggestions();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions
    };
  }

  /**
   * 验证文件结构
   */
  private async validateFileStructure(): Promise<void> {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'README.md',
      'src/index.ts',
      'src/cli.ts',
      'src/analyzer.ts',
      'src/generator.ts',
      'src/types.ts'
    ];

    const requiredDirs = [
      'src',
      '__tests__'
    ];

    // 检查必需的文件
    for (const file of requiredFiles) {
      if (!await fs.pathExists(file)) {
        this.errors.push(`缺少必需文件: ${file}`);
      }
    }

    // 检查必需的目录
    for (const dir of requiredDirs) {
      if (!await fs.pathExists(dir) || !await fs.stat(dir).then(stat => stat.isDirectory())) {
        this.errors.push(`缺少必需目录: ${dir}`);
      }
    }

    // 检查GitHub工作流目录
    if (await fs.pathExists('.github')) {
      const workflowsDir = '.github/workflows';
      if (await fs.pathExists(workflowsDir)) {
        const workflowFiles = await fs.readdir(workflowsDir);
        if (!workflowFiles.some(file => file.endsWith('.yml') || file.endsWith('.yaml'))) {
          this.warnings.push('GitHub工作流目录存在但没有工作流文件');
        }
      } else {
        this.warnings.push('缺少GitHub工作流目录');
      }
    } else {
      this.warnings.push('缺少GitHub配置目录');
    }
  }

  /**
   * 验证package.json
   */
  private async validatePackageJson(): Promise<void> {
    try {
      const packageJson = await fs.readJson('package.json');
      
      // 检查必需字段
      const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'scripts', 'dependencies', 'devDependencies'];
      
      for (const field of requiredFields) {
        if (!(field in packageJson)) {
          this.errors.push(`package.json缺少字段: ${field}`);
        }
      }

      // 检查bin配置
      if (packageJson.bin) {
        if (typeof packageJson.bin !== 'object') {
          this.errors.push('package.json的bin字段应该是对象');
        } else {
          const binEntries = Object.entries(packageJson.bin);
          for (const [name, path] of binEntries) {
            if (typeof path !== 'string' || !path.endsWith('.js')) {
              this.errors.push(`bin配置 "${name}" 指向的路径应该以.js结尾`);
            }
          }
        }
      }

      // 检查依赖版本格式
      for ( const type of ['dependencies', 'devDependencies'] as const) {
        if (packageJson[type]) {
          for (const [name, version] of Object.entries(packageJson[type])) {
            if (!this.isValidVersionFormat(version as string)) {
              this.warnings.push(`依赖 "${name}" 的版本格式可能有问题: ${version}`);
            }
          }
        }
      }

      // 检查脚本配置
      const scripts = packageJson.scripts || {};
      const requiredScripts = ['build', 'test', 'lint'];
      
      for (const script of requiredScripts) {
        if (!scripts[script]) {
          this.errors.push(`缺少必需的脚本: ${script}`);
        }
      }

    } catch (error) {
      this.errors.push(`无法读取package.json: ${error}`);
    }
  }

  /**
   * 验证TypeScript配置
   */
  private async validateTypeScriptConfig(): Promise<void> {
    try {
      const tsConfig = await fs.readJson('tsconfig.json');
      
      // 检查必需字段
      if (!tsConfig.compilerOptions) {
        this.errors.push('tsconfig.json缺少compilerOptions字段');
        return;
      }

      const requiredOptions = [
        'target',
        'module',
        'outDir',
        'rootDir',
        'strict',
        'esModuleInterop',
        'skipLibCheck',
        'forceConsistentCasingInFileNames'
      ];

      for (const option of requiredOptions) {
        if (!(option in tsConfig.compilerOptions)) {
          this.errors.push(`tsconfig.json缺少编译选项: ${option}`);
        }
      }

      // 检查target设置
      if (tsConfig.compilerOptions.target !== 'ES2022') {
        this.warnings.push('建议将target设置为ES2022或更高版本');
      }

      // 检查模块设置
      if (!['ES2022', 'CommonJS'].includes(tsConfig.compilerOptions.module)) {
        this.warnings.push('建议将module设置为ES2022或CommonJS');
      }

    } catch (error) {
      this.errors.push(`无法读取tsconfig.json: ${error}`);
    }
  }

  /**
   * 验证Git配置
   */
  private async validateGitConfig(): Promise<void> {
    try {
      // 检查是否在Git仓库中
      await execAsync('git rev-parse --is-inside-work-tree');
      
      // 检查远程仓库
      const { stdout: remoteUrl } = await execAsync('git remote -v');
      if (!remoteUrl.includes('github.com')) {
        this.warnings.push('远程仓库不是GitHub地址');
      }

      // 检查.gitignore
      if (await fs.pathExists('.gitignore')) {
        const gitignore = await fs.readFile('.gitignore', 'utf8');
        const ignoredPatterns = [
          'node_modules/',
          'dist/',
          'coverage/',
          '.env'
        ];
        
        for (const pattern of ignoredPatterns) {
          if (!gitignore.includes(pattern)) {
            this.warnings.push(`.gitignore缺少模式: ${pattern}`);
          }
        }
      } else {
        this.errors.push('缺少.gitignore文件');
      }

    } catch (error) {
      this.warnings.push('项目不在Git仓库中或Git配置有问题');
    }
  }

  /**
   * 验证GitHub配置
   */
  private async validateGitHubConfig(): Promise<void> {
    // 检查GitHub工作流
    if (await fs.pathExists('.github/workflows')) {
      const workflows = await fs.readdir('.github/workflows');
      const hasCIWorkflow = workflows.some(file => 
        file.includes('ci') || file.includes('cd') || file.includes('build')
      );
      
      if (!hasCIWorkflow) {
        this.warnings.push('建议添加CI/CD工作流文件');
      }
    }

    // 检查issue模板
    if (await fs.pathExists('.github/ISSUE_TEMPLATE')) {
      const issueFiles = await fs.readdir('.github/ISSUE_TEMPLATE');
      if (!issueFiles.some(file => file.endsWith('.md'))) {
        this.warnings.push('建议添加issue模板文件');
      }
    }
  }

  /**
   * 验证依赖完整性
   */
  private async validateDependencies(): Promise<void> {
    try {
      // 检查node_modules是否存在
      if (!await fs.pathExists('node_modules')) {
        this.warnings.push('node_modules目录不存在，运行npm install');
        return;
      }

      // 检查package-lock.json是否存在
      if (!await fs.pathExists('package-lock.json')) {
        this.warnings.push('建议添加package-lock.json以锁定依赖版本');
      }

      // 检查依赖安装状态
      const packageJson = await fs.readJson('package.json');
      const allDependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      for (const [name, version] of Object.entries(allDependencies)) {
        const packagePath = `node_modules/${name}/package.json`;
        if (await fs.pathExists(packagePath)) {
          const packageInfo = await fs.readJson(packagePath);
          if (!this.satisfiesVersion(packageInfo.version, version as string)) {
            this.warnings.push(`依赖 "${name}" 版本不匹配: 期望 ${version}, 实际 ${packageInfo.version}`);
          }
        } else {
          this.warnings.push(`依赖 "${name}" 未正确安装`);
        }
      }

    } catch (error) {
      this.errors.push(`依赖验证失败: ${error}`);
    }
  }

  /**
   * 验证环境变量
   */
  private async validateEnvironmentVariables(): Promise<void> {
    // 检查必需的环境变量
    const requiredEnvVars = ['OPENAI_API_KEY'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        this.warnings.push(`缺少环境变量: ${envVar} (对于AI功能是必需的)`);
      }
    }

    // 检查可选的环境变量
    const optionalEnvVars = ['NODE_ENV', 'LOG_LEVEL'];
    
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        this.warnings.push(`建议设置环境变量: ${envVar}`);
      }
    }
  }

  /**
   * 验证版本格式
   */
  private isValidVersionFormat(version: string): boolean {
    const versionRegex = /^(\^|~|=|>=|<=|<|>)?(\d+)\.(\d+)\.(\d+)(?:-([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return versionRegex.test(version);
  }

  /**
   * 检查版本是否满足要求
   */
  private satisfiesVersion(actual: string, required: string): boolean {
    // 简化的版本检查逻辑
    const cleanActual = actual.replace(/[\^~>=<]/g, '');
    const cleanRequired = required.replace(/[\^~>=<]/g, '');
    return cleanActual === cleanRequired;
  }

  /**
   * 生成改进建议
   */
  private generateSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.warnings.length > 0) {
      suggestions.push('建议解决以上警告以提升项目质量');
    }

    if (!this.errors.length) {
      suggestions.push('✅ 项目配置验证通过，建议定期运行此检查');
    }

    // 通用建议
    suggestions.push('考虑添加pre-commit钩子进行代码检查');
    suggestions.push('建议设置代码格式化工具如Prettier');
    suggestions.push('考虑添加ESLint配置文件');

    return suggestions;
  }
}

// 运行验证
async function main() {
  const validator = new ConfigValidator();
  const result = await validator.validate();

  console.log('\n📋 配置验证结果:');
  console.log(`\n✅ 状态: ${result.isValid ? '通过' : '失败'}`);
  console.log(`❌ 错误: ${result.errors.length}个`);
  console.log(`⚠️ 警告: ${result.warnings.length}个`);
  console.log(`💡 建议: ${result.suggestions.length}个`);

  if (result.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ 警告详情:');
    result.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }

  if (result.suggestions.length > 0) {
    console.log('\n💡 改进建议:');
    result.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }

  if (result.isValid) {
    console.log('\n🎉 项目配置验证通过！');
    process.exit(0);
  } else {
    console.log('\n❌ 项目配置验证失败，请修复错误后重试。');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

export { ConfigValidator };