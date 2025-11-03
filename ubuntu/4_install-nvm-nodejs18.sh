#!/bin/bash

# NVM 和 Node.js 18 自动安装脚本
# 支持 Ubuntu/Debian、Fedora/RHEL/CentOS、Arch Linux

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
    else
        print_error "无法检测操作系统类型"
        exit 1
    fi
    print_info "检测到操作系统: $OS"
}

# 安装必要的依赖
install_dependencies() {
    print_step "安装必要的依赖工具..."
    
    case $OS in
        ubuntu|debian|linuxmint)
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential
            ;;
        fedora|rhel|centos)
            sudo dnf install -y curl wget git gcc-c++ make || sudo yum install -y curl wget git gcc-c++ make
            ;;
        arch|manjaro)
            sudo pacman -Sy --noconfirm curl wget git base-devel
            ;;
        *)
            print_error "不支持的操作系统: $OS"
            exit 1
            ;;
    esac
    
    print_info "依赖安装完成"
}

# 检查 nvm 是否已安装
check_nvm() {
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        print_warning "NVM 已经安装"
        return 0
    fi
    return 1
}

# 安装 NVM
install_nvm() {
    if check_nvm; then
        print_warning "NVM 已存在，跳过安装步骤"
        return 0
    fi

    print_step "开始安装 NVM..."
    
    # 下载并安装 NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # 加载 NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    print_info "NVM 安装完成"
}

# 激活 NVM
activate_nvm() {
    print_step "激活 NVM 环境..."
    
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    if command -v nvm &> /dev/null || [ -s "$NVM_DIR/nvm.sh" ]; then
        print_info "NVM 已激活"
        return 0
    else
        print_error "NVM 激活失败"
        return 1
    fi
}

# 在 shell 配置文件中添加 NVM 自动加载
configure_shell() {
    print_step "配置 shell 以自动加载 NVM..."
    
    local config_file=""
    local nvm_init='export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"'
    
    # 检测使用的 shell
    if [ -n "$ZSH_VERSION" ]; then
        config_file="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        config_file="$HOME/.bashrc"
    else
        config_file="$HOME/.profile"
    fi
    
    # 检查是否已经配置了 NVM
    if [ -f "$config_file" ] && grep -q "NVM_DIR" "$config_file"; then
        print_warning "NVM 配置已存在于 $config_file，跳过配置步骤"
        return 0
    fi
    
    # 备份配置文件
    if [ -f "$config_file" ]; then
        cp "$config_file" "$config_file.backup.$(date +%Y%m%d%H%M%S)"
        print_info "已备份配置文件: $config_file"
    fi
    
    # 添加 NVM 配置
    echo "" >> "$config_file"
    echo "# NVM 配置" >> "$config_file"
    echo "$nvm_init" >> "$config_file"
    
    print_info "已添加 NVM 配置到 $config_file"
}

# 安装 Node.js 18
install_nodejs18() {
    print_step "安装 Node.js 18 稳定版本..."
    
    # 确保 NVM 已加载
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # 检查是否已经安装了 Node.js 18
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" == "18" ]; then
            print_warning "Node.js 18 已经安装: $(node -v)"
            print_info "当前 npm 版本: $(npm -v)"
            return 0
        fi
    fi
    
    # 安装 Node.js 18 LTS（稳定版）
    print_info "正在安装 Node.js 18 LTS..."
    nvm install 18
    
    # 设置为默认版本
    print_info "设置 Node.js 18 为默认版本..."
    nvm use 18
    nvm alias default 18
    
    # 验证安装
    if command -v node &> /dev/null; then
        print_info "Node.js 安装成功: $(node -v)"
        print_info "npm 版本: $(npm -v)"
    else
        print_error "Node.js 安装后验证失败"
        exit 1
    fi
}

# 主函数
main() {
    echo "======================================"
    echo "  NVM 和 Node.js 18 自动安装脚本"
    echo "======================================"
    echo ""

    detect_os
    install_dependencies
    install_nvm
    activate_nvm
    configure_shell
    install_nodejs18

    echo ""
    print_info "================================================"
    print_info "所有安装和配置已完成！"
    print_info "================================================"
    echo ""
    print_info "安装信息："
    print_info "  - NVM 版本: $(nvm --version 2>/dev/null || echo '已安装')"
    print_info "  - Node.js 版本: $(node -v 2>/dev/null || echo '请重新加载 shell')"
    print_info "  - npm 版本: $(npm -v 2>/dev/null || echo '请重新加载 shell')"
    echo ""
    print_warning "================================================"
    print_warning "重要提示：配置已写入 shell 配置文件"
    print_warning "================================================"
    echo ""
    print_error "⚠️  请立即运行以下命令以激活 NVM 和 Node.js："
    echo ""
    if [ -f "$HOME/.zshrc" ]; then
        print_info "    source ~/.zshrc"
        echo ""
        print_warning "或重新打开终端窗口，NVM 和 Node.js 将自动激活"
    elif [ -f "$HOME/.bashrc" ]; then
        print_info "    source ~/.bashrc"
        echo ""
        print_warning "或重新打开终端窗口，NVM 和 Node.js 将自动激活"
    fi
    echo ""
    print_info "常用 NVM 命令："
    print_info "  - nvm list              # 查看已安装的版本"
    print_info "  - nvm install <version> # 安装指定版本"
    print_info "  - nvm use <version>     # 切换到指定版本"
    print_info "  - nvm current           # 查看当前使用的版本"
    echo ""
}

# 运行主函数
main

