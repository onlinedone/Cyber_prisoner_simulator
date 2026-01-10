# 记忆增强插件 API 接口文档

根据 `st-memory-enhancement-master` 源代码分析，以下是可用的 API 接口。

## 全局对象

记忆增强插件在 `window` 对象上注册了以下全局对象：

```javascript
window.stMemoryEnhancement = {
    ext_getAllTables,        // 获取所有表格数据
    ext_exportAllTablesAsJson, // 导出所有表格为 JSON
    VERSION,                  // 插件版本号
};
```

## API 接口

### 1. `ext_getAllTables()`

**功能**: 导出所有表格数据，方便其他插件调用。

**返回值**: 返回一个包含所有表格数据的数组，每个表格对象包含：
- `name`: 表格的名称（字符串）
- `data`: 一个二维数组，表示表格的完整数据（包括表头和所有行）
  - 第一行是表头（列名）
  - 后续行是数据行

**返回格式示例**:
```javascript
[
  {
    name: "状态",
    data: [
      ["健康值", "精神值", "力量", "智力"],  // 表头
      [70, 65, 50, 55],                      // 第一行数据
      [80, 70, 60, 60],                      // 第二行数据（如果有）
    ]
  },
  {
    name: "角色信息",
    data: [
      ["姓名", "年龄", "职业"],
      ["张三", "25", "程序员"],
    ]
  }
]
```

**使用示例**:
```javascript
if (window.stMemoryEnhancement && typeof window.stMemoryEnhancement.ext_getAllTables === 'function') {
  try {
    const allTables = window.stMemoryEnhancement.ext_getAllTables();
    console.log('获取到的表格:', allTables);

    // 查找包含状态数据的表格
    const stateTable = allTables.find(table =>
      table.name && (
        table.name.toLowerCase().includes('state') ||
        table.name.toLowerCase().includes('status') ||
        table.name.toLowerCase().includes('状态')
      )
    );

    if (stateTable && stateTable.data && stateTable.data.length >= 2) {
      const header = stateTable.data[0];  // 表头
      const firstRow = stateTable.data[1]; // 第一行数据

      // 将二维数组转换为对象
      const stateObj = {};
      header.forEach((colName, index) => {
        if (colName && firstRow[index] !== undefined) {
          stateObj[colName] = firstRow[index];
        }
      });

      console.log('解析出的状态对象:', stateObj);
    }
  } catch (error) {
    console.error('获取表格数据失败:', error);
  }
}
```

**注意事项**:
- 此方法可能会抛出错误（如 `table.getBody is not a function`），建议使用 try-catch 包裹
- 返回的数组可能为空（如果没有表格数据）
- 只有启用的表格（`enable: true`）才会被返回

### 2. `ext_exportAllTablesAsJson()`

**功能**: 导出所有表格为一个 JSON 对象，格式与 '范例表格.json' 类似。

**返回值**: 返回一个 JSON 对象，键是表格的 UID，值是表格的完整配置和数据：
```javascript
{
  "table_uid_1": {
    uid: "table_uid_1",
    name: "状态",
    content: [
      ["健康值", "精神值"],
      [70, 65],
    ]
  },
  "table_uid_2": {
    uid: "table_uid_2",
    name: "角色信息",
    content: [
      ["姓名", "年龄"],
      ["张三", "25"],
    ]
  }
}
```

**使用示例**:
```javascript
if (window.stMemoryEnhancement && typeof window.stMemoryEnhancement.ext_exportAllTablesAsJson === 'function') {
  try {
    const jsonData = window.stMemoryEnhancement.ext_exportAllTablesAsJson();
    console.log('导出的 JSON 数据:', jsonData);

    // 查找包含状态数据的表格
    const stateTable = Object.values(jsonData).find((table: any) =>
      table.name && (
        table.name.toLowerCase().includes('state') ||
        table.name.toLowerCase().includes('status') ||
        table.name.toLowerCase().includes('状态')
      )
    );

    if (stateTable && stateTable.content && stateTable.content.length >= 2) {
      const header = stateTable.content[0];
      const firstRow = stateTable.content[1];

      // 转换为对象
      const stateObj = {};
      header.forEach((colName, index) => {
        if (colName && firstRow[index] !== undefined) {
          stateObj[colName] = firstRow[index];
        }
      });

      console.log('解析出的状态对象:', stateObj);
    }
  } catch (error) {
    console.error('导出表格数据失败:', error);
  }
}
```

