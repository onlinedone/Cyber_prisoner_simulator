# GitHub 上传指南

## 📋 前置准备

### 1. 确认仓库地址

- 仓库地址：`https://github.com/onlinedone/Cyber_prisoner_simulator`
- 用户名：`onlinedone`
- 仓库名：`Cyber_prisoner_simulator`

### 2. 确认已安装 Git

如果未安装，请访问：<https://git-scm.com/download/win>

---

## 🚀 上传步骤

### 步骤 1：初始化 Git 仓库

在项目根目录（`tavern_helper_template-main`）打开 PowerShell 或命令提示符，执行：

```powershell
# 初始化 Git 仓库
git init

# 配置用户信息（如果还没配置）
git config user.name "onlinedone"
git config user.email "你的邮箱@example.com"
```

### 步骤 2：添加远程仓库

```powershell
# 添加远程仓库
git remote add origin https://github.com/onlinedone/Cyber_prisoner_simulator.git

# 验证远程仓库
git remote -v
```

### 步骤 3：添加文件并提交

```powershell
# 添加所有文件（.gitignore 会自动排除 node_modules 等）
git add .

# 查看将要提交的文件
git status

# 提交文件
git commit -m "初始提交：看守所模拟器完整系统（核心系统、状态栏、事件系统、NPC系统、知识库加载器）"
```

### 步骤 4：推送到 GitHub

```powershell
# 推送到主分支
git branch -M main
git push -u origin main
```

**注意**：如果是第一次推送，GitHub 可能会要求你输入用户名和密码（或 Personal Access Token）。

---

## 🔐 GitHub 认证

### 方式 1：使用 Personal Access Token（推荐）

1. 访问：<https://github.com/settings/tokens>
2. 点击 "Generate new token (classic)"
3. 设置权限：勾选 `repo` 权限
4. 生成后复制 token
5. 推送时，用户名输入 `onlinedone`，密码输入 token

### 方式 2：使用 GitHub Desktop（图形界面）

1. 下载：<https://desktop.github.com/>
2. 登录 GitHub 账号
3. 添加仓库
4. 点击 "Publish repository"

---

## 📦 打包并上传

### 确保已打包

```powershell
# 安装依赖（如果还没安装）
pnpm install

# 打包项目
pnpm build

# 确认 dist 目录中有文件
dir dist\赛博坐牢模拟器增强脚本
```

### 提交打包后的文件

```powershell
# 添加打包后的文件
git add dist/

# 提交
git commit -m "添加打包后的脚本文件"

# 推送
git push
```

---

## 🏷️ 创建版本标签（重要！）

为了使用 jsdelivr，需要创建版本标签：

```powershell
# 创建版本标签 v1.0.0
git tag -a v1.0.0 -m "版本 1.0.0：完整系统"

# 推送标签到 GitHub
git push origin v1.0.0
```

**后续更新时**：

```powershell
# 创建新版本标签
git tag -a v1.0.1 -m "版本 1.0.1：修复xxx"
git push origin v1.0.1
```

---

## 🌐 使用 jsdelivr 访问脚本

### jsdelivr CDN 格式

```
https://cdn.jsdelivr.net/gh/用户名/仓库名@版本号/文件路径
```

### 你的脚本访问地址

#### 方式 1：使用版本标签（推荐）

```javascript
// 完整系统（合并版）
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/index.js';
```

#### 方式 2：使用分支（开发版）

```javascript
// 使用 main 分支（最新代码）
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@main/dist/赛博坐牢模拟器增强脚本/index.js';
```

#### 方式 3：使用 commit hash（精确版本）

```javascript
// 使用具体的 commit hash
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@abc123def456/dist/赛博坐牢模拟器增强脚本/index.js';
```

---

## 📝 在 SillyTavern 中导入

### 方式 1：作为脚本导入（推荐）

1. 打开 SillyTavern
2. 进入 **设置** → **脚本** → **添加脚本**
3. 填写以下信息：

```json
{
  "id": "detention-system",
  "name": "看守所模拟器-完整系统",
  "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/index.js'",
  "info": "完整系统：核心系统、状态栏、事件系统、NPC系统、知识库加载器",
  "buttons": []
}
```

### 方式 2：使用 GitHub Raw（备用）

如果 jsdelivr 不可用，可以使用 GitHub Raw：

```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/v1.0.0/dist/赛博坐牢模拟器增强脚本/index.js';
```

---

## 🔄 更新脚本流程

### 1. 修改代码后

