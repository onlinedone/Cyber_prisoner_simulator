// 外置脚本检测
function findDetentionSystemInIframes() {
  if (typeof document === 'undefined') return null;
  const iframes = document.querySelectorAll('iframe');
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    const iframeName = iframe.name || '';
    const iframeId = iframe.id || '';
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
          iframeWindow.detentionSystem.ping()
        ) {
          return iframeWindow.detentionSystem;
        }
      } catch (e) {}
    }
  }
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframeWindow = iframes[i].contentWindow;
      if (
        iframeWindow &&
        iframeWindow.detentionSystem &&
        iframeWindow.detentionSystem.ping &&
        iframeWindow.detentionSystem.ping()
      ) {
        return iframeWindow.detentionSystem;
      }
    } catch (e) {}
  }
  return null;
}

// 等待模块注册的函数
function waitForModules(DS, maxWaitTime = 5000, checkInterval = 100) {
  return new Promise(resolve => {
    const startTime = Date.now();
    const checkModules = () => {
      const modules = DS.modules || {};
      const moduleCount = Object.keys(modules).length;
      const elapsed = Date.now() - startTime;

      // 如果已经有至少2个模块，或者超时，则停止等待
      if (moduleCount >= 2 || elapsed >= maxWaitTime) {
        resolve(moduleCount);
        return;
      }

      setTimeout(checkModules, checkInterval);
    };
    checkModules();
  });
}

let DS = null;
let 运行模式 = '降级模式(基础功能)';
const 模块状态 = {
  core: false,
  eventSystem: false,
  statusPanel: false,
  npcSystem: false,
  worldbook: false,
};
const 缺失模块列表 = [];

// 异步初始化检测
(async function detectSystem() {
  if (typeof window !== 'undefined') {
    // 首先检查主窗口
    if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
      DS = window.detentionSystem;
    } else {
      // 在主窗口未找到，尝试在 iframe 中查找
      DS = findDetentionSystemInIframes();
      if (DS) {
        window._detentionSystem = DS;
        if (!window.detentionSystem) {
          window.detentionSystem = DS;
        }
      }
    }

    if (DS) {
      模块状态.core = true;

      // 等待模块注册完成（最多等待5秒）
      console.log('[系统检测] 等待模块注册完成...');
      const moduleCount = await waitForModules(DS, 5000, 100);
      console.log(`[系统检测] 已注册模块数: ${moduleCount}`);
      console.log('[系统检测] 已注册的模块:', Object.keys(DS.modules || {}));

      // 检测事件系统
      const eventSystem = DS.getModule('eventSystem');
      if (eventSystem && typeof DS.advanceDay === 'function') {
        模块状态.eventSystem = true;
        console.log('[系统检测] ✅ 事件系统(eventSystem): 已加载');
      } else {
        缺失模块列表.push('事件系统(eventSystem)');
        console.log('[系统检测] ❌ 事件系统(eventSystem): 未加载');
        if (eventSystem) {
          console.log('[系统检测]   原因: DS.advanceDay 方法不存在');
        } else {
          console.log('[系统检测]   原因: 模块未注册');
        }
      }

      // 检测状态栏
      const statusPanel = DS.getModule('statusPanel');
      if (statusPanel && typeof DS.getState === 'function') {
        模块状态.statusPanel = true;
        console.log('[系统检测] ✅ 状态栏(statusPanel): 已加载');
      } else {
        缺失模块列表.push('状态栏(statusPanel)');
        console.log('[系统检测] ❌ 状态栏(statusPanel): 未加载');
        if (statusPanel) {
          console.log('[系统检测]   原因: DS.getState 方法不存在');
        } else {
          console.log('[系统检测]   原因: 模块未注册');
        }
      }

      // 检测NPC系统
      const npcSystem = DS.getModule('npcSystem');
      if (npcSystem && typeof DS.generateNPC === 'function') {
        模块状态.npcSystem = true;
        console.log('[系统检测] ✅ NPC系统(npcSystem): 已加载');
      } else {
        缺失模块列表.push('NPC系统(npcSystem)');
        console.log('[系统检测] ❌ NPC系统(npcSystem): 未加载');
        if (npcSystem) {
          console.log('[系统检测]   原因: DS.generateNPC 方法不存在');
        } else {
          console.log('[系统检测]   原因: 模块未注册');
        }
      }

      // 检测知识库加载器
      const worldbook = DS.getModule('worldbook');
      if (worldbook && typeof DS.loadWorldbook === 'function') {
        模块状态.worldbook = true;
        console.log('[系统检测] ✅ 知识库加载器(worldbook): 已加载');
      } else {
        缺失模块列表.push('知识库加载器(worldbook)');
        console.log('[系统检测] ❌ 知识库加载器(worldbook): 未加载');
        if (worldbook) {
          console.log('[系统检测]   原因: DS.loadWorldbook 方法不存在');
        } else {
          console.log('[系统检测]   原因: 模块未注册');
        }
      }

      // 判断运行模式
      const 已加载模块数 = Object.values(模块状态).filter(v => v === true).length;
      if (已加载模块数 >= 2) {
        运行模式 = '外置脚本(完整功能)';
      } else if (已加载模块数 === 1) {
        运行模式 = '外置脚本(部分功能) - 仅核心系统';
      } else {
        运行模式 = '降级模式(基础功能)';
      }

      // 输出检测结果
      console.log('\n[系统检测] ========== 检测结果 ==========');
      console.log(`[系统检测] 运行模式: ${运行模式}`);
      console.log(`[系统检测] 已加载模块数: ${已加载模块数}/5`);
      if (缺失模块列表.length > 0) {
        console.log(`[系统检测] 缺失模块: ${缺失模块列表.join(', ')}`);
      }
      console.log('[系统检测] ==============================\n');
    } else {
      console.log('[系统检测] ❌ 未找到核心系统(detentionSystem)');
      console.log('[系统检测] 运行模式: 降级模式(基础功能)');
    }
  }
})();
