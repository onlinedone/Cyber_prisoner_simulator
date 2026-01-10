# GitHub 部署指南 - 赛博坐牢模拟器增强脚本

## 📋 当前状态

- ✅ 项目已正确打包
- ✅ 打包文件位置：`dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
- ✅ Git 仓库已连接：`onlinedone/Cyber_prisoner_simulator`
- ⚠️ 需要提交更改并创建版本标签

---

## 🚀 上传步骤

### 步骤 1：拉取最新更改

由于本地分支落后于远程分支，需要先拉取最新代码：

```powershell
cd "c:\Users\38331\Downloads\tavern_helper_template-main"
git pull origin main
```

如果出现冲突，需要先解决冲突。

### 步骤 2：添加文件到 Git

```powershell
# 添加所有更改（包括打包后的文件）
git add .

# 查看将要提交的文件
git status
```

### 步骤 3：提交更改

```powershell
# 提交更改
git commit -m "feat: 添加赛博坐牢模拟器增强脚本完整系统

- 核心系统（core.ts）
- 状态栏系统（status_panel.ts）
- 事件系统（event_system.ts）
- NPC系统（npc_system.ts）
- 知识库加载器（worldbook_loader.ts）
- 打包文件已生成"
```

### 步骤 4：推送到 GitHub

```powershell
# 推送到主分支
git push origin main
```

### 步骤 5：创建版本标签（重要！）

为了使用 jsdelivr CDN，必须创建版本标签：

```powershell
# 创建版本标签 v1.0.0
git tag -a v1.0.0 -m "版本 1.0.0：赛博坐牢模拟器增强脚本完整系统"

