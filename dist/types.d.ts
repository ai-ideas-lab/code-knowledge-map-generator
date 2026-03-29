export interface AnalysisConfig {
    projectPath: string;
    outputPath?: string;
    format?: 'markdown' | 'json' | 'html';
    includeTests: boolean;
    excludePatterns?: string[];
    depth?: number;
    focusAreas?: string[];
    aiModel?: string;
    maxFileSize?: number;
}
export interface CodeStructure {
    name: string;
    type: 'file' | 'directory' | 'module';
    path: string;
    size: number;
    lines: number;
    language: string;
    dependencies: string[];
    exports?: string[];
    imports?: string[];
    functions?: FunctionInfo[];
    classes?: ClassInfo[];
    complexity?: number;
    lastModified: Date;
}
export interface FunctionInfo {
    name: string;
    line: number;
    parameters: string[];
    returnType: string;
    complexity: number;
    isAsync: boolean;
    isExported: boolean;
    documentation?: string;
}
export interface ClassInfo {
    name: string;
    line: number;
    methods: MethodInfo[];
    properties: PropertyInfo[];
    extends: string | null;
    implements?: string[];
    documentation?: string;
}
export interface MethodInfo {
    name: string;
    line: number;
    parameters: string[];
    returnType: string;
    visibility: 'public' | 'private' | 'protected';
    isStatic: boolean;
    isAsync: boolean;
    complexity: number;
    documentation?: string;
}
export interface PropertyInfo {
    name: string;
    line: number;
    type: string;
    visibility: 'public' | 'private' | 'protected';
    isStatic: boolean;
    defaultValue?: string;
    documentation?: string;
}
export interface AnalysisResult {
    structure: CodeStructure[];
    dependencies: DependencyAnalysis;
    metrics: CodeMetrics;
    insights: string[];
    recommendations: string[];
    aiSummary: string;
    additionalData?: {
        qualityScore?: {
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
        };
        refactoringSuggestions?: {
            immediateActions: string[];
            longTermGoals: string[];
            estimatedEffort: {
                immediate: 'low' | 'medium' | 'high';
                longTerm: 'low' | 'medium' | 'high';
            };
        };
        riskFactors?: string[];
        improvementSuggestions?: string[];
    };
}
export interface DependencyAnalysis {
    totalDependencies: number;
    directDependencies: string[];
    indirectDependencies: string[];
    dependencyGraph: Record<string, string[]>;
    circularDependencies: string[][];
    outdatedDependencies?: PackageInfo[];
}
export interface PackageInfo {
    name: string;
    current: string;
    latest: string;
    isDeprecated: boolean;
}
export interface CodeMetrics {
    totalFiles: number;
    totalLines: number;
    totalFunctions: number;
    totalClasses: number;
    averageComplexity: number;
    largestFiles: Array<{
        path: string;
        size: number;
        lines: number;
    }>;
    mostComplexFunctions: Array<{
        name: string;
        complexity: number;
        path: string;
    }>;
    testCoverage?: number;
}
export interface GenerateResult {
    outputPath: string;
    format: string;
    stats: CodeMetrics;
    insights: string[];
    generatedFiles: string[];
    processingTime: number;
}
export interface AnalysisFocus {
    architecture: boolean;
    dependencies: boolean;
    patterns: boolean;
    performance: boolean;
    security: boolean;
    testing: boolean;
}
export interface DocumentGeneratorConfig {
    outputDir: string;
    format: 'markdown' | 'json' | 'html';
    includeMetrics: boolean;
    includeInsights: boolean;
    maxDepth?: number;
    theme?: 'light' | 'dark';
}
//# sourceMappingURL=types.d.ts.map