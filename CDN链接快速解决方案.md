# CDN 链接快速解决方案

## 🚨 问题

jsdelivr CDN 链接无法访问。

## ✅ 解决方案（按推荐顺序）

### ⭐ 方案 1：使用提交哈希（最推荐，立即生效）

**优点**：
- ✅ 立即可用，无需等待
- ✅ 最可靠，精确指向特定版本
- ✅ 不需要创建 Release

**脚本链接**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏链接**：
```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

---

### 🔄 方案 2：使用 main 分支

**脚本链接**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏链接**：
```javascript
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

**注意**：如果无法访问，添加时间戳强制刷新：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js?v=' + Date.now();
```

---

### 🔄 方案 3：使用 GitHub Raw（备选）

**脚本链接**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**状态栏链接**：
```javascript
$('body').load('https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

**优点**：最直接，不依赖 CDN，立即可用

---

### 🔄 方案 4：使用不同的 jsdelivr 镜像

#### Fastly 镜像
```javascript
import 'https://fastly.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

#### Gcore 镜像
```javascript
import 'https://gcore.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 🔍 验证链接是否可用

在浏览器中直接访问以下链接测试：

### 测试链接 1（提交哈希）：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试链接 2（main 分支）：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

### 测试链接 3（GitHub Raw）：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

如果能看到 JavaScript 代码，说明链接可用。

---

## ⚠️ 可能的原因

### 1. jsdelivr 需要时间同步
- 新提交可能需要 5-10 分钟才能被 jsdelivr 识别
- 标签可能需要创建 Release 才能被识别

### 2. 文件路径问题
- 确保路径正确：`dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
- 文件名是 `detention-system.js`，不是 `index.js`

### 3. 网络问题
- 如果在中国大陆，可能需要使用镜像或代理
- 推荐使用 GitHub Raw（方案 3）或 Fastly 镜像（方案 4）

### 4. 文件未提交
- 确认文件已提交到 GitHub
- 检查仓库：https://github.com/onlinedone/Cyber_prisoner_simulator

---

## 🎯 推荐使用

**当前推荐**：**方案 1（提交哈希）**

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**原因**：
- ✅ 最可靠，立即生效
- ✅ 不需要等待 CDN 同步
- ✅ 精确指向特定版本
- ✅ 不会因为后续更新而改变

---

## 📝 在 SillyTavern 中使用

### 1. 打开角色卡编辑页面

### 2. 在"脚本"部分添加：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 3. 保存并测试

---

## 🚀 如果所有链接都无法访问

### 1. 检查 GitHub 仓库
访问：https://github.com/onlinedone/Cyber_prisoner_simulator

检查文件是否存在：
- `dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`

### 2. 检查网络连接
- 确保可以访问 GitHub
- 确保可以访问 jsdelivr CDN
- 如果在国内，可能需要使用代理

### 3. 使用本地文件（临时方案）
如果所有 CDN 都无法访问：
1. 下载文件到本地
2. 放到 SillyTavern 的静态文件目录
3. 使用相对路径加载

---

## 📋 所有可用链接汇总

### 脚本文件

1. **提交哈希（推荐）**：
   ```
   https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

2. **main 分支**：
   ```
   https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

3. **GitHub Raw**：
   ```
   https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

4. **Fastly 镜像**：
   ```
   https://fastly.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

5. **Gcore 镜像**：
   ```
   https://gcore.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

### 状态栏界面

1. **提交哈希（推荐）**：
   ```
   https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@c373efc0172df719a49695e11b9340b28a48a98a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
   ```

2. **main 分支**：
   ```
   https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
   ```

3. **GitHub Raw**：
   ```
   https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
   ```

---

## 🎯 快速选择

- ✅ **最可靠**：使用提交哈希（方案 1）
- ✅ **最简单**：使用 main 分支（方案 2）
- ✅ **最直接**：使用 GitHub Raw（方案 3）
- ✅ **国内访问**：使用 Fastly 镜像（方案 4）

建议先尝试方案 1（提交哈希），如果不行再试其他方案。
