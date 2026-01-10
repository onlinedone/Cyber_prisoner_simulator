# 修复 CORS 错误脚本
# 批量修复所有调试日志代码，添加本地环境检测

$scriptPath = "src/赛博坐牢模拟器增强脚本"
$files = @(
    "$scriptPath/脚本/core.ts",
    "$scriptPath/脚本/event_system.ts",
    "$scriptPath/脚本/npc_system.ts",
    "$scriptPath/脚本/status_panel.ts",
    "$scriptPath/脚本/worldbook_loader.ts"
)

# 定义要替换的模式
$pattern = @"
fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66',