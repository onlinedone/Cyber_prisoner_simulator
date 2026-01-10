# GitHub 上传说明

## 已上传的文件

以下文件已成功提交到 GitHub 仓库 `onlinedone/Cyber_prisoner_simulator`：

### 源代码文件
- `src/赛博坐牢模拟器增强脚本/界面/状态栏/` - 状态栏界面（Vue 组件）
- `src/赛博坐牢模拟器增强脚本/脚本/变量结构/index.ts` - MVU 变量结构注册脚本

### 提交哈希
- 最新提交：`cc1d3d140b5be7e008862980ee6da62e533b63bb`

## CDN 链接

### 1. 主脚本（看守所模拟器完整系统）

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@cc1d3d1/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/cc1d3d1/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

### 2. 状态栏界面（前端界面）

**jsdelivr CDN（推荐）**：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@cc1d3d1/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

**GitHub Raw（备选）**：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/cc1d3d1/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

### 3. MVU 变量结构注册脚本

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@cc1d3d1/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/cc1d3d1/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

## 注意事项

1. **打包文件**：需要先运行 `pnpm build` 生成 `dist` 目录下的打包文件，然后提交到 GitHub
2. **CDN 缓存**：jsdelivr CDN 可能需要几分钟时间同步 GitHub 上的新文件
3. **提交哈希**：使用提交哈希（如 `cc1d3d1`）比使用分支名更可靠，因为哈希指向特定的提交版本

## 下一步操作

1. 运行 `pnpm build` 生成打包文件
2. 提交 `dist` 目录到 GitHub
3. 使用上述 CDN 链接在角色卡中配置 MVU
