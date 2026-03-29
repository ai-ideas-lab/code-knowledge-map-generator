import { CodeStructure, AnalysisResult, AnalysisConfig } from './types.js';

/**
 * 错误处理和增强类
 */
export class ErrorHandler {
  private errors: Array<{
    type: string;
    message: string;
    timestamp: Date;
    stack?: string;
    context?: any;
  }> = [];

  /**
   * 包装异步函数，提供错误处理
   */
  async wrapAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<{ result: T | null; error: Error | null }> {
    try {
      const result = await operation();
      return { result, error: null };
    } catch (error) {
      const errorInfo = {
        type: 'AsyncOperationError',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
        context
      };
      
      this.errors.push(errorInfo);
      console.error(`❌ ${context}:`, errorInfo);
      
      return { result: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * 安全地执行文件操作
   */
  async safeFileOperation<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    context: string
  ): Promise<T> {
    return this.wrapAsyncOperation(operation, context).then(
      result => result.result ?? fallbackValue,
      () => fallbackValue
    );
  }

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
  } {
    const errorSummary = this.summarizeErrors();
    const suggestions = this.generateErrorSuggestions();
    
    // 计算健康分数 (0-100)
    const healthScore = this.calculateHealthScore();
    
    return {
      summary: errorSummary,
      criticalErrors: this.classifyErrors('critical'),
      warnings: this.classifyErrors('warning'),
      suggestions,
      healthScore
    };
  }

  /**
   * 汇总错误信息
   */
  private summarizeErrors(): string {
    if (this.errors.length === 0) {
      return '未发现错误，系统运行正常';
    }

    const errorTypes = [...new Set(this.errors.map(e => e.type))];
    const latestError = this.errors[this.errors.length - 1];

    return `
发现 ${this.errors.length} 个错误，涉及 ${errorTypes.length} 种类型
最新错误: ${latestError.message} (${latestError.timestamp.toLocaleString()})
`;
  }

  /**
   * 分类错误
   */
  private classifyErrors(severity: 'critical' | 'warning'): Array<{
    type: string;
    message: string;
    count: number;
  }> {
    const severityMap: Record<string, 'critical' | 'warning'> = {
      'AsyncOperationError': 'warning',
      'FileSystemError': 'critical',
      'NetworkError': 'critical',
      'ParsingError': 'warning',
      'ValidationError': 'warning',
      'AIAnalysisError': 'warning'
    };

    const filteredErrors = this.errors.filter(error => 
      severityMap[error.type] === severity
    );

    const errorGroups = filteredErrors.reduce((acc, error) => {
      const key = error.type;
      if (!acc[key]) {
        acc[key] = { type: key, message: error.message, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { type: string; message: string; count: number }>);

    return Object.values(errorGroups).sort((a, b) => b.count - a.count);
  }

  /**
   * 生成错误处理建议
   */
  private generateErrorSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.errors.length === 0) {
      suggestions.push('系统运行正常，建议定期检查日志');
      return suggestions;
    }

    // 分析常见错误类型
    const errorTypes = this.errors.map(e => e.type);
    const errorCounts = errorTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 根据错误类型生成建议
    if (errorCounts.FileSystemError > 0) {
      suggestions.push('文件系统错误频繁，建议检查权限和磁盘空间');
    }

    if (errorCounts.NetworkError > 0) {
      suggestions.push('网络连接不稳定，建议增加重试机制和缓存');
    }

    if (errorCounts.AIAnalysisError > 0) {
      suggestions.push('AI分析服务不稳定，建议添加备用分析方案');
    }

    if (errorCounts.ParsingError > 0) {
      suggestions.push('解析错误较多，建议增强数据验证和错误处理');
    }

    // 通用建议
    suggestions.push('建议增加错误监控和日志收集');
    suggestions.push('定期清理和归档错误日志');

    return suggestions;
  }

  /**
   * 计算系统健康分数
   */
  private calculateHealthScore(): number {
    if (this.errors.length === 0) return 100;

    let score = 100;
    
    // 根据错误数量扣分
    score -= Math.min(30, this.errors.length * 2);
    
    // 根据错误严重程度扣分
    const criticalErrors = this.errors.filter(e => 
      e.type === 'FileSystemError' || e.type === 'NetworkError'
    ).length;
    score -= criticalErrors * 10;
    
    // 根据错误趋势扣分
    const recentErrors = this.errors.filter(e => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return e.timestamp > oneHourAgo;
    }).length;
    score -= recentErrors * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 恢复分析失败的项目
   */
  async recoverFailedAnalysis(
    originalResult: AnalysisResult,
    structure: CodeStructure[]
  ): Promise<AnalysisResult> {
    console.log('🔄 正在恢复失败的分析...');

    // 基础保障分析结果
    const fallbackResult: AnalysisResult = {
      structure: structure.length > 0 ? structure : [],
      dependencies: {
        totalDependencies: 0,
        directDependencies: [],
        indirectDependencies: [],
        dependencyGraph: {},
        circularDependencies: []
      },
      metrics: {
        totalFiles: structure.length,
        totalLines: structure.reduce((sum, item) => sum + item.lines, 0),
        totalFunctions: structure.reduce((sum, item) => sum + (item.functions?.length || 0), 0),
        totalClasses: structure.reduce((sum, item) => sum + (item.classes?.length || 0), 0),
        averageComplexity: structure.length > 0 ? 
          structure.reduce((sum, item) => sum + (item.complexity || 0), 0) / structure.length : 0,
        largestFiles: structure
          .filter(item => item.type === 'file')
          .sort((a, b) => b.size - a.size)
          .slice(0, 5)
          .map(item => ({
            path: item.path,
            size: item.size,
            lines: item.lines
          })),
        mostComplexFunctions: []
      },
      insights: ['基础分析完成，部分高级功能不可用'],
      recommendations: ['建议重试分析或检查配置'],
      aiSummary: '分析过程中遇到问题，已返回基础结果。'
    };

    // 尝试保留部分原始结果
    if (originalResult.structure.length > 0) {
      fallbackResult.structure = originalResult.structure;
    }

    if (originalResult.metrics.totalFiles > 0) {
      fallbackResult.metrics = originalResult.metrics;
    }

    return fallbackResult;
  }

  /**
   * 验证分析结果完整性
   */
  validateAnalysisResult(result: AnalysisResult): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查必要字段
    if (!result.structure) {
      issues.push('缺少结构信息');
    }

    if (!result.metrics) {
      issues.push('缺少指标信息');
    }

    if (!result.insights) {
      issues.push('缺少AI洞察');
    }

    // 检查数据完整性
    if (result.structure && result.structure.length === 0) {
      issues.push('结构信息为空');
      suggestions.push('检查目标目录是否存在且包含代码文件');
    }

    if (result.metrics && result.metrics.totalFiles === 0) {
      issues.push('未发现任何文件');
      suggestions.push('确认分析路径正确，包含有效的代码文件');
    }

    // 检查数据一致性
    if (result.structure && result.metrics) {
      const fileCount = result.structure.filter(item => item.type === 'file').length;
      if (fileCount !== result.metrics.totalFiles) {
        issues.push('文件数量不一致');
      }
    }

    const isValid = issues.length === 0;

    return {
      isValid,
      issues,
      suggestions
    };
  }

  /**
   * 清理和归档错误日志
   */
  cleanupErrorLogs(): {
    cleanedCount: number;
    archivedCount: number;
    remainingCount: number;
  } {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 清理一周前的错误
    const cleanedErrors = this.errors.filter(error => error.timestamp > oneWeekAgo);
    const cleanedCount = this.errors.length - cleanedErrors.length;
    this.errors = cleanedErrors;

    // 归档一个月前的错误到日志文件
    const archivedCount = 0; // 实际实现中可以写入日志文件
    const remainingCount = this.errors.length;

    return { cleanedCount, archivedCount, remainingCount };
  }

  /**
   * 获取错误报告
   */
  getErrorReport(): {
    totalErrors: number;
    recentErrors: number;
    errorTypes: string[];
    healthScore: number;
    recommendations: string[];
  } {
    const recentErrors = this.errors.filter(error => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return error.timestamp > oneHourAgo;
    }).length;

    const errorTypes = [...new Set(this.errors.map(e => e.type))];
    const healthAnalysis = this.analyzeErrors();

    return {
      totalErrors: this.errors.length,
      recentErrors,
      errorTypes,
      healthScore: healthAnalysis.healthScore,
      recommendations: healthAnalysis.suggestions
    };
  }

  /**
   * 清空错误日志
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 获取错误数量
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(limit: number = 5): Array<{
    type: string;
    message: string;
    timestamp: Date;
  }> {
    return this.errors
      .slice(-limit)
      .map(error => ({
        type: error.type,
        message: error.message,
        timestamp: error.timestamp
      }));
  }
}