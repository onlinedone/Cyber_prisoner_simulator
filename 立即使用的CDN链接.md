# 立即使用的 CDN 链接

## 🎯 推荐方案：使用提交哈希（最可靠，立即生效）

### 脚本文件

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

**优点**：
- ✅ 立即可用，无需等待
- ✅ 最可靠，精确指向特定版本
- ✅ 不需要创建 Release

---

## 🔄 备选方案 1：使用 main 分支

### 脚本文件

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

**注意**：可能需要等待 5-10 分钟 CDN 同步，或添加时间戳强制刷新：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js?v=' + Date.now();
```

---

## 🔄 备选方案 2：使用 GitHub Raw（最直接）

### 脚本文件

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```javascript
$('body').load('https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

**优点**：
- ✅ 最直接，不依赖 CDN
- ✅ 立即可用
- ✅ 支持中文路径

**缺点**：
- ⚠️ 可能有 MIME 类型问题（某些浏览器需要配置）
- ⚠️ 没有 CDN 加速

---

## 🔄 备选方案 3：使用不同的 jsdelivr 镜像

### Fastly 镜像

```javascript
// 脚本
import 'https://fastly.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 状态栏
$('body').load('https://fastly.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### Gcore 镜像

```javascript
// 脚本
import 'https://gcore.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 状态栏
$('body').load('https://gcore.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

## 📋 在 SillyTavern 中使用

### 作为脚本导入

1. 打开 SillyTavern
2. 进入角色卡编辑页面
3. 在"脚本"或"导入脚本"部分添加：

```javascript
// 推荐：使用提交哈希
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 加载状态栏界面

在聊天界面中使用 jQuery 加载状态栏：

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

## 🔍 验证链接是否可用

在浏览器中直接访问以下链接，如果能看到 JavaScript 代码，说明链接可用：

### 测试脚本链接（提交哈希）：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试脚本链接（main 分支）：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试脚本链接（GitHub Raw）：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试状态栏链接：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

---

## ⚠️ 如果所有链接都无法访问

### 1. 检查网络连接
- 确保可以访问 GitHub
- 确保可以访问 jsdelivr CDN
- 如果在国内，可能需要使用代理

### 2. 检查文件是否存在
在 GitHub 仓库中检查文件是否存在：
```
https://github.com/onlinedone/Cyber_prisoner_simulator/blob/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 3. 检查分支/标签
- 确认 `main` 分支存在
- 确认提交哈希正确
- 确认文件已提交到 GitHub

### 4. 使用本地文件（临时方案）
如果所有 CDN 都无法访问，可以：
1. 下载文件到本地
2. 放到 SillyTavern 的静态文件目录
3. 使用相对路径加载

---

## 🎯 当前推荐

**立即使用**：**提交哈希方案**

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**原因**：
- ✅ 最可靠，立即生效
- ✅ 不需要等待 CDN 同步
- ✅ 精确指向特定版本
- ✅ 不会因为后续更新而改变

---

## 📝 如果标签 v1.0.1 可用（等待 5-10 分钟后）

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**注意**：标签可能需要创建 GitHub Release 才能被 jsdelivr 正确识别。

---

## 🚀 创建 GitHub Release（可选，用于标签）

如果希望使用标签（如 `v1.0.1`），可以创建 GitHub Release：

1. 访问：https://github.com/onlinedone/Cyber_prisoner_simulator/releases/new
2. 选择标签：`v1.0.1`
3. 填写标题：`v1.0.1 - 修复 CORS 错误`
4. 填写描述：
   ```
   ## 修复内容
   - 注释掉所有调试日志代码（184 处）
   - 修复 CORS 错误
   - 文件大小优化（减少 40%）
   ```
5. 点击 "Publish release"
6. 等待 5-10 分钟后使用标签链接
