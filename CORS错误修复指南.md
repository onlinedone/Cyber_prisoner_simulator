# CORS 错误修复指南

## 问题说明

错误信息：

```
Access to fetch at 'http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'
from origin 'http://38.244.14.36:8000' has been blocked by CORS policy:
The request client is not a secure context and the resource is in more-private address space `loopback`.
```

**问题原因**：

- 脚本中包含调试日志代码，尝试向本地调试服务器（`127.0.0.1:7242`）发送请求
- 在云服务器（`http://38.244.14.36:8000`）上运行时，浏览器安全策略阻止从公网地址访问本地回环地址
- 这是浏览器的安全特性，无法绕过

**影响**：

- 错误信息会大量出现，但不影响脚本核心功能
- 只是调试日志无法发送，不影响脚本正常运行

---

## 解决方案

### 方案 1：添加环境检测（推荐）

在所有调试日志 `fetch` 调用前添加环境检测，只在本地开发环境中发送：

```typescript
// 检测是否是本地开发环境
const isLocalDev =
  typeof window !== 'undefined' &&
  window.location &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.'));

if (isLocalDev) {
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    // ... 原有代码
  }).catch(() => {
    // 静默失败
  });
}
```

**已修复文件**：

- ✅ `src/赛博坐牢模拟器增强脚本/脚本/index.ts`

**需要修复的文件**：

- `src/赛博坐牢模拟器增强脚本/脚本/core.ts`（约 70 处）
- `src/赛博坐牢模拟器增强脚本/脚本/event_system.ts`（约 60 处）
- `src/赛博坐牢模拟器增强脚本/脚本/npc_system.ts`（约 18 处）
- `src/赛博坐牢模拟器增强脚本/脚本/worldbook_loader.ts`（约 14 处）

---

### 方案 2：批量注释掉调试日志代码

如果不需要调试功能，可以直接注释掉所有 `#region agent log` 到 `#endregion` 之间的代码。

**优点**：快速修复，彻底解决问题
**缺点**：失去调试功能

---

### 方案 3：使用工具函数（最佳实践）

已经在 `src/util/common.ts` 中添加了 `sendDebugLog` 函数，但需要修改所有调用代码使用这个函数。

---

## 快速修复脚本

### 使用正则表达式批量替换

可以使用以下 PowerShell 脚本批量修复：

```powershell
# 修复所有文件中的调试日志代码
$files = Get-ChildItem -Path "src/赛博坐牢模拟器增强脚本" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # 替换模式：在所有 fetch('http://127.0.0.1:7242/... 前添加环境检测
    $pattern = "(?s)(\s+)fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'"
    $replacement = "`$1// 检测是否是本地开发环境
    `$1const isLocalDev =
    `$1  typeof window !== 'undefined' &&
    `$1  window.location &&
    `$1  (window.location.hostname === 'localhost' ||
    `$1    window.location.hostname === '127.0.0.1' ||
    `$1    window.location.hostname.startsWith('192.168.') ||
    `$1    window.location.hostname.startsWith('10.') ||
    `$1    window.location.hostname.startsWith('172.'));
    `$1
    `$1if (isLocalDev) {
    `$1  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'"

    $newContent = $content -replace $pattern, $replacement

    # 在对应的 .catch(() => {}); 后添加 }
    $newContent = $newContent -replace "(\.catch\(\(\) => \{\}\);\s*)(// #endregion)", "`$1  }`n    `$2"

    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "已修复: $($file.FullName)" -ForegroundColor Green
    }
}
```

**注意**：使用前请先备份文件！

---

## 手动修复步骤

### 步骤 1：查找所有调试日志代码

使用 VSCode 或编辑器的查找功能，搜索：

```
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'
```

### 步骤 2：添加环境检测

在每个 `fetch` 调用前添加：

```typescript
// 检测是否是本地开发环境
const isLocalDev =
  typeof window !== 'undefined' &&
  window.location &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.startsWith('172.'));

if (isLocalDev) {
  // 原有的 fetch 代码
}
```

### 步骤 3：修改 catch 块

将 `.catch(() => {});` 后的代码包裹在 `if (isLocalDev)` 块内。

---

## 临时解决方案（不修复代码）

如果暂时不想修改代码，可以：

1. **忽略错误**：这些错误不影响脚本核心功能，可以暂时忽略
2. **使用浏览器扩展**：安装 CORS 扩展（不推荐，仅用于测试）
3. **本地调试**：在本地环境中调试，避免在云服务器上出现错误

---

## 验证修复

修复后，重新打包并测试：

```powershell
# 重新打包
pnpm build

# 检查是否有语法错误
pnpm lint
```

在云服务器上测试，应该不再出现 CORS 错误。

---

## 推荐的修复方式

由于代码量较大（193 个匹配项），建议：

1. **优先修复**：先修复核心文件和最频繁调用的地方
2. **批量处理**：使用脚本批量替换（注意备份）
3. **逐步验证**：修复后逐步测试，确保功能正常

**最安全的做法**：逐个文件手动修复，确保代码逻辑正确。

---

## 已完成的修复

- ✅ `src/赛博坐牢模拟器增强脚本/脚本/index.ts` - 已修复所有调试日志代码
- ✅ `src/util/common.ts` - 已添加 `sendDebugLog` 辅助函数（可选使用）

---

## 后续优化建议

1. **使用环境变量**：通过构建工具注入环境变量，在生产版本中完全移除调试代码
2. **使用条件编译**：使用 webpack 的 DefinePlugin 在打包时移除调试代码
3. **统一日志系统**：创建一个统一的日志系统，方便管理所有调试日志
