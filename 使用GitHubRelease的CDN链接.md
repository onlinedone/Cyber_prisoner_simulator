# 使用 GitHub Release 的 CDN 链接

## ✅ 你已经创建了 GitHub Release

创建 Release 后，可以使用标签链接访问 CDN。

---

## 🎯 使用 Release 的链接

### 脚本文件

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

## ⏰ 重要提示：等待 CDN 同步

**jsdelivr CDN 需要 5-10 分钟来同步新的 Release。**

### 如何检查是否已同步？

在浏览器中直接访问以下链接：

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

**如果能看到 JavaScript 代码**，说明已同步，可以使用。

**如果返回 404 或错误**，说明还未同步，需要等待或使用替代方案。

---

## 🔄 如果 Release 链接还未同步（临时方案）

如果 Release 链接还未同步，可以使用以下替代方案：

### 方案 1：使用提交哈希（最可靠，立即生效）⭐

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**优点**：

- ✅ 立即可用，无需等待
- ✅ 精确指向特定版本

### 方案 2：使用 main 分支（临时）

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**注意**：如果无法访问，添加时间戳强制刷新：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js?v=' + Date.now();
```

### 方案 3：使用 GitHub Raw（备选）

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 📝 在 SillyTavern 中使用

### 步骤 1：验证链接是否可用

在浏览器中访问以下链接测试：

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

**如果看到 JavaScript 代码**，说明已同步，可以继续下一步。

**如果看不到或返回错误**，等待 5-10 分钟后重试，或使用上述替代方案。

### 步骤 2：添加脚本到 SillyTavern

1. 打开 SillyTavern
2. 进入角色卡编辑页面
3. 找到"脚本"或"导入脚本"部分
4. 添加以下代码：

```javascript
// 使用 Release 链接（推荐，等待 5-10 分钟同步后使用）
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 或者，如果 Release 还未同步，使用提交哈希（立即生效）
// import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 步骤 3：加载状态栏界面（可选）

如果需要状态栏界面，添加以下代码：

```javascript
// 使用 Release 链接（推荐）
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');

// 或者，如果 Release 还未同步，使用提交哈希
// $('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### 步骤 4：保存并测试

1. 保存角色卡设置
2. 刷新页面
3. 在浏览器控制台（F12）中检查：

```javascript
// 检查核心系统是否加载
window.detentionSystem

// 应该返回一个对象，包含：
// - version: "3.2.0"
// - initialized: true/false
// - modules: {...}
```

---

## 🔍 验证 Release 是否可用

### 方法 1：在浏览器中直接访问

访问以下链接，如果能看到 JavaScript 代码，说明 Release 已同步：

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 方法 2：使用 jsdelivr API 检查

访问以下链接检查版本信息：

```
https://data.jsdelivr.com/v1/package/gh/onlinedone/Cyber_prisoner_simulator
```

如果看到 `v1.0.1` 在版本列表中，说明已同步。

### 方法 3：在 GitHub 上确认 Release

访问以下链接确认 Release 已创建：

```
https://github.com/onlinedone/Cyber_prisoner_simulator/releases
```

应该能看到 `v1.0.1` 的 Release。

---

## 📋 完整的链接列表

### Release 链接（v1.0.1）- 等待 5-10 分钟同步后使用

**脚本文件**：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏界面**：

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### 提交哈希链接（立即生效）- 如果 Release 还未同步

**脚本文件**：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏界面**：

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### main 分支链接（开发版）

**脚本文件**：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏界面**：

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### GitHub Raw 链接（最直接，不依赖 CDN）

**脚本文件**：

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏界面**：

```javascript
$('body').load('https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

## 🎯 推荐使用流程

### 立即使用（如果 Release 还未同步）

**使用提交哈希链接**（最可靠，立即生效）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 等待 5-10 分钟后使用 Release 链接

**使用 Release 标签链接**（更清晰，版本管理更好）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## ⚠️ 常见问题

### Q1: Release 链接返回 404

**原因**：jsdelivr CDN 还未同步新的 Release（需要 5-10 分钟）

**解决方案**：

1. 等待 5-10 分钟后重试
2. 使用提交哈希链接（立即生效）
3. 使用 main 分支链接（临时）

### Q2: 如何确认 Release 已同步？

**方法**：在浏览器中直接访问 Release 链接，如果能看到 JavaScript 代码，说明已同步。

### Q3: Release 和提交哈希有什么区别？

**Release（标签）**：

- ✅ 更清晰，版本管理更好
- ✅ 易于识别版本
- ⚠️ 需要等待 CDN 同步（5-10 分钟）

**提交哈希**：

- ✅ 立即可用
- ✅ 精确指向特定版本
- ⚠️ 哈希值较长，不易记忆

**建议**：

- 长期使用：Release 链接
- 临时使用：提交哈希链接

---

## 🚀 下一步

1. **等待 5-10 分钟**，让 jsdelivr CDN 同步新的 Release
2. **验证链接是否可用**（在浏览器中访问 Release 链接）
3. **在 SillyTavern 中使用 Release 链接**
4. **如果需要立即使用**，可以先使用提交哈希链接，等 Release 同步后再切换

---

## 📝 总结

✅ **你已经创建了 GitHub Release v1.0.1**

🎯 **推荐使用流程**：

1. 现在：使用提交哈希链接（立即生效）
2. 5-10 分钟后：使用 Release 链接（v1.0.1）
3. 验证：在浏览器中访问链接确认可用

🔗 **Release 链接**（等待同步后使用）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

🔗 **提交哈希链接**（立即使用）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```
