/**
 * 快速诊断 DS.advanceDay 问题
 * 在控制台中直接运行此脚本
 */

(function() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     快速诊断 DS.advanceDay                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // 查找核心系统
  let DS = null;
  let source = '未知';
  
  // 优先在主窗口查找
  if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
    DS = window.detentionSystem;
    source = '主窗口';
  }
  
  // 在父窗口查找
  if (!DS && window.parent && window.parent !== window) {
    try {
      if (window.parent.detentionSystem && window.parent.detentionSystem.ping && window.parent.detentionSystem.ping()) {
        DS = window.parent.detentionSystem;
        source = '父窗口';
      }
    } catch (e) {
      console.warn('   无法访问父窗口（跨域限制）');
    }
  }
  
  // 遍历 iframe
  if (!DS) {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.detentionSystem && iframeWindow.detentionSystem.ping && iframeWindow.detentionSystem.ping()) {
          DS = iframeWindow.detentionSystem;
          source = 'iframe';
          break;
        }
      } catch (e) {
        // 跨域限制
      }
    }
  }
  
  if (!DS) {
    console.error('❌ 未找到核心系统！');
    console.log('\n💡 请确保：');
    console.log('   1. 脚本已正确加载');
    console.log('   2. 核心系统已初始化');
    return;
  }
  
  console.log(`✅ 找到核心系统 (${source})\n`);
  
  // 诊断 advanceDay 方法
  console.log('🔍 诊断 DS.advanceDay 方法：\n');
  console.log(`   DS 对象类型: ${typeof DS}`);
  console.log(`   DS.advanceDay 是否存在: ${'advanceDay' in DS}`);
  console.log(`   DS.advanceDay 类型: ${typeof DS.advanceDay}`);
  console.log(`   DS.advanceDay 是否为函数: ${typeof DS.advanceDay === 'function'}`);
  
  if (!DS.advanceDay) {
    console.error('\n❌ DS.advanceDay 方法不存在！');
    console.log('\n📋 可用的方法列表:');
    const methods = Object.keys(DS).filter(k => typeof DS[k] === 'function');
    methods.forEach(m => console.log(`   - ${m}`));
    return;
  }
  
  // 检查事件系统模块
  const eventSystem = DS.getModule('eventSystem');
  console.log(`\n📦 事件系统模块: ${eventSystem ? '✅ 已加载' : '❌ 未加载'}`);
  if (eventSystem) {
    console.log(`   当前天数: ${eventSystem.currentDay || 0}`);
    console.log(`   当前回合: ${eventSystem.currentRound || 0}`);
  }
  
  // 测试调用
  console.log('\n🧪 测试调用 DS.advanceDay(1)...\n');
  try {
    const testResult = DS.advanceDay(1);
    console.log('✅ 调用成功！');
    console.log('\n📊 返回值详情:');
    console.log(`   返回值类型: ${typeof testResult}`);
    console.log(`   是否为 null: ${testResult === null}`);
    console.log(`   是否为 undefined: ${testResult === undefined}`);
    
    if (testResult) {
      console.log(`   返回值键: ${Object.keys(testResult).join(', ')}`);
      console.log(`   是否被打断: ${testResult.interrupted}`);
      console.log(`   当前天数: ${testResult.currentDay}`);
      console.log(`   累积事件数: ${testResult.accumulatedEvents?.length || 0}`);
      console.log('\n   完整返回值:', testResult);
    } else {
      console.error('❌ 返回值是 null 或 undefined！');
    }
  } catch (error) {
    console.error('❌ 调用失败:', error);
    console.error('   错误堆栈:', error.stack);
  }
  
  // 暴露到全局
  window.DS = DS;
  console.log('\n✅ 已将 DS 暴露到全局，可以直接使用:');
  console.log('   - DS.advanceDay(5)');
  console.log('   - DS.advanceRound()');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();
