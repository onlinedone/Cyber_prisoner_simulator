/**
 * 快速测试脚本 - 简化版
 * 在浏览器 F12 控制台中快速运行，检查核心功能
 */

(function quickTest() {
  console.log('🔍 快速测试看守所模拟器增强脚本...\n');
  
  // 检查核心系统
  if (typeof window.detentionSystem === 'undefined') {
    console.error('❌ window.detentionSystem 未定义');
    console.error('请确保脚本已正确加载');
    return false;
  }
  
  const DS = window.detentionSystem;
  console.log('✅ 核心系统已加载');
  console.log(`   版本: ${DS.version || '未知'}`);
  console.log(`   已初始化: ${DS.initialized ? '是' : '否'}`);
  
  // 检查模块
  const modules = Object.keys(DS.modules || {});
  console.log(`\n📦 已注册模块 (${modules.length}):`);
  modules.forEach(name => console.log(`   - ${name}`));
  
  // 检查关键功能
  console.log('\n🔧 关键功能检查:');
  const checks = [
    { name: '事件系统', method: 'advanceDay' },
    { name: '状态栏', method: 'getState' },
    { name: 'NPC系统', method: 'generateNPC' },
    { name: '知识库', method: 'loadWorldbook' }
  ];
  
  checks.forEach(check => {
    const exists = typeof DS[check.method] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${check.name}: ${exists ? '可用' : '不可用'}`);
  });
  
  // 测试 ping
  try {
    const pingResult = DS.ping();
    console.log(`\n📡 Ping 测试: ${pingResult ? '✅ 正常' : '❌ 异常'}`);
  } catch (error) {
    console.error(`\n📡 Ping 测试: ❌ 错误 - ${error.message}`);
  }
  
  // 检查 UI
  const hasUI = !!document.getElementById('detention-status-panel');
  console.log(`\n🖥️  状态栏 UI: ${hasUI ? '✅ 已创建' : '⚠️  未找到'}`);
  
  console.log('\n✅ 快速测试完成！');
  return true;
})();
