import { AnalysisConfig, GenerateResult, AnalysisResult } from './types.js';
export declare class DocumentGenerator {
    private config;
    private analysisResult;
    constructor(config: AnalysisConfig, analysisResult: AnalysisResult);
    generate(): Promise<GenerateResult>;
    private generateMarkdown;
    private generateStructureMarkdown;
    private generateDetailedStructureMarkdown;
    private generateDependencyMarkdown;
    private generateDetailedDependencyMarkdown;
    private calculateDependencyDepth;
    private generateMetricsMarkdown;
    private generateQualityReportMarkdown;
    private generateJSON;
    private generateHTML;
    private generateTreeStructure;
    private getFileIcon;
    private formatFileSize;
}
//# sourceMappingURL=generator.d.ts.map