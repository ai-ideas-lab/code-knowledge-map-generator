import { AnalysisConfig, AnalysisResult } from './types.js';
export declare class CodeAnalyzer {
    private config;
    constructor(config: AnalysisConfig);
    analyze(): Promise<AnalysisResult>;
    private scanStructure;
    private scanFiles;
    private detectLanguage;
    private extractDependencies;
    private extractFunctions;
    private extractClasses;
    private extractDocumentation;
    private getLineNumber;
    private calculateComplexity;
    private isExported;
    private extractExtends;
    private analyzeDependencies;
    private checkOutdatedDependencies;
    private calculateMetrics;
    private performAIAnalysis;
    /**
     * 基础AI分析（备用方案）
     */
    private performBasicAIAnalysis;
    private getLanguageDistribution;
    private getArchitectureSummary;
}
//# sourceMappingURL=analyzer.d.ts.map