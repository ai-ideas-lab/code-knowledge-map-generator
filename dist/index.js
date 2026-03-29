import { CodeAnalyzer } from './analyzer';
import { DocumentGenerator } from './generator';
export class CodeKnowledgeMapGenerator {
    config;
    analyzer;
    generator;
    constructor(config) {
        this.config = config;
        this.analyzer = new CodeAnalyzer(config);
        this.generator = new DocumentGenerator(config, {}); // 临时类型，后面会替换
    }
    async generate() {
        console.log('🚀 开始生成代码库知识地图...');
        // 1. 分析代码库
        const analysisResult = await this.analyzer.analyze();
        // 2. 设置分析结果到生成器
        this.generator = new DocumentGenerator(this.config, analysisResult);
        // 3. 生成文档
        const result = await this.generator.generate();
        return result;
    }
    async analyze() {
        return await this.analyzer.analyze();
    }
    async analyzeWithFocus(focusAreas) {
        // 扩展配置以包含重点分析领域
        this.config.focusAreas = focusAreas;
        return await this.analyzer.analyze();
    }
    async generateWithConfig(overrides) {
        const mergedConfig = { ...this.config, ...overrides };
        const tempGenerator = new CodeKnowledgeMapGenerator(mergedConfig);
        return await tempGenerator.generate();
    }
}
//# sourceMappingURL=index.js.map