// 检测外置脚本系统（增强版 - 带调试信息）
function findDetentionSystemInIframes() {
  if (typeof document === 'undefined') return null;
  const iframes = document.querySelectorAll('iframe');
  console.log('[检测] 找到 iframe 数量:', iframes.length);
  
  // 优先检查脚本相关的 iframe
  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    const iframeName = iframe.name || '';
    const iframeId = iframe.id || '';
    if (iframeName.includes('script') || iframeName.includes('TH-script') || iframeName.includes('detention') || 
        iframeId.includes('script') || iframeId.includes('TH-script') || iframeId.includes('detention')) {
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.detentionSystem) {
          console.log('[检测] 在脚本 iframe[' + i + '] 中找到 detentionSystem');
          if (iframeWindow.detentionSystem.ping && 
              typeof iframeWindow.detentionSystem.ping === 'function' &&
              iframeWindow.detentionSystem.ping()) {
            console.log('[检测] ✅ 脚本 iframe[' + i + '] 中的 detentionSystem 可用');
            return iframeWindow.detentionSystem;
          } else {
            console.log('[检测] ⚠️ 脚本 iframe[' + i + '] 中的 detentionSystem ping 失败');
          }
        }
      } catch (e) {
        console.log('[检测] ⚠️ 脚本 iframe[' + i + '] 访问失败:', e.message);
      }
    }
  }
  
  // 如果没找到，遍历所有 iframe
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframeWindow = iframes[i].contentWindow;
      if (iframeWindow && iframeWindow.detentionSystem) {
        console.log('[检测] 在普通 iframe[' + i + '] 中找到 detentionSystem');
        if (iframeWindow.detentionSystem.ping && 
            typeof iframeWindow.detentionSystem.ping === 'function' &&
            iframeWindow.detentionSystem.ping()) {
          console.log('[检测] ✅ 普通 iframe[' + i + '] 中的 detentionSystem 可用');
          return iframeWindow.detentionSystem;
        }
      }
    } catch (e) {
      // 跨域或权限问题，跳过
    }
  }
  
  console.log('[检测] ❌ 未在任何 iframe 中找到可用的 detentionSystem');
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

console.log('[检测] 开始检测外置脚本系统...');

