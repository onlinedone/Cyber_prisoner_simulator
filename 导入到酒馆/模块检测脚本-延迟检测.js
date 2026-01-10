/**
 * 模块检测脚本 - 延迟检测版本
 * 等待所有模块注册完成后再检测
 */

// 等待模块加载的辅助函数
function waitForModules(maxWait = 5000, interval = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkModules = () => {
      const DS = window.detentionSystem;
      if (!DS) {
        if (Date.now() - startTime < maxWait) {
          setTimeout(checkModules, interval);
        } else {
          resolve(false);
        }
        return;
      }

      // 检查所有模块是否已注册
      const modules = ['eventSystem', 'statusPanel', 'npcSystem', 'worldbook'];
      const allLoaded = modules.every(name => DS.getModule(name) !== undefined);
      
      if (allLoaded || Date.now() - startTime >= maxWait) {
        resolve(true);
      } else {
        setTimeout(checkModules, interval);
      }
    };

    checkModules();
  });
}

// 检测模块状态
async function detectModules() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 开始检测模块状态（延迟检测模式）...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 等待最多 5 秒，每 100ms 检查一次
  console.log('⏳ 等待模块注册完成...');
  const loaded = await waitForModules(5000, 100);
  
  if (!loaded) {
    console.warn('⚠️  等待超时，使用当前状态检测');
  } else {
    console.log('✅ 模块加载检测完成');
  }

  let DS = null;
  let 运行模式 = '降级模式(基础功能)';
  let 模块状态 = {
    core: false,
    eventSystem: false,
    statusPanel: false,
    npcSystem: false,
    worldbook: false,
  };

  if (typeof window !== 'undefined') {
    if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
      DS = window.detentionSystem;
      模块状态.core = true;

      console.log('\n📦 检测已注册的模块：');
      console.log('  核心系统模块列表:', Object.keys(DS.modules || {}));

      // 检测事件系统
      const eventSystem = DS.getModule('eventSystem');
      if (eventSystem && typeof DS.advanceDay === 'function') {
        模块状态.eventSystem = true;
        console.log('  ✅ eventSystem: 已加载');
      } else {
        console.log('  ❌ eventSystem: 未加载');
        if (eventSystem) console.log('     原因: DS.advanceDay 方法不存在');
        else console.log('     原因: 模块未注册');
      }

      // 检测状态栏
      const statusPanel = DS.getModule('statusPanel');
      if (statusPanel && typeof DS.getState === 'function') {
        模块状态.statusPanel = true;
        console.log('  ✅ statusPanel: 已加载');
      } else {
        console.log('  ❌ statusPanel: 未加载');
        if (statusPanel) console.log('     原因: DS.getState 方法不存在');
        else console.log('     原因: 模块未注册');
      }

      // 检测 NPC 系统
      const npcSystem = DS.getModule('npcSystem');
      if (npcSystem && typeof DS.generateNPC === 'function') {
        模块状态.npcSystem = true;
        console.log('  ✅ npcSystem: 已加载');
      } else {
        console.log('  ❌ npcSystem: 未加载');
        if (npcSystem) console.log('     原因: DS.generateNPC 方法不存在');
        else console.log('     原因: 模块未注册');
      }

      // 检测知识库加载器
      const worldbook = DS.getModule('worldbook');
      if (worldbook && typeof DS.loadWorldbook === 'function') {
        模块状态.worldbook = true;
        console.log('  ✅ worldbook: 已加载');
      } else {
        console.log('  ❌ worldbook: 未加载');
        if (worldbook) console.log('     原因: DS.loadWorldbook 方法不存在');
        else console.log('     原因: 模块未注册');
      }

      const 已加载模块数 = Object.values(模块状态).filter((v) => v === true).length;
      if (已加载模块数 >= 2) {
        运行模式 = '外置脚本(完整功能)';
      } else if (已加载模块数 === 1) {
        运行模式 = '外置脚本(部分功能) - 仅核心系统';
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 模块加载状态汇总：');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  核心系统: ' + (模块状态.core ? '✅' : '❌'));
  console.log('  事件系统: ' + (模块状态.eventSystem ? '✅' : '❌'));
  console.log('  状态栏: ' + (模块状态.statusPanel ? '✅' : '❌'));
  console.log('  NPC系统: ' + (模块状态.npcSystem ? '✅' : '❌'));
  console.log('  知识库加载器: ' + (模块状态.worldbook ? '✅' : '❌'));
  console.log('');
  console.log('运行模式: ' + 运行模式);
  console.log('已加载模块数: ' + Object.values(模块状态).filter((v) => v === true).length + '/5');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    运行模式,
    模块状态,
    DS,
  };
}

// 在 DOM 加载完成后执行检测
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点，确保所有 jQuery ready 回调都已执行
    setTimeout(() => {
      detectModules();
    }, 2000);
  });
} else {
  // DOM 已经加载完成
  setTimeout(() => {
    detectModules();
  }, 2000);
}
