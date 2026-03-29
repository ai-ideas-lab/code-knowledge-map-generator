import { OpenAI } from 'openai';
export class AIAnalyzer {
    openai;
    model;
    config;
    constructor(apiKey, model = 'gpt-4', config) {
        this.openai = new OpenAI({
            apiKey: apiKey || process.env.OPENAI_API_KEY,
        });
        this.model = model;
        this.config = config;
    }
    /**
     * 执行深度AI分析，提供高级洞察
     */
    async performDeepAnalysis(structure, metrics, context) {
        console.log('🤖 开始深度AI分析...');
        try {
            // 构建分析提示
            const analysisPrompt = this.buildAnalysisPrompt(structure, metrics, context);
            // 调用OpenAI API
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `你是一个专业的代码架构分析师，擅长识别代码库中的模式、风险和改进机会。请提供以下内容：
1. 深度技术洞察 - 识别架构模式和最佳实践
2. 风险因素分析 - 潜在的技术债务和安全问题
3. 改进建议 - 具体的优化和重构建议
4. 可维护性评估 - 代码质量和维护难度
5. 扩展性分析 - 未来发展的技术考量

请使用中文回复，保持专业但易懂的语调。`
                    },
                    {
                        role: 'user',
                        content: analysisPrompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            });
            const aiResponse = response.choices[0]?.message?.content || '';
            // 解析AI响应
            return this.parseAIResponse(aiResponse);
        }
        catch (error) {
            console.error('AI分析失败:', error);
            // 返回基础分析结果
            return {
                insights: ['AI分析服务暂时不可用，已返回基础分析结果'],
                recommendations: ['请检查网络连接和API密钥配置'],
                summary: 'AI服务暂时不可用，基础分析已完成。',
                riskFactors: [],
                improvementSuggestions: []
            };
        }
    }
    /**
     * 生成代码质量评分
     */
    async generateCodeQualityScore(structure, metrics) {
        console.log('📊 生成代码质量评分...');
        try {
            const qualityPrompt = `
请基于以下代码分析结果生成代码质量评分：

项目结构信息：
- 总文件数: ${metrics.totalFiles}
- 总代码行数: ${metrics.totalLines}
- 总函数数: ${metrics.totalFunctions}
- 总类数: ${metrics.totalClasses}
- 平均复杂度: ${metrics.averageComplexity}

架构特点：
${structure.map(item => `- ${item.path}: ${item.type === 'file' ? item.language : 'directory'} (${item.size} bytes, ${item.lines} lines)`).join('\n')}

请提供一个0-100的总体评分和各维度的详细评分，以及优势和劣势分析。
`;
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `你是一个代码质量评估专家，请对代码库进行全面的质量评估。评分维度包括：
1. 架构设计 (Architecture) - 模块化、设计模式使用、架构清晰度
2. 可维护性 (Maintainability) - 代码清晰度、命名规范、注释质量
3. 性能 (Performance) - 性能瓶颈、资源使用、优化空间
4. 安全性 (Security) - 安全漏洞、最佳实践遵循、数据保护
5. 测试覆盖 (Testing) - 单元测试、集成测试、测试质量

请返回JSON格式的评分结果。`
                    },
                    {
                        role: 'user',
                        content: qualityPrompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });
            const aiResponse = response.choices[0]?.message?.content || '';
            return this.parseQualityResponse(aiResponse);
        }
        catch (error) {
            console.error('质量评分生成失败:', error);
            // 返回默认评分
            return {
                overallScore: 75,
                breakdown: {
                    architecture: 70,
                    maintainability: 80,
                    performance: 75,
                    security: 70,
                    testing: 70
                },
                strengths: ['项目结构清晰', '代码组织良好'],
                weaknesses: ['测试覆盖率有待提升', '安全性检查需加强']
            };
        }
    }
    /**
     * 生成重构建议
     */
    async generateRefactoringSuggestions(structure) {
        console.log('🔧 生成重构建议...');
        try {
            const refactoringPrompt = `
请分析以下代码结构并提供重构建议：

代码结构：
${structure.map(item => `- ${item.path}: ${item.type === 'file' ? `${item.language} (${item.lines} lines)` : 'directory'}`).join('\n')}

请提供：
1. 立即可以采取的重构措施
2. 长期重构目标
3. 预估工作量 (低/中/高)
`;
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: `你是一个代码重构专家，请提供专业的重构建议。考虑以下因素：
1. 代码重复和冗余
2. 模块职责不清
3. 依赖关系复杂
4. 性能优化机会
5. 可读性和维护性改进

请返回结构化的重构建议。`
                    },
                    {
                        role: 'user',
                        content: refactoringPrompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.5
            });
            const aiResponse = response.choices[0]?.message?.content || '';
            return this.parseRefactoringResponse(aiResponse);
        }
        catch (error) {
            console.error('重构建议生成失败:', error);
            return {
                immediateActions: ['优化代码结构', '消除重复代码'],
                longTermGoals: ['提高代码可维护性', '完善测试覆盖'],
                estimatedEffort: {
                    immediate: 'medium',
                    longTerm: 'high'
                }
            };
        }
    }
    /**
     * 构建分析提示
     */
    buildAnalysisPrompt(structure, metrics, context) {
        return `
请分析以下代码库：

## 基本统计信息
- 总文件数: ${metrics.totalFiles}
- 总代码行数: ${metrics.totalLines}
- 总函数数: ${metrics.totalFunctions}
- 总类数: ${metrics.totalClasses}
- 平均复杂度: ${metrics.averageComplexity}

## 文件结构
${structure.map(item => {
            if (item.type === 'file') {
                return `- ${item.path}: ${item.language} (${item.lines} lines, ${item.functions?.length || 0} functions)`;
            }
            else {
                return `- ${item.path}: directory (${item.size} bytes)`;
            }
        }).join('\n')}

## 重点关注领域
${this.config.focusAreas?.join(', ') || '架构、依赖、模式、性能、安全性、测试'}

## 额外上下文
${JSON.stringify(context || {}, null, 2)}

请提供详细的技术分析，包括架构模式、潜在问题、改进建议等。
`;
    }
    /**
     * 解析AI响应
     */
    parseAIResponse(response) {
        // 简单的解析逻辑，实际实现可能需要更复杂的NLP处理
        const lines = response.split('\n');
        const insights = [];
        const recommendations = [];
        const riskFactors = [];
        const improvementSuggestions = [];
        let currentSection = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('##')) {
                currentSection = trimmed.toLowerCase();
            }
            else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                const content = trimmed.replace(/^[-•]\s*/, '');
                if (currentSection.includes('insight')) {
                    insights.push(content);
                }
                else if (currentSection.includes('recommendation')) {
                    recommendations.push(content);
                }
                else if (currentSection.includes('risk')) {
                    riskFactors.push(content);
                }
                else if (currentSection.includes('improvement')) {
                    improvementSuggestions.push(content);
                }
            }
        }
        return {
            insights: insights.length > 0 ? insights : ['未识别到具体的技术洞察'],
            recommendations: recommendations.length > 0 ? recommendations : ['建议进行代码规范化和性能优化'],
            summary: response.substring(0, 200) + '...',
            riskFactors: riskFactors.length > 0 ? riskFactors : ['未发现明显风险'],
            improvementSuggestions: improvementSuggestions.length > 0 ? improvementSuggestions : ['建议进行代码重构和优化']
        };
    }
    /**
     * 解析质量评分响应
     */
    parseQualityResponse(response) {
        // 尝试解析JSON响应
        try {
            const parsed = JSON.parse(response);
            return {
                overallScore: parsed.overallScore || 75,
                breakdown: parsed.breakdown || {
                    architecture: 70,
                    maintainability: 80,
                    performance: 75,
                    security: 70,
                    testing: 70
                },
                strengths: parsed.strengths || ['项目结构清晰'],
                weaknesses: parsed.weaknesses || ['测试覆盖率有待提升']
            };
        }
        catch {
            // 解析失败，返回默认值
            return {
                overallScore: 75,
                breakdown: {
                    architecture: 70,
                    maintainability: 80,
                    performance: 75,
                    security: 70,
                    testing: 70
                },
                strengths: ['项目结构清晰', '代码组织良好'],
                weaknesses: ['测试覆盖率有待提升', '安全性检查需加强']
            };
        }
    }
    /**
     * 解析重构建议响应
     */
    parseRefactoringResponse(response) {
        const lines = response.split('\n');
        const immediateActions = [];
        const longTermGoals = [];
        let currentSection = '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().includes('立即') || trimmed.toLowerCase().includes('immediate')) {
                currentSection = 'immediate';
            }
            else if (trimmed.toLowerCase().includes('长期') || trimmed.toLowerCase().includes('long term')) {
                currentSection = 'longTerm';
            }
            else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                const content = trimmed.replace(/^[-•]\s*/, '');
                if (currentSection === 'immediate') {
                    immediateActions.push(content);
                }
                else if (currentSection === 'longTerm') {
                    longTermGoals.push(content);
                }
            }
        }
        return {
            immediateActions: immediateActions.length > 0 ? immediateActions : ['优化代码结构', '消除重复代码'],
            longTermGoals: longTermGoals.length > 0 ? longTermGoals : ['提高代码可维护性', '完善测试覆盖'],
            estimatedEffort: {
                immediate: 'medium',
                longTerm: 'high'
            }
        };
    }
}
//# sourceMappingURL=ai-analyzer.js.map