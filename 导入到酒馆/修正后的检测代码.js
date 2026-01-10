// 检测外置脚本系统（修正版）
function findDetentionSystemInIframes() {
  if (typeof document === 'undefined') return null;
  const iframes = document.querySelectorAll('iframe');
  
  // 优先检查脚本相关的 iframe
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    const iframeName = iframe.name || '';
    const iframeId = iframe.id || '';
    if (iframeName.includes('script') || iframeName.includes('TH-script') || iframeName.includes('detention') || 
        iframeId.includes('script') || iframeId.includes('TH-script') || iframeId.includes('detention')) {
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.detentionSystem && 
            iframeWindow.detentionSystem.ping && 
            typeof iframeWindow.detentionSystem.ping === 'function' &&
            iframeWindow.detentionSystem.ping()) {
          return iframeWindow.detentionSystem;
        }
      } catch (e) {
        // 跨域或权限问题，跳过
      }
    }
  }
  
  // 如果没找到，遍历所有 iframe
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframeWindow = iframes[i].contentWindow;
      if (iframeWindow && iframeWindow.detentionSystem && 
          iframeWindow.detentionSystem.ping && 
          typeof iframeWindow.detentionSystem.ping === 'function' &&
          iframeWindow.detentionSystem.ping()) {
        return iframeWindow.detentionSystem;
      }
    } catch (e) {
      // 跨域或权限问题，跳过
    }
  }
  
  return null;
}

let DS = null;
let 运行模式 = '降级模式(基础功能)';
let 模块状态 = {
  core: false,
  eventSystem: false,
  statusPanel: false,
  npcSystem: false,
  worldbook: false
};
let 缺失模块列表 = [];

if (typeof window !== 'undefined') {
  // 首先检查主窗口
  if (window.detentionSystem && 
      window.detentionSystem.ping && 
      typeof window.detentionSystem.ping === 'function' &&
      window.detentionSystem.ping()) {
    DS = window.detentionSystem;
  } else {
    // 在主窗口未找到，尝试在 iframe 中查找
    DS = findDetentionSystemInIframes();
    if (DS) {
      // 将找到的 DS 保存到主窗口，方便后续使用
      window._detentionSystem = DS;
      if (!window.detentionSystem) {
        window.detentionSystem = DS;
      }
    }
  }

  // 如果找到核心系统，检测各个模块
  if (DS) {
    模块状态.core = true;

    // 检测事件系统：检查模块和方法
    const eventSystem = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('eventSystem') : null;
    if (eventSystem && DS.advanceDay && typeof DS.advanceDay === 'function') {
      模块状态.eventSystem = true;
    } else {
      缺失模块列表.push('事件系统(eventSystem)');
    }

    // 检测状态栏：检查模块和方法
    const statusPanel = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('statusPanel') : null;
    if (statusPanel && DS.getState && typeof DS.getState === 'function') {
      模块状态.statusPanel = true;
    } else {
      缺失模块列表.push('状态栏(statusPanel)');
    }

    // 检测NPC系统：检查模块和方法
    const npcSystem = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('npcSystem') : null;
    if (npcSystem && DS.generateNPC && typeof DS.generateNPC === 'function') {
      模块状态.npcSystem = true;
    } else {
      缺失模块列表.push('NPC系统(npcSystem)');
    }

    // 检测知识库加载器：检查模块和方法
    const worldbook = DS.getModule && typeof DS.getModule === 'function' ? DS.getModule('worldbook') : null;
    if (worldbook && DS.loadWorldbook && typeof DS.loadWorldbook === 'function') {
      模块状态.worldbook = true;
    } else {
      缺失模块列表.push('知识库加载器(worldbook)');
    }

    // 判断运行模式
    const 已加载模块数 = Object.values(模块状态).filter(v => v === true).length;
    if (已加载模块数 >= 2) {
      // 核心系统 + 至少一个功能模块
      运行模式 = '外置脚本(完整功能)';
    } else if (已加载模块数 === 1) {
      // 只有核心系统
      运行模式 = '外置脚本(部分功能) - 仅核心系统';
    } else {
      // 核心系统也未加载（理论上不会发生，因为 DS 存在说明 core 已加载）
      运行模式 = '降级模式(基础功能)';
    }
  }
}

// 输出检测结果（用于调试）
console.log('脚本检测结果:', {
  DS: DS ? '已找到' : '未找到',
  运行模式: 运行模式,
  模块状态: 模块状态,
  缺失模块: 缺失模块列表
});
