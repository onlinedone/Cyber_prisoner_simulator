# 快速修复 CORS 错误

## 问题说明

错误信息显示脚本尝试从云服务器（`http://38.244.14.36:8000`）访问本地调试服务器（`http://127.0.0.1:7242`），被浏览器安全策略阻止。

**重要**：这些错误**不影响脚本核心功能**，只是调试日志无法发送。

---

## 最快速的解决方案

### 方案 1：忽略错误（最简单）

这些错误不影响脚本正常运行，可以暂时忽略。脚本的核心功能（主角生成、状态栏、事件系统等）都正常工作。

---

### 方案 2：批量注释掉调试日志（推荐用于生产环境）

如果不需要调试功能，可以直接注释掉所有调试日志代码。

**使用 VSCode 批量替换**：

1. 按 `Ctrl+Shift+H` 打开查找替换
2. 启用正则表达式模式（点击 `.*` 图标）
3. 查找：`fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'`
4. 替换为：`// fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'` （添加注释）

或者更彻底地注释掉整个 `#region agent log` 块：

1. 查找：`// #region agent log\n.*?// #endregion`
2. 替换为：`// #region agent log (已禁用)\n  /* 调试日志已禁用以避免 CORS 错误 */\n// #endregion`

---

### 方案 3：添加环境检测（保留调试功能）

已在以下文件添加了环境检测：
- ✅ `src/赛博坐牢模拟器增强脚本/脚本/index.ts`
- ✅ `src/赛博坐牢模拟器增强脚本/脚本/core.ts`（部分修复）

**修复模式**：

将：
```typescript
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  // ... 代码
}).catch(() => {});
```

替换为：
```typescript
try {
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
      // ... 代码
    }).catch(() => {});
  }
} catch (e) {
  // 静默失败
}
```

---

## 已验证的功能

从错误日志中可以看到，脚本的**核心功能正常**：

```
✅ [核心系统] 📨 MESSAGE_SENT 事件触发
✅ [核心系统] 检测到用户输入
✅ [核心系统] 检测到生成主角指令
✅ [核心系统] ✓ 主角已生成并保存: 周文娟 38 信用卡诈骗罪
✅ [知识库加载器] 执行动态加载
```

**这些 CORS 错误不影响脚本功能，只是调试日志无法发送到本地调试服务器。**

---

## 推荐做法

1. **对于生产环境**：使用方案 2，批量注释掉所有调试日志代码
2. **对于本地开发**：保留调试日志，它们会自动在本地环境工作
3. **如果不想修改代码**：可以忽略这些错误，不影响使用

---

## 修复后的验证

修复后重新打包：

```powershell
pnpm build
```

然后在云服务器上测试，应该不再出现 CORS 错误。
