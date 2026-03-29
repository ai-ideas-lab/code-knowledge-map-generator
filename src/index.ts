import { CodeAnalyzer } from './analyzer.js';
import { DocumentGenerator } from './generator.js';
import { AnalysisConfig, GenerateResult, AnalysisResult, DocumentGeneratorConfig } from './types.js';

export class CodeKnowledgeMapGenerator {
  private config: AnalysisConfig;
  private analyzer: CodeAnalyzer;
  private generator: DocumentGenerator | null = null;

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.analyzer = new CodeAnalyzer(config);
    this.generator = null; // 初始化为null，在generate时创建
  }

  async generate(): Promise<GenerateResult> {
    console.log('🚀 开始生成代码库知识地图...');
    
    // 1. 分析代码库
    const analysisResult = await this.analyzer.analyze();
    
    // 2. 创建生成器配置
    const generatorConfig: DocumentGeneratorConfig = {
      outputDir: this.config.projectPath + '/output',
      format: this.config.depth ? 'markdown' : 'markdown',
      includeMetrics: true,
      includeInsights: true,
      maxDepth: this.config.depth || 3
    };
    
    // 3. 生成文档
    const docGeneratorConfig = {
      ...this.config,
      includeMetrics: true,
      includeInsights: true,
      maxDepth: this.config.depth || 3
    };
    this.generator = new DocumentGenerator(docGeneratorConfig, analysisResult);
    const result = await this.generator.generate();
    
    return result;
  }

  async analyze(): Promise<AnalysisResult> {
    return await this.analyzer.analyze();
  }

  async analyzeWithFocus(focusAreas: string[]): Promise<AnalysisResult> {
    // 扩展配置以包含重点分析领域
    this.config.focusAreas = focusAreas;
    return await this.analyzer.analyze();
  }

  async generateWithConfig(overrides: Partial<AnalysisConfig>): Promise<GenerateResult> {
    const mergedConfig = { ...this.config, ...overrides };
    const tempGenerator = new CodeKnowledgeMapGenerator(mergedConfig);
    return await tempGenerator.generate();
  }
}

export { CodeKnowledgeMapGenerator as default };