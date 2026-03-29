import { AnalysisResult, CodeStructure, DependencyAnalysis, CodeMetrics } from '../src/types.js';

export const mockAnalysisResult: AnalysisResult = {
  structure: [
    {
      type: 'file',
      name: 'index.ts',
      path: '/src/index.ts',
      size: 2048,
      language: 'typescript',
      lines: 100,
      functions: 5,
      complexity: 3,
      imports: ['express', 'lodash'],
      exports: ['main']
    },
    {
      type: 'directory',
      name: 'src',
      path: '/src',
      size: 8192,
      files: 8,
      subdirectories: 2,
      languages: ['typescript', 'javascript']
    },
    {
      type: 'file',
      name: 'package.json',
      path: '/package.json',
      size: 1024,
      language: 'json',
      lines: 50,
      dependencies: {
        'express': '^4.18.2',
        'lodash': '^4.17.21'
      }
    }
  ],
  dependencies: {
    direct: [
      { name: 'express', version: '^4.18.2', type: 'npm', category: 'web-framework' },
      { name: 'lodash', version: '^4.17.21', type: 'npm', category: 'utility' }
    ],
    indirect: [
      { name: 'body-parser', version: '^1.20.2', type: 'npm', category: 'middleware' }
    ],
    circular: [],
    outdated: [
      { name: 'lodash', current: '^4.17.21', latest: '^4.17.21', type: 'npm' }
    ]
  },
  metrics: {
    totalFiles: 15,
    totalLines: 1200,
    averageComplexity: 2.8,
    largestFile: {
      name: 'index.ts',
      size: 2048,
      path: '/src/index.ts'
    },
    averageFileSize: 512,
    testCoverage: 75,
    maintainability: 85
  },
  insights: [
    '项目架构清晰，模块化程度良好',
    '依赖管理规范，但存在轻微的循环依赖风险',
    '代码质量较高，可维护性强',
    'TypeScript使用规范，类型定义完整'
  ],
  recommendations: [
    '考虑添加ESLint配置以统一代码风格',
    '建议增加单元测试覆盖率至90%以上',
    '可以考虑引入CI/CD流水线',
    '建议添加API文档生成'
  ],
  aiSummary: '这是一个结构良好的TypeScript Web项目，使用Express框架。项目具有清晰的代码组织，依赖管理规范，整体质量较高。建议进一步提升测试覆盖率并建立完整的CI/CD流程。'
};

export const mockEmptyResult: AnalysisResult = {
  structure: [],
  dependencies: {
    direct: [],
    indirect: [],
    circular: [],
    outdated: []
  },
  metrics: {
    totalFiles: 0,
    totalLines: 0,
    averageComplexity: 0,
    largestFile: { name: '', size: 0, path: '' },
    averageFileSize: 0,
    testCoverage: 0,
    maintainability: 0
  },
  insights: [],
  recommendations: [],
  aiSummary: '空项目或无法分析的目录结构'
};

export const mockErrorResult: Partial<AnalysisResult> = {
  structure: [],
  dependencies: {
    direct: [],
    indirect: [],
    circular: [],
    outdated: []
  },
  metrics: {
    totalFiles: 0,
    totalLines: 0,
    averageComplexity: 0,
    largestFile: { name: '', size: 0, path: '' },
    averageFileSize: 0,
    testCoverage: 0,
    maintainability: 0
  },
  insights: ['分析过程中出现错误，请检查项目结构'],
  recommendations: ['确保项目包含有效的源代码文件'],
  aiSummary: '分析过程中遇到问题，项目可能不包含可分析的代码文件'
};