/**
 * 快速将 DS 暴露到全局作用域
 * 在控制台中直接运行此脚本，然后就可以使用 DS.advanceDay() 等命令了
 */

(function() {
  // 查找核心系统
  let DS = null;
  
  // 优先在主窗口查找
  if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
    DS = window.detentionSystem;
    console.log('✅ 在主窗口找到核心系统');
  }
  
  // 在父窗口查找
  if (!DS && window.parent && window.parent !== window) {
    try {
      if (window.parent.detentionSystem && window.parent.detentionSystem.ping && window.parent.detentionSystem.ping()) {
        DS = window.parent.detentionSystem;
        console.log('✅ 在父窗口找到核心系统');
      }
    } catch (e) {
      // 跨域限制
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
          console.log('✅ 在 iframe 中找到核心系统');
          break;
        }
      } catch (e) {
        // 跨域限制
      }
    }
  }
  
  if (!DS) {
    console.error('❌ 未找到核心系统！');
    console.log('💡 请确保脚本已正确加载并初始化');
    return;
  }
  
  // 暴露到全局
  window.DS = DS;
  
  console.log('\n✅ DS 已暴露到全局作用域！');
  console.log('\n📋 可用的方法:');
  console.log('   - DS.advanceDay(5)      // 跳过5天');
  console.log('   - DS.advanceRound()     // 推进一个回合');
  console.log('   - DS.getCurrentRound()  // 获取当前回合数');
  console.log('   - DS.getModule(name)    // 获取模块');
  console.log('\n💡 现在可以直接使用 DS.advanceDay(5) 等命令了！\n');
})();
