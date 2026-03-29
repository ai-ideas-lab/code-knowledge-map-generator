#!/bin/bash

# Code Knowledge Map Generator - 全局安装脚本
# 将工具安装到全局 npm 范围

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_BIN_DIR="/usr/local/bin"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查权限
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要超级用户权限来安装到全局。"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 检查 Node.js 和 npm
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装。请先安装 Node.js 18+ 版本。"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装。请先安装 npm。"
        exit 1
    fi
    
    log_info "Node.js 版本: $(node --version)"
    log_info "npm 版本: $(npm --version)"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    cd "$PROJECT_ROOT"
    npm install
    npm run build
    
    if [[ ! -d "dist" ]]; then
        log_error "构建失败: dist 目录不存在"
        exit 1
    fi
    
    log_info "项目构建完成"
}

# 创建可执行文件
create_executable() {
    local exec_path="$GLOBAL_BIN_DIR/code-knowledge-map"
    
    log_info "创建可执行文件: $exec_path"
    
    cat > "$exec_path" << 'EOF'
#!/bin/bash

# Code Knowledge Map Generator - 全局可执行文件

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Node.js 可执行文件路径
NODE_EXEC="$(which node)"

# 如果不在 macOS 上，可能需要特殊处理
if [[ -z "$NODE_EXEC" ]]; then
    echo "错误: 找不到 Node.js 可执行文件"
    exit 1
fi

# 运行应用
exec "$NODE_EXEC" "$SCRIPT_DIR/../lib/index.js" "$@"
EOF
    
    chmod +x "$exec_path"
    
    if [[ -x "$exec_path" ]]; then
        log_info "可执行文件创建成功"
    else
        log_error "可执行文件创建失败"
        exit 1
    fi
}

# 验证安装
verify_install() {
    log_info "验证安装..."
    
    if command -v code-knowledge-map &> /dev/null; then
        log_info "✅ code-knowledge-map 命令可用"
        
        # 测试基本功能
        if code-knowledge-map --help &> /dev/null; then
            log_info "✅ 命令基本功能正常"
        else
            log_warn "⚠️ 命令基本功能异常"
        fi
    else
        log_error "❌ code-knowledge-map 命令不可用"
        exit 1
    fi
}

# 显示安装完成信息
show_completion() {
    echo ""
    echo -e "${GREEN}🎉 Code Knowledge Map Generator 安装完成！${NC}"
    echo ""
    echo "使用方法:"
    echo "  code-knowledge-map generate <路径>    # 生成知识地图"
    echo "  code-knowledge-map analyze <路径>     # 分析代码"
    echo "  code-knowledge-map interactive       # 交互模式"
    echo ""
    echo "示例:"
    echo "  code-knowledge-map generate ./my-project --output ./docs --format markdown"
    echo "  code-knowledge-map analyze ./src --focus architecture dependencies"
    echo ""
    echo "更多信息请查看 README.md"
    echo ""
}

# 主函数
main() {
    log_info "开始安装 Code Knowledge Map Generator..."
    
    check_permissions
    check_node
    build_project
    create_executable
    verify_install
    show_completion
}

# 运行主函数
main "$@"