/**
 * 性能优化工具类
 */
export class PerformanceOptimizer {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * 分析性能瓶颈
     */
    analyzePerformanceBottlenecks(structure, metrics) {
        console.log('⚡ 分析性能瓶颈...');
        const bottlenecks = [];
        const recommendations = [];
        // 1. 文件大小分析
        const largeFiles = structure
            .filter(file => file.type === 'file' && file.size > 50000) // 大于50KB
            .sort((a, b) => b.size - a.size);
        if (largeFiles.length > 0) {
            bottlenecks.push({
                type: 'file-size',
                severity: largeFiles.length > 5 ? 'high' : 'medium',
                description: `${largeFiles.length}个文件过大，影响加载性能`,
                files: largeFiles.map(f => f.path)
            });
            recommendations.push('建议拆分大文件，提取公共功能到独立模块');
        }
        // 2. 复杂度分析
        const complexFunctions = structure
            .filter(file => file.type === 'file')
            .flatMap(file => file.functions?.filter(func => func && func.complexity > 10) || [])
            .sort((a, b) => b.complexity - a.complexity);
        if (complexFunctions.length > 0) {
            bottlenecks.push({
                type: 'complexity',
                severity: complexFunctions.length > 10 ? 'high' : 'medium',
                description: `${complexFunctions.length}个函数复杂度过高`,
                files: [...new Set(complexFunctions.map(f => f?.name || ''))]
            });
            recommendations.push('建议重构高复杂度函数，拆分为更小的函数');
        }
        // 3. 依赖关系分析
        const heavyDependencies = structure
            .filter(file => file.type === 'file')
            .map(file => ({
            path: file.path,
            dependencyCount: file.dependencies?.length || 0
        }))
            .filter(item => item.dependencyCount > 20)
            .sort((a, b) => b.dependencyCount - a.dependencyCount);
        if (heavyDependencies.length > 0) {
            bottlenecks.push({
                type: 'dependency',
                severity: heavyDependencies.length > 5 ? 'high' : 'medium',
                description: `${heavyDependencies.length}个文件依赖过多`,
                files: heavyDependencies.map(d => d.path)
            });
            recommendations.push('建议减少直接依赖，引入抽象层和接口');
        }
        // 4. 语言性能分析
        const performanceCriticalFiles = structure
            .filter(file => file.type === 'file' && this.isPerformanceCriticalLanguage(file.language))
            .filter(file => file.size > 100000); // 大于100KB的性能关键文件
        if (performanceCriticalFiles.length > 0) {
            bottlenecks.push({
                type: 'language',
                severity: performanceCriticalFiles.length > 3 ? 'high' : 'medium',
                description: `${performanceCriticalFiles.length}个性能关键语言文件过大`,
                files: performanceCriticalFiles.map(f => f.path)
            });
            recommendations.push('优化性能关键语言的代码，考虑使用缓存和数据结构优化');
        }
        // 计算优化评分 (0-100)
        const optimizationScore = this.calculateOptimizationScore(bottlenecks, metrics);
        return {
            bottlenecks,
            recommendations,
            optimizationScore
        };
    }
    /**
     * 生成优化建议
     */
    generateOptimizationSuggestions(bottlenecks, metrics) {
        const immediateActions = [];
        const longTermStrategy = [];
        bottlenecks.forEach(bottleneck => {
            switch (bottleneck.type) {
                case 'file-size':
                    immediateActions.push('拆分大文件，按功能模块重组代码');
                    longTermStrategy.push('建立代码模块化标准，限制单文件大小');
                    break;
                case 'complexity':
                    immediateActions.push('重构高复杂度函数，提取公共逻辑');
                    longTermStrategy.push('引入代码复杂度监控工具，设定复杂度阈值');
                    break;
                case 'dependency':
                    immediateActions.push('梳理依赖关系，移除不必要的依赖');
                    longTermStrategy.push('建立依赖管理规范，使用依赖注入模式');
                    break;
                case 'language':
                    immediateActions.push('优化性能关键代码，引入缓存机制');
                    longTermStrategy.push('性能测试自动化，建立性能基准');
                    break;
            }
        });
        // 如果没有发现瓶颈，提供一般性建议
        if (bottlenecks.length === 0) {
            immediateActions.push('当前代码性能良好，建议保持最佳实践');
            longTermStrategy.push('持续监控性能指标，预防性能退化');
        }
        return {
            immediateActions,
            longTermStrategy,
            estimatedEffort: {
                immediate: bottlenecks.length > 10 ? 'high' :
                    bottlenecks.length > 5 ? 'medium' : 'low',
                longTerm: 'medium'
            }
        };
    }
    /**
     * 计算优化评分
     */
    calculateOptimizationScore(bottlenecks, metrics) {
        if (bottlenecks.length === 0)
            return 95; // 无瓶颈，性能良好
        let score = 100;
        const severityWeight = {
            low: 5,
            medium: 10,
            high: 20
        };
        bottlenecks.forEach(bottleneck => {
            score -= severityWeight[bottleneck.severity];
        });
        // 根据基础指标调整评分
        if (metrics.averageComplexity > 15)
            score -= 10;
        if (metrics.totalFiles > 1000)
            score -= 5;
        if (metrics.totalLines > 50000)
            score -= 5;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 判断是否为性能关键语言
     */
    isPerformanceCriticalLanguage(language) {
        const criticalLanguages = [
            'javascript', 'typescript', 'python', 'ruby', 'php'
        ];
        return criticalLanguages.includes(language.toLowerCase());
    }
    /**
     * 生成性能报告
     */
    generatePerformanceReport(bottlenecks, optimizationScore, suggestions) {
        const priority = optimizationScore < 50 ? 'high' :
            optimizationScore < 80 ? 'medium' : 'low';
        const summary = `
性能优化评估完成，总体评分: ${optimizationScore}/100
优先级: ${priority}
发现 ${bottlenecks.length} 个性能瓶颈
`;
        const details = {
            bottlenecks: bottlenecks.map(b => `- ${b.description} (严重程度: ${b.severity})`).join('\n'),
            recommendations: [
                '立即采取的措施:',
                ...suggestions.immediateActions.map(action => `  - ${action}`),
                '',
                '长期策略:',
                ...suggestions.longTermStrategy.map(strategy => `  - ${strategy}`)
            ].join('\n'),
            score: `优化评分: ${optimizationScore}/100 (${this.getScoreDescription(optimizationScore)})`
        };
        return {
            summary,
            details,
            priority
        };
    }
    /**
     * 获取评分描述
     */
    getScoreDescription(score) {
        if (score >= 90)
            return '优秀 - 无需优化';
        if (score >= 80)
            return '良好 - 轻微优化';
        if (score >= 70)
            return '中等 - 需要关注';
        if (score >= 60)
            return '一般 - 需要优化';
        return '较差 - 急需优化';
    }
    /**
     * 执行性能分析并生成优化方案
     */
    async analyzeAndOptimize(structure, metrics) {
        console.log('🚀 开始性能分析和优化...');
        // 1. 分析性能瓶颈
        const analysis = this.analyzePerformanceBottlenecks(structure, metrics);
        // 2. 生成优化建议
        const suggestions = this.generateOptimizationSuggestions(analysis.bottlenecks, metrics);
        // 3. 生成性能报告
        const report = this.generatePerformanceReport(analysis.bottlenecks, analysis.optimizationScore, suggestions);
        // 4. 估算时间
        const estimatedTime = {
            analysis: '2-5分钟',
            optimization: `${suggestions.estimatedEffort.immediate === 'high' ? '3-5' :
                suggestions.estimatedEffort.immediate === 'medium' ? '1-3' : '0.5-1'}小时`,
            total: `${suggestions.estimatedEffort.immediate === 'high' ? '4-6' :
                suggestions.estimatedEffort.immediate === 'medium' ? '2-4' : '1-2'}小时`
        };
        return {
            analysis,
            suggestions,
            report,
            estimatedTime
        };
    }
}
//# sourceMappingURL=performance-optimizer.js.map