# 批量移除调试日志脚本
$files = @(
    "src\赛博坐牢模拟器增强脚本\event_system.ts",
    "src\赛博坐牢模拟器增强脚本\worldbook_loader.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        # 移除所有调试日志块（包括多行）
        $content = $content -replace '(?s)// #region agent log.*?// #endregion\s*', ''
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "已处理: $file"
    }
}

Write-Host "完成！"
