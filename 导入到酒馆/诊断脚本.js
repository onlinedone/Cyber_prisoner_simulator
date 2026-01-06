// 诊断脚本 - 检查脚本加载情况
(function diagnoseScriptLoading() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 开始诊断脚本加载问题');
  console.log('═══════════════════════════════════════════════════');

  const diagnostics = {
    scriptLoaded: false,
    errors: [],
    warnings: [],
    networkRequests: [],
    consoleLogs: [],
  };

  // 1. 检查 window.detentionSystem
  console.log('\n📋 检查 1: window.detentionSystem');
  if (typeof window.detentionSystem !== 'undefined') {
    console.log('✅ window.detentionSystem 存在');
    diagnostics.scriptLoaded = true;
    console.log('   类型:', typeof window.detentionSystem);
    console.log('   值:', window.detentionSystem);
  } else {
    console.log('❌ window.detentionSystem 未定义');
    diagnostics.scriptLoaded = false;
  }

  // 2. 检查控制台日志（查找调试日志）
  console.log('\n📋 检查 2: 查找调试日志');
  const debugLogs = [];
  const originalLog = console.log;
  const originalInfo = console.info;

  // 拦截 console.log 和 console.info（但这只能捕获未来的日志）
  console.log('   注意：此检查只能捕获未来的日志，请查看之前的控制台输出');

  // 3. 检查是否有错误
  console.log('\n📋 检查 3: 检查错误信息');
  console.log('   请手动检查控制台中的红色错误信息');
  console.log('   特别关注：');
  console.log('   - 网络请求失败（404, CORS 等）');
  console.log('   - 语法错误');
  console.log('   - 模块加载错误');

  // 4. 检查 Network 请求
  console.log('\n📋 检查 4: Network 请求');
  console.log('   请在浏览器 F12 -> Network 标签中：');
  console.log('   1. 清除所有请求');
  console.log('   2. 刷新页面');
  console.log('   3. 搜索 "index.js" 或 "赛博坐牢"');
  console.log('   4. 检查是否有请求，状态码是什么');
  console.log('   5. 如果有请求，点击查看 Response 内容');

  // 5. 尝试手动加载脚本
  console.log('\n📋 检查 5: 尝试手动加载脚本');
  const scriptUrl =
    'https://cdn.jsdelivr.net/gh/onlinedone/Cyber_prisoner_simulator@3a1bd4f2fdea5d7a255340d29d1e7750309ac17e/dist/赛博坐牢模拟器增强脚本/index.js';
  console.log('   脚本 URL:', scriptUrl);
  console.log('   正在测试 URL 是否可访问...');

  fetch(scriptUrl, { method: 'HEAD' })
    .then(response => {
      console.log('   ✅ URL 可访问');
      console.log('   状态码:', response.status);
      console.log('   Content-Type:', response.headers.get('Content-Type'));

      if (response.status === 200) {
        console.log('   ✅ 脚本文件存在且可访问');
      } else {
        console.log('   ⚠️  状态码异常:', response.status);
      }
    })
    .catch(error => {
      console.error('   ❌ URL 无法访问:', error.message);
      console.error('   可能的原因：');
      console.error('   - 网络连接问题');
      console.error('   - CORS 限制');
      console.error('   - CDN 未更新（需要等待几分钟）');
    });

  // 6. 检查脚本是否在页面中
  console.log('\n📋 检查 6: 检查页面中的脚本标签');
  const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
  console.log(`   找到 ${scripts.length} 个模块脚本标签`);

  const relevantScripts = scripts.filter(script => {
    const src = script.src || script.textContent || '';
    return src.includes('赛博坐牢') || src.includes('detention') || src.includes('Cyber_prisoner_simulator');
  });

  if (relevantScripts.length > 0) {
    console.log('   ✅ 找到相关脚本标签:');
    relevantScripts.forEach((script, index) => {
      console.log(`   ${index + 1}. ${script.src || '内联脚本'}`);
      if (script.textContent) {
        console.log(`      内容预览: ${script.textContent.substring(0, 100)}...`);
      }
    });
  } else {
    console.log('   ❌ 未找到相关脚本标签');
    console.log('   可能的原因：');
    console.log('   - 脚本未正确导入到酒馆中');
    console.log('   - 脚本被动态加载，不在 DOM 中');
  }

  // 7. 检查是否有调试日志
  console.log('\n📋 检查 7: 查找调试日志');
  console.log('   请在控制台中搜索以下关键词：');
  console.log('   - "[DEBUG-HYP-A]"');
  console.log('   - "[看守所模拟器]"');
  console.log('   - "[核心系统]"');
  console.log('   如果找到这些日志，说明脚本已执行');
  console.log('   如果找不到，说明脚本未执行');

  // 8. 输出诊断总结
  setTimeout(() => {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 诊断总结');
    console.log('═══════════════════════════════════════════════════');
    console.log(`脚本是否加载: ${diagnostics.scriptLoaded ? '✅ 是' : '❌ 否'}`);
    console.log('\n💡 下一步操作：');
    console.log('   1. 检查 Network 标签，确认脚本是否被请求');
    console.log('   2. 检查控制台错误信息');
    console.log('   3. 确认脚本已正确导入到酒馆中');
    console.log('   4. 如果使用 CDN，等待几分钟让 CDN 更新');
    console.log('   5. 尝试使用 GitHub Raw 链接作为备选方案');
    console.log('═══════════════════════════════════════════════════');

    return diagnostics;
  }, 2000);

  return diagnostics;
})();
