# PowerShell 脚本：启动支持 CORS 的 HTTP 服务器
# 使用方法：在 PowerShell 中运行 .\start_cors_server.ps1

$separator = "========================================"
Write-Host $separator -ForegroundColor Cyan
Write-Host "正在启动支持 CORS 的 HTTP 服务器..." -ForegroundColor Yellow

# 检查 Python 是否可用
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
}
elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}
else {
    Write-Host "错误：未找到 Python！" -ForegroundColor Red
    Write-Host "请确保已安装 Python 3.x" -ForegroundColor Red
    exit 1
}

# 检查 cors_server.py 是否存在
if (-not (Test-Path "cors_server.py")) {
    Write-Host "错误：找不到 cors_server.py 文件！" -ForegroundColor Red
    Write-Host "请确保在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 启动服务器
Write-Host "使用命令: $pythonCmd cors_server.py" -ForegroundColor Gray
Write-Host $separator -ForegroundColor Cyan
Write-Host ""

& $pythonCmd cors_server.py
