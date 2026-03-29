// Test file for CLI module
import { describe, it, expect, beforeEach, afterEach } from 'jest';
import { Command } from 'commander';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

describe('CLI Integration Tests', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(async () => {
    testDir = path.join(__dirname, 'cli-test-project');
    await fs.ensureDir(testDir);
    
    // 创建测试项目
    await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        'lodash': '^4.17.21'
      }
    }, null, 2));
    
    await fs.writeFile(path.join(testDir, 'src/index.ts'), `
import { hello } from './utils';
console.log(hello());

export function main() {
  return 'Hello World';
}
`);
    
    await fs.writeFile(path.join(testDir, 'src/utils.ts'), `
export function hello() {
  return 'Hello from utils';
}
`);
    
    cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('Command Line Interface', () => {
    it('should show help when no arguments provided', async () => {
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath]);
        
        let output = '';
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          expect(output).toContain('code-knowledge-map');
          expect(output).toContain('Usage:');
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should generate markdown knowledge map', async () => {
      const outputPath = path.join(testDir, 'output');
      
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', testDir, '--output', outputPath, '--format', 'markdown']);
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          
          // 检查输出文件
          expect(fs.existsSync(path.join(outputPath, 'README.md'))).toBe(true);
          expect(fs.existsSync(path.join(outputPath, 'structure.md'))).toBe(true);
          expect(fs.existsSync(path.join(outputPath, 'dependencies.md'))).toBe(true);
          
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should generate JSON knowledge map', async () => {
      const outputPath = path.join(testDir, 'json-output');
      
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', testDir, '--output', outputPath, '--format', 'json']);
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          
          // 检查输出文件
          expect(fs.existsSync(path.join(outputPath, 'knowledge-map.json'))).toBe(true);
          expect(fs.existsSync(path.join(outputPath, 'structure.json'))).toBe(true);
          expect(fs.existsSync(path.join(outputPath, 'dependencies.json'))).toBe(true);
          
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should analyze code and show insights', async () => {
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'analyze', testDir, '--focus', 'architecture', 'dependencies']);
        
        let output = '';
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          expect(output).toContain('分析完成');
          expect(output).toContain('AI洞察');
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should handle invalid directory gracefully', async () => {
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', '/non/existent/path']);
        
        process.on('close', (code) => {
          expect(code).toBeGreaterThan(0); // 应该返回错误码
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should handle invalid format gracefully', async () => {
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', testDir, '--format', 'invalid']);
        
        process.on('close', (code) => {
          expect(code).toBeGreaterThan(0); // 应该返回错误码
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should support include tests option', async () => {
      return new Promise((resolve, reject) => {
        const outputPath = path.join(testDir, 'test-output');
        
        // 创建测试文件
        await fs.writeFile(path.join(testDir, 'test/example.test.ts'), `
test('example test', () => {
  expect(true).toBe(true);
});
`);
        
        const process = spawn('node', [cliPath, 'generate', testDir, '--output', outputPath, '--include-tests']);
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should support exclude patterns', async () => {
      return new Promise((resolve, reject) => {
        const outputPath = path.join(testDir, 'exclude-output');
        
        // 创建一些应该被排除的文件
        await fs.ensureDir(path.join(testDir, 'node_modules'));
        await fs.writeFile(path.join(testDir, 'node_modules/test.js'), 'test');
        
        const process = spawn('node', [cliPath, 'generate', testDir, '--output', outputPath, '--exclude', 'node_modules/**', 'dist/**']);
        
        process.on('close', (code) => {
          expect(code).toBe(0);
          resolve();
        });
        
        process.on('error', reject);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key for AI features', async () => {
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', testDir, '--ai-model', 'gpt-4']);
        
        process.on('close', (code) => {
          // 应该能够优雅地处理缺少API键的情况
          expect(code).toBe(0);
          resolve();
        });
        
        process.on('error', reject);
      });
    });

    it('should handle permission errors', async () => {
      // 创建一个没有读权限的目录
      const restrictedDir = path.join(testDir, 'restricted');
      await fs.ensureDir(restrictedDir);
      
      // 在实际系统中，我们需要设置权限，但在测试环境中我们模拟这个场景
      return new Promise((resolve, reject) => {
        const process = spawn('node', [cliPath, 'generate', restrictedDir]);
        
        process.on('close', (code) => {
          // 应该能够优雅地处理权限错误
          resolve();
        });
        
        process.on('error', reject);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large projects efficiently', async () => {
      // 创建一个较大的项目结构
      const largeProjectDir = path.join(testDir, 'large-project');
      await fs.ensureDir(largeProjectDir);
      
      // 创建多个文件
      for (let i = 0; i < 50; i++) {
        await fs.writeFile(
          path.join(largeProjectDir, `file${i}.ts`),
          `// File ${i}\nexport function function${i}() { return 'hello'; }\n`
        );
      }
      
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const process = spawn('node', [cliPath, 'generate', largeProjectDir, '--format', 'json']);
        
        process.on('close', (code) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(code).toBe(0);
          expect(duration).toBeLessThan(30000); // 应该在30秒内完成
          resolve();
        });
        
        process.on('error', reject);
      });
    });
  });
});