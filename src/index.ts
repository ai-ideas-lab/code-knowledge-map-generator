import { CodeAnalyzer } from './analyzer';
import { DocumentGenerator } from './generator';
import { AnalysisConfig, GenerateResult } from './types';

export class CodeKnowledgeMapGenerator {
  private config: AnalysisConfig;
  private analyzer: CodeAnalyzer;
  private generator: DocumentGenerator;

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.analyzer = new CodeAnalyzer(config);
    this.generator = new DocumentGenerator(config, {} as any); // 临时类型，后面会替换
  }

  async generate(): Promise<GenerateResult> {
    console.log('🚀 开始生成代码库知识地图...');
    
    // 1. 分析代码库
    const analysisResult = await this.analyzer.analyze();
    
    // 2. 设置分析结果到生成器
    this.generator = new DocumentGenerator(this.config, analysisResult);
    
    // 3. 生成文档
    const result = await this.generator.generate();
    
    return result;
  }

  async analyze(): Promise<any> {
    return await this.analyzer.analyze();
  }

  async analyzeWithFocus(focusAreas: string[]): Promise<any> {
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