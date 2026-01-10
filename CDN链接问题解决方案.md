# CDN 链接问题解决方案

## 🔍 问题诊断

如果 jsdelivr CDN 链接无法访问，可能的原因：

1. **jsdelivr 需要时间同步新标签**（5-10 分钟）
2. **标签未关联到 GitHub Release**（仅标签不够，需要创建 Release）
3. **中文路径问题**（虽然通常支持，但可能有兼容性问题）
4. **网络问题**（中国大陆可能需要使用镜像）

---

## ✅ 解决方案（按推荐顺序）

### 方案 1：使用提交哈希（最可靠，立即生效）⭐

**优点**：

- ✅ 立即可用，无需等待同步
- ✅ 不需要创建 Release
- ✅ 最可靠

**获取最新提交哈希**：

```powershell
git rev-parse HEAD
```

**脚本链接**（替换 `COMMIT_HASH` 为实际哈希值）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@COMMIT_HASH/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏界面链接**：

```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@COMMIT_HASH/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

### 方案 2：使用 main 分支（开发版）

**优点**：

- ✅ 总是最新版本
- ✅ 无需创建标签

**缺点**：

- ⚠️ 可能有缓存问题
- ⚠️ 更新后需要等待 CDN 同步

**链接**：

```javascript
// 脚本
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 状态栏界面
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

### 方案 3：使用 GitHub Raw 链接（备选）

**优点**：

- ✅ 最直接，不依赖 CDN
- ✅ 立即可用
- ✅ 支持中文路径

**缺点**：

- ⚠️ 可能有 MIME 类型问题（某些浏览器）
- ⚠️ 没有 CDN 加速

**链接**：

```javascript
// 脚本
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 状态栏界面
$('body').load('https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

### 方案 4：使用不同的 jsdelivr 镜像

如果主 CDN 无法访问，可以尝试不同的镜像：

#### Fastly 镜像（推荐）

```javascript
import 'https://fastly.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

#### Gcore 镜像

```javascript
import 'https://gcore.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

### 方案 5：创建 GitHub Release（最佳长期方案）

jsdelivr 对标签的支持可能需要创建正式的 GitHub Release。

**步骤**：

1. 访问 GitHub 仓库：

   ```
   https://github.com/onlinedone/Cyber_prisoner_simulator
   ```

2. 点击右侧 **"Releases"** → **"Create a new release"**

3. 填写信息：
   - **Tag**: 选择 `v1.0.1`（如果标签不存在，输入 `v1.0.1` 创建）
   - **Title**: `v1.0.1 - 修复 CORS 错误`
   - **Description**:

     ```
     ## 修复内容
     - 注释掉所有调试日志代码
     - 修复 CORS 错误
     - 文件大小优化（减少 40%）
     ```

4. 点击 **"Publish release"**

5. 等待 5-10 分钟后，使用标签链接：

   ```javascript
   import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
   ```

---

## 🔍 验证链接是否可用

在浏览器中直接访问链接，如果能看到 JavaScript 代码，说明链接可用。

### 测试脚本链接

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试状态栏链接

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

如果返回 404，检查：

1. 文件路径是否正确
2. 分支/标签是否存在
3. 文件是否已提交到 GitHub

---

## 📋 当前可用链接（更新后）

### 使用提交哈希（推荐）

```javascript
// 替换 COMMIT_HASH 为实际值
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@COMMIT_HASH/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 使用 main 分支（临时）

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 使用 GitHub Raw（备选）

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## ⚠️ 注意事项

### 1. 文件路径

- 确保路径正确：`dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
- 不是 `index.js`，是 `detention-system.js`

### 2. 缓存问题

- jsdelivr 有缓存机制，更新后可能需要等待几分钟
- 可以在 URL 后添加 `?v=时间戳` 强制刷新

### 3. 网络问题

- 如果在中国大陆，可能需要使用镜像或代理
- 推荐使用方案 1（提交哈希）或方案 3（GitHub Raw）

---

## 🎯 推荐使用方案

**当前推荐**：**方案 1（提交哈希）**

**原因**：

- ✅ 最可靠，立即生效
- ✅ 不需要等待 CDN 同步
- ✅ 不需要创建 Release
- ✅ 精确指向特定版本

**获取当前提交哈希**：

```powershell
git rev-parse HEAD
```

然后在链接中使用该哈希值替换 `COMMIT_HASH`。
