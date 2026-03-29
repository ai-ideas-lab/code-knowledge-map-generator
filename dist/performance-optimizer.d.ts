import { CodeStructure, CodeMetrics } from './types.js';
/**
 * 性能优化工具类
 */
export declare class PerformanceOptimizer {
    private config;
    constructor(config?: any);
    /**
     * 分析性能瓶颈
     */
    analyzePerformanceBottlenecks(structure: CodeStructure[], metrics: CodeMetrics): {
        bottlenecks: Array<{
            type: 'file-size' | 'complexity' | 'dependency' | 'language';
            severity: 'low' | 'medium' | 'high';
            description: string;
            files: string[];
        }>;
        recommendations: string[];
        optimizationScore: number;
    };
    /**
     * 生成优化建议
     */
    generateOptimizationSuggestions(bottlenecks: Array<{
        type: 'file-size' | 'complexity' | 'dependency' | 'language';
        severity: 'low' | 'medium' | 'high';
        description: string;
        files: string[];
    }>, metrics: CodeMetrics): {
        immediateActions: string[];
        longTermStrategy: string[];
        estimatedEffort: {
            immediate: 'low' | 'medium' | 'high';
            longTerm: 'low' | 'medium' | 'high';
        };
    };
    /**
     * 计算优化评分
     */
    private calculateOptimizationScore;
    /**
     * 判断是否为性能关键语言
     */
    private isPerformanceCriticalLanguage;
    /**
     * 生成性能报告
     */
    generatePerformanceReport(bottlenecks: Array<{
        type: 'file-size' | 'complexity' | 'dependency' | 'language';
        severity: 'low' | 'medium' | 'high';
        description: string;
        files: string[];
    }>, optimizationScore: number, suggestions: {
        immediateActions: string[];
        longTermStrategy: string[];
        estimatedEffort: {
            immediate: 'low' | 'medium' | 'high';
            longTerm: 'low' | 'medium' | 'high';
        };
    }): {
        summary: string;
        details: {
            bottlenecks: string;
            recommendations: string;
            score: string;
        };
        priority: 'low' | 'medium' | 'high';
    };
    /**
     * 获取评分描述
     */
    private getScoreDescription;
    /**
     * 执行性能分析并生成优化方案
     */
    analyzeAndOptimize(structure: CodeStructure[], metrics: CodeMetrics): Promise<{
        analysis: any;
        suggestions: any;
        report: any;
        estimatedTime: {
            analysis: string;
            optimization: string;
            total: string;
        };
    }>;
}
//# sourceMappingURL=performance-optimizer.d.ts.map