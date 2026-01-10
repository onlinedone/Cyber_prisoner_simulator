/**
 * 模块检测脚本 - 支持 iframe 环境
 * 自动查找主窗口和所有 iframe 中的脚本
 */

// 在 iframe 中查找脚本的辅助函数
function findDetentionSystemInIframes() {
  if (typeof document === 'undefined') return null;
  
  const iframes = document.querySelectorAll('iframe');
  console.log(`🔍 找到 ${iframes.length} 个 iframe，开始搜索...`);
  
  // 优先检查脚本相关的 iframe
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    const iframeName = iframe.name || '';
    const iframeId = iframe.id || '';
    
    // 检查是否是脚本 iframe
    if (
      iframeName.includes('script') ||
      iframeName.includes('TH-script') ||
      iframeName.includes('detention') ||
      iframeId.includes('script') ||
      iframeId.includes('TH-script') ||
      iframeId.includes('detention')
    ) {
      try {
        const iframeWindow = iframe.contentWindow;
        if (
          iframeWindow &&
          iframeWindow.detentionSystem &&
          iframeWindow.detentionSystem.ping &&
          typeof iframeWindow.detentionSystem.ping === 'function' &&
          iframeWindow.detentionSystem.ping()
        ) {
          console.log(`✅ 在脚本 iframe[${i}] 中找到核心系统 (name: ${iframeName || '无'}, id: ${iframeId || '无'})`);
          return iframeWindow.detentionSystem;
        }
      } catch (e) {
        console.log(`⚠️  脚本 iframe[${i}] 无法访问: ${e.message}`);
      }
    }
  }

  // 如果没找到，遍历所有 iframe
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframeWindow = iframes[i].contentWindow;
      if (
        iframeWindow &&
        iframeWindow.detentionSystem &&
        iframeWindow.detentionSystem.ping &&
        typeof iframeWindow.detentionSystem.ping === 'function' &&
        iframeWindow.detentionSystem.ping()
      ) {
        const iframeName = iframes[i].name || '无name';
        const iframeId = iframes[i].id || '无id';
        console.log(`✅ 在 iframe[${i}] 中找到核心系统 (name: ${iframeName}, id: ${iframeId})`);
        return iframeWindow.detentionSystem;
      }
    } catch (e) {
      // 跨域限制，跳过
    }
  }

  return null;
}

// 等待模块加载的辅助函数
function waitForModules(DS, maxWait = 5000, interval = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkModules = () => {
      // 检查所有模块是否已注册
      const modules = ['eventSystem', 'statusPanel', 'npcSystem', 'worldbook'];
      const allLoaded = modules.every(name => DS.getModule && DS.getModule(name) !== undefined);

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
  console.log('🔍 开始检测模块状态（支持 iframe）...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let DS = null;
  let DSLocation = '未找到';
  let 运行模式 = '降级模式(基础功能)';
  let 模块状态 = {
    core: false,
    eventSystem: false,
    statusPanel: false,
    npcSystem: false,
    worldbook: false,
  };

  // 1. 首先检查主窗口
  if (typeof window !== 'undefined') {
    if (
      window.detentionSystem &&
      window.detentionSystem.ping &&
      typeof window.detentionSystem.ping === 'function' &&
      window.detentionSystem.ping()
    ) {
      DS = window.detentionSystem;
      DSLocation = '主窗口';
      console.log('✅ 在主窗口找到核心系统');
    } else {
      console.log('⚠️  在主窗口未找到，搜索 iframe...');
      // 2. 在主窗口未找到，尝试在 iframe 中查找
      DS = findDetentionSystemInIframes();
      if (DS) {
        DSLocation = 'iframe';
        // 将找到的 DS 保存到主窗口，方便后续使用
        try {
          window._detentionSystem = DS;
          if (!window.detentionSystem) {
            window.detentionSystem = DS;
            console.log('✅ 已将 iframe 中的系统同步到主窗口');
          }
        } catch (e) {
          console.warn('⚠️  无法同步到主窗口:', e.message);
        }
      }
    }
  }

  // 3. 如果找到核心系统，等待模块注册并检测
  if (DS) {
    模块状态.core = true;
    console.log(`\n📦 等待模块注册完成... (来源: ${DSLocation})`);
    console.log('   已注册的模块:', Object.keys(DS.modules || {}));

    // 等待模块注册
    await waitForModules(DS, 5000, 100);

    console.log('\n📦 检测已注册的模块：');
    console.log('   核心系统模块列表:', Object.keys(DS.modules || {}));

    // 检测事件系统
    const eventSystem = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('eventSystem') : null;
    if (eventSystem && DS.advanceDay && typeof DS.advanceDay === 'function') {
      模块状态.eventSystem = true;
      console.log('  ✅ eventSystem: 已加载');
    } else {
      console.log('  ❌ eventSystem: 未加载');
      if (eventSystem) console.log('     原因: DS.advanceDay 方法不存在');
      else console.log('     原因: 模块未注册');
    }

    // 检测状态栏
    const statusPanel = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('statusPanel') : null;
    if (statusPanel && DS.getState && typeof DS.getState === 'function') {
      模块状态.statusPanel = true;
      console.log('  ✅ statusPanel: 已加载');
    } else {
      console.log('  ❌ statusPanel: 未加载');
      if (statusPanel) console.log('     原因: DS.getState 方法不存在');
      else console.log('     原因: 模块未注册');
    }

    // 检测 NPC 系统
    const npcSystem = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('npcSystem') : null;
    if (npcSystem && DS.generateNPC && typeof DS.generateNPC === 'function') {
      模块状态.npcSystem = true;
      console.log('  ✅ npcSystem: 已加载');
    } else {
      console.log('  ❌ npcSystem: 未加载');
      if (npcSystem) console.log('     原因: DS.generateNPC 方法不存在');
      else console.log('     原因: 模块未注册');
    }

    // 检测知识库加载器
    const worldbook = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('worldbook') : null;
    if (worldbook && DS.loadWorldbook && typeof DS.loadWorldbook === 'function') {
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
  } else {
    console.log('\n❌ 未找到核心系统');
    console.log('   可能原因:');
    console.log('   1. 脚本尚未加载');
    console.log('   2. 脚本加载失败');
    console.log('   3. iframe 跨域限制');
    console.log('   4. 检测时机过早（脚本还在加载中）');
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
  console.log('脚本位置: ' + DSLocation);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    运行模式,
    模块状态,
    DS,
    DSLocation,
  };
}

// 在 DOM 加载完成后执行检测
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 延迟 3 秒，确保所有模块都已注册
    setTimeout(() => {
      detectModules();
    }, 3000);
  });
} else {
  // DOM 已经加载完成
  setTimeout(() => {
    detectModules();
  }, 3000);
}
