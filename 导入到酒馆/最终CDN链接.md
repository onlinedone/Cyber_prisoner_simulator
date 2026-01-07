# 最终 CDN 链接

## 提交哈希

- 最新提交：`71817ad7e5de3ecffa975ecae84769af53e4b9e3`

## CDN 链接

### 1. 主脚本（看守所模拟器完整系统）

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@71817ad/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/71817ad/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

### 2. 状态栏界面（前端界面）

**jsdelivr CDN（推荐）**：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@0e4804a/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

**GitHub Raw（备选）**：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/71817ad/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

### 3. MVU 变量结构注册脚本

**注意**：变量结构脚本目前还没有被打包。如果需要，请检查 `src/赛博坐牢模拟器增强脚本/脚本/变量结构/index.ts` 文件是否存在，并确保 webpack 配置正确识别它。

## 角色卡 MVU 配置示例

```json
{
  "mvu": {
    "scripts": [
      {
        "id": "detention-system-schema",
        "name": "状态栏变量结构",
        "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@71817ad/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'"
      }
    ],
    "frontends": [
      {
        "id": "detention-system-status-bar",
        "name": "状态栏",
        "content": "https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@71817ad/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html"
      }
    ]
  }
}
```

## 注意事项

1. **CDN 缓存**：jsdelivr CDN 可能需要几分钟时间同步 GitHub 上的新文件
2. **提交哈希**：使用提交哈希（如 `71817ad`）比使用分支名更可靠
3. **变量结构脚本**：如果变量结构脚本未被打包，需要检查 webpack 配置或文件路径
