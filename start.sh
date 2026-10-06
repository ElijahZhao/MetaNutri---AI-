#!/bin/bash
# MetaNutri 一键启动脚本
# 用法: ./start.sh [--install] [--backend] [--frontend] [--all]
#   --install  安装所有依赖
#   --backend  仅启动后端
#   --frontend 仅启动前端
#   --all      启动前后端 (默认)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# 进程ID文件
BACKEND_PID_FILE="$ROOT_DIR/.backend.pid"
FRONTEND_PID_FILE="$ROOT_DIR/.frontend.pid"

print_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# 安装后端依赖
install_backend() {
    print_info "安装后端依赖..."
    cd "$BACKEND_DIR"
    pip install -r requirements.txt
    print_success "后端依赖安装完成"
}

# 安装前端依赖
install_frontend() {
    print_info "安装前端依赖..."
    cd "$FRONTEND_DIR"
    npm install
    print_success "前端依赖安装完成"
}

# 启动后端
start_backend() {
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat $BACKEND_PID_FILE)" 2>/dev/null; then
        print_warning "后端已在运行中 (PID: $(cat $BACKEND_PID_FILE))"
        return 0
    fi

    print_info "启动后端服务..."
    cd "$BACKEND_DIR"
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$ROOT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$BACKEND_PID_FILE"

    sleep 3
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "后端已启动 (PID: $BACKEND_PID)"
        print_info "API 文档: http://localhost:8000/docs"
    else
        print_error "后端启动失败，请查看 backend.log"
        exit 1
    fi
}

# 启动前端
start_frontend() {
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat $FRONTEND_PID_FILE)" 2>/dev/null; then
        print_warning "前端已在运行中 (PID: $(cat $FRONTEND_PID_FILE))"
        return 0
    fi

    print_info "启动前端服务..."
    cd "$FRONTEND_DIR"
    npm run dev > "$ROOT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

    sleep 5
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "前端已启动 (PID: $FRONTEND_PID)"
        print_info "前端地址: http://localhost:3000"
    else
        print_error "前端启动失败，请查看 frontend.log"
        exit 1
    fi
}

# 停止服务
stop_all() {
    print_info "停止所有服务..."
    for pid_file in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
        if [ -f "$pid_file" ]; then
            PID=$(cat "$pid_file")
            if kill -0 $PID 2>/dev/null; then
                kill $PID
                print_success "已停止进程 $PID"
            fi
            rm -f "$pid_file"
        fi
    done
}

# 显示状态
show_status() {
    echo ""
    print_info "=== MetaNutri 服务状态 ==="
    if [ -f "$BACKEND_PID_FILE" ] && kill -0 "$(cat $BACKEND_PID_FILE)" 2>/dev/null; then
        print_success "后端运行中 (PID: $(cat $BACKEND_PID_FILE)) - http://localhost:8000"
    else
        print_error "后端未运行"
    fi
    if [ -f "$FRONTEND_PID_FILE" ] && kill -0 "$(cat $FRONTEND_PID_FILE)" 2>/dev/null; then
        print_success "前端运行中 (PID: $(cat $FRONTEND_PID_FILE)) - http://localhost:3000"
    else
        print_error "前端未运行"
    fi
    echo ""
}

# 显示帮助
show_help() {
    echo "MetaNutri 启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --install     安装所有依赖 (前后端)"
    echo "  --backend     仅启动后端"
    echo "  --frontend    仅启动前端"
    echo "  --all         启动前后端 (默认)"
    echo "  --stop        停止所有服务"
    echo "  --status      查看服务状态"
    echo "  --help        显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 --install --all    # 安装依赖并启动所有服务"
    echo "  $0 --stop              # 停止所有服务"
}

# 主逻辑
case "$1" in
    --install)
        install_backend
        install_frontend
        ;;
    --backend)
        start_backend
        ;;
    --frontend)
        start_frontend
        ;;
    --stop)
        stop_all
        ;;
    --status)
        show_status
        ;;
    --help)
        show_help
        ;;
    --all|"")
        start_backend
        start_frontend
        show_status
        ;;
    *)
        print_error "未知选项: $1"
        show_help
        exit 1
        ;;
esac
