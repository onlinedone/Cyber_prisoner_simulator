// ========== 修复后的角色卡检测和生成代码 ==========
// 这是修复版本，包含完整的诊断日志和正确的检测逻辑

// #region agent log - HYP-A: 系统初始化开始
try {
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'system_prompt:系统初始化',
      message: '开始系统初始化和主角生成',
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'script-load-debug',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
} catch (e) {}
// #endregion

// 1. 查找脚本（支持 iframe 环境）
function findDetentionSystemInIframes() {
  // #region agent log - HYP-A: iframe查找函数执行
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'system_prompt:findDetentionSystemInIframes入口',
        message: '开始查找iframe中的detentionSystem',
        data: { documentExists: typeof document !== 'undefined' },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'script-load-debug',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  if (typeof document === 'undefined') {
    console.warn('[模块检测] document 未定义，无法查找 iframe');
    return null;
  }
  const iframes = document.querySelectorAll('iframe');
  console.log('[模块检测] 开始查找 iframe 中的脚本，iframe 数量:', iframes.length);

  for (let i = 0; i < iframes.length; i++) {
    const iframe = iframes[i];
    const iframeName = iframe.name || '';
    const iframeId = iframe.id || '';
    if (iframeName.includes('script') || iframeName.includes('TH-script') || iframeName.includes('detention') || iframeId.includes('script') || iframeId.includes('TH-script') || iframeId.includes('detention')) {
      console.log('[模块检测] 检查 iframe:', iframeName || iframeId);
      try {
        const iframeWindow = iframe.contentWindow;
        
        // #region agent log - HYP-B: 检查iframe中的detentionSystem
        try {
          fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'system_prompt:findDetentionSystemInIframes检查',
              message: '检查iframe中的detentionSystem',
              data: {
                iframeName: iframeName || iframeId,
                hasWindow: !!iframeWindow,
                hasDetentionSystem: !!(iframeWindow && iframeWindow.detentionSystem),
                hasPing: !!(iframeWindow && iframeWindow.detentionSystem && typeof iframeWindow.detentionSystem.ping === 'function'),
                hasGenerateProtagonist: !!(iframeWindow && iframeWindow.detentionSystem && typeof iframeWindow.detentionSystem.generateProtagonist === 'function'),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'script-load-debug',
              hypothesisId: 'B',
            }),
          }).catch(() => {});
        } catch (e) {}
        // #endregion
        
        if (iframeWindow && iframeWindow.detentionSystem && iframeWindow.detentionSystem.ping && iframeWindow.detentionSystem.ping()) {
          console.log('[模块检测] ✓ 在 iframe 中找到核心系统:', iframeName || iframeId);
          
          // #region agent log - HYP-B: 成功找到detentionSystem
          try {
            fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'system_prompt:findDetentionSystemInIframes成功',
                message: '在iframe中找到detentionSystem',
                data: {
                  iframeName: iframeName || iframeId,
                  hasModules: 'modules' in iframeWindow.detentionSystem,
                  modulesCount: 'modules' in iframeWindow.detentionSystem ? Object.keys(iframeWindow.detentionSystem.modules).length : 0,
                  hasGenerateProtagonist: typeof iframeWindow.detentionSystem.generateProtagonist === 'function',
                  hasGenerateNPC: typeof iframeWindow.detentionSystem.generateNPC === 'function',
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'script-load-debug',
                hypothesisId: 'B',
              }),
            }).catch(() => {});
          } catch (e) {}
          // #endregion
          
          return iframeWindow.detentionSystem;
        }
      } catch (e) {
        console.warn('[模块检测] 访问 iframe 失败:', iframeName || iframeId, e);
      }
    }
  }
  console.warn('[模块检测] ❌ 在所有 iframe 中未找到核心系统');
  return null;
}

