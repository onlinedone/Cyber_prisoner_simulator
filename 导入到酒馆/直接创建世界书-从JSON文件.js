/**
 * 方案2（改进版）：从 JSON 文件读取并使用酒馆助手 API 创建世界书
 *
 * 使用方法：
 * 1. 在浏览器中打开酒馆页面
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 将下面的代码复制粘贴到控制台并执行
 * 5. 在弹出的文件选择对话框中选择 internal_basic_procedures.json 文件
 *
 * 注意：执行前请确保：
 * - 酒馆助手已正确安装并运行
 * - 如果世界书已存在，此脚本会替换它
 */

(async function createWorldbookFromJSONFile() {
  try {
    console.log('[世界书创建脚本] 准备从 JSON 文件创建世界书...');

    // 检查酒馆助手 API 是否可用
    if (typeof getWorldbookNames === 'undefined') {
      throw new Error('酒馆助手 API 不可用。请确保酒馆助手已正确安装并运行。');
    }

    // 创建文件选择输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // 等待用户选择文件
    const file = await new Promise((resolve, reject) => {
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('未选择文件'));
        }
      });
      fileInput.click();
    });

    console.log(`[世界书创建脚本] 已选择文件: ${file.name}`);

    // 读取文件内容
    const fileText = await file.text();
    const jsonData = JSON.parse(fileText);

    // 验证 JSON 结构
    if (!jsonData.entries || !Array.isArray(jsonData.entries)) {
      throw new Error('JSON 文件格式不正确：缺少 entries 数组');
    }

    const worldbookName = jsonData.name || '生活细节库';
    const entries = jsonData.entries;

    console.log(`[世界书创建脚本] 解析成功:`);
    console.log(`  - 世界书名称: ${worldbookName}`);
    console.log(`  - 条目数量: ${entries.length}`);

    // 验证条目格式
    let validEntries = 0;
    for (const entry of entries) {
      if (entry.uid !== undefined && entry.name && entry.strategy && entry.position) {
        validEntries++;
      }
    }
    console.log(`  - 有效条目: ${validEntries}/${entries.length}`);

    if (validEntries === 0) {
      throw new Error('没有找到有效条目。请检查 JSON 文件格式。');
    }

    // 检查世界书是否已存在
    const existingWorldbooks = getWorldbookNames();
    const worldbookExists = existingWorldbooks.includes(worldbookName);

    if (worldbookExists) {
      console.log(`[世界书创建脚本] 世界书 "${worldbookName}" 已存在，将替换它...`);

      // 使用 replaceWorldbook 替换现有世界书
      await replaceWorldbook(worldbookName, entries, { render: 'immediate' });
      console.log(`[世界书创建脚本] ✓ 已替换世界书 "${worldbookName}" (${entries.length} 个条目)`);
    } else {
      console.log(`[世界书创建脚本] 创建新世界书 "${worldbookName}"...`);

      // 使用 createOrReplaceWorldbook 创建新世界书
      const created = await createOrReplaceWorldbook(worldbookName, entries, { render: 'immediate' });
      console.log(`[世界书创建脚本] ✓ 已创建世界书 "${worldbookName}" (${entries.length} 个条目)`);
      console.log(`[世界书创建脚本] 创建结果: ${created ? '新建' : '替换'}`);
    }

    // 验证创建结果
    try {
      const createdWorldbook = await getWorldbook(worldbookName);
      console.log(`[世界书创建脚本] ✓ 验证成功: 世界书包含 ${createdWorldbook.length} 个条目`);
      console.log(`[世界书创建脚本] ✓ 条目列表:`, createdWorldbook.map(e => e.name).join(', '));
    } catch (error) {
      console.error(`[世界书创建脚本] ⚠ 验证失败:`, error);
    }

    // 清理文件输入
    document.body.removeChild(fileInput);

    console.log(`[世界书创建脚本] ✓ 完成！`);
    return { success: true, worldbookName, entriesCount: entries.length };
  } catch (error) {
    console.error('[世界书创建脚本] ✗ 执行失败:', error);
    console.error('[世界书创建脚本] 错误详情:', error.message);
    if (error.stack) {
      console.error('[世界书创建脚本] 错误堆栈:', error.stack);
    }
    return { success: false, error: error.message };
  }
})();
