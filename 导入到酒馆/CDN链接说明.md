# CDN 链接说明

## 当前状态

源代码已提交到 GitHub，但打包文件（`dist` 目录）尚未上传。需要先打包并提交 `dist` 目录。

## 提交哈希

- 源代码提交：`cc1d3d140b5be7e008862980ee6da62e533b63bb`

## 待上传的文件

打包后需要上传以下文件到 GitHub：

1. `dist/赛博坐牢模拟器增强脚本/detention-system.js` - 主脚本
2. `dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html` - 状态栏界面（如果已打包）
3. `dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js` - MVU 变量结构注册脚本（如果已打包）

## 上传步骤

1. 运行 `pnpm build` 生成打包文件
2. 检查 `dist` 目录下的文件
3. 提交 `dist` 目录到 GitHub：
   ```bash
   git add dist/
   git commit -m "build: add packaged files"
   git push origin main
   ```
4. 获取新的提交哈希
5. 使用新的提交哈希更新 CDN 链接

## CDN 链接格式（待更新）

### 1. 主脚本

**jsdelivr CDN**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@提交哈希/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

**GitHub Raw**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/提交哈希/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

### 2. 状态栏界面（如果已打包）

**jsdelivr CDN**：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@提交哈希/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

**GitHub Raw**：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/提交哈希/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

### 3. MVU 变量结构注册脚本（如果已打包）

**jsdelivr CDN**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@提交哈希/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

**GitHub Raw**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/提交哈希/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

## 注意事项

1. **打包文件**：状态栏界面和变量结构脚本可能还没有被打包，需要检查 webpack 配置
2. **CDN 缓存**：jsdelivr CDN 可能需要几分钟时间同步 GitHub 上的新文件
3. **提交哈希**：使用提交哈希（如 `cc1d3d1`）比使用分支名更可靠