// 2. 检测核心系统和模块
let DS = null;
let 运行模式 = '降级模式(基础功能)';
let 模块状态 = {
  core: false,
  eventSystem: false,
  npcSystem: false,
  worldbook: false
};
let 缺失模块列表 = [];
let 记忆增强插件状态 = false;

if (typeof window !== 'undefined') {
  // #region agent log - HYP-C: 开始检测核心系统
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'system_prompt:开始检测核心系统',
        message: 'system_prompt代码执行开始',
        data: {
          windowExists: typeof window !== 'undefined',
          scriptLoaded: !!(window as any).__DETENTION_SYSTEM_LOADED__,
          scriptLoadedTimestamp: (window as any).__DETENTION_SYSTEM_LOADED_TIMESTAMP__,
          coreLoaded: !!(window as any).__DETENTION_SYSTEM_CORE_LOADED__,
          windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
          windowDetentionSystemType: typeof window.detentionSystem,
          hasPing: typeof window.detentionSystem !== 'undefined' && typeof window.detentionSystem.ping === 'function',
          hasGenerateProtagonist: typeof window.detentionSystem !== 'undefined' && typeof window.detentionSystem.generateProtagonist === 'function',
          isIframe: window.parent !== window,
          currentTime: Date.now(),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'script-load-debug',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  console.error('[模块检测] 开始检测核心系统...', {
    windowExists: typeof window !== 'undefined',
    scriptLoaded: (window as any).__DETENTION_SYSTEM_LOADED__,
    windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
  });

  if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
    DS = window.detentionSystem;
    
    // #region agent log - HYP-C: 在主窗口找到DS
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:主窗口找到DS',
          message: '在主窗口找到detentionSystem',
          data: {
            hasModules: 'modules' in DS,
            modulesCount: 'modules' in DS ? Object.keys(DS.modules).length : 0,
            moduleNames: 'modules' in DS ? Object.keys(DS.modules) : [],
            hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
            hasGenerateNPC: typeof DS.generateNPC === 'function',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'C',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion
    
    console.log('[模块检测] ✓ 在主窗口找到核心系统');
  } else {
    console.log('[模块检测] 主窗口未找到核心系统，尝试在 iframe 中查找...');
    DS = findDetentionSystemInIframes();
    if (DS) {
      console.log('[模块检测] ✓ 在 iframe 中找到核心系统');
      window._detentionSystem = DS;
      if (!window.detentionSystem) {
        window.detentionSystem = DS;
        console.log('[模块检测] ✓ 已将核心系统保存到主窗口');
      }
    } else {
      console.warn('[模块检测] ❌ 未找到核心系统');
    }
  }

  if (DS) {
    模块状态.core = true;

    // 等待模块注册完成
    // #region agent log - HYP-D: 开始等待模块注册
    const waitStartTime = Date.now();
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:开始等待模块注册',
          message: '开始等待模块注册',
          data: {
            initialModulesCount: DS && DS.modules ? Object.keys(DS.modules).length : 0,
            initialModuleNames: DS && DS.modules ? Object.keys(DS.modules) : [],
            hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
            hasGenerateNPC: typeof DS.generateNPC === 'function',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'D',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion
    
    let waitCount = 0;
    const maxWait = 50;
    while (waitCount < maxWait) {
      const modulesCount = DS && DS.modules ? Object.keys(DS.modules).length : 0;
      if (modulesCount >= 3) {
        // #region agent log - HYP-D: 模块注册完成
        try {
          fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'system_prompt:模块注册完成',
              message: '模块注册完成',
              data: {
                modulesCount: modulesCount,
                moduleNames: DS && DS.modules ? Object.keys(DS.modules) : [],
                waitCount: waitCount,
                elapsedTime: Date.now() - waitStartTime,
                hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
                hasGenerateNPC: typeof DS.generateNPC === 'function',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'script-load-debug',
              hypothesisId: 'D',
            }),
          }).catch(() => {});
        } catch (e) {}
        // #endregion
        
        console.error('[模块检测] ✓ 模块已注册完成，模块数:', modulesCount);
        break;
      }
      const start = Date.now();
      while (Date.now() - start < 10) {}
      waitCount++;
    }
    if (waitCount >= maxWait) {
      console.error('[模块检测] ⚠️ 警告：等待模块注册超时（500ms），可能模块尚未完全加载');
      
      // #region agent log - HYP-D: 等待超时
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'system_prompt:等待模块注册超时',
            message: '等待模块注册超时',
            data: {
              waitCount: waitCount,
              finalModulesCount: DS && DS.modules ? Object.keys(DS.modules).length : 0,
              finalModuleNames: DS && DS.modules ? Object.keys(DS.modules) : [],
              elapsedTime: Date.now() - waitStartTime,
              hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
              hasGenerateNPC: typeof DS.generateNPC === 'function',
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'script-load-debug',
            hypothesisId: 'D',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion
    }

    // 检测事件系统
    const eventSystem = DS.getModule('eventSystem');
    if (eventSystem && typeof DS.advanceDay === 'function') {
      模块状态.eventSystem = true;
      console.error('[模块检测] ✓ 事件系统已加载');
    } else {
      缺失模块列表.push('事件系统(eventSystem)');
      console.error('[模块检测] ⚠️ 事件系统未加载');
    }

    // 检测记忆增强插件
    try {
      const memoryEnhancement = window.stMemoryEnhancement || window.MemoryEnhancement || window.memoryEnhancement;
      if (memoryEnhancement && typeof memoryEnhancement.getState === 'function') {
        记忆增强插件状态 = true;
      }
    } catch (error) {
      console.warn('记忆增强插件检测失败:', error);
    }

    // 检测NPC系统 - ⚠️ 重要修复：同时检查 generateProtagonist 和 generateNPC
    const npcSystem = DS.getModule('npcSystem');
    
    // #region agent log - HYP-E: 检测NPC系统和generateProtagonist
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:检测NPC系统和generateProtagonist',
          message: '检测NPC系统',
          data: {
            npcSystemModule: npcSystem ? '找到' : '未找到',
            hasGenerateNPC: typeof DS.generateNPC,
            hasGenerateProtagonist: typeof DS.generateProtagonist,
            hasGenerateNPCForEvent: typeof DS.generateNPCForEvent,
            hasGetCurrentCellNPCs: typeof DS.getCurrentCellNPCs,
            DSObjectType: typeof DS,
            DSHasModules: 'modules' in DS,
            modulesCount: 'modules' in DS ? Object.keys(DS.modules).length : 0,
            moduleNames: 'modules' in DS ? Object.keys(DS.modules) : [],
            DSHasGetModule: typeof DS.getModule === 'function',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'E',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion
    
    console.error('[模块检测] NPC系统检测详情:', {
      npcSystemModule: npcSystem ? '找到' : '未找到',
      hasGenerateNPC: typeof DS.generateNPC,
      hasGenerateProtagonist: typeof DS.generateProtagonist, // ⚠️ 重要：检查generateProtagonist
      hasGenerateNPCForEvent: typeof DS.generateNPCForEvent,
      hasGetCurrentCellNPCs: typeof DS.getCurrentCellNPCs,
      DSObjectType: typeof DS,
      DSHasModules: 'modules' in DS,
      modulesCount: 'modules' in DS ? Object.keys(DS.modules).length : 0,
      moduleNames: 'modules' in DS ? Object.keys(DS.modules) : [],
      DSHasGetModule: typeof DS.getModule === 'function',
    });

    // ⚠️ 重要修复：检查 generateProtagonist 或 generateNPC，任一存在即认为NPC系统可用
    if (npcSystem && (typeof DS.generateProtagonist === 'function' || typeof DS.generateNPC === 'function')) {
      模块状态.npcSystem = true;
      console.error('[模块检测] ✓ NPC系统已加载，可用方法:', {
        generateNPC: typeof DS.generateNPC,
        generateProtagonist: typeof DS.generateProtagonist, // ⚠️ 重要：显示generateProtagonist状态
        generateNPCForEvent: typeof DS.generateNPCForEvent,
        getCurrentCellNPCs: typeof DS.getCurrentCellNPCs,
        setCurrentCellNPCs: typeof DS.setCurrentCellNPCs
      });
      
      // #region agent log - HYP-E: NPC系统检测成功
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'system_prompt:NPC系统检测成功',
            message: 'NPC系统已加载',
            data: {
              hasGenerateNPC: typeof DS.generateNPC === 'function',
              hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'script-load-debug',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion
    } else {
      缺失模块列表.push('NPC系统(npcSystem)');
      if (npcSystem) {
        console.error('[模块检测] ⚠ NPC系统模块已注册，但 generateNPC 和 generateProtagonist 方法都不存在');
        console.error('[模块检测] 调试信息:', {
          npcSystemType: typeof npcSystem,
          npcSystemValue: npcSystem,
          DSGenerateNPCType: typeof DS.generateNPC,
          DSGenerateProtagonistType: typeof DS.generateProtagonist, // ⚠️ 重要：显示generateProtagonist状态
          DSGenerateNPCValue: DS.generateNPC,
          DSGenerateProtagonistValue: DS.generateProtagonist,
        });
        
        // #region agent log - HYP-E: NPC系统模块已注册但方法不存在
        try {
          fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'system_prompt:NPC系统模块已注册但方法不存在',
              message: 'NPC系统模块已注册，但generateNPC和generateProtagonist方法都不存在',
              data: {
                npcSystemType: typeof npcSystem,
                hasGenerateNPC: typeof DS.generateNPC === 'function',
                hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'script-load-debug',
              hypothesisId: 'E',
            }),
          }).catch(() => {});
        } catch (e) {}
        // #endregion
      } else {
        console.error('[模块检测] ⚠ NPC系统模块未注册');
        console.error('[模块检测] 调试信息:', {
          DSModules: 'modules' in DS ? DS.modules : 'modules属性不存在',
          DSGetModuleType: typeof DS.getModule,
          getModuleResult: typeof DS.getModule === 'function' ? DS.getModule('npcSystem') : 'getModule不是函数',
        });
      }
    }

    // 检测知识库加载器
    const worldbook = DS.getModule('worldbook');
    if (worldbook && typeof DS.loadWorldbook === 'function') {
      模块状态.worldbook = true;
      console.error('[模块检测] ✓ 知识库加载器已加载');
    } else {
      缺失模块列表.push('知识库加载器(worldbook)');
      console.error('[模块检测] ⚠️ 知识库加载器未加载');
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

// 3. 生成角色信息（主角）
let 角色姓名, 角色年龄, 角色罪名, 角色外貌, 角色教育背景, 角色职业;
let 状态来源 = '默认值';

if (DS && 模块状态.npcSystem) {
  // #region agent log - HYP-F: 开始使用NPC系统生成角色
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'system_prompt:开始使用NPC系统生成角色',
        message: '开始使用NPC系统生成主角',
        data: {
          hasDS: !!DS,
          npcSystemAvailable: 模块状态.npcSystem,
          hasGenerateNPC: typeof DS.generateNPC === 'function',
          hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'script-load-debug',
        hypothesisId: 'F',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  try {
    // ⚠️ 重要更新：使用 generateProtagonist 生成主角（而不是 generateNPC）
    // generateProtagonist 专门用于生成主角，支持更多自定义选项
    // generateNPC 只能生成普通NPC（囚犯），不适用于主角

    // #region agent log - HYP-F: 调用generateProtagonist前
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:调用generateProtagonist前',
          message: '准备调用generateProtagonist',
          data: {
            hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
            hasGenerateNPC: typeof DS.generateNPC === 'function',
            DSObject: typeof DS,
            DSModulesCount: DS && DS.modules ? Object.keys(DS.modules).length : 0,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'F',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion

    // 使用 generateProtagonist 生成主角
    // 选项：高级知识分子、非学术背景、经济犯罪
    const protagonistData = DS.generateProtagonist?.({
      crimeType: 'economic', // 经济犯罪
      excludeCrimes: ['学术腐败'], // 排除学术腐败
      background: {
        isIntellectual: true, // 高级知识分子
        isAcademic: false, // 非学术背景
        isBusiness: true, // 商业背景
      },
      ageRange: [35, 45], // 35-45岁（符合企业家年龄）
      education: 'high', // 高学历（本科及以上）
      profession: ['企业家', '公司高管', '金融从业者', '投资顾问'], // 职业背景
    });

    // #region agent log - HYP-F: generateProtagonist调用后
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:generateProtagonist调用后',
          message: 'generateProtagonist调用完成',
          data: {
            hasProtagonistData: !!protagonistData,
            protagonistName: protagonistData?.name || 'N/A',
            protagonistAge: protagonistData?.age || 'N/A',
            protagonistCrime: protagonistData?.crime || 'N/A',
            hasAppearance: !!protagonistData?.appearance,
            protagonistEducation: protagonistData?.background?.education || 'N/A',
            protagonistProfession: protagonistData?.background?.profession || 'N/A',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'F',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion

    if (protagonistData && protagonistData.name) {
      角色姓名 = protagonistData.name;
      角色年龄 = protagonistData.age;
      角色罪名 = protagonistData.crime || '集资诈骗罪';
      角色外貌 = protagonistData.appearance || {
        height: 168,
        weight: 58,
        hair: '黑色长发',
        skin: '白皙',
        features: '气质优雅'
      };
      角色教育背景 = protagonistData.background?.education || '本科';
      角色职业 = protagonistData.background?.profession || '企业家';
      状态来源 = 'NPC系统(generateProtagonist)';
      
      // #region agent log - HYP-F: 主角生成成功
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'system_prompt:主角生成成功',
            message: 'generateProtagonist成功生成主角',
            data: {
              角色姓名: 角色姓名,
              角色年龄: 角色年龄,
              角色罪名: 角色罪名,
              教育背景: 角色教育背景,
              职业: 角色职业,
              性格标签: protagonistData.personality?.tags || [],
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'script-load-debug',
            hypothesisId: 'F',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion
      
      console.info('[角色生成] 使用generateProtagonist生成主角:', 角色姓名, 角色年龄, 角色罪名);
    } else {
      // #region agent log - HYP-F: generateProtagonist返回空数据
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'system_prompt:generateProtagonist返回空数据',
            message: 'generateProtagonist返回空数据或无效数据',
            data: {
              hasProtagonistData: !!protagonistData,
              protagonistDataType: typeof protagonistData,
              hasName: !!protagonistData?.name,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'script-load-debug',
            hypothesisId: 'F',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion
      
      console.warn('[角色生成] generateProtagonist返回空数据，使用降级模式');
    }
  } catch (error) {
    // #region agent log - HYP-F: NPC系统生成失败
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'system_prompt:NPC系统生成失败',
          message: 'NPC系统生成主角失败',
          data: {
            error: error?.toString() || '未知错误',
            errorStack: error?.stack || 'N/A',
            hasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'script-load-debug',
          hypothesisId: 'F',
        }),
      }).catch(() => {});
    } catch (e) {}
    // #endregion
    
    console.warn('[角色生成] NPC系统生成角色失败，使用降级模式:', error);
  }
} else {
  // #region agent log - HYP-F: NPC系统不可用
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'system_prompt:NPC系统不可用',
        message: 'NPC系统不可用，使用降级模式',
        data: {
          hasDS: !!DS,
          npcSystemAvailable: 模块状态.npcSystem,
          hasGenerateProtagonist: DS ? typeof DS.generateProtagonist === 'function' : false,
          hasGenerateNPC: DS ? typeof DS.generateNPC === 'function' : false,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'script-load-debug',
        hypothesisId: 'F',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  console.info('[角色生成] NPC系统不可用，使用降级模式');
}

// 如果NPC系统不可用或生成失败，使用降级模式
if (!角色姓名) {
  const 姓氏列表 = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '梁'];
  const 女性名字列表 = ['婷', '雪', '梅', '芳', '丽', '娟', '静', '敏', '慧', '琳', '颖', '洁', '莉', '萍', '红', '艳', '玲', '芬', '燕', '彩'];
  const 经济犯罪列表 = ['集资诈骗罪', '职务侵占罪', '挪用资金罪', '内幕交易罪', '操纵证券市场罪', '非法吸收公众存款罪'];
  const 职业列表 = ['企业家', '公司高管', '金融从业者', '投资顾问', '私募基金经理', '上市公司董事'];

  角色姓名 = 姓氏列表[Math.floor(Math.random() * 姓氏列表.length)] +
            女性名字列表[Math.floor(Math.random() * 女性名字列表.length)] +
            女性名字列表[Math.floor(Math.random() * 女性名字列表.length)];
  角色年龄 = Math.floor(Math.random() * 11) + 35; // 35-45岁
  角色罪名 = 经济犯罪列表[Math.floor(Math.random() * 经济犯罪列表.length)];
  角色职业 = 职业列表[Math.floor(Math.random() * 职业列表.length)];
  角色教育背景 = Math.random() > 0.5 ? '硕士' : '本科';
  角色外貌 = {
    height: Math.floor(Math.random() * 11) + 160,
    weight: Math.floor(Math.random() * 11) + 50,
    hair: '黑色长发',
    skin: '白皙',
    features: '气质优雅'
  };
  状态来源 = '降级模式';
  
  // #region agent log - HYP-F: 降级模式生成完成
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'system_prompt:降级模式生成完成',
        message: '降级模式成功生成角色',
        data: {
          角色姓名: 角色姓名,
          角色年龄: 角色年龄,
          角色罪名: 角色罪名,
          角色职业: 角色职业,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'script-load-debug',
        hypothesisId: 'F',
      }),
    }).catch(() => {});
  } catch (e) {}
  // #endregion
  
  console.info('[角色生成] 使用降级模式生成角色:', 角色姓名, 角色年龄, 角色罪名);
}

