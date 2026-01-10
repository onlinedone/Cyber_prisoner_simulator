/**
 * 方案3（备用方案）：使用 SillyTavern 导入 API 创建世界书
 *
 * 这个方案使用 /api/worldinfo/import 端点，类似于手动导入世界书文件
 *
 * 使用方法：
 * 1. 在浏览器中打开酒馆页面
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 将下面的代码复制粘贴到控制台并执行
 * 5. 在弹出的文件选择对话框中选择 internal_basic_procedures.json 文件
 *
 * 注意：
 * - 此方法使用导入 API，不需要格式转换
 * - 如果世界书已存在，会询问是否覆盖（取决于服务器配置）
 */

(async function importWorldbookUsingImportAPI() {
  try {
    console.log('[世界书导入脚本] 准备使用 SillyTavern 导入 API 导入世界书...');

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

    console.log(`[世界书导入脚本] 已选择文件: ${file.name}`);

    // 步骤 1: 获取 CSRF token（必需的）
    let csrfToken = '';
    try {
      const tokenResponse = await fetch('/csrf-token');
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        csrfToken = tokenData.token;
        console.log('[世界书导入脚本] ✓ 已获取 CSRF token');
      } else {
        throw new Error('无法获取 CSRF token');
      }
    } catch (error) {
      console.warn('[世界书导入脚本] ⚠ 获取 CSRF token 失败:', error);
      // 尝试使用 getRequestHeaders 函数（如果存在）
      try {
        if (typeof getRequestHeaders === 'function') {
          const headers = getRequestHeaders({ omitContentType: true });
          csrfToken = headers['X-CSRF-Token'] || headers['x-csrf-token'];
          if (csrfToken) {
            console.log('[世界书导入脚本] ✓ 从 getRequestHeaders 获取 CSRF token');
          }
        }
      } catch (e) {
        console.warn('[世界书导入脚本] ⚠ 无法从 getRequestHeaders 获取 token:', e);
      }
    }

    if (!csrfToken) {
      throw new Error('无法获取 CSRF token。请确保已登录 SillyTavern，或刷新页面后重试。');
    }

    // 使用 FormData 上传文件（导入 API 需要文件上传）
    const formData = new FormData();
    formData.append('file', file);

    console.log('[世界书导入脚本] 开始上传文件...');

    // 使用 SillyTavern 导入 API：/api/worldinfo/import
    const response = await fetch('/api/worldinfo/import', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        // 不要设置 Content-Type，让浏览器自动设置（包含 boundary）
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[世界书导入脚本] ✗ 请求失败:');
      console.error(`  状态码: ${response.status} ${response.statusText}`);
      console.error(`  响应: ${errorText}`);

      // 如果是 403 错误，提供更详细的帮助信息
      if (response.status === 403) {
        console.error('[世界书导入脚本] 💡 403 Forbidden 错误排查:');
        console.error('  1. 检查是否已登录 SillyTavern');
        console.error('  2. 检查 CSRF token 是否正确');
        console.error('  3. 检查服务器是否启用了认证');
        console.error('  4. 尝试刷新页面后重试');
        console.error('  5. 检查浏览器控制台的 Network 标签，查看实际请求');
      }

      throw new Error(`服务器返回错误: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const result = await response.json();
    console.log(`[世界书导入脚本] ✓ 服务器响应:`, result);

    if (result.name) {
      console.log(`[世界书导入脚本] ✓ 世界书 "${result.name}" 导入成功！`);

      // 刷新世界书列表（如果 updateWorldInfoList 函数存在）
      if (typeof updateWorldInfoList === 'function') {
        await updateWorldInfoList();
        console.log(`[世界书导入脚本] ✓ 已刷新世界书列表`);
      } else {
        console.warn(`[世界书导入脚本] ⚠ updateWorldInfoList 函数不可用，请手动刷新页面`);
      }

      // 验证导入结果
      try {
        const verifyResponse = await fetch('/api/worldinfo/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({ name: result.name }),
        });

        if (verifyResponse.ok) {
          const verifiedData = await verifyResponse.json();
          const entryCount = verifiedData.entries ? Object.keys(verifiedData.entries).length : 0;
          console.log(`[世界书导入脚本] ✓ 验证成功: 世界书包含 ${entryCount} 个条目`);

          if (entryCount > 0) {
            const entryNames = Object.values(verifiedData.entries)
              .slice(0, 5)
              .map(e => e.name || e.comment || `uid=${e.uid}`)
              .join(', ');
            console.log(`[世界书导入脚本] ✓ 条目示例: ${entryNames}${entryCount > 5 ? '...' : ''}`);
          }
        } else {
          console.warn(`[世界书导入脚本] ⚠ 验证失败: 无法读取导入的世界书`);
        }
      } catch (verifyError) {
        console.warn(`[世界书导入脚本] ⚠ 验证时出错:`, verifyError);
      }
    } else {
      console.warn(`[世界书导入脚本] ⚠ 服务器响应中未包含世界书名称`);
    }

    // 清理文件输入
    document.body.removeChild(fileInput);

    console.log(`[世界书导入脚本] ✓ 完成！`);
    console.log(`[世界书导入脚本] 💡 提示: 如果世界书没有出现在列表中，请刷新页面`);

    return { success: true, worldbookName: result.name || '未知' };
  } catch (error) {
    console.error('[世界书导入脚本] ✗ 执行失败:', error);
    console.error('[世界书导入脚本] 错误详情:', error.message);
    if (error.stack) {
      console.error('[世界书导入脚本] 错误堆栈:', error.stack);
    }
    return { success: false, error: error.message };
  }
})();
