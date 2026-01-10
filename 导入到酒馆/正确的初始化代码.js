// ⚠️ 重要：此代码仅用于角色卡的初始化，不包含主角生成
// 主角生成应该由外置脚本（core.ts）监听用户消息自动处理
// 用户发送"生成主角"、"创建主角"等消息时，系统会自动触发主角生成

// 检测外置脚本和记忆增强插件
let DS = null;
let 运行模式 = '降级模式(基础功能)';
const 模块状态 = {
  core: false,
  eventSystem: false,
  npcSystem: false,
  worldbook: false,
};
const 缺失模块列表 = [];
let 记忆增强插件状态 = false;

if (typeof window !== 'undefined') {
  // 检测记忆增强插件
  try {
    const memoryEnhancement = window.stMemoryEnhancement || window.MemoryEnhancement || window.memoryEnhancement;
    if (memoryEnhancement && typeof memoryEnhancement.getState === 'function') {
      记忆增强插件状态 = true;
    }
  } catch (error) {
    // 忽略错误
  }

  // 检查主窗口
  if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
    DS = window.detentionSystem;
  } else if (typeof document !== 'undefined') {
    // 在iframe中查找
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      try {
        const iframeWindow = iframes[i].contentWindow;
        if (
          iframeWindow &&
          iframeWindow.detentionSystem &&
          iframeWindow.detentionSystem.ping &&
          iframeWindow.detentionSystem.ping()
        ) {
          DS = iframeWindow.detentionSystem;
          if (!window.detentionSystem) {
            window.detentionSystem = DS;
          }
          break;
        }
      } catch (e) {
        // 跨域限制，忽略
      }
    }
  }

  // 检测各个模块
  if (DS) {
    模块状态.core = true;

    // 等待模块注册完成（脚本可能是异步加载的）
    let waitCount = 0;
    const maxWait = 50; // 最多等待50次，即500ms
    while (waitCount < maxWait) {
      const modulesCount = DS && DS.modules ? Object.keys(DS.modules).length : 0;
      if (modulesCount >= 3) {
        break;
      }
      const start = Date.now();
      while (Date.now() - start < 10) {
        // busy-wait 10ms
      }
      waitCount++;
    }

    // 检测事件系统
    const eventSystem = DS.getModule('eventSystem');
    if (eventSystem && typeof DS.advanceDay === 'function') {
      模块状态.eventSystem = true;
    } else {
      缺失模块列表.push('事件系统(eventSystem)');
    }

    // 检测NPC系统
    const npcSystem = DS.getModule('npcSystem');
    // ⚠️ 重要：检查 generateProtagonist 或 generateNPC，任一存在即认为NPC系统可用
    if (npcSystem && (typeof DS.generateProtagonist === 'function' || typeof DS.generateNPC === 'function')) {
      模块状态.npcSystem = true;
    } else {
      缺失模块列表.push('NPC系统(npcSystem)');
    }

    // 检测知识库加载器
    const worldbook = DS.getModule('worldbook');
    if (worldbook && typeof DS.loadWorldbook === 'function') {
      模块状态.worldbook = true;
    } else {
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

// ⚠️ 重要：主角生成已移除
// 主角生成应该由外置脚本（core.ts）监听用户消息自动处理
// 当用户发送包含"生成主角"、"创建主角"等关键词的消息时，系统会自动：
// 1. 调用 DS.generateProtagonist() 生成主角信息
// 2. 使用 replaceVariables() 保存到聊天变量
// 3. 隐藏用户的生成主角消息，防止AI重复响应

// 获取或初始化状态（如果记忆增强插件可用）
let state = null;
if (记忆增强插件状态) {
  try {
    const memoryEnhancement = window.stMemoryEnhancement || window.MemoryEnhancement || window.memoryEnhancement;
    const memoryState = memoryEnhancement.getState();
    if (memoryState && (memoryState.health !== undefined || memoryState.mental !== undefined)) {
      state = memoryState;
    }
  } catch (error) {
    // 忽略错误
  }
}

// 如果记忆增强插件不可用，使用默认值
if (!state && DS && 运行模式 !== '降级模式(基础功能)') {
  state = {
    health: 75,
    mental: 60,
    strength: 55,
    intelligence: 60,
  };

  // 尝试设置状态到记忆增强插件（如果可用）
  if (记忆增强插件状态) {
    try {
      const memoryEnhancement = window.stMemoryEnhancement || window.MemoryEnhancement || window.memoryEnhancement;
      if (typeof memoryEnhancement.setState === 'function') {
        memoryEnhancement.setState(state);
      }
    } catch (error) {
      // 忽略错误
    }
  }
}

// 初始化日期（如果需要）
if (DS && typeof DS.getCurrentDay === 'function') {
  const currentDay = DS.getCurrentDay();
  // 如果当前天数为0或未设置，且用户需要初始化，可以设置为0
  // 注意：通常应该保持当前天数，不要自动重置
  // if (currentDay === 0 && typeof DS.setCurrentDay === 'function') {
  //   DS.setCurrentDay(0);
  // }
}
