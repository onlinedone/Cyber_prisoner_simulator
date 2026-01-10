/**
 * 方案3：使用 SillyTavern 原生 API 创建世界书（不依赖酒馆助手）
 *
 * 使用方法：
 * 1. 在浏览器中打开酒馆页面
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 将下面的代码复制粘贴到控制台并执行
 * 5. 在弹出的文件选择对话框中选择 internal_basic_procedures.json 文件
 *
 * 注意：
 * - 此方法直接使用 SillyTavern 的原生 API，不依赖酒馆助手
 * - 如果世界书已存在，此脚本会替换它
 * - 会自动将 JSON 数组格式转换为 SillyTavern 需要的对象格式
 */

(async function createWorldbookUsingNativeAPI() {
  try {
    console.log('[世界书创建脚本] 准备使用 SillyTavern 原生 API 创建世界书...');

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
    const entriesArray = jsonData.entries;

    console.log(`[世界书创建脚本] 解析成功:`);
    console.log(`  - 世界书名称: ${worldbookName}`);
    console.log(`  - 条目数量: ${entriesArray.length}`);

    // 将数组格式转换为 SillyTavern 需要的对象格式
    // SillyTavern 期望: { entries: { [uid]: entryObject } }
    // 我们的格式: { entries: [entryArray] }
    const entriesObject = {};
    let validEntries = 0;

    for (const entry of entriesArray) {
      // 验证条目格式
      if (entry.uid === undefined || entry.uid === null) {
        console.warn(`[世界书创建脚本] ⚠ 跳过无效条目（缺少 uid）:`, entry.name || '未知');
        continue;
      }

      if (!entry.name || !entry.strategy || !entry.position) {
        console.warn(`[世界书创建脚本] ⚠ 跳过无效条目（缺少必需字段）:`, entry.name || `uid=${entry.uid}`);
        continue;
      }

      // 将条目添加到对象中，使用 uid 作为键
      entriesObject[entry.uid] = entry;
      validEntries++;
    }

    console.log(`  - 有效条目: ${validEntries}/${entriesArray.length}`);

    if (validEntries === 0) {
      throw new Error('没有找到有效条目。请检查 JSON 文件格式。');
    }

    // 构建 SillyTavern 期望的数据格式
    const worldbookData = {
      entries: entriesObject,
      // 保留其他元数据字段（如果有）
      ...(jsonData.extensions && { extensions: jsonData.extensions }),
      ...(jsonData.description && { description: jsonData.description }),
    };

    console.log(`[世界书创建脚本] 开始保存世界书 "${worldbookName}"...`);

    // 步骤 1: 获取 CSRF token（必需的）
    let csrfToken = '';
    try {
      const tokenResponse = await fetch('/csrf-token');
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        csrfToken = tokenData.token;
        console.log('[世界书创建脚本] ✓ 已获取 CSRF token');
      } else {
        throw new Error('无法获取 CSRF token，服务器可能未启用认证');
      }
    } catch (error) {
      console.warn('[世界书创建脚本] ⚠ 获取 CSRF token 失败:', error);
      // 尝试使用 getRequestHeaders 函数（如果存在）
      try {
        if (typeof getRequestHeaders === 'function') {
          const headers = getRequestHeaders();
          csrfToken = headers['X-CSRF-Token'] || headers['x-csrf-token'];
          if (csrfToken) {
            console.log('[世界书创建脚本] ✓ 从 getRequestHeaders 获取 CSRF token');
          }
        }
      } catch (e) {
        console.warn('[世界书创建脚本] ⚠ 无法从 getRequestHeaders 获取 token:', e);
      }
    }

    // 构建请求头
    let headers = {
      'Content-Type': 'application/json',
    };

    // 添加 CSRF token（如果获取到了）
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    } else {
      console.warn('[世界书创建脚本] ⚠ 警告: 未获取到 CSRF token，请求可能会失败（403 Forbidden）');
      console.warn('[世界书创建脚本] 💡 提示: 如果遇到 403 错误，请检查：');
      console.warn('[世界书创建脚本]   1. 是否已登录 SillyTavern');
      console.warn('[世界书创建脚本]   2. 服务器是否启用了认证');
      console.warn('[世界书创建脚本]   3. 尝试刷新页面后重试');
    }

    // 尝试从 getRequestHeaders 获取其他请求头（如果存在）
    try {
      if (typeof getRequestHeaders === 'function') {
        const extraHeaders = getRequestHeaders();
        headers = { ...headers, ...extraHeaders };
        console.log('[世界书创建脚本] ✓ 已获取完整请求头');
      }
    } catch (e) {
      console.warn('[世界书创建脚本] ⚠ 无法获取额外请求头:', e);
    }

    // 使用 SillyTavern 原生 API：/api/worldinfo/edit
    console.log('[世界书创建脚本] 发送请求到 /api/worldinfo/edit...');
    console.log('[世界书创建脚本] 请求头:', headers);
    console.log('[世界书创建脚本] 世界书数据预览:', {
      name: worldbookName,
      entriesCount: Object.keys(worldbookData.entries).length,
    });

    const response = await fetch('/api/worldinfo/edit', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        name: worldbookName,
        data: worldbookData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[世界书创建脚本] ✗ 请求失败:');
      console.error(`  状态码: ${response.status} ${response.statusText}`);
      console.error(`  响应: ${errorText}`);

      // 如果是 403 错误，提供更详细的帮助信息
      if (response.status === 403) {
        console.error('[世界书创建脚本] 💡 403 Forbidden 错误排查:');
        console.error('  1. 检查是否已登录 SillyTavern');
        console.error('  2. 检查 CSRF token 是否正确');
        console.error('  3. 检查服务器是否启用了认证');
        console.error('  4. 尝试刷新页面后重试');
        console.error('  5. 检查浏览器控制台的 Network 标签，查看实际请求的请求头');

        // 尝试重新获取 token 并提供手动操作指南
        console.error('[世界书创建脚本] 💡 手动操作指南:');
        console.error(
          '  1. 在控制台执行: fetch("/csrf-token").then(r => r.json()).then(d => console.log("CSRF Token:", d.token))',
        );
        console.error('  2. 复制获取到的 token');
        console.error('  3. 修改脚本中的 headers，添加: "X-CSRF-Token": "你的token"');
      }

      throw new Error(`服务器返回错误: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    console.log(`[世界书创建脚本] ✓ 服务器响应:`, result);

    // 刷新世界书列表（如果 updateWorldInfoList 函数存在）
    if (typeof updateWorldInfoList === 'function') {
      await updateWorldInfoList();
      console.log(`[世界书创建脚本] ✓ 已刷新世界书列表`);
    } else {
      console.warn(`[世界书创建脚本] ⚠ updateWorldInfoList 函数不可用，请手动刷新页面`);
    }

    // 验证创建结果（通过 API 获取）
    try {
      const verifyResponse = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: worldbookName }),
      });

      if (verifyResponse.ok) {
        const verifiedData = await verifyResponse.json();
        const entryCount = verifiedData.entries ? Object.keys(verifiedData.entries).length : 0;
        console.log(`[世界书创建脚本] ✓ 验证成功: 世界书包含 ${entryCount} 个条目`);

        if (entryCount > 0) {
          const entryNames = Object.values(verifiedData.entries)
            .slice(0, 5)
            .map(e => e.name || `uid=${e.uid}`)
            .join(', ');
          console.log(`[世界书创建脚本] ✓ 条目示例: ${entryNames}${entryCount > 5 ? '...' : ''}`);
        }
      } else {
        console.warn(`[世界书创建脚本] ⚠ 验证失败: 无法读取创建的世界书`);
      }
    } catch (verifyError) {
      console.warn(`[世界书创建脚本] ⚠ 验证时出错:`, verifyError);
    }

    // 清理文件输入
    document.body.removeChild(fileInput);

    console.log(`[世界书创建脚本] ✓ 完成！`);
    console.log(`[世界书创建脚本] 💡 提示: 如果世界书没有出现在列表中，请刷新页面`);

    return { success: true, worldbookName, entriesCount: validEntries };
  } catch (error) {
    console.error('[世界书创建脚本] ✗ 执行失败:', error);
    console.error('[世界书创建脚本] 错误详情:', error.message);
    if (error.stack) {
      console.error('[世界书创建脚本] 错误堆栈:', error.stack);
    }
    return { success: false, error: error.message };
  }
})();
