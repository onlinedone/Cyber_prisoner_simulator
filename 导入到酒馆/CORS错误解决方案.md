# CORS 错误解决方案

## 问题

浏览器报错：
```
Access to script at 'http://127.0.0.1:8080/...' from origin 'http://127.0.0.1:8000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## 原因

Python 的 `python -m http.server` 默认不支持 CORS（跨域资源共享）头，而浏览器需要这些头来允许跨域请求。

## 解决方案

### 方法 1：使用支持 CORS 的服务器脚本（推荐）

我已经创建了 `cors_server.py` 文件，它支持 CORS。

**使用步骤**：

1. **停止当前的 HTTP 服务器**（在运行 `python -m http.server 8080` 的终端按 `Ctrl + C`）

2. **启动支持 CORS 的服务器**：
   ```powershell
   python cors_server.py
   ```

3. **验证**：应该看到：
   ```
   ========================================
   支持 CORS 的 HTTP 服务器已启动
   地址: http://127.0.0.1:8080
   按 Ctrl+C 停止服务器
   ========================================
   ```

### 方法 2：使用 Node.js http-server（如果已安装）

```powershell
npx http-server -p 8080 -c-1 --cors
```

### 方法 3：使用其他支持 CORS 的工具

- **Live Server**（VS Code 扩展）：自动支持 CORS
- **serve**：`npx serve -p 8080 --cors`

## 验证

启动支持 CORS 的服务器后：

1. 在浏览器中访问：
   ```
   http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js
   ```

2. 打开开发者工具（F12）→ Network 标签
3. 刷新页面
4. 点击 `detention-system.js` 请求
5. 查看 Response Headers，应该看到：
   ```
   Access-Control-Allow-Origin: *
   ```

## 完整工作流程

现在你需要运行：

1. **终端 1**：`pnpm watch`（编译代码）
2. **终端 2**：`python cors_server.py`（提供文件，支持 CORS）

然后在酒馆中使用：
```javascript
import 'http://127.0.0.1:8080/dist/赛博坐牢模拟器增强脚本/脚本/detention-system.js'
```

## 注意事项

- `cors_server.py` 设置了 `Access-Control-Allow-Origin: *`，允许所有来源访问
- 这**仅适用于本地开发**，不要在生产环境使用
- 服务器会禁用缓存，确保总是获取最新文件