# 推送标签到 GitHub
git push origin v1.0.0
```

---

## 🌐 调用网址

### 方式 1：使用 jsdelivr CDN（推荐）

#### 主脚本文件（脚本入口）

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

#### 状态栏界面（前端界面）

```html
<script>
  $('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
</script>
```

### 方式 2：使用分支（开发版）

如果使用 `main` 分支（最新代码）：

```javascript
// 主脚本
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';

// 状态栏界面
$('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
```

### 方式 3：使用 commit hash（精确版本）

```powershell
# 获取当前 commit hash
git rev-parse HEAD
```

使用 commit hash：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@<commit-hash>/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 📦 在 SillyTavern 中导入

### 方式 1：作为脚本导入（推荐）

1. 打开 SillyTavern
2. 进入 **设置** → **脚本** → **添加脚本**
3. 填写以下信息：

```json
{
  "id": "detention-system",
  "name": "赛博坐牢模拟器增强脚本",
  "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js'",
  "info": "完整系统：核心系统、状态栏、事件系统、NPC系统、知识库加载器",
  "buttons": []
}
```

### 方式 2：使用 GitHub Raw（备用）

如果 jsdelivr 不可用，可以使用 GitHub Raw：

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

**注意**：GitHub Raw 可能有 MIME 类型问题，不推荐使用。

---

## 🔄 更新流程

### 1. 修改代码后

```powershell
# 重新打包
pnpm build

# 添加更改
git add .

# 提交更改
git commit -m "feat: 描述你的更改"

# 推送到 GitHub
git push origin main
```

### 2. 创建新版本

```powershell
# 创建新版本标签（例如：v1.0.1）
git tag -a v1.0.1 -m "版本 1.0.1：描述更改内容"

# 推送标签
git push origin v1.0.1
```

### 3. 更新 SillyTavern 中的脚本

将脚本中的版本号更新为新版本：

```javascript
// 从 v1.0.0 更新到 v1.0.1
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

---

## 🌍 云服务器部署说明

### 重要说明

脚本通过 **jsdelivr CDN** 从 GitHub 加载，**不需要配置云服务器地址**。

### 工作原理

1. **脚本存储**：脚本文件存储在 GitHub 仓库中
2. **CDN 分发**：jsdelivr CDN 从 GitHub 获取文件并分发
3. **浏览器加载**：SillyTavern 在浏览器中通过 `import` 语句加载脚本
4. **执行环境**：脚本在**浏览器**中执行，不是在服务器上执行

### 流程图

```
GitHub 仓库
    ↓
jsdelivr CDN
    ↓
用户浏览器（访问 SillyTavern）
    ↓
脚本在浏览器中执行
```

### 云服务器的作用

云服务器只负责：
- ✅ 运行 SillyTavern 后端服务
- ✅ 提供 Web 界面
- ✅ 处理 API 请求

**不负责**：
- ❌ 存储脚本文件（脚本在 GitHub）
- ❌ 分发脚本文件（由 jsdelivr CDN 负责）
- ❌ 执行脚本（脚本在浏览器中执行）

---

## ✅ 验证部署

### 1. 检查 GitHub 仓库

访问：<https://github.com/onlinedone/Cyber_prisoner_simulator>

确认以下文件存在：
- ✅ `dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js`
- ✅ `dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js.map`
- ✅ `dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html`
- ✅ `src/赛博坐牢模拟器增强脚本/` 目录下的所有源文件

### 2. 测试 jsdelivr 链接

在浏览器中访问：

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
```

应该能看到 JavaScript 代码（可能是压缩后的单行代码）。

### 3. 在 SillyTavern 中测试

1. 导入脚本
2. 打开浏览器控制台（F12）
3. 查看是否有加载日志：
   - `🔵 [看守所模拟器] 脚本文件开始执行！`
   - `[核心系统] 开始加载...`
   - `[状态栏] 脚本开始加载`
   - `[事件系统] 开始加载...`
   - `[NPC系统] 开始加载...`
   - `[知识库加载器] 启动...`

---

## 🆘 常见问题

### Q1: jsdelivr 链接 404

**可能原因**：
- 版本标签不存在
- 文件路径错误
- 仓库未公开

**解决方案**：
- 确认标签已推送：`git push origin v1.0.0`
- 检查文件路径是否正确（注意是 `detention-system.js` 而不是 `index.js`）
- 确认仓库是公开的（Public）

### Q2: 脚本无法加载，提示网络错误

**解决方案**：
1. 检查浏览器能否访问 GitHub
2. 检查浏览器能否访问 jsdelivr CDN
3. 如果在中国大陆，尝试使用不同的 CDN 镜像：
   - 主站：`cdn.jsdelivr.net`
   - 备选：`fastly.jsdelivr.net` 或 `gcore.jsdelivr.net`

### Q3: 文件名是 detention-system.js 而不是 index.js

这是正常的！根据 webpack 配置，对于"赛博坐牢模拟器增强脚本"项目，输出文件名是 `detention-system.js`。

### Q4: 中文路径问题

**解决方案**：
- jsdelivr 支持中文路径
- 如果遇到问题，可以使用 URL 编码路径

### Q5: 缓存问题

jsdelivr 有缓存机制，更新后可能需要等待几分钟。可以在 URL 后添加 `?v=时间戳` 强制刷新：

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js?v=' + Date.now();
```

---

## 📋 快速命令清单

### 首次部署

```powershell
# 1. 拉取最新代码
git pull origin main

# 2. 打包项目
pnpm build

# 3. 添加文件
git add .

# 4. 提交更改
git commit -m "feat: 初始提交 - 赛博坐牢模拟器增强脚本"

# 5. 推送到 GitHub
git push origin main

# 6. 创建版本标签
git tag -a v1.0.0 -m "版本 1.0.0：完整系统"

# 7. 推送标签
git push origin v1.0.0
```

### 更新部署

```powershell
# 1. 打包项目
pnpm build

# 2. 添加更改
git add .

# 3. 提交更改
git commit -m "feat: 描述更改"

# 4. 推送到 GitHub
git push origin main

# 5. 创建新版本标签（如 v1.0.1）
git tag -a v1.0.1 -m "版本 1.0.1：描述更改"
git push origin v1.0.1
```

---

## 📚 参考资源

- Git 官方文档：<https://git-scm.com/doc>
- GitHub 文档：<https://docs.github.com>
- jsdelivr 文档：<https://www.jsdelivr.com/documentation>
- Personal Access Token：<https://github.com/settings/tokens>

---

## ✅ 完成检查清单

- [ ] 项目已正确打包
- [ ] 已拉取最新代码
- [ ] 已添加所有更改
- [ ] 已提交更改
- [ ] 已推送到 GitHub
- [ ] 已创建版本标签（v1.0.0）
- [ ] 已推送版本标签
- [ ] jsdelivr 链接可访问
- [ ] SillyTavern 中脚本可正常加载
- [ ] 浏览器控制台无错误

---

## 🎯 最终调用网址（复制使用）

### 主脚本（用于 SillyTavern 脚本导入）

```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js';
```

### 状态栏界面（用于前端界面）

```html
<script>
  $('body').load('https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html');
</script>
```

**注意**：请在上传完成后将 `v1.0.0` 替换为实际创建的版本标签。
