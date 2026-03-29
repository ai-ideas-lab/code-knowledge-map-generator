#!/bin/bash

# Code Knowledge Map Generator - 开发脚本
# 用于开发和测试的工具脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 Code Knowledge Map Generator 开发脚本${NC}"

# 功能函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查项目依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装。请安装 Node.js 18+ 版本。"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装。请安装 npm。"
        exit 1
    fi
    
    log_info "Node.js 版本: $(node --version)"
    log_info "npm 版本: $(npm --version)"
}

# 安装依赖
install_deps() {
    log_info "安装项目依赖..."
    npm install
    log_info "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    npm run build
    log_info "项目构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    npm test
    log_info "测试完成"
}

# 运行测试覆盖率
run_coverage() {
    log_info "运行测试覆盖率..."
    npm run test -- --coverage
    log_info "测试覆盖率报告已生成"
}

# 运行开发模式
run_dev() {
    log_info "启动开发模式..."
    npm run dev
}

# 代码检查
lint_code() {
    log_info "代码检查..."
    npm run lint
    log_info "代码检查完成"
}

# 代码修复
lint_fix() {
    log_info "自动修复代码问题..."
    npm run lint:fix
    log_info "代码修复完成"
}

# 创建测试项目
create_test_project() {
    local test_dir="./test-project"
    log_info "创建测试项目: $test_dir"
    
    mkdir -p "$test_dir"
    
    # 创建 package.json
    cat > "$test_dir/package.json" << EOF
{
  "name": "test-project",
  "version": "1.0.0",
  "description": "测试项目",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  }
}
EOF
    
    # 创建 JavaScript 文件
    cat > "$test_dir/index.js" << EOF
const express = require('express');
const _ = require('lodash');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const message = 'Hello World!';
  res.send(message);
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});

module.exports = app;
EOF
    
    # 创建 TypeScript 文件
    cat > "$test_dir/types.ts" << EOF
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(id: number, name: string, email: string): User {
  return { id, name, email };
}

export { User, createUser };
EOF
    
    log_info "测试项目创建完成"
}

# 清理项目
clean_project() {
    log_info "清理项目..."
    rm -rf dist coverage test-project test-output
    log_info "项目清理完成"
}

# 显示帮助信息
show_help() {
    echo "Code Knowledge Map Generator 开发脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  install     - 安装项目依赖"
    echo "  build       - 构建项目"
    echo "  test        - 运行测试"
    echo "  coverage    - 运行测试覆盖率"
    echo "  dev         - 启动开发模式"
    echo "  lint        - 代码检查"
    echo "  lint:fix    - 自动修复代码"
    echo "  create-test - 创建测试项目"
    echo "  clean       - 清理项目"
    echo "  help        - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 install    # 安装依赖"
    echo "  $0 test       # 运行测试"
    echo "  $0 dev        # 开发模式"
}

# 主函数
main() {
    case "${1:-help}" in
        install)
            check_dependencies
            install_deps
            ;;
        build)
            check_dependencies
            build_project
            ;;
        test)
            check_dependencies
            run_tests
            ;;
        coverage)
            check_dependencies
            run_coverage
            ;;
        dev)
            check_dependencies
            run_dev
            ;;
        lint)
            check_dependencies
            lint_code
            ;;
        lint:fix)
            check_dependencies
            lint_fix
            ;;
        create-test)
            create_test_project
            ;;
        clean)
            clean_project
            ;;
        help)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"