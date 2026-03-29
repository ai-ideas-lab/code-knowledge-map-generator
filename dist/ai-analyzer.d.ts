import { CodeStructure, CodeMetrics } from './types.js';
export declare class AIAnalyzer {
    private openai;
    private model;
    private config;
    constructor(apiKey?: string, model?: string, config?: any);
    /**
     * 执行深度AI分析，提供高级洞察
     */
    performDeepAnalysis(structure: CodeStructure[], metrics: CodeMetrics, context?: any): Promise<{
        insights: string[];
        recommendations: string[];
        summary: string;
        riskFactors: string[];
        improvementSuggestions: string[];
    }>;
    /**
     * 生成代码质量评分
     */
    generateCodeQualityScore(structure: CodeStructure[], metrics: CodeMetrics): Promise<{
        overallScore: number;
        breakdown: {
            architecture: number;
            maintainability: number;
            performance: number;
            security: number;
            testing: number;
        };
        strengths: string[];
        weaknesses: string[];
    }>;
    /**
     * 生成重构建议
     */
    generateRefactoringSuggestions(structure: CodeStructure[]): Promise<{
        immediateActions: string[];
        longTermGoals: string[];
        estimatedEffort: {
            immediate: 'low' | 'medium' | 'high';
            longTerm: 'low' | 'medium' | 'high';
        };
    }>;
    /**
     * 构建分析提示
     */
    private buildAnalysisPrompt;
    /**
     * 解析AI响应
     */
    private parseAIResponse;
    /**
     * 解析质量评分响应
     */
    private parseQualityResponse;
    /**
     * 解析重构建议响应
     */
    private parseRefactoringResponse;
}
//# sourceMappingURL=ai-analyzer.d.ts.map