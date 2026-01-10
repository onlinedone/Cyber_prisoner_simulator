# ERR_CONNECTION_REFUSED 错误修复指南

## 问题原因

`ERR_CONNECTION_REFUSED` 表示浏览器无法连接到指定的服务器地址。常见原因：

1. **HTTP 服务器没有启动**
2. **端口号错误**
3. **路径不正确**
4. **使用了错误的协议**（file:// vs http://）

## 快速诊断步骤

### 步骤 1：确认文件路径

编译后的文件应该在：
```
dist/赛博坐牢模拟器增强脚本/脚本/index.js
```

**检查方法**：
1. 打开文件资源管理器
2. 导航到项目根目录：`C:\Users\38331\Downloads\tavern_helper_template-main`
3. 确认 `dist/赛博坐牢模拟器增强脚本/脚本/` 目录存在
4. 确认 `index.js` 文件存在

### 步骤 2：检查编译是否成功

确认 `pnpm watch` 终端显示编译成功，没有错误。

### 步骤 3：启动本地 HTTP 服务器

**重要**：必须启动 HTTP 服务器才能通过 HTTP 协议访问文件。

#### 方法 A：使用 Python（推荐）

1. 打开新的 PowerShell 或 CMD 终端
2. 导航到项目根目录：
   ```powershell
   cd C:\Users\38331\Downloads\tavern_helper_template-main
   ```
3. 启动 HTTP 服务器：
   ```powershell
   # Python 3
   python -m http.server 8080
   
   # 或者 Python 2
   python -m SimpleHTTPServer 8080
   ```

如果成功，你会看到：
```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

#### 方法 B：使用 Node.js http-server

如果没有 Python，可以使用 Node.js：

```powershell
# 安装（如果还没安装）
npm install -g http-server

# 在项目根目录运行
http-server -p 8080 -c-1
```

#### 方法 C：使用 VS Code Live Server 扩展

如果使用 VS Code：

1. 安装 "Live Server" 扩展
2. 右键点击 `dist` 文件夹
3. 选择 "Open with Live Server"
4. 记住分配的端口号

### 步骤 4：验证服务器运行

在浏览器中访问：
```
http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js
```

**如果看到 JavaScript 代码**：✅ 服务器运行正常  
**如果看到 ERR_CONNECTION_REFUSED**：❌ 服务器未启动或端口错误

### 步骤 5：在酒馆中配置正确的路径

确保使用正确的导入路径：

```javascript
// 正确格式
import 'http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js'
```

**常见错误**：

❌ **错误示例**：
```javascript
// 1. 使用 file:// 协议（浏览器安全限制，可能无法工作）
import 'file:///C:/Users/38331/Downloads/tavern_helper_template-main/dist/赛博坐牢模拟器增强脚本/脚本/index.js'

// 2. 路径中缺少协议
import '127.0.0.1:8080/dist/...'

// 3. 路径中缺少 /dist/
import 'http://127.0.0.1:8080/赛博坐牢模拟器增强脚本/脚本/index.js'

// 4. 端口号错误
import 'http://127.0.0.1:8000/dist/...'  // 8000 是酒馆的端口，不是文件服务器的端口
```

✅ **正确示例**：
```javascript
import 'http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js'
```

## 完整配置流程

### 1. 确认 pnpm watch 正在运行

在终端 A 中运行：
```powershell
cd C:\Users\38331\Downloads\tavern_helper_template-main
pnpm watch
```

确认看到：
```
[tavern_helper] 已启动酒馆监听服务
```

### 2. 启动 HTTP 服务器

在终端 B 中运行：
```powershell
cd C:\Users\38331\Downloads\tavern_helper_template-main
python -m http.server 8080
```

### 3. 验证服务器可访问

在浏览器中访问：
```
http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js
```

应该能看到 JavaScript 代码。

### 4. 在酒馆中配置路径

在 SillyTavern 的酒馆助手设置中，使用：
```javascript
import 'http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js'
```

## 常见问题排查

### Q1: 提示 "python 不是内部或外部命令"

**解决**：
1. 安装 Python：https://www.python.org/downloads/
2. 或者在安装时勾选 "Add Python to PATH"
3. 或者使用 Node.js 方法（方法 B）

### Q2: 端口 8080 被占用

**解决**：使用其他端口
```powershell
python -m http.server 8081  # 使用 8081
```

然后更新导入路径：
```javascript
import 'http://127.0.0.1:8081/dist/赛博坐牢模拟器增强脚本/脚本/index.js'
```

### Q3: 仍然提示 ERR_CONNECTION_REFUSED

**检查清单**：
- [ ] HTTP 服务器是否已启动？（终端是否有输出）
- [ ] 端口号是否正确？（8080 或其他）
- [ ] 路径是否正确？（包含 `/dist/`）
- [ ] 浏览器能否访问 `http://127.0.0.1:8080`？
- [ ] 防火墙是否阻止了连接？

### Q4: 文件存在但返回 404

**可能原因**：
1. **路径大小写错误**：Windows 不区分大小写，但 HTTP 服务器可能区分
   - 检查：`赛博坐牢模拟器增强脚本` 是否完全匹配
2. **文件未编译**：运行 `pnpm watch` 确保文件已编译到 `dist/` 目录

### Q5: 想要使用绝对路径

**不推荐**，因为：
- `file://` 协议有浏览器安全限制
- 跨域问题

**推荐**：始终使用 HTTP 服务器。

## 替代方案：使用相对路径（如果酒馆支持）

如果酒馆助手支持相对路径，可以尝试：

```javascript
// 如果酒馆在 http://127.0.0.1:8000/
// 需要配置静态文件服务
import '/scripts/index.js'  // 需要在酒馆服务器上配置静态文件服务
```

但这不是推荐方案，因为需要修改酒馆服务器配置。

## 推荐配置

### 开发环境（实时监听）

1. **终端 1**：运行 `pnpm watch`（编译代码）
2. **终端 2**：运行 `python -m http.server 8080`（提供文件）
3. **酒馆路径**：`http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/index.js`

### 生产环境（使用 CDN）

如果代码已经推送到 GitHub：

```javascript
import 'https://cdn.jsdelivr.net/gh/你的用户名/仓库名@分支/dist/赛博坐牢模拟器增强脚本/脚本/index.js'
```

## 验证成功标志

配置成功后，你应该：

1. ✅ 在浏览器中能直接访问 `http://127.0.0.1:8080/dist/.../index.js`
2. ✅ 酒馆中不再出现 `ERR_CONNECTION_REFUSED` 错误
3. ✅ 浏览器控制台显示脚本加载成功
4. ✅ 能看到 `[核心系统]` 等初始化日志
