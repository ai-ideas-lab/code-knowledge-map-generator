# Code Knowledge Map Generator

AI驱动的代码库知识地图生成器 - 帮助开发者快速理解代码架构。

## ✨ 功能特性

- 🔍 **深度代码分析**: 自动扫描和分析代码库结构
- 🤖 **AI智能洞察**: 使用GPT-4提供架构分析和改进建议
- 📊 **多格式输出**: 支持Markdown、JSON、HTML格式
- 📁 **项目结构可视化**: 生成清晰的目录树和文件分布
- 🔗 **依赖关系分析**: 识别循环依赖和过时依赖
- ⚡ **性能指标**: 代码复杂度、文件大小、测试覆盖率等
- 🎯 **交互式CLI**: 友好的命令行界面

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/ai-ideas-lab/code-knowledge-map-generator.git
cd code-knowledge-map-generator

# 安装依赖
npm install

# 全局安装（可选）
npm install -g .
```

### 基本使用

```bash
# 生成知识地图
code-knowledge-map generate ./my-project --output ./docs --format markdown

# 分析特定目录
code-knowledge-map analyze ./src --depth 3 --focus architecture dependencies

# 交互式模式
code-knowledge-map interactive
```

## 📖 详细文档

### 命令行选项

#### generate - 生成知识地图

```bash
code-knowledge-map generate <path> [options]
```

**参数:**
- `<path>`: 目标代码库路径

**选项:**
- `-o, --output <path>`: 输出目录 (默认: ./knowledge-map)
- `-f, --format <format>`: 输出格式 (markdown|json|html, 默认: markdown)
- `--include-tests`: 包含测试文件
- `--exclude-patterns <patterns...>`: 排除的文件模式
- `--ai-model <model>`: AI模型 (默认: gpt-4)

**示例:**
```bash
# 生成Markdown格式文档
code-knowledge-map generate ./my-project --output ./docs --format markdown

# 包含测试文件，排除测试目录
code-knowledge-map generate ./project \
  --output ./analysis \
  --format html \
  --include-tests \
  --exclude-patterns "test/**" "__tests__/**"

# 使用特定AI模型
code-knowledge-map generate ./code --ai-model gpt-4-turbo
```

#### analyze - 代码分析

```bash
code-knowledge-map analyze <path> [options]
```

**参数:**
- `<path>`: 分析路径

**选项:**
- `--depth <number>`: 分析深度 (默认: 3)
- `--focus <areas...>`: 分析重点 (architecture, dependencies, patterns, performance, security, testing)

**示例:**
```bash
# 分析架构
code-knowledge-map analyze ./src --focus architecture dependencies

# 深度分析性能相关代码
code-knowledge-map analyze ./performance --depth 5 --focus performance
```

#### interactive - 交互式模式

```bash
code-knowledge-map interactive
```

启动交互式界面，逐步引导用户完成知识地图生成。

## 📊 输出格式

### Markdown 格式

生成包含以下内容的文档：
- 📊 总体统计表格
- 🔍 AI洞察
- 💡 改进建议
- 📁 项目结构
- 🏗️ 依赖分析
- 📈 代码质量指标
- 🤖 AI架构总结

### JSON 格式

结构化的数据输出，包含完整的分析结果：
```json
{
  "metadata": { "generatedAt": "2026-03-29T...", "format": "json" },
  "summary": { "totalFiles": 150, "totalLines": 12500 },
  "insights": ["洞察1", "洞察2"],
  "structure": [...],
  "dependencies": {...},
  "metrics": {...}
}
```

### HTML 格式

美观的网页界面，包含：
- 响应式设计
- 交互式图表
- 代码高亮
- 统计卡片

## 🔧 配置

### 环境变量

```bash
# OpenAI API密钥 (必需)
OPENAI_API_KEY=your_openai_api_key_here

# 默认AI模型
OPENAI_MODEL=gpt-4

# 最大文件大小限制 (MB)
MAX_FILE_SIZE=10
```

### 配置文件

创建 `.code-knowledge-map-config.json` 文件：

```json
{
  "defaultOutput": "./docs",
  "defaultFormat": "markdown",
  "includeTests": false,
  "excludePatterns": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**"
  ],
  "aiModel": "gpt-4",
  "focusAreas": ["architecture", "dependencies"]
}
```

## 🎯 支持的语言

- JavaScript / TypeScript
- Python
- Java
- Go
- Rust
- C / C++
- Vue.js
- React / JSX / TSX

## 📈 分析指标

### 代码质量指标
- **文件总数**: 统计所有源代码文件
- **代码行数**: 总代码行数统计
- **函数复杂度**: 圈复杂度分析
- **文件大小**: 最大文件和平均文件大小

### 依赖分析
- **直接依赖**: 项目直接依赖的包
- **间接依赖**: 传递性依赖
- **循环依赖**: 检测循环引用
- **过时依赖**: 检查可用的更新版本

### 架构洞察
- **模块结构**: 代码组织方式分析
- **耦合度**: 模块间耦合程度
- **可维护性**: 代码维护难度评估
- **扩展性**: 架构扩展能力分析

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ai-ideas-lab/code-knowledge-map-generator.git
cd code-knowledge-map-generator

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint
```

### 项目结构

```
src/
├── index.ts          # CLI入口和主类
├── types.ts          # TypeScript类型定义
├── analyzer.ts       # 代码分析引擎
├── generator.ts      # 文档生成器
└── utils/           # 工具函数
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

- 🐛 [问题反馈](https://github.com/ai-ideas-lab/code-knowledge-map-generator/issues)
- 💬 [讨论区](https://github.com/ai-ideas-lab/code-knowledge-map-generator/discussions)
- 📧 [邮件联系](mailto:contact@ai-ideas-lab.com)

---

*AI Ideas Lab - 让AI技术惠及每个开发者*