# 方案3：使用 SillyTavern 原生 API 创建世界书 - 实施说明

## 概述

方案3直接使用 SillyTavern 的原生 HTTP API，完全不依赖酒馆助手，适合酒馆助手 API 不可用的情况。

## 核心原理

### 数据格式转换

SillyTavern 存储世界书的格式与您的 JSON 文件格式不同：

**您的 JSON 格式（数组格式）：**

```json
{
  "name": "生活细节库",
  "entries": [
    { "uid": 0, "name": "...", ... },
    { "uid": 1, "name": "...", ... }
  ]
}
```

**SillyTavern 期望格式（对象格式）：**

```json
{
  "entries": {
    "0": { "uid": 0, "name": "...", ... },
    "1": { "uid": 1, "name": "...", ... }
  }
}
```

脚本会自动将数组格式转换为对象格式。

## 实施步骤

### 方法 1：使用文件选择器（推荐）

1. **打开酒馆页面**
   - 在浏览器中打开您的 SillyTavern 实例

2. **打开开发者工具**
   - 按 `F12`
   - 切换到 **Console（控制台）** 标签

3. **执行脚本**
   - 打开文件：`导入到酒馆/使用原生API创建世界书.js`
   - 复制整个文件内容
   - 粘贴到控制台并按 `Enter` 执行

4. **选择 JSON 文件**
   - 会弹出一个文件选择对话框
   - 选择 `internal_basic_procedures.json` 文件
   - 点击"打开"

5. **等待完成**
   - 脚本会自动：
     - 读取 JSON 文件
     - 将数组格式转换为对象格式
     - 调用 SillyTavern 原生 API 保存
     - 验证创建结果
   - 控制台会显示详细的执行日志

### 方法 2：手动调用 API（适合自动化）

如果您需要在代码中调用，可以使用：

```javascript
// 1. 读取 JSON 文件
const jsonData = {
  name: "生活细节库",
  entries: [/* ... */]
};

// 2. 转换为对象格式
const entriesObject = {};
for (const entry of jsonData.entries) {
  entriesObject[entry.uid] = entry;
}

// 3. 构建世界书数据
const worldbookData = {
  entries: entriesObject,
  extensions: jsonData.extensions,
  description: jsonData.description,
};

// 4. 调用 API
const response = await fetch('/api/worldinfo/edit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: jsonData.name,
    data: worldbookData,
  }),
});

const result = await response.json();
console.log('创建结果:', result);
```

## API 说明

### `/api/worldinfo/edit` - 创建/编辑世界书

**请求格式：**

```json
POST /api/worldinfo/edit
Content-Type: application/json

{
  "name": "世界书名称",
  "data": {
    "entries": {
      "0": { "uid": 0, "name": "...", ... },
      "1": { "uid": 1, "name": "...", ... }
    }
  }
}
```

**响应格式：**

```json
{
  "ok": true
}
```

### `/api/worldinfo/get` - 获取世界书

**请求格式：**

```json
POST /api/worldinfo/get
Content-Type: application/json

{
  "name": "世界书名称"
}
```

**响应格式：**

```json
{
  "entries": {
    "0": { ... },
    "1": { ... }
  }
}
```

## 注意事项

### 1. 数据格式要求

- ✅ `entries` 必须是对象，键为 uid（字符串），值为条目对象
- ✅ 每个条目必须包含：`uid`, `name`, `strategy`, `position`
- ✅ `uid` 必须唯一且为数字

### 2. 世界书名称

- 脚本会使用 JSON 文件中的 `name` 字段
- 如果没有 `name` 字段，默认使用 `"生活细节库"`
- **重要**：确保名称与 `worldbook_loader.ts` 中的配置匹配

### 3. 权限和认证

- 脚本会自动尝试获取请求头（如果 `getRequestHeaders` 函数存在）
- 如果遇到 401/403 错误，可能需要：
  - 检查是否已登录
  - 检查 CORS 设置
  - 手动添加认证头

### 4. 验证步骤

创建完成后，执行以下命令验证：

```javascript
// 通过 API 获取世界书
const response = await fetch('/api/worldinfo/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '生活细节库' }),
});

const worldbook = await response.json();
console.log('条目数量:', Object.keys(worldbook.entries).length);
```

## 常见问题

### Q1: 提示 "服务器返回错误 400"？

**A:** 检查：

1. JSON 文件格式是否正确
2. `entries` 是否包含有效数据
3. 每个条目是否包含必需字段（`uid`, `name`, `strategy`, `position`）

### Q2: 提示 "服务器返回错误 403 Forbidden"？

**A:** 这是认证问题，按以下步骤排查：

1. **检查是否已登录**
   - 确保已经登录 SillyTavern
   - 如果未登录，请先登录

