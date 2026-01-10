# 最终 CDN 链接

## ✅ 所有文件已成功打包并上传

### 提交哈希

- 最新提交：`de01d60`（待确认完整哈希）

## CDN 链接

### 1. 主脚本（看守所模拟器完整系统）

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@de01d60/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/de01d60/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

### 2. 状态栏界面（前端界面）

**jsdelivr CDN（推荐）**：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@de01d60/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

**GitHub Raw（备选）**：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/de01d60/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

### 3. MVU 变量结构注册脚本

**注意**：变量结构脚本已成功打包，文件名为 `index.js`。

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@de01d60/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/de01d60/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'
```

## 角色卡 MVU 配置示例

```json
{
  "mvu": {
    "scripts": [
      {
        "id": "detention-system-schema",
        "name": "状态栏变量结构",
        "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@de01d60/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/index.js'"
      }
    ],
    "frontends": [
      {
        "id": "detention-system-status-bar",
        "name": "状态栏",
        "content": "https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@de01d60/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html"
      }
    ]
  }
}
```

## 注意事项

1. **CDN 缓存**：jsdelivr CDN 可能需要几分钟时间同步 GitHub 上的新文件
2. **提交哈希**：使用提交哈希比使用分支名更可靠
3. **变量结构脚本**：已成功打包，文件名为 `index.js`（位于 `脚本/变量结构/` 目录下）