### 3. `VERSION`

**功能**: 获取插件版本号。

**类型**: 字符串

**使用示例**:
```javascript
if (window.stMemoryEnhancement) {
  console.log('记忆增强插件版本:', window.stMemoryEnhancement.VERSION);
}
```

## 检测插件是否可用

```javascript
function isMemoryEnhancementAvailable() {
  return !!(
    window.stMemoryEnhancement &&
    typeof window.stMemoryEnhancement.ext_getAllTables === 'function'
  );
}
```

## 从表格数据中提取状态信息

以下是一个通用的状态提取函数：

```javascript
function extractStateFromTables(allTables) {
  if (!Array.isArray(allTables) || allTables.length === 0) {
    return null;
  }

  // 1. 按表格名称查找
  const possibleTableNames = [
    'state', 'status', 'character', 'protagonist', 'player', 'main', 'current',
    '状态', '角色', '主角', '玩家'
  ];

  let targetTable = allTables.find(table =>
    table.name && possibleTableNames.some(name =>
      table.name.toLowerCase().includes(name.toLowerCase())
    )
  );

  // 2. 如果没找到，按表头字段查找
  if (!targetTable) {
    targetTable = allTables.find(table => {
      if (!table.data || !Array.isArray(table.data) || table.data.length < 2) {
        return false;
      }
      const header = table.data[0];
      return Array.isArray(header) && (
        header.some(h => h && h.toLowerCase().includes('health')) ||
        header.some(h => h && h.toLowerCase().includes('mental')) ||
        header.some(h => h && h.toLowerCase().includes('健康')) ||
        header.some(h => h && h.toLowerCase().includes('精神'))
      );
    });
  }

  // 3. 转换为对象
  if (targetTable && targetTable.data && targetTable.data.length >= 2) {
    const header = targetTable.data[0];
    const firstRow = targetTable.data[1];
    const stateObj = {};

    header.forEach((colName, index) => {
      if (colName && firstRow[index] !== undefined) {
        const normalizedName = colName.toLowerCase().trim();
        const value = firstRow[index];

        // 尝试转换为数字
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        const finalValue = !isNaN(numValue) && numValue !== null ? numValue : value;

        // 匹配常见字段
        if (normalizedName.includes('health') || normalizedName.includes('健康')) {
          stateObj.health = finalValue;
        } else if (normalizedName.includes('mental') || normalizedName.includes('精神')) {
          stateObj.mental = finalValue;
        } else if (normalizedName.includes('strength') || normalizedName.includes('力量')) {
          stateObj.strength = finalValue;
        } else if (normalizedName.includes('intelligence') || normalizedName.includes('智力')) {
          stateObj.intelligence = finalValue;
        }

        // 保存原始字段名
        stateObj[colName] = finalValue;
      }
    });

    // 如果找到了 health 或 mental，返回状态对象
    if ('health' in stateObj || 'mental' in stateObj) {
      return stateObj;
    }
  }

  return null;
}

// 使用示例
if (window.stMemoryEnhancement) {
  try {
    const allTables = window.stMemoryEnhancement.ext_getAllTables();
    const state = extractStateFromTables(allTables);
    if (state) {
      console.log('提取的状态:', state);
    }
  } catch (error) {
    console.error('提取状态失败:', error);
  }
}
```

## 错误处理

由于 `ext_getAllTables()` 可能会抛出错误（如 `table.getBody is not a function`），建议始终使用 try-catch：

```javascript
function getStateFromMemoryEnhancement() {
  if (!window.stMemoryEnhancement) {
    return null;
  }

  try {
    const allTables = window.stMemoryEnhancement.ext_getAllTables();
    return extractStateFromTables(allTables);
  } catch (error) {
    console.warn('从记忆增强插件获取状态失败:', error);
    return null;
  }
}
```

## 总结

- **主要 API**: `ext_getAllTables()` 和 `ext_exportAllTablesAsJson()`
- **返回格式**: 数组或对象，包含表格的 `name` 和 `data`/`content`（二维数组）
- **数据格式**: 第一行是表头，后续行是数据
- **错误处理**: 必须使用 try-catch 包裹 API 调用
- **状态提取**: 需要从二维数组转换为对象，并匹配字段名
