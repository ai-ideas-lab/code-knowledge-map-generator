import { describe, it, expect, beforeAll, afterEach, jest } from 'jest';
import { CommandCLI } from '../src/cli.js';
import { CodeAnalyzer } from '../src/analyzer.js';
import { DocumentGenerator } from '../src/generator.js';
import fs from 'fs-extra';
import path from 'path';

// Mock dependencies
jest.mock('../src/analyzer.js');
jest.mock('../src/generator.js');

const MockCodeAnalyzer = CodeAnalyzer as jest.MockedClass<typeof CodeAnalyzer>;
const MockDocumentGenerator = DocumentGenerator as jest.MockedClass<typeof DocumentGenerator>;

describe('CommandCLI', () => {
  let testDir: string;
  let cli: CommandCLI;

  beforeAll(async () => {
    testDir = path.join(__dirname, 'cli-test');
    await fs.ensureDir(testDir);
    
    // 创建测试项目
    await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      version: '1.0.0'
    }, null, 2));
    await fs.writeFile(path.join(testDir, 'src/index.ts'), 'console.log("Hello World");');
  });

  afterEach(async () => {
    await fs.remove(testDir);
    jest.clearAllMocks();
  });

  it('should generate knowledge map with correct parameters', async () => {
    cli = new CommandCLI();
    
    // Mock analyzer and generator
    const mockAnalysisResult = {
      structure: [],
      dependencies: { direct: [], indirect: [], circular: [], outdated: [] },
      metrics: { totalFiles: 0, totalLines: 0, averageComplexity: 0, largestFile: { name: '', size: 0 }, averageFileSize: 0 },
      insights: [],
      recommendations: [],
      aiSummary: 'Test summary'
    };

    MockCodeAnalyzer.prototype.analyze.mockResolvedValue(mockAnalysisResult);
    MockDocumentGenerator.prototype.generate.mockResolvedValue();

    // 模拟命令行参数
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await cli.run(['generate', testDir, '--output', path.join(testDir, 'output'), '--format', 'markdown']);
    
    expect(MockCodeAnalyzer.prototype.analyze).toHaveBeenCalled();
    expect(MockDocumentGenerator.prototype.generate).toHaveBeenCalledWith(
      mockAnalysisResult,
      'markdown'
    );
    consoleSpy.mockRestore();
  });

  it('should analyze code with focus areas', async () => {
    cli = new CommandCLI();
    
    const mockAnalysisResult = {
      structure: [],
      dependencies: { direct: [], indirect: [], circular: [], outdated: [] },
      metrics: { totalFiles: 0, totalLines: 0, averageComplexity: 0, largestFile: { name: '', size: 0 }, averageFileSize: 0 },
      insights: [],
      recommendations: [],
      aiSummary: 'Test summary'
    };

    MockCodeAnalyzer.prototype.analyze.mockResolvedValue(mockAnalysisResult);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await cli.run(['analyze', testDir, '--focus', 'architecture', 'dependencies']);
    
    expect(MockCodeAnalyzer.prototype.analyze).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle interactive mode', async () => {
    cli = new CommandCLI();
    
    // Mock inquirer prompts
    const inquirerMock = {
      prompt: jest.fn().mockResolvedValue({
        action: 'generate',
        path: testDir,
        format: 'markdown'
      })
    };
    
    jest.mock('inquirer', () => inquirerMock);
    
    const mockAnalysisResult = {
      structure: [],
      dependencies: { direct: [], indirect: [], circular: [], outdated: [] },
      metrics: { totalFiles: 0, totalLines: 0, averageComplexity: 0, largestFile: { name: '', size: 0 }, averageFileSize: 0 },
      insights: [],
      recommendations: [],
      aiSummary: 'Test summary'
    };

    MockCodeAnalyzer.prototype.analyze.mockResolvedValue(mockAnalysisResult);
    MockDocumentGenerator.prototype.generate.mockResolvedValue();

    await cli.run(['interactive']);
    
    expect(inquirerMock.prompt).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle help command', async () => {
    cli = new CommandCLI();
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await cli.run(['help']);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('code-knowledge-map'));
    consoleSpy.mockRestore();
  });

  it('should handle invalid command', async () => {
    cli = new CommandCLI();
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await cli.run(['invalid-command']);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown command'));
    consoleSpy.mockRestore();
  });

  it('should handle missing arguments', async () => {
    cli = new CommandCLI();
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await cli.run(['generate']);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required argument'));
    consoleSpy.mockRestore();
  });

  it('should handle file system errors gracefully', async () => {
    cli = new CommandCLI();
    
    MockCodeAnalyzer.prototype.analyze.mockRejectedValue(new Error('File not found'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await cli.run(['generate', '/non/existent/path']);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error'));
    consoleSpy.mockRestore();
  });

  it('should validate command options', async () => {
    cli = new CommandCLI();
    
    const mockAnalysisResult = {
      structure: [],
      dependencies: { direct: [], indirect: [], circular: [], outdated: [] },
      metrics: { totalFiles: 0, totalLines: 0, averageComplexity: 0, largestFile: { name: '', size: 0 }, averageFileSize: 0 },
      insights: [],
      recommendations: [],
      aiSummary: 'Test summary'
    };

    MockCodeAnalyzer.prototype.analyze.mockResolvedValue(mockAnalysisResult);
    MockDocumentGenerator.prototype.generate.mockResolvedValue();

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await cli.run(['generate', testDir, '--output', path.join(testDir, 'output'), '--format', 'json', '--depth', '5']);
    
    expect(MockCodeAnalyzer.prototype.analyze).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});