import { CodeStructure, AnalysisResult } from './types.js';
/**
 * 错误处理和增强类
 */
export declare class ErrorHandler {
    private errors;
    /**
     * 包装异步函数，提供错误处理
     */
    wrapAsyncOperation<T>(operation: () => Promise<T>, context: string): Promise<{
        result: T | null;
        error: Error | null;
    }>;
    /**
     * 安全地执行文件操作
     */
    safeFileOperation<T>(operation: () => Promise<T>, fallbackValue: T, context: string): Promise<T>;
    /**
     * 分析和分类错误
     */
    analyzeErrors(): {
        summary: string;
        criticalErrors: Array<{
            type: string;
            message: string;
            count: number;
        }>;
        warnings: Array<{
            type: string;
            message: string;
            count: number;
        }>;
        suggestions: string[];
        healthScore: number;
    };
    /**
     * 汇总错误信息
     */
    private summarizeErrors;
    /**
     * 分类错误
     */
    private classifyErrors;
    /**
     * 生成错误处理建议
     */
    private generateErrorSuggestions;
    /**
     * 计算系统健康分数
     */
    private calculateHealthScore;
    /**
     * 恢复分析失败的项目
     */
    recoverFailedAnalysis(originalResult: AnalysisResult, structure: CodeStructure[]): Promise<AnalysisResult>;
    /**
     * 验证分析结果完整性
     */
    validateAnalysisResult(result: AnalysisResult): {
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    };
    /**
     * 清理和归档错误日志
     */
    cleanupErrorLogs(): {
        cleanedCount: number;
        archivedCount: number;
        remainingCount: number;
    };
    /**
     * 获取错误报告
     */
    getErrorReport(): {
        totalErrors: number;
        recentErrors: number;
        errorTypes: string[];
        healthScore: number;
        recommendations: string[];
    };
    /**
     * 清空错误日志
     */
    clearErrors(): void;
    /**
     * 获取错误数量
     */
    getErrorCount(): number;
    /**
     * 获取最近的错误
     */
    getRecentErrors(limit?: number): Array<{
        type: string;
        message: string;
        timestamp: Date;
    }>;
}
//# sourceMappingURL=error-handler.d.ts.map