const { CodeAnalyzer } = require('./analyzer.js');
const { DocumentGenerator } = require('./generator.js');

class CodeKnowledgeMapGenerator {
  constructor(config) {
    this.config = config;
    this.analyzer = new CodeAnalyzer(config);
    this.generator = null;
  }

  async generate() {
    console.log('🚀 开始生成代码库知识地图...');
    
    const analysisResult = await this.analyzer.analyze();
    this.generator = new DocumentGenerator(this.config, analysisResult);
    
    if (!this.generator) {
      throw new Error('Generator not initialized');
    }
    
    const result = await this.generator.generate();
    return result;
  }

  async analyze() {
    return await this.analyzer.analyze();
  }

  async analyzeWithFocus(focusAreas) {
    this.config.focusAreas = focusAreas;
    return await this.analyzer.analyze();
  }

  async generateWithConfig(overrides) {
    const mergedConfig = { ...this.config, ...overrides };
    const tempGenerator = new CodeKnowledgeMapGenerator(mergedConfig);
    return await tempGenerator.generate();
  }
}

module.exports = { CodeKnowledgeMapGenerator };