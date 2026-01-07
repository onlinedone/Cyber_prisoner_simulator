// 检测外置脚本系统（修复版 - 包含所有类型检查和错误处理）
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
        // 修复：添加 typeof 检查
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
      // 修复：添加 typeof 检查
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
  // 修复：添加 typeof 检查
  if (window.detentionSystem && 
      window.detentionSystem.ping && 
      typeof window.detentionSystem.ping === 'function' &&
      window.detentionSystem.ping()) {
    DS = window.detentionSystem;
  } else {
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

    // 修复：添加类型检查和错误处理
    // 检测事件系统
    try {
      const eventSystem = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('eventSystem') : null;
      if (eventSystem && DS.advanceDay && typeof DS.advanceDay === 'function') {
        模块状态.eventSystem = true;
      } else {
        缺失模块列表.push('事件系统(eventSystem)');
      }
    } catch (e) {
      缺失模块列表.push('事件系统(eventSystem)');
    }

    // 检测状态栏
    try {
      const statusPanel = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('statusPanel') : null;
      if (statusPanel && DS.getState && typeof DS.getState === 'function') {
        模块状态.statusPanel = true;
      } else {
        缺失模块列表.push('状态栏(statusPanel)');
      }
    } catch (e) {
      缺失模块列表.push('状态栏(statusPanel)');
    }

    // 检测NPC系统
    try {
      const npcSystem = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('npcSystem') : null;
      if (npcSystem && DS.generateNPC && typeof DS.generateNPC === 'function') {
        模块状态.npcSystem = true;
      } else {
        缺失模块列表.push('NPC系统(npcSystem)');
      }
    } catch (e) {
      缺失模块列表.push('NPC系统(npcSystem)');
    }

    // 检测知识库加载器
    try {
      const worldbook = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('worldbook') : null;
      if (worldbook && DS.loadWorldbook && typeof DS.loadWorldbook === 'function') {
        模块状态.worldbook = true;
      } else {
        缺失模块列表.push('知识库加载器(worldbook)');
      }
    } catch (e) {
      缺失模块列表.push('知识库加载器(worldbook)');
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
  }
}