if (typeof window !== 'undefined') {
  console.log('[检测] window 对象可用');
  
  // 首先检查主窗口
  if (window.detentionSystem) {
    console.log('[检测] 主窗口找到 window.detentionSystem');
    if (window.detentionSystem.ping && typeof window.detentionSystem.ping === 'function') {
      if (window.detentionSystem.ping()) {
        console.log('[检测] ✅ 主窗口的 detentionSystem ping 成功');
        DS = window.detentionSystem;
      } else {
        console.log('[检测] ⚠️ 主窗口的 detentionSystem ping 失败');
      }
    } else {
      console.log('[检测] ⚠️ 主窗口的 detentionSystem 没有 ping 方法');
    }
  } else {
    console.log('[检测] 主窗口未找到 window.detentionSystem，尝试在 iframe 中查找');
  }
  
  // 如果主窗口没有，尝试在 iframe 中查找
  if (!DS) {
    DS = findDetentionSystemInIframes();
    if (DS) {
      console.log('[检测] ✅ 在 iframe 中找到 detentionSystem');
      // 将找到的 DS 保存到主窗口，方便后续使用
      window._detentionSystem = DS;
      if (!window.detentionSystem) {
        window.detentionSystem = DS;
        console.log('[检测] 已将 iframe 中的 detentionSystem 绑定到主窗口');
      }
    }
  }

  // 如果找到核心系统，检测各个模块
  if (DS) {
    console.log('[检测] 开始检测模块...');
    console.log('[检测] DS.getModule 类型:', typeof DS.getModule);
    console.log('[检测] DS.modules:', DS.modules ? Object.keys(DS.modules) : '无');
    
    模块状态.core = true;

    // 检测事件系统：检查模块和方法
    try {
      const eventSystem = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('eventSystem') : null;
      console.log('[检测] 事件系统模块:', eventSystem ? '找到' : '未找到');
      console.log('[检测] DS.advanceDay 类型:', typeof DS.advanceDay);
      if (eventSystem && DS.advanceDay && typeof DS.advanceDay === 'function') {
        模块状态.eventSystem = true;
        console.log('[检测] ✅ 事件系统已加载');
      } else {
        缺失模块列表.push('事件系统(eventSystem)');
        console.log('[检测] ❌ 事件系统未加载 - 模块:', eventSystem ? '有' : '无', '方法:', DS.advanceDay ? '有' : '无');
      }
    } catch (e) {
      console.error('[检测] 检测事件系统时出错:', e);
      缺失模块列表.push('事件系统(eventSystem)');
    }

    // 检测状态栏：检查模块和方法
    try {
      const statusPanel = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('statusPanel') : null;
      console.log('[检测] 状态栏模块:', statusPanel ? '找到' : '未找到');
      console.log('[检测] DS.getState 类型:', typeof DS.getState);
      if (statusPanel && DS.getState && typeof DS.getState === 'function') {
        模块状态.statusPanel = true;
        console.log('[检测] ✅ 状态栏已加载');
      } else {
        缺失模块列表.push('状态栏(statusPanel)');
        console.log('[检测] ❌ 状态栏未加载 - 模块:', statusPanel ? '有' : '无', '方法:', DS.getState ? '有' : '无');
      }
    } catch (e) {
      console.error('[检测] 检测状态栏时出错:', e);
      缺失模块列表.push('状态栏(statusPanel)');
    }

    // 检测NPC系统：检查模块和方法
    try {
      const npcSystem = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('npcSystem') : null;
      console.log('[检测] NPC系统模块:', npcSystem ? '找到' : '未找到');
      console.log('[检测] DS.generateNPC 类型:', typeof DS.generateNPC);
      if (npcSystem && DS.generateNPC && typeof DS.generateNPC === 'function') {
        模块状态.npcSystem = true;
        console.log('[检测] ✅ NPC系统已加载');
      } else {
        缺失模块列表.push('NPC系统(npcSystem)');
        console.log('[检测] ❌ NPC系统未加载 - 模块:', npcSystem ? '有' : '无', '方法:', DS.generateNPC ? '有' : '无');
      }
    } catch (e) {
      console.error('[检测] 检测NPC系统时出错:', e);
      缺失模块列表.push('NPC系统(npcSystem)');
    }

    // 检测知识库加载器：检查模块和方法
    try {
      const worldbook = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule('worldbook') : null;
      console.log('[检测] 知识库加载器模块:', worldbook ? '找到' : '未找到');
      console.log('[检测] DS.loadWorldbook 类型:', typeof DS.loadWorldbook);
      if (worldbook && DS.loadWorldbook && typeof DS.loadWorldbook === 'function') {
        模块状态.worldbook = true;
        console.log('[检测] ✅ 知识库加载器已加载');
      } else {
        缺失模块列表.push('知识库加载器(worldbook)');
        console.log('[检测] ❌ 知识库加载器未加载 - 模块:', worldbook ? '有' : '无', '方法:', DS.loadWorldbook ? '有' : '无');
      }
    } catch (e) {
      console.error('[检测] 检测知识库加载器时出错:', e);
      缺失模块列表.push('知识库加载器(worldbook)');
    }

    // 判断运行模式
    const 已加载模块数 = Object.values(模块状态).filter(v => v === true).length;
    console.log('[检测] 已加载模块数:', 已加载模块数);
    console.log('[检测] 模块状态:', 模块状态);
    
    if (已加载模块数 >= 2) {
      // 核心系统 + 至少一个功能模块
      运行模式 = '外置脚本(完整功能)';
      console.log('[检测] ✅ 运行模式: 外置脚本(完整功能)');
    } else if (已加载模块数 === 1) {
      // 只有核心系统
      运行模式 = '外置脚本(部分功能) - 仅核心系统';
      console.log('[检测] ⚠️ 运行模式: 外置脚本(部分功能) - 仅核心系统');
    } else {
      // 核心系统也未加载（理论上不会发生，因为 DS 存在说明 core 已加载）
      运行模式 = '降级模式(基础功能)';
      console.log('[检测] ❌ 运行模式: 降级模式(基础功能)');
    }
    
    console.log('[检测] 缺失模块:', 缺失模块列表);
  } else {
    console.log('[检测] ❌ 未找到核心系统，进入降级模式');
  }
} else {
  console.log('[检测] ❌ window 对象不可用');
}

// 输出最终检测结果
console.log('═══════════════════════════════════════════════════');
console.log('[检测] 最终检测结果:');
console.log('  DS:', DS ? '已找到' : '未找到');
console.log('  运行模式:', 运行模式);
console.log('  模块状态:', 模块状态);
console.log('  缺失模块:', 缺失模块列表);
console.log('═══════════════════════════════════════════════════');
