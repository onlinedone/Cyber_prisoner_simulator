# PowerShell脚本：清理system_prompt文件，移除所有调试代码
$filePath = "导入到酒馆/system_prompt_v3.5.5.txt"
$outputPath = "导入到酒馆/system_prompt_v3.5.6.txt"

Write-Host "正在读取文件..." -ForegroundColor Yellow
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "正在清理调试代码..." -ForegroundColor Yellow

# 移除所有 #region agent log ... #endregion 块
$content = $content -replace '(?s)// #region agent log[^#]*#endregion\s*', ''
$content = $content -replace '(?s)#region agent log[^#]*#endregion\s*', ''

# 移除所有包含fetch的try-catch块
$content = $content -replace '(?s)try\s*\{\s*fetch\([^}]*\}\s*catch\s*\([^)]+\)\s*\{\s*\}\s*', ''

# 移除单独的fetch调用
$content = $content -replace 'fetch\([^)]+\}\)\.catch\([^)]+\);?\s*', ''

# 移除console.log/warn/error/info调用（保留必要的console调用）
$content = $content -replace 'console\.(log|warn|error|info)\(''[^'']*''[^)]*\);?\s*', ''
$content = $content -replace 'console\.(log|warn|error|info)\([^)]+\);?\s*', ''

# 移除调试用的const变量定义（包含fetch或log的）
$content = $content -replace 'const\s+\w+Data\s*=\s*\{[^}]+\};\s*', ''

# 清理多余的空行（3个或更多空行替换为2个）
$content = $content -replace '\n{4,}', "`n`n`n"

Write-Host "正在保存清理后的文件..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText($outputPath, $content, [System.Text.Encoding]::UTF8)

Write-Host "清理完成！已保存到: $outputPath" -ForegroundColor Green
Write-Host "原文件: $filePath (未修改)" -ForegroundColor Gray
