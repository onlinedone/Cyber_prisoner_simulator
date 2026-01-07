# 最终 CDN 链接

## ✅ 所有文件已成功打包并上传

### 提交哈希

- 最新提交：`feb8234d8bf738e3ab4a1d4a4e5f4f8ce41b0563`

## CDN 链接

### 1. 主脚本（看守所模拟器完整系统）

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@feb8234/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/feb8234/dist/赛博坐牢模拟器增强脚本/detention-system.js'
```

### 2. 状态栏界面（前端界面）

**jsdelivr CDN（推荐）**：
```
https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@提交哈希/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

**GitHub Raw（备选）**：
```
https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/feb8234/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html
```

### 3. MVU 变量结构注册脚本

**注意**：变量结构脚本已成功打包，但文件名也是 `detention-system.js`（因为 webpack 配置对 `赛博坐牢模拟器增强脚本` 目录下的所有文件都使用相同的文件名）。

**jsdelivr CDN（推荐）**：
```javascript
import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@提交哈希/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/detention-system.js'
```

**GitHub Raw（备选）**：
```javascript
import 'https://raw.githubusercontent.com/onlinedone/Cyber_prisoner_simulator/feb8234/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/detention-system.js'
```

## 角色卡 MVU 配置示例

```json
{
  "mvu": {
    "scripts": [
      {
        "id": "detention-system-schema",
        "name": "状态栏变量结构",
        "content": "import 'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@feb8234/dist/赛博坐牢模拟器增强脚本/脚本/变量结构/detention-system.js'"
      }
    ],
    "frontends": [
      {
        "id": "detention-system-status-bar",
        "name": "状态栏",
        "content": "https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@feb8234/dist/赛博坐牢模拟器增强脚本/界面/状态栏/index.html"
      }
    ]
  }
}
```

## 注意事项

1. **CDN 缓存**：jsdelivr CDN 可能需要几分钟时间同步 GitHub 上的新文件
2. **提交哈希**：使用提交哈希比使用分支名更可靠
3. **变量结构脚本**：已成功打包，文件名为 `detention-system.js`（位于 `脚本/变量结构/` 目录下）