```powershell
# 重新打包
pnpm build

# 添加更改
git add .

# 提交更改
git commit -m "更新：描述你的更改"

# 推送到 GitHub
git push
```

### 2. 创建新版本

```powershell
# 创建新版本标签
git tag -a v1.0.1 -m "版本 1.0.1：添加状态栏系统"

# 推送标签
git push origin v1.0.1
```

### 3. 更新 SillyTavern 中的脚本

将脚本中的版本号更新为新版本：

```javascript
// 从 v1.0.0 更新到 v1.0.1
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.1/dist/赛博坐牢模拟器增强脚本/index.js';
```

---

## ⚠️ 注意事项

### 1. 文件路径

- jsdelivr 对中文路径支持良好
- 如果遇到问题，可以考虑将文件夹名改为英文

### 2. 缓存问题

- jsdelivr 有缓存机制，更新后可能需要等待几分钟
- 可以在 URL 后添加 `?v=时间戳` 强制刷新：

  ```javascript
  import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/index.js?v=' + Date.now();
  ```

### 3. 版本管理

- **主版本号**：重大功能更新（v1.0.0 → v2.0.0）
- **次版本号**：新功能添加（v1.0.0 → v1.1.0）
- **修订号**：Bug修复（v1.0.0 → v1.0.1）

### 4. 安全性

- 不要将敏感信息（API密钥、密码等）提交到 GitHub
- `.gitignore` 已配置，会自动排除 `node_modules` 等文件

---

## 📋 快速命令清单

```powershell
# 初始化（首次）
git init
git remote add origin https://github.com/onlinedone/Cyber_prisoner_simulator.git
git add .
git commit -m "初始提交"
git branch -M main
git push -u origin main
git tag -a v1.0.0 -m "版本 1.0.0"
git push origin v1.0.0

# 更新（后续）
pnpm build
git add .
git commit -m "更新描述"
git push
git tag -a v1.0.1 -m "版本 1.0.1"
git push origin v1.0.1
```

---

## 🎯 验证上传

### 1. 检查 GitHub 仓库

访问：<https://github.com/onlinedone/Cyber_prisoner_simulator>

确认以下文件存在：

- ✅ `dist/赛博坐牢模拟器增强脚本/index.js`
- ✅ `dist/赛博坐牢模拟器增强脚本/index.js.map`
- ✅ `src/赛博坐牢模拟器增强脚本/` 目录下的所有 `.ts` 文件

### 2. 测试 jsdelivr 链接

在浏览器中访问：

```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@v1.0.0/dist/赛博坐牢模拟器增强脚本/index.js
```

应该能看到 JavaScript 代码（可能是压缩后的单行代码）。

### 3. 在 SillyTavern 中测试

1. 导入脚本
2. 打开浏览器控制台（F12）
3. 查看是否有加载日志：
   - `[核心系统] 开始加载...`
   - `[状态栏] 脚本开始加载 v3.5.2`
   - `[事件系统] 开始加载...`
   - `[NPC系统] 开始加载...`
   - `[知识库加载器] v5.1.0 启动...`

---

## 🆘 常见问题

### Q1: 推送时提示 "Authentication failed"

**解决方案**：

- 使用 Personal Access Token 代替密码
- 或使用 GitHub Desktop 图形界面

### Q2: 推送时提示 "remote: Support for password authentication was removed"

**解决方案**：

- GitHub 已禁用密码认证
- 必须使用 Personal Access Token

### Q3: jsdelivr 链接 404

**可能原因**：

- 版本标签不存在
- 文件路径错误
- 仓库未公开

**解决方案**：

- 确认标签已推送：`git push origin v1.0.0`
- 检查文件路径是否正确
- 确认仓库是公开的（Public）

### Q4: 中文路径问题

**解决方案**：

- jsdelivr 支持中文路径
- 如果遇到问题，可以 URL 编码路径

---

## 📚 参考资源

- Git 官方文档：<https://git-scm.com/doc>
- GitHub 文档：<https://docs.github.com>
- jsdelivr 文档：<https://www.jsdelivr.com/documentation>
- Personal Access Token：<https://github.com/settings/tokens>

---

## ✅ 完成检查清单

- [ ] Git 已安装
- [ ] GitHub 仓库已创建
- [ ] 远程仓库已添加
- [ ] 代码已提交
- [ ] 代码已推送到 GitHub
- [ ] 版本标签已创建
- [ ] jsdelivr 链接可访问
- [ ] SillyTavern 中脚本可正常加载
