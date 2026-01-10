# 批量注释掉所有调试日志代码
# 将所有 fetch('http://127.0.0.1:7242/ingest/... 调用注释掉

$files = @(
    "src/赛博坐牢模拟器增强脚本/脚本/core.ts",
    "src/赛博坐牢模拟器增强脚本/脚本/event_system.ts",
    "src/赛博坐牢模拟器增强脚本/脚本/npc_system.ts",
    "src/赛博坐牢模拟器增强脚本/脚本/worldbook_loader.ts",
    "src/赛博坐牢模拟器增强脚本/脚本/status_panel.ts",
    "src/赛博坐牢模拟器增强脚本/脚本/index.ts"
)

$totalFixed = 0

foreach ($filePath in $files) {
    if (-not (Test-Path $filePath)) {
        Write-Host "文件不存在: $filePath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "处理文件: $filePath" -ForegroundColor Cyan
    
    # 读取文件内容
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $originalContent = $content
    $fileFixed = 0
    
    # 模式1: 注释掉独立的 fetch 调用（前面没有 if (isLocalDev)）
    # 匹配：fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', 到对应的 .catch(() => {});)
    # 使用多行模式匹配整个 fetch 块
    
    # 先处理已经被 if (isLocalDev) 包裹的 fetch 调用
    # 匹配：if (isLocalDev) { ... fetch(...) ... }
    $pattern1 = "(?s)(\s+)(try\s*\{[^}]*const isLocalDev[^}]*if \(isLocalDev\) \{\s*)(fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{[^}]*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);\s*\})\s*\} catch \(e\) \{[^}]*\}\s*(// #endregion)"
    $replacement1 = '$1// #region agent log (已禁用以避免 CORS 错误)
$1/* 调试日志已注释掉
$3*/
$1// #endregion'
    
    # 处理未被包裹的 fetch 调用
    # 匹配完整的 fetch 调用块（从 fetch 到 .catch(() => {});）
    $pattern2 = "(?s)(\s+)(// #region agent log\s*\n(?:(?://.*?\n|try\s*\{[^}]*\}\s*catch[^}]*\}\s*)*)?)(fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{[^}]*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);\s*)(// #endregion)"
    
    # 更简单的方法：直接注释掉 fetch 行，保留其他代码
    # 模式：匹配 fetch('http://127.0.0.1:7242/ingest/... 并注释掉
    
    # 使用更简单的方法：找到所有 fetch 调用，在每行前添加注释
    $lines = Get-Content $filePath -Encoding UTF8
    $newLines = @()
    $inFetchBlock = $false
    $fetchBlockIndent = ""
    $bracesCount = 0
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        
        # 检查是否是 fetch 调用的开始
        if ($line -match "^\s*(fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66')") {
            # 如果这一行已经有注释或者被 if (isLocalDev) 包裹，跳过
            if ($i -gt 0 -and $lines[$i-1] -match "if \(isLocalDev\)") {
                # 找到对应的闭合大括号，注释掉整个 if 块
                $inFetchBlock = $true
                $fetchBlockIndent = $line -replace "^(\s*).*", '$1'
                $newLines += $fetchBlockIndent + "// 调试日志已禁用以避免 CORS 错误"
                $newLines += $fetchBlockIndent + "/* " + $line.TrimStart()
                $bracesCount = 0
                if ($line -match "\{") { $bracesCount++ }
                continue
            } else {
                # 普通 fetch 调用，直接注释
                $indent = $line -replace "^(\s*).*", '$1'
                $newLines += $indent + "// 调试日志已禁用以避免 CORS 错误"
                $newLines += $indent + "/* " + $line.TrimStart()
                $fileFixed++
                $inFetchBlock = $true
                $fetchBlockIndent = $indent
                $bracesCount = 0
                if ($line -match "\{") { $bracesCount++ }
                continue
            }
        }
        
        # 如果在 fetch 块中，继续处理
        if ($inFetchBlock) {
            if ($line -match "\{") { $bracesCount++ }
            if ($line -match "\}") { $bracesCount-- }
            
            $newLines += $line
            
            # 检查是否是 fetch 块的结束（.catch(() => {});）
            if ($line -match "\.catch\(\(\) => \{\}\);" -and $bracesCount -eq 0) {
                $newLines += $fetchBlockIndent + " */"
                $inFetchBlock = $false
                $bracesCount = 0
            }
        } else {
            $newLines += $line
        }
    }
    
    $newContent = $newLines -join "`n"
    
    if ($newContent -ne $originalContent -and $fileFixed -gt 0) {
        # 备份原文件
        $backupPath = "$filePath.backup"
        Copy-Item $filePath $backupPath -Force
        Write-Host "  已备份到: $backupPath" -ForegroundColor Gray
        
        # 保存修复后的文件
        [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "  ✓ 已注释 $fileFixed 处调试日志代码" -ForegroundColor Green
        $totalFixed += $fileFixed
    } else {
        Write-Host "  无需修复或修复失败" -ForegroundColor Gray
    }
}

Write-Host "`n修复完成！共注释 $totalFixed 处调试日志代码" -ForegroundColor Green
