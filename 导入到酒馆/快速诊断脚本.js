/**
 * 快速诊断脚本：检查 SillyTavern API 可用性和认证状态
 *
 * 使用方法：
 * 1. 在浏览器中打开酒馆页面
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console 标签
 * 4. 复制粘贴此脚本并执行
 *
 * 此脚本会检查：
 * - CSRF token 是否可用
 * - getRequestHeaders 函数是否可用
 * - API 端点是否可访问
 * - 认证状态
 */

(async function diagnoseSillyTavernAPI() {
  console.log('=== SillyTavern API 诊断 ===\n');

  const diagnostics = {
    csrfToken: null,
    getRequestHeaders: null,
    apiEndpoints: {},
    authentication: null,
  };

  // 1. 检查 CSRF token
  console.log('1. 检查 CSRF token...');
  try {
    const tokenResponse = await fetch('/csrf-token');
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      diagnostics.csrfToken = tokenData.token;
      console.log(`   ✓ CSRF token 可用: ${diagnostics.csrfToken ? '已获取' : '为空'}`);
      if (diagnostics.csrfToken) {
        console.log(`   Token 值: ${diagnostics.csrfToken.substring(0, 20)}...`);
      }
    } else {
      console.log(`   ✗ 无法获取 CSRF token: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }
  } catch (error) {
    console.log(`   ✗ 获取 CSRF token 时出错: ${error.message}`);
  }

  // 2. 检查 getRequestHeaders 函数
  console.log('\n2. 检查 getRequestHeaders 函数...');
  if (typeof getRequestHeaders === 'function') {
    try {
      const headers = getRequestHeaders();
      diagnostics.getRequestHeaders = headers;
      console.log('   ✓ getRequestHeaders 函数可用');
      console.log(`   返回的请求头:`, headers);
      if (headers['X-CSRF-Token'] || headers['x-csrf-token']) {
        console.log(`   ✓ 包含 CSRF token`);
      } else {
        console.log(`   ⚠ 未包含 CSRF token`);
      }
    } catch (error) {
      console.log(`   ✗ 调用 getRequestHeaders 时出错: ${error.message}`);
    }
  } else {
    console.log('   ✗ getRequestHeaders 函数不可用');
  }

  // 3. 检查世界书 API 端点
  console.log('\n3. 检查世界书 API 端点...');

  // 3.1 检查 /api/worldinfo/list
  console.log('   3.1 检查 /api/worldinfo/list...');
  try {
    const headers = diagnostics.getRequestHeaders || {
      'Content-Type': 'application/json',
      ...(diagnostics.csrfToken && { 'X-CSRF-Token': diagnostics.csrfToken }),
    };

    const listResponse = await fetch('/api/worldinfo/list', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({}),
    });

    if (listResponse.ok) {
      const listData = await listResponse.json();
      diagnostics.apiEndpoints.list = { ok: true, data: listData };
      console.log(`   ✓ /api/worldinfo/list 可访问`);
      console.log(`   现有世界书数量: ${Array.isArray(listData) ? listData.length : '未知'}`);
      if (Array.isArray(listData) && listData.length > 0) {
        console.log(
          `   世界书列表:`,
          listData
            .slice(0, 5)
            .map(w => w.name || w.file_id)
            .join(', '),
        );
      }
    } else {
      diagnostics.apiEndpoints.list = { ok: false, status: listResponse.status, statusText: listResponse.statusText };
      console.log(`   ✗ /api/worldinfo/list 返回错误: ${listResponse.status} ${listResponse.statusText}`);
    }
  } catch (error) {
    diagnostics.apiEndpoints.list = { ok: false, error: error.message };
    console.log(`   ✗ /api/worldinfo/list 请求失败: ${error.message}`);
  }

  // 3.2 检查 /api/worldinfo/get（如果列表中有世界书）
  if (
    diagnostics.apiEndpoints.list &&
    diagnostics.apiEndpoints.list.ok &&
    diagnostics.apiEndpoints.list.data.length > 0
  ) {
    console.log('\n   3.2 检查 /api/worldinfo/get...');
    try {
      const testWorldbookName =
        diagnostics.apiEndpoints.list.data[0].name || diagnostics.apiEndpoints.list.data[0].file_id;
      const headers = diagnostics.getRequestHeaders || {
        'Content-Type': 'application/json',
        ...(diagnostics.csrfToken && { 'X-CSRF-Token': diagnostics.csrfToken }),
      };

      const getResponse = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ name: testWorldbookName }),
      });

      if (getResponse.ok) {
        const getData = await getResponse.json();
        diagnostics.apiEndpoints.get = { ok: true };
        const entryCount = getData.entries ? Object.keys(getData.entries).length : 0;
        console.log(`   ✓ /api/worldinfo/get 可访问`);
        console.log(`   测试世界书 "${testWorldbookName}" 包含 ${entryCount} 个条目`);
      } else {
        diagnostics.apiEndpoints.get = { ok: false, status: getResponse.status, statusText: getResponse.statusText };
        console.log(`   ✗ /api/worldinfo/get 返回错误: ${getResponse.status} ${getResponse.statusText}`);
      }
    } catch (error) {
      diagnostics.apiEndpoints.get = { ok: false, error: error.message };
      console.log(`   ✗ /api/worldinfo/get 请求失败: ${error.message}`);
    }
  }

  // 4. 检查认证状态
  console.log('\n4. 检查认证状态...');
  if (diagnostics.csrfToken && diagnostics.apiEndpoints.list && diagnostics.apiEndpoints.list.ok) {
    diagnostics.authentication = '已认证';
    console.log('   ✓ 认证状态正常，API 可以访问');
  } else if (diagnostics.apiEndpoints.list && diagnostics.apiEndpoints.list.status === 403) {
    diagnostics.authentication = '认证失败';
    console.log('   ✗ 认证失败: 403 Forbidden');
    console.log('   💡 建议:');
    console.log('     1. 确保已登录 SillyTavern');
    console.log('     2. 检查 CSRF token 是否正确');
    console.log('     3. 尝试刷新页面后重试');
  } else if (!diagnostics.csrfToken) {
    diagnostics.authentication = '无法获取 token';
    console.log('   ⚠ 无法获取 CSRF token');
    console.log('   💡 建议:');
    console.log('     1. 检查服务器是否启用了认证');
    console.log('     2. 检查 /csrf-token 端点是否可访问');
    console.log('     3. 查看浏览器 Network 标签中的请求');
  } else {
    diagnostics.authentication = '未知';
    console.log('   ⚠ 认证状态未知');
  }

  // 总结
  console.log('\n=== 诊断总结 ===');
  console.log(`CSRF Token: ${diagnostics.csrfToken ? '✓ 可用' : '✗ 不可用'}`);
  console.log(`getRequestHeaders: ${diagnostics.getRequestHeaders ? '✓ 可用' : '✗ 不可用'}`);
  console.log(`API /list: ${diagnostics.apiEndpoints.list?.ok ? '✓ 可访问' : '✗ 不可访问'}`);
  console.log(
    `API /get: ${diagnostics.apiEndpoints.get?.ok ? '✓ 可访问' : diagnostics.apiEndpoints.get ? '✗ 不可访问' : '未测试'}`,
  );
  console.log(`认证状态: ${diagnostics.authentication}`);

  // 提供建议
  console.log('\n=== 建议 ===');
  if (!diagnostics.csrfToken && !diagnostics.getRequestHeaders) {
    console.log('⚠ 无法获取 CSRF token，建议：');
    console.log('  1. 使用备用方案：使用导入 API（导入到酒馆/使用导入API创建世界书.js）');
    console.log('  2. 或者手动在酒馆中导入世界书 JSON 文件');
  } else if (diagnostics.apiEndpoints.list && diagnostics.apiEndpoints.list.status === 403) {
    console.log('⚠ 遇到 403 错误，建议：');
    console.log('  1. 刷新页面后重试');
    console.log('  2. 确保已登录 SillyTavern');
    console.log('  3. 使用备用方案：使用导入 API');
  } else if (diagnostics.apiEndpoints.list?.ok) {
    console.log('✓ API 可用，可以尝试创建世界书');
    console.log('  使用脚本：导入到酒馆/使用原生API创建世界书.js');
  }

  console.log('\n=== 诊断完成 ===');
  return diagnostics;
})();