2. **检查 CSRF token**
   - 脚本会自动尝试从 `/csrf-token` 获取 CSRF token
   - 如果获取失败，手动执行：
     ```javascript
     fetch('/csrf-token').then(r => r.json()).then(d => console.log('CSRF Token:', d.token))
     ```
   - 如果返回错误或 `undefined`，说明服务器可能未启用认证

3. **手动添加 CSRF token**
   - 如果脚本无法自动获取 token，可以手动获取并添加到脚本中：
     ```javascript
     // 先获取 token
     const tokenResponse = await fetch('/csrf-token');
     const tokenData = await tokenResponse.json();
     const csrfToken = tokenData.token;

     // 然后在请求头中添加
     headers['X-CSRF-Token'] = csrfToken;
     ```

4. **使用 getRequestHeaders 函数**
   - 如果 `getRequestHeaders` 函数可用，它会自动包含 CSRF token
   - 在控制台执行：`typeof getRequestHeaders` 检查是否可用
   - 如果可用，脚本会自动使用它

5. **尝试刷新页面**
   - 刷新页面可以让 SillyTavern 重新初始化 token
   - 刷新后立即执行脚本

6. **检查服务器配置**
   - 如果服务器启用了认证，确保已正确配置
   - 检查服务器日志，查看具体的认证错误
   - 查看浏览器 Network 标签中的请求，确认请求头是否正确

7. **使用备用方案（导入 API）**
   - 如果 `/api/worldinfo/edit` 一直失败，尝试使用 `/api/worldinfo/import` 端点
   - 使用文件：`导入到酒馆/使用导入API创建世界书.js`
   - 这个端点使用文件上传方式，可能更容易通过认证

### Q3: 创建成功但列表中没有显示？

**A:**

1. **刷新页面**：最直接的解决方法
2. 手动触发列表更新：在控制台执行：

   ```javascript
   // 如果 updateWorldInfoList 函数可用
   if (typeof updateWorldInfoList === 'function') {
     await updateWorldInfoList();
   } else {
     location.reload();
   }
   ```

### Q4: 条目格式验证失败？

**A:** 检查每个条目是否包含：

- `uid`（数字，必需）
- `name`（字符串，必需）
- `strategy`（对象，必需）
  - `type`: `"selective"` 或 `"constant"`
  - `keys`: 数组
  - `keys_secondary`: 对象
  - `scan_depth`: 数字或 `"same_as_global"`
- `position`（对象，必需）
  - `type`: 位置类型字符串
  - `role`: `"system"`、`"user"` 或 `"assistant"`
  - `depth`: 数字
  - `order`: 数字
- `content`（字符串，必需）
- `probability`（数字，必需）
- `recursion`（对象）
- `effect`（对象）

## 调试技巧

### 1. 检查请求和响应

在浏览器开发者工具的 **Network（网络）** 标签中：

- 查找对 `/api/worldinfo/edit` 的请求
- 查看请求体和响应内容
- 检查状态码和错误信息

### 2. 验证数据转换

在控制台执行：

```javascript
// 假设 jsonData 是您加载的 JSON 数据
const entriesObject = {};
for (const entry of jsonData.entries) {
  entriesObject[entry.uid] = entry;
}
console.log('转换后的格式:', { entries: entriesObject });
console.log('条目数量:', Object.keys(entriesObject).length);
```

### 3. 逐步测试

```javascript
// 1. 测试 API 是否可用
fetch('/api/worldinfo/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
})
.then(r => r.json())
.then(data => console.log('世界书列表:', data));

// 2. 测试获取世界书（如果已存在）
fetch('/api/worldinfo/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '生活细节库' }),
})
.then(r => r.json())
.then(data => console.log('现有世界书:', data));
```

## 优点

✅ **不依赖酒馆助手**：直接使用 SillyTavern 原生 API
✅ **格式自动转换**：自动处理数组到对象的转换
✅ **错误处理完善**：详细的错误信息和验证步骤
✅ **易于调试**：可以使用浏览器开发者工具查看请求/响应

## 缺点

⚠️ **需要手动刷新**：创建后可能需要手动刷新页面才能看到
⚠️ **需要手动添加认证**：如果服务器启用了认证，可能需要手动处理
⚠️ **数据格式转换**：需要将数组格式转换为对象格式

## 下一步

创建成功后：

1. **刷新页面**：让世界书出现在列表中
2. **检查日志**：查看控制台中的创建日志
3. **验证功能**：尝试触发相关关键词，验证条目是否正确激活
4. **测试加载器**：确认 `worldbook_loader.ts` 能否正常加载世界书

## 技术支持

如果遇到问题：

1. 检查浏览器控制台错误信息
2. 查看 Network 标签中的 API 请求
3. 验证 JSON 文件格式是否正确
4. 检查服务器端日志（如果有权限访问）
