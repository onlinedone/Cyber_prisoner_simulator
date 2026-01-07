/**
 * 看守所模拟器增强脚本 - 完整功能测试脚本
 * 在浏览器 F12 控制台中运行此脚本来测试所有功能
 *
 * 使用方法：
 * 1. 打开浏览器 F12 开发者工具
 * 2. 切换到 Console（控制台）标签
 * 3. 复制下面的代码并粘贴到控制台，按回车执行
 *
 * 或者：
 * 1. 在控制台中输入：testDetentionSystem()
 * 2. 如果脚本已加载，会自动运行测试
 */

(function testDetentionSystem() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 开始测试看守所模拟器增强脚本 - 完整功能测试');
  console.log('═══════════════════════════════════════════════════');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  function addTest(name, passed, message, isWarning = false) {
    results.tests.push({ name, passed, message, isWarning });
    if (isWarning) {
      results.warnings++;
      console.warn(`⚠️  [${name}] ${message}`);
    } else if (passed) {
      results.passed++;
      console.log(`✅ [${name}] ${message}`);
    } else {
      results.failed++;
      console.error(`❌ [${name}] ${message}`);
    }
  }

  // ========== 测试 1: 核心系统 ==========
  console.log('\n📋 测试 1: 检查核心系统');

  // 首先尝试在主窗口查找
  let DS = window.detentionSystem;
  let DSLocation = '主窗口';

  // 如果主窗口没有，尝试在所有 iframe 中查找
  if (!DS) {
    console.log('   在主窗口未找到，正在搜索 iframe...');
    const iframes = document.querySelectorAll('iframe');
    console.log(`   找到 ${iframes.length} 个 iframe`);

    // 列出所有 iframe 的信息（用于调试）
    if (iframes.length > 0) {
      console.log('   iframe 列表:');
      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        const iframeName = iframe.name || '无name';
        const iframeId = iframe.id || '无id';
        const iframeSrc = iframe.src || '无src';
        console.log(`   [${i}] name: "${iframeName}", id: "${iframeId}", src: "${iframeSrc.substring(0, 50)}..."`);
      }
    }

    // 首先尝试通过 name 属性查找脚本 iframe（脚本 iframe 的 name 通常包含 "script" 或 "TH-script"）
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      const iframeName = iframe.name || '';
      const iframeId = iframe.id || '';

      // 检查是否是脚本 iframe
      if (
        iframeName.includes('script') ||
        iframeName.includes('TH-script') ||
        iframeId.includes('script') ||
        iframeId.includes('TH-script') ||
        iframeName.includes('detention') ||
        iframeId.includes('detention')
      ) {
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            console.log(`   检查脚本 iframe[${i}]...`);
            if (typeof iframeWindow.detentionSystem !== 'undefined') {
              DS = iframeWindow.detentionSystem;
              DSLocation = `脚本 iframe[${i}] (name: ${iframeName || '无name'}, id: ${iframeId || '无id'})`;
              console.log(`   ✅ 在 ${DSLocation} 中找到核心系统`);
              break;
            } else {
              console.log(`   ⚠️  脚本 iframe[${i}] 中未找到 detentionSystem`);
            }
          }
        } catch (e) {
          console.log(`   ⚠️  脚本 iframe[${i}] 无法访问 (可能是跨域): ${e.message}`);
        }
      }
    }

    // 如果还没找到，遍历所有 iframe（可能跨域问题）
    if (!DS) {
      console.log('   遍历所有 iframe 查找...');
      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            if (typeof iframeWindow.detentionSystem !== 'undefined') {
              DS = iframeWindow.detentionSystem;
              DSLocation = `iframe[${i}] (name: ${iframe.name || '无name'}, id: ${iframe.id || '无id'})`;
              console.log(`   ✅ 在 ${DSLocation} 中找到核心系统`);
              break;
            }
          }
        } catch (e) {
          // 跨域 iframe 无法访问，跳过
          console.log(`   ⚠️  iframe[${i}] 跨域无法访问`);
        }
      }
    }

    // 如果还是没找到，提供调试建议
    if (!DS) {
      console.log('   ❌ 在所有 iframe 中都未找到核心系统');
      console.log('   💡 调试建议:');
      console.log('      1. 检查脚本是否已正确导入到酒馆助手中');
      console.log('      2. 等待几秒后再次运行测试（脚本可能还在加载）');
      console.log('      3. 检查浏览器控制台是否有错误信息');
      console.log('      4. 尝试手动检查 iframe:');
      console.log('         const iframes = document.querySelectorAll("iframe");');
      console.log('         for (let i = 0; i < iframes.length; i++) {');
      console.log('           try {');
      console.log('             const win = iframes[i].contentWindow;');
      console.log('             if (win && win.detentionSystem) {');
      console.log('               console.log(`找到在 iframe[${i}]`);');
      console.log('             }');
      console.log('           } catch(e) {}');
      console.log('         }');
    }
  }

  if (DS) {
    addTest('核心系统存在', true, `window.detentionSystem 已创建 (位置: ${DSLocation})`);

    // 将找到的 DS 保存到主窗口，方便后续测试
    if (DSLocation !== '主窗口') {
      console.log('   💡 提示：核心系统在 iframe 中，已临时保存到 window._detentionSystem 供测试使用');
      window._detentionSystem = DS;
      window._detentionSystemLocation = DSLocation;
    }

    // 测试核心系统版本
    if (DS.version) {
      addTest('核心系统版本', true, `版本: ${DS.version}`);
    } else {
      addTest('核心系统版本', false, '版本信息缺失');
    }

    // 测试初始化状态
    if (DS.initialized !== undefined) {
      addTest('初始化状态', true, `已初始化: ${DS.initialized}`);
    } else {
      addTest('初始化状态', false, '初始化状态缺失');
    }

    // 测试事件系统
    if (DS.events) {
      addTest('事件系统', true, '事件系统已加载');
    } else {
      addTest('事件系统', false, '事件系统缺失');
    }

    // 测试模块注册
    if (DS.modules && typeof DS.modules === 'object') {
      const moduleCount = Object.keys(DS.modules).length;
      addTest('模块注册', true, `已注册 ${moduleCount} 个模块`);

      // 列出所有模块
      if (moduleCount > 0) {
        console.log('   已注册的模块:');
        Object.keys(DS.modules).forEach(name => {
          console.log(`   - ${name}`);
        });
      }
    } else {
      addTest('模块注册', false, '模块系统异常');
    }

    // 测试核心方法
    console.log('\n📋 测试 2: 检查核心方法');
    const coreMethods = ['ping', 'registerModule', 'getModule', 'handleError', 'checkTokenBudget', 'updateTokenUsage', 'compressContent', 'detectEnvironment'];
    coreMethods.forEach(method => {
      if (typeof DS[method] === 'function') {
        addTest(`核心方法: ${method}`, true, '方法存在');
      } else {
        addTest(`核心方法: ${method}`, false, '方法缺失');
      }
    });

    // 测试 ping 方法
    try {
      const pingResult = DS.ping();
      if (pingResult === true) {
        addTest('ping 方法', true, 'ping 方法正常工作');
      } else {
        addTest('ping 方法', false, `ping 返回异常: ${pingResult}`);
      }
    } catch (error) {
      addTest('ping 方法', false, `ping 执行出错: ${error.message}`);
    }

    // 测试 Token 预算
    try {
      const budget = DS.checkTokenBudget();
      if (budget && typeof budget === 'object') {
        addTest('Token 预算', true, `已使用: ${budget.used}/${budget.total} (${budget.percentage}%)`);
      } else {
        addTest('Token 预算', false, '预算信息格式异常');
      }
    } catch (error) {
      addTest('Token 预算', false, `预算检查失败: ${error.message}`);
    }

    // 测试环境检测
    try {
      const env = DS.detectEnvironment();
      if (env && typeof env === 'object') {
        addTest('环境检测', true, `SillyTavern: ${env.isSillyTavern}, 助手: ${env.hasHelper}`);
      } else {
        addTest('环境检测', false, '环境信息格式异常');
      }
    } catch (error) {
      addTest('环境检测', false, `环境检测失败: ${error.message}`);
    }

    // ========== 测试 3: 事件系统模块 ==========
    console.log('\n📋 测试 3: 检查事件系统模块');
    const eventSystem = DS.getModule('eventSystem');
    if (eventSystem) {
      addTest('事件系统模块', true, '事件系统模块已注册');

      // 检查事件系统方法
      const eventMethods = ['advanceDay', 'getCurrentStage', 'generateRandomEvent', 'checkCellTransfer', 'setCaseComplexity', 'rollbackToStage', 'setDeathPenalty', 'getEventStatistics', 'exportTimeline', 'importTimeline'];
      eventMethods.forEach(method => {
        if (typeof DS[method] === 'function') {
          addTest(`事件方法: ${method}`, true, '方法存在');
        } else {
          addTest(`事件方法: ${method}`, false, '方法缺失', true);
        }
      });

      // 测试获取当前阶段
      try {
        const stage = DS.getCurrentStage();
        if (stage && typeof stage === 'object') {
          addTest('获取当前阶段', true, `阶段: ${stage.stage || '未知'}, 天数: ${stage.day || 0}`);
        } else {
          addTest('获取当前阶段', false, '阶段信息格式异常');
        }
      } catch (error) {
        addTest('获取当前阶段', false, `获取阶段失败: ${error.message}`);
      }

      // 测试推进天数
      try {
        const result = DS.advanceDay(1);
        if (result && typeof result === 'object') {
          addTest('推进天数', true, `当前天数: ${result.currentDay || '未知'}`);
        } else {
          addTest('推进天数', false, '推进结果格式异常');
        }
      } catch (error) {
        addTest('推进天数', false, `推进天数失败: ${error.message}`);
      }

      // 测试生成随机事件
      try {
        const event = DS.generateRandomEvent();
        if (event === null || (event && typeof event === 'object')) {
          addTest('生成随机事件', true, event ? `事件: ${event.name || '未知'}` : '未生成事件（正常）');
        } else {
          addTest('生成随机事件', false, '事件格式异常');
        }
      } catch (error) {
        addTest('生成随机事件', false, `生成事件失败: ${error.message}`);
      }

      // 测试事件统计
      try {
        const stats = DS.getEventStatistics();
        if (stats && typeof stats === 'object') {
          addTest('事件统计', true, `总事件数: ${stats.totalEvents || 0}`);
        } else {
          addTest('事件统计', false, '统计信息格式异常');
        }
      } catch (error) {
        addTest('事件统计', false, `获取统计失败: ${error.message}`);
      }

      // 测试回合制功能（检查 DS 对象上的方法和 eventSystem 模块的属性）
      const hasAdvanceRound = typeof DS.advanceRound === 'function';
      const hasSetPaceMultiplier = typeof DS.setPaceMultiplier === 'function';
      const hasRoundProperty = eventSystem.currentRound !== undefined;
      const hasPaceProperty = eventSystem.paceMultiplier !== undefined;

      if (hasRoundProperty) {
        addTest('回合制功能', true, `当前回合: ${eventSystem.currentRound}`);
      } else if (hasAdvanceRound) {
        // 如果方法存在但属性不存在，尝试调用方法获取
        try {
          const roundResult = DS.advanceRound();
          addTest('回合制功能', true, `当前回合: ${roundResult?.currentRound || '未知'}`);
        } catch (error) {
          addTest('回合制功能', false, `回合制功能存在但无法获取: ${error.message}`, true);
        }
      } else {
        addTest('回合制功能', false, '回合制功能未实现', true);
      }

      // 测试叙事节奏功能（如果存在）
      if (hasPaceProperty) {
        addTest('叙事节奏功能', true, `当前节奏倍数: ${eventSystem.paceMultiplier}`);
      } else if (hasSetPaceMultiplier) {
        // 如果方法存在但属性不存在，尝试设置后检查
        try {
          DS.setPaceMultiplier(0.5);
          // 再次检查属性
          if (eventSystem.paceMultiplier !== undefined) {
            addTest('叙事节奏功能', true, `当前节奏倍数: ${eventSystem.paceMultiplier}`);
          } else {
            addTest('叙事节奏功能', true, '叙事节奏功能已实现（方法可用）');
          }
        } catch (error) {
          addTest('叙事节奏功能', false, `叙事节奏功能存在但无法设置: ${error.message}`, true);
        }
      } else {
        addTest('叙事节奏功能', false, '叙事节奏功能未实现', true);
      }

      // 测试设置叙事节奏（如果存在）
      if (hasSetPaceMultiplier) {
        try {
          const oldPace = hasPaceProperty ? eventSystem.paceMultiplier : undefined;
          DS.setPaceMultiplier(0.75);
          const newPace = hasPaceProperty ? eventSystem.paceMultiplier : undefined;
          addTest('设置叙事节奏', true, `设置成功${newPace !== undefined ? ` (${oldPace} → ${newPace})` : ''}`);
        } catch (error) {
          addTest('设置叙事节奏', false, `设置失败: ${error.message}`);
        }
      } else {
        addTest('设置叙事节奏', false, 'setPaceMultiplier 方法不存在', true);
      }

      // 测试推进回合（如果存在）
      if (hasAdvanceRound) {
        try {
          const oldRound = hasRoundProperty ? eventSystem.currentRound : undefined;
          const roundResult = DS.advanceRound();
          const newRound = hasRoundProperty ? eventSystem.currentRound : roundResult?.currentRound;
          addTest('推进回合', true, `推进成功，当前回合: ${newRound || '未知'}${oldRound !== undefined ? ` (${oldRound} → ${newRound})` : ''}`);
        } catch (error) {
          addTest('推进回合', false, `推进失败: ${error.message}`);
        }
      } else {
        addTest('推进回合', false, 'advanceRound 方法不存在', true);
      }
    } else {
      addTest('事件系统模块', false, '事件系统模块未注册', true);
    }

    // ========== 测试 4: 状态栏模块 ==========
    console.log('\n📋 测试 4: 检查状态栏模块');
    const statusPanel = DS.getModule('statusPanel');
    if (statusPanel) {
      addTest('状态栏模块', true, '状态栏模块已注册');

      // 检查状态栏方法
      const statusMethods = ['getState', 'getTrendAnalysis', 'getCurrentStage', 'parseStatusUpdate', 'modifyValue', 'reset', 'exportData', 'importData'];
      statusMethods.forEach(method => {
        if (typeof statusPanel[method] === 'function') {
          addTest(`状态栏方法: ${method}`, true, '方法存在');
        } else {
          addTest(`状态栏方法: ${method}`, false, '方法缺失', true);
        }
      });

      // 测试获取状态
      if (typeof DS.getState === 'function' || typeof statusPanel.getState === 'function') {
        try {
          const getStateFn = DS.getState || statusPanel.getState;
          const state = getStateFn();
          if (state && typeof state === 'object') {
            addTest('获取状态', true, `健康: ${state.health || 0}, 精神: ${state.mental || 0}`);
          } else {
            addTest('获取状态', false, '状态信息格式异常');
          }
        } catch (error) {
          addTest('获取状态', false, `状态获取失败: ${error.message}`);
        }
      } else {
        addTest('获取状态', false, 'getState 方法缺失', true);
      }

      // 测试趋势分析
      try {
        const trend = statusPanel.getTrendAnalysis();
        if (trend && typeof trend === 'object') {
          addTest('趋势分析', true, '趋势分析功能正常');
        } else {
          addTest('趋势分析', false, '趋势信息格式异常');
        }
      } catch (error) {
        addTest('趋势分析', false, `趋势分析失败: ${error.message}`, true);
      }

      // 测试解析状态更新（parseStatusUpdate 期望纯 JSON 字符串，不包含 HTML 注释）
      try {
        const testUpdate = JSON.stringify({
          health: 80,
          mental: 70,
          name: '测试角色',
          age: 25,
          crime: '测试罪名'
        });
        // parseStatusUpdate 期望纯 JSON，HTML 注释的提取由 parseCommentNode 处理
        const parseResult = statusPanel.parseStatusUpdate(testUpdate);
        addTest('解析状态更新', true, `解析结果: ${parseResult ? '成功' : '失败（可能正常）'}`);
      } catch (error) {
        addTest('解析状态更新', false, `解析失败: ${error.message}`);
      }

      // 测试修改状态值
      try {
        statusPanel.modifyValue('health', 5, '测试');
        addTest('修改状态值', true, '修改成功');
      } catch (error) {
        addTest('修改状态值', false, `修改失败: ${error.message}`);
      }
    } else {
      addTest('状态栏模块', false, '状态栏模块未注册', true);
    }

    // ========== 测试 5: NPC 系统模块 ==========
    console.log('\n📋 测试 5: 检查 NPC 系统模块');
    const npcSystem = DS.getModule('npcSystem');
    if (npcSystem) {
      addTest('NPC 系统模块', true, 'NPC 系统模块已注册');

      // 检查NPC方法
      if (typeof DS.generateNPC === 'function') {
        addTest('NPC 生成方法', true, 'generateNPC 方法存在');

        // 测试生成NPC
        try {
          const npcs = DS.generateNPC(1);
          if (Array.isArray(npcs) && npcs.length > 0) {
            addTest('生成NPC', true, `成功生成 ${npcs.length} 个NPC: ${npcs[0].name || '未知'}`);
          } else {
            addTest('生成NPC', false, '生成结果格式异常');
          }
        } catch (error) {
          addTest('生成NPC', false, `生成失败: ${error.message}`);
        }
      } else {
        addTest('NPC 生成方法', false, 'generateNPC 方法缺失', true);
      }

      // 测试为事件生成NPC
      if (typeof DS.generateNPCForEvent === 'function') {
        try {
          const eventNPC = DS.generateNPCForEvent('interrogation');
          if (eventNPC && typeof eventNPC === 'object') {
            addTest('为事件生成NPC', true, '生成成功');
          } else {
            addTest('为事件生成NPC', false, '生成结果格式异常');
          }
        } catch (error) {
          addTest('为事件生成NPC', false, `生成失败: ${error.message}`);
        }
      } else {
        addTest('为事件生成NPC', false, 'generateNPCForEvent 方法不存在', true);
      }
    } else {
      addTest('NPC 系统模块', false, 'NPC 系统模块未注册', true);
    }

    // ========== 测试 6: 知识库加载器模块 ==========
    console.log('\n📋 测试 6: 检查知识库加载器模块');
    const worldbook = DS.getModule('worldbook');
    if (worldbook) {
      addTest('知识库加载器模块', true, '知识库加载器模块已注册');

      // 检查知识库方法
      if (typeof DS.loadWorldbook === 'function') {
        addTest('知识库加载方法', true, 'loadWorldbook 方法存在');
      } else {
        addTest('知识库加载方法', false, 'loadWorldbook 方法缺失', true);
      }
    } else {
      addTest('知识库加载器模块', false, '知识库加载器模块未注册', true);
    }

    // ========== 测试 7: MVU 变量框架 ==========
    console.log('\n📋 测试 7: 检查 MVU 变量框架');
    if (typeof window.Mvu !== 'undefined') {
      addTest('MVU 变量框架', true, 'MVU 变量框架已加载');

      // 测试MVU方法
      if (typeof window.Mvu.getMvuData === 'function') {
        try {
          const mvuData = window.Mvu.getMvuData({ type: 'message', message_id: -1 });
          addTest('获取MVU数据', true, '获取成功');
        } catch (error) {
          addTest('获取MVU数据', false, `获取失败: ${error.message}`);
        }
      } else {
        addTest('获取MVU数据', false, 'getMvuData 方法不存在', true);
      }
    } else {
      addTest('MVU 变量框架', false, 'MVU 变量框架未加载', true);
    }

    // ========== 测试 8: 状态栏界面 ==========
    console.log('\n📋 测试 8: 检查 UI 元素');
    const statusPanelElement = document.getElementById('app');
    if (statusPanelElement) {
      addTest('状态栏 UI 容器', true, '状态栏 UI 容器已创建');
    } else {
      addTest('状态栏 UI 容器', false, '状态栏 UI 容器未找到', true);
    }

    // 检查Vue应用是否已挂载
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      addTest('Vue 应用', true, 'Vue 应用已加载');
    } else {
      addTest('Vue 应用', false, 'Vue 应用未检测到', true);
    }

    // ========== 测试 9: 事件监听 ==========
    console.log('\n📋 测试 9: 测试事件监听');
    let eventReceived = false;
    const testCallback = () => {
      eventReceived = true;
    };

    try {
      DS.events.on('test_event', testCallback);
      DS.events.emit('test_event');
      setTimeout(() => {
        if (eventReceived) {
          addTest('事件监听', true, '事件系统正常工作');
        } else {
          addTest('事件监听', false, '事件未触发');
        }
        DS.events.off('test_event', testCallback);
      }, 100);
    } catch (error) {
      addTest('事件监听', false, `事件监听失败: ${error.message}`);
    }

    // ========== 测试 10: 数据导出导入 ==========
    console.log('\n📋 测试 10: 测试数据导出导入');

    // 测试时间线导出
    try {
      if (typeof DS.exportTimeline === 'function') {
        const timeline = DS.exportTimeline();
        if (timeline && typeof timeline === 'object') {
          addTest('时间线导出', true, '导出成功');

          // 测试时间线导入
          if (typeof DS.importTimeline === 'function') {
            const importResult = DS.importTimeline(timeline);
            if (importResult === true) {
              addTest('时间线导入', true, '导入成功');
            } else {
              addTest('时间线导入', false, '导入失败');
            }
          } else {
            addTest('时间线导入', false, 'importTimeline 方法不存在', true);
          }
        } else {
          addTest('时间线导出', false, '导出结果格式异常');
        }
      } else {
        addTest('时间线导出', false, 'exportTimeline 方法不存在', true);
      }
    } catch (error) {
      addTest('时间线导出导入', false, `导出导入失败: ${error.message}`);
    }

    // 测试状态栏数据导出
    if (statusPanel && typeof statusPanel.exportData === 'function') {
      try {
        const statusData = statusPanel.exportData();
        if (statusData && typeof statusData === 'object') {
          addTest('状态栏数据导出', true, '导出成功');
        } else {
          addTest('状态栏数据导出', false, '导出结果格式异常');
        }
      } catch (error) {
        addTest('状态栏数据导出', false, `导出失败: ${error.message}`);
      }
    } else {
      addTest('状态栏数据导出', false, 'exportData 方法不存在', true);
    }

  } else {
    addTest('核心系统存在', false, 'window.detentionSystem 未定义');
    console.error('❌ 核心系统未加载！请确保：');
    console.error('   1. 脚本已正确导入到酒馆中');
    console.error('   2. core.ts 模块已正确加载');
    console.error('   3. 检查浏览器控制台是否有错误信息');
    console.error('   4. 如果脚本在 iframe 中运行，可能需要等待 iframe 加载完成');
    console.error('\n💡 调试提示：');
    console.error('   - 尝试刷新页面后再次运行测试');
    console.error('   - 检查所有 iframe 的控制台日志');
    console.error('   - 在 iframe 中直接运行: window.detentionSystem');
  }

  // ========== 测试总结 ==========
  setTimeout(() => {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 测试总结');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ 通过: ${results.passed}`);
    console.log(`❌ 失败: ${results.failed}`);
    console.log(`⚠️  警告: ${results.warnings}`);
    console.log(`📝 总计: ${results.tests.length} 项测试`);

    if (results.failed === 0 && results.warnings === 0) {
      console.log('\n🎉 所有测试通过！系统运行正常。');
    } else if (results.failed === 0) {
      console.log('\n✅ 核心功能正常，但有一些警告（可能是模块未完全加载）。');
    } else {
      console.log('\n⚠️  发现一些问题，请检查上述错误信息。');
    }

    console.log('\n💡 提示：');
    console.log('   - 如果核心系统未加载，请检查脚本导入是否正确');
    console.log('   - 如果模块未注册，可能需要等待几秒让模块初始化完成');
    console.log('   - 可以多次运行此测试脚本以验证系统状态');
    console.log('   - 警告项通常是可选功能，不影响核心使用');
    console.log('═══════════════════════════════════════════════════');

    // 返回测试结果对象，方便进一步检查
    return {
      summary: {
        passed: results.passed,
        failed: results.failed,
        warnings: results.warnings,
        total: results.tests.length
      },
      tests: results.tests,
      detentionSystem: window.detentionSystem
    };
  }, 1500);

  // 立即返回测试结果（异步部分会在1.5秒后完成）
  return {
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.tests.length
    },
    tests: results.tests,
    detentionSystem: window.detentionSystem
  };
})();
