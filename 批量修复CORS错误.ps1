# 批量修复 CORS 错误脚本
# 在所有调试日志 fetch 调用前添加环境检测

$scriptPath = "src/赛博坐牢模拟器增强脚本"
$files = @(
    "$scriptPath/脚本/core.ts",
    "$scriptPath/脚本/event_system.ts",
    "$scriptPath/脚本/npc_system.ts",
    "$scriptPath/脚本/status_panel.ts",
    "$scriptPath/脚本/worldbook_loader.ts"
)

$totalFixed = 0

foreach ($filePath in $files) {
    if (-not (Test-Path $filePath)) {
        Write-Host "文件不存在: $filePath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "处理文件: $filePath" -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $fileFixed = 0
    
    # 匹配模式：查找 fetch('http://127.0.0.1:7242/ingest/... 模式
    # 但不匹配已经包含 isLocalDev 的行
    $pattern = "(?s)(\s+)(// #region agent log\s*\n(?:(?!// #endregion)[^\n])*\n)?\s*(fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{)"
    
    $replacement = {
        param($match)
        $indent = $match.Groups[1].Value
        $agentLogComment = $match.Groups[2].Value
        $fetchCall = $match.Groups[3].Value
        
        # 检查是否已经有环境检测
        $context = $match.Value
        if ($context -match "isLocalDev") {
            return $match.Value
        }
        
        # 添加环境检测代码
        $newCode = @"
$indent// #region agent log
$indent// 调试日志：只在本地开发环境中发送，避免在生产环境中触发 CORS 错误
$indenttry {
$indent  const isLocalDev =
$indent    typeof window !== 'undefined' &&
$indent    window.location &&
$indent    (window.location.hostname === 'localhost' ||
$indent      window.location.hostname === '127.0.0.1' ||
$indent      window.location.hostname.startsWith('192.168.') ||
$indent      window.location.hostname.startsWith('10.') ||
$indent      window.location.hostname.startsWith('172.'));
$indent  
$indent  if (isLocalDev) {
$indent    $fetchCall
"@
        
        return $newCode
    }
    
    # 执行替换
    $newContent = [regex]::Replace($content, $pattern, $replacement)
    
    # 修复 .catch(() => {}); 后的闭合大括号
    # 查找所有 .catch(() => {}); 后的 // #endregion
    $pattern2 = "(\.catch\(\(\) => \{\}\);\s*)(// #endregion)"
    $replacement2 = '$1  }`n    $2'
    $newContent = $newContent -replace $pattern2, $replacement2
    
    # 计算修复数量
    $fileFixed = ([regex]::Matches($content, "fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'")).Count
    $newFileFixed = ([regex]::Matches($newContent, "if \(isLocalDev\) \{[^}]*fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'")).Count
    
    if ($newContent -ne $originalContent) {
        # 备份原文件
        $backupPath = "$filePath.backup"
        Copy-Item $filePath $backupPath -Force
        Write-Host "  已备份到: $backupPath" -ForegroundColor Gray
        
        # 保存修复后的文件
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "  ✓ 已修复 $fileFixed 处调试日志代码" -ForegroundColor Green
        $totalFixed += $fileFixed
    } else {
        Write-Host "  无需修复（可能已经修复过）" -ForegroundColor Gray
    }
}

Write-Host "`n修复完成！共修复 $totalFixed 处调试日志代码" -ForegroundColor Green
Write-Host "提示：修复后请运行 'pnpm build' 重新打包" -ForegroundColor Yellow