// 4. 获取或初始化状态
let state = null;
if (记忆增强插件状态) {
  try {
    const memoryEnhancement = window.stMemoryEnhancement || window.MemoryEnhancement || window.memoryEnhancement;
    const memoryState = memoryEnhancement.getState();
    if (memoryState && (memoryState.health !== undefined || memoryState.mental !== undefined)) {
      state = memoryState;
      状态来源 = '记忆增强插件';
    }
  } catch (error) {
    console.warn('从记忆增强插件获取状态失败:', error);
  }
}

if (!state) {
  state = {
    health: 75,
    mental: 60,
    strength: 55,
    intelligence: 70
  };
  状态来源 = '默认值';
}

// #region agent log - HYP-G: 获取currentDay
try {
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'system_prompt:获取currentDay前',
      message: '准备获取currentDay',
      data: {
        hasDS: !!DS,
        hasGetCurrentDay: DS ? typeof DS.getCurrentDay === 'function' : false,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'script-load-debug',
      hypothesisId: 'G',
    }),
  }).catch(() => {});
} catch (e) {}
// #endregion

const currentDay = DS?.getCurrentDay?.() || 0;

// #region agent log - HYP-G: 获取currentDay后
try {
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'system_prompt:获取currentDay后',
      message: '获取currentDay完成',
      data: {
        currentDay: currentDay,
        hasGetCurrentDay: DS ? typeof DS.getCurrentDay === 'function' : false,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'script-load-debug',
      hypothesisId: 'G',
    }),
  }).catch(() => {});
} catch (e) {}
// #endregion
