import { AnalysisConfig, GenerateResult } from './types';
export declare class CodeKnowledgeMapGenerator {
    private config;
    private analyzer;
    private generator;
    constructor(config: AnalysisConfig);
    generate(): Promise<GenerateResult>;
    analyze(): Promise<any>;
    analyzeWithFocus(focusAreas: string[]): Promise<any>;
    generateWithConfig(overrides: Partial<AnalysisConfig>): Promise<GenerateResult>;
}
//# sourceMappingURL=index.d.ts.map