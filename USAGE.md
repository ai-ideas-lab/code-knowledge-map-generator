# Code Knowledge Map Generator 使用示例

这个示例将展示如何使用 Code Knowledge Map Generator 来分析一个真实的项目并生成知识地图。

## 快速开始

### 1. 安装工具

```bash
# 克隆项目
git clone https://github.com/ai-ideas-lab/code-knowledge-map-generator.git
cd code-knowledge-map-generator

# 安装依赖
npm install

# 全局安装（可选）
sudo ./install.sh
```

### 2. 基本使用

#### 分析当前目录

```bash
# 生成 Markdown 格式的知识地图
code-knowledge-map generate . --output ./docs --format markdown

# 分析特定目录
code-knowledge-map analyze ./src --focus architecture dependencies

# 交互式模式
code-knowledge-map interactive
```

#### 分析其他项目

```bash
# 分析 React 项目
code-knowledge-map generate ./my-react-app --output ./react-analysis --format html

# 包含测试文件
code-knowledge-map generate ./project --include-tests --exclude-patterns "test/**"

# 使用特定 AI 模型
code-knowledge-map generate ./code --ai-model gpt-4-turbo
```

### 3. 输出示例

#### Markdown 输出示例

生成的文档包含以下部分：

```markdown
# 代码库知识地图 - 2026-03-29

## 📊 总体统计

| 指标 | 数值 |
|------|------|
| 总文件数 | 150 |
| 总代码行数 | 12,500 |
| 函数总数 | 450 |
| 类总数 | 85 |
| 平均复杂度 | 3.2 |
| 依赖总数 | 45 |

## 🔍 AI洞察

- 代码库结构清晰，模块划分合理
- 存在3个函数复杂度过高，建议重构
- 依赖关系健康，无循环依赖
- 测试覆盖率较高，达到85%

## 💡 改进建议

- 考虑将超过50行的函数拆分为更小的函数
- 增加单元测试覆盖率到90%以上
- 引入代码质量检查工具
- 优化大型文件的依赖结构
```

#### JSON 输出示例

```json
{
  "metadata": {
    "generatedAt": "2026-03-29T10:30:00Z",
    "format": "json",
    "targetPath": "./project",
    "outputPath": "./analysis"
  },
  "summary": {
    "totalFiles": 150,
    "totalLines": 12500,
    "totalFunctions": 450,
    "totalClasses": 85,
    "averageComplexity": 3.2
  },
  "insights": [
    "代码库结构清晰",
    "模块划分合理",
    "依赖关系健康"
  ],
  "structure": [...],
  "dependencies": {
    "totalDependencies": 45,
    "directDependencies": 25,
    "indirectDependencies": 20,
    "circularDependencies": []
  },
  "metrics": {
    "totalFiles": 150,
    "totalLines": 12500,
    "largestFiles": [...]
  }
}
```

### 4. 高级用法

#### 批量分析多个项目

```bash
#!/bin/bash

# 批量分析多个项目
projects=(
    "./project1"
    "./project2"
    "./project3"
)

for project in "${projects[@]}"; do
    if [[ -d "$project" ]]; then
        echo "分析项目: $project"
        code-knowledge-map generate "$project" \
            --output "./analysis/$(basename "$project")" \
            --format markdown \
            --include-tests
    fi
done
```

#### 集成到 CI/CD

```yaml
# .github/workflows/analysis.yml
name: Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Code Knowledge Map Generator
      run: |
        npm install -g code-knowledge-map-generator
    
    - name: Generate Knowledge Map
      run: |
        code-knowledge-map generate . \
          --output ./docs/knowledge-map \
          --format markdown \
          --exclude-patterns "node_modules/**" \
          "dist/**" \
          "build/**"
    
    - name: Upload Analysis Results
      uses: actions/upload-artifact@v3
      with:
        name: code-analysis
        path: ./docs/
```

### 5. 配置文件

创建 `.code-knowledge-map-config.json` 来自定义配置：

```json
{
  "defaultOutput": "./docs",
  "defaultFormat": "markdown",
  "includeTests": false,
  "excludePatterns": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "build/**",
    "*.test.js",
    "*.spec.js"
  ],
  "aiModel": "gpt-4",
  "focusAreas": ["architecture", "dependencies", "performance"]
}
```

### 6. 与其他工具集成

#### VS Code 集成

创建 VS Code 任务：

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate Knowledge Map",
      "type": "shell",
      "command": "code-knowledge-map generate ${workspaceFolder}",
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "problemMatcher": []
    }
  ]
}
```

#### Git Hook 集成

创建 pre-commit hook：

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 在提交前生成知识地图
code-knowledge-map generate . --output ./analysis --format json

# 添加分析结果到提交
git add analysis/ || true
```

### 7. 常见问题解决

#### 权限问题

```bash
# 如果遇到权限问题，尝试
sudo chown -R $(whoami):$(whoami) /usr/local/bin
```

#### AI API 配置

```bash
# 确保设置了 OpenAI API 密钥
export OPENAI_API_KEY=your_api_key_here

# 或者在环境变量文件中
echo "OPENAI_API_KEY=your_api_key_here" >> .env
```

#### 性能优化

```bash
# 对于大型项目，使用排除模式
code-knowledge-map generate ./large-project \
  --exclude-patterns "node_modules/**" \
  "dist/**" \
  "build/**" \
  "vendor/**"
```

### 8. 故障排除

#### 常见错误

1. **"找不到 Node.js"**
   ```bash
   # 确保 Node.js 在 PATH 中
   which node
   node --version
   ```

2. **"AI 分析失败"**
   ```bash
   # 检查网络连接和 API 密钥
   curl -s https://api.openai.com/v1/models
   ```

3. **"文件权限错误"**
   ```bash
   # 检查文件权限
   ls -la
   chmod +x code-knowledge-map
   ```

#### 调试模式

```bash
# 启用详细输出
code-knowledge-map generate . --verbose

# 检查配置
code-knowledge-map generate . --dry-run
```

### 9. 最佳实践

1. **定期分析**：将知识地图生成添加到开发工作流中
2. **版本控制**：将分析结果提交到版本控制系统
3. **团队协作**：使用分析结果进行代码评审和重构讨论
4. **持续改进**：根据分析结果持续优化代码质量
5. **文档维护**：保持生成的文档与代码同步更新

### 10. 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与开发。

---

*这个示例展示了 Code Knowledge Map Generator 的主要用法和集成方法。*