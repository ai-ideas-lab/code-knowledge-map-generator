import { AnalysisConfig, GenerateResult, AnalysisResult } from './types.js';
export declare class CodeKnowledgeMapGenerator {
    private config;
    private analyzer;
    private generator;
    constructor(config: AnalysisConfig);
    generate(): Promise<GenerateResult>;
    analyze(): Promise<AnalysisResult>;
    analyzeWithFocus(focusAreas: string[]): Promise<AnalysisResult>;
    generateWithConfig(overrides: Partial<AnalysisConfig>): Promise<GenerateResult>;
}
export { CodeKnowledgeMapGenerator as default };
//# sourceMappingURL=index.d.ts.map