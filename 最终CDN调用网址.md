# 最终 CDN 调用网址

## ✅ 立即使用（推荐）

由于 jsdelivr 标签同步可能需要几分钟，建议先使用 `main` 分支：

### 主脚本

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```html
<script>
  $('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
</script>
```

---

## ⏳ 等待几分钟后使用（标签版本）

标签 `v1.0.0` 已重新创建并指向最新 commit。等待 **5-10 分钟**让 jsdelivr CDN 同步后，可以使用：

### 主脚本

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面

```html
<script>
  $('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
</script>
```

---

## 🔄 使用 commit hash（精确版本）

如果需要使用特定的 commit 版本：

### 主脚本

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@<commit-hash>/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 🔧 如果 jsdelivr 无法访问（备用方案）

### 方案 1：使用 GitHub Raw

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**注意**：GitHub Raw 可能需要配置正确的 MIME 类型。

### 方案 2：使用 unpkg（如果发布到 npm）

如果将来将资源发布到 npm，可以使用：

```javascript
import 'https://unpkg.com/your-package-name@latest/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## ✅ 验证步骤

### 1. 验证 GitHub 仓库文件存在

访问：
```
https://github.com/onlinedone/Cyber_prisoner_simulator/blob/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

应该能看到文件内容。

### 2. 验证标签存在

访问：
```
https://github.com/onlinedone/Cyber_prisoner_simulator/releases/tag/v1.0.0
```

应该能看到标签信息。

### 3. 测试 GitHub Raw（应该立即可用）

访问：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

应该能看到 JavaScript 代码。

### 4. 测试 jsdelivr main 分支（应该可用）

访问：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

如果显示 404，可能需要等待几分钟让 CDN 同步。

### 5. 测试 jsdelivr 标签（可能需要等待 5-10 分钟）

访问：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

---

## 🎯 推荐使用方式

**现在立即使用**（最可靠）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**等待几分钟后**（使用稳定版本标签）：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 📝 在 SillyTavern 中导入

1. 打开 SillyTavern
2. 进入 **设置** → **脚本** → **添加脚本**
3. 填写以下信息：

```json
{
  "id": "detention-system",
  "name": "赛博坐牢模拟器增强脚本",
  "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js'",
  "info": "完整系统：核心系统、状态栏、事件系统、NPC系统、知识库加载器",
  "buttons": []
}
```

---

## 🔍 故障排除

### 如果所有 CDN 链接都返回 404

1. ✅ **确认文件存在于 GitHub**：
   - 访问 `https://github.com/onlinedone/Cyber_prisoner_simulator/tree/main/dist/赛博坐牢模拟器增强脚本/脚本`
   - 应该能看到 `detention-system.js` 文件

2. ✅ **确认仓库是公开的**：
   - 检查仓库设置是否为 Public

3. ✅ **尝试使用 GitHub Raw**：
   - 如果 GitHub Raw 可以访问，说明文件存在，只是 CDN 同步问题

4. ✅ **等待 CDN 同步**：
   - jsdelivr CDN 同步通常需要 5-10 分钟
   - 清除浏览器缓存后重试

### 如果 GitHub Raw 可以访问但 jsdelivr 不行

1. 等待几分钟让 CDN 同步
2. 清除浏览器缓存
3. 使用 `main` 分支而不是标签
4. 在链接后添加 `?v=时间戳` 强制刷新缓存

---

## 📋 当前状态

- ✅ 文件已上传到 GitHub：`dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
- ✅ 文件存在于 main 分支
- ✅ 标签 v1.0.0 已创建并指向最新 commit
- ⏳ jsdelivr CDN 标签同步可能需要 5-10 分钟
- ✅ 使用 `main` 分支链接应该可以立即访问

---

## 💡 重要提示

1. **优先使用 `main` 分支**：jsdelivr 对分支的同步比对标签更快
2. **标签需要等待**：新创建的标签需要等待 CDN 同步
3. **文件名确认**：`detention-system.js`（不是 `index.js`）
4. **路径确认**：`dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
