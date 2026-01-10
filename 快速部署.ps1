# 快速部署脚本 - 赛博坐牢模拟器增强脚本
# 用于将项目上传到 GitHub 并生成调用网址

Write-Host "🚀 开始部署赛博坐牢模拟器增强脚本..." -ForegroundColor Cyan

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤 1: 打包项目
Write-Host "`n📦 步骤 1: 打包项目..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 打包失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 打包完成" -ForegroundColor Green

# 步骤 2: 检查 Git 状态
Write-Host "`n📊 步骤 2: 检查 Git 状态..." -ForegroundColor Yellow
git status --short

# 步骤 3: 拉取最新代码
Write-Host "`n⬇️  步骤 3: 拉取最新代码..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  警告：拉取代码时出现问题，可能没有远程分支或需要解决冲突" -ForegroundColor Yellow
}

# 步骤 4: 添加文件
Write-Host "`n➕ 步骤 4: 添加文件到 Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ 文件已添加" -ForegroundColor Green

# 步骤 5: 提交更改
Write-Host "`n💾 步骤 5: 提交更改..." -ForegroundColor Yellow
$commitMessage = Read-Host "请输入提交信息（直接回车使用默认信息）"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "feat: 更新赛博坐牢模拟器增强脚本 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  警告：提交失败，可能没有更改需要提交" -ForegroundColor Yellow
}

# 步骤 6: 推送到 GitHub
Write-Host "`n⬆️  步骤 6: 推送到 GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败，请检查网络连接和 Git 配置" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 推送完成" -ForegroundColor Green

# 步骤 7: 创建版本标签
Write-Host "`n🏷️  步骤 7: 创建版本标签..." -ForegroundColor Yellow
$version = Read-Host "请输入版本号（例如：v1.0.0，直接回车使用 v1.0.0）"
if ([string]::IsNullOrWhiteSpace($version)) {
    $version = "v1.0.0"
}

$tagMessage = Read-Host "请输入标签信息（直接回车使用默认信息）"
if ([string]::IsNullOrWhiteSpace($tagMessage)) {
    $tagMessage = "版本 $version：赛博坐牢模拟器增强脚本完整系统"
}

git tag -a $version -m $tagMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  警告：标签创建失败，标签可能已存在" -ForegroundColor Yellow
    $overwrite = Read-Host "是否删除并重新创建标签？（y/N）"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        git tag -d $version
        git push origin :refs/tags/$version
        git tag -a $version -m $tagMessage
    }
}

git push origin $version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 标签推送失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 标签创建并推送完成" -ForegroundColor Green

# 步骤 8: 获取 commit hash
Write-Host "`n📝 步骤 8: 获取 commit hash..." -ForegroundColor Yellow
$commitHash = git rev-parse HEAD
Write-Host "当前 commit hash: $commitHash" -ForegroundColor Cyan

# 步骤 9: 生成调用网址
Write-Host "`n🌐 调用网址已生成：" -ForegroundColor Green
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "主脚本（用于 SillyTavern 脚本导入）：" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@$version/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "状态栏界面（用于前端界面）：" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host '$(''body'').load(''https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@' + $version + '/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html'');' -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "使用 commit hash（精确版本）：" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@$commitHash/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "📋 请查看 'GitHub部署指南.md' 了解详细使用说明" -ForegroundColor Cyan
