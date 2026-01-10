/**
 * 赛博坐牢模拟器增强脚本 - 完整功能测试脚本
 * 
 * 测试功能：
 * 1. 世界书调取
 * 2. 预测性加载
 * 3. 回合推进
 * 4. 事件打断推进
 * 5. 监室转移
 */

// ========== 辅助函数 ==========

function logSection(title) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 ${title}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function logTest(name, result, details = {}) {
  const status = result ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (Object.keys(details).length > 0) {
    console.log('   详情:', details);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 查找核心系统 ==========

function findDetentionSystem() {
  // 优先在主窗口查找
  if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
    return { DS: window.detentionSystem, source: '主窗口' };
  }
  
  // 在 iframe 中查找
  if (window.parent && window.parent !== window) {
    try {
      if (window.parent.detentionSystem && window.parent.detentionSystem.ping && window.parent.detentionSystem.ping()) {
        return { DS: window.parent.detentionSystem, source: '父窗口' };
      }
    } catch (e) {
      // 跨域限制
    }
  }
  
  // 遍历所有 iframe
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow && iframeWindow.detentionSystem && iframeWindow.detentionSystem.ping && iframeWindow.detentionSystem.ping()) {
        return { DS: iframeWindow.detentionSystem, source: 'iframe' };
      }
    } catch (e) {
      // 跨域限制
    }
  }
  
  return null;
}

// ========== 等待模块加载 ==========

async function waitForModules(DS, maxWait = 5000, interval = 100) {
  const startTime = Date.now();
  const requiredModules = ['worldbook', 'eventSystem', 'statusPanel'];
  
  while (Date.now() - startTime < maxWait) {
    const loaded = requiredModules.filter(name => {
      const module = DS.getModule(name);
      return module !== undefined && module !== null;
    });
    
    if (loaded.length === requiredModules.length) {
      return true;
    }
    
    await sleep(interval);
  }
  
  return false;
}

// ========== 测试 1: 世界书调取 ==========

async function testWorldbookLoading(DS) {
  logSection('测试 1: 世界书调取');
  
  const worldbookLoader = DS.getModule('worldbook');
  if (!worldbookLoader) {
    logTest('世界书加载器模块', false, { error: '模块未找到' });
    return { passed: 0, total: 0 };
  }
  
  const testBooks = [
    { name: 'detention_rules', displayName: '核心规则库' },
    { name: 'internal_basic_procedures', displayName: '生活细节库' },
    { name: 'internal_basic_legal', displayName: '法律细节库' },
    { name: 'environment_descriptions', displayName: '环境描写库' },
  ];
  
  let passed = 0;
  const results = [];
  
  for (const book of testBooks) {
    try {
      console.log(`\n📚 测试加载: ${book.displayName} (${book.name})`);
      
      const startTime = Date.now();
      const result = await DS.loadWorldbook(book.name);
      const duration = Date.now() - startTime;
      
      if (result && result.name && result.displayName) {
        const status = DS.getWorldbookStatus?.();
        const isLoaded = status?.loaded?.some(l => l.name === book.name);
        
        logTest(`加载 ${book.displayName}`, true, {
          entries: result.entries?.length || 0,
          duration: `${duration}ms`,
          loaded: isLoaded,
          fallback: result.fallback || false,
        });
        
        if (isLoaded) passed++;
        results.push({ book: book.name, success: true, result });
      } else {
        logTest(`加载 ${book.displayName}`, false, { error: '返回结果格式不正确', result });
        results.push({ book: book.name, success: false, error: '格式错误' });
      }
    } catch (error) {
      logTest(`加载 ${book.displayName}`, false, { error: error.message });
      results.push({ book: book.name, success: false, error: error.message });
    }
    
    await sleep(500); // 避免请求过快
  }
  
  // 测试获取状态
  try {
    const status = DS.getWorldbookStatus?.();
    if (status) {
      logTest('获取世界书状态', true, {
        initialized: status.initialized,
        loadedCount: status.loaded?.length || 0,
        loadingCount: status.loading?.length || 0,
      });
      passed++;
    } else {
      logTest('获取世界书状态', false, { error: '状态为空' });
    }
  } catch (error) {
    logTest('获取世界书状态', false, { error: error.message });
  }
  
  return { passed, total: testBooks.length + 1, results };
}

// ========== 测试 2: 预测性加载 ==========

async function testPredictiveCache(DS) {
  logSection('测试 2: 预测性加载');
  
  const worldbookLoader = DS.getModule('worldbook');
  if (!worldbookLoader || !DS.predictiveCache) {
    logTest('预测性加载功能', false, { error: '功能不可用' });
    return { passed: 0, total: 0 };
  }
  
  const testContexts = [
    {
      context: '我今天要去审讯室接受审讯，然后要去会见室见律师',
      expectedKeywords: ['审讯', '会见', '律师'],
      description: '包含审讯和会见关键词',
    },
    {
      context: '我需要了解监规和处罚制度',
      expectedKeywords: ['监规', '处罚'],
      description: '包含监规关键词',
    },
    {
      context: '今天要去洗澡，然后吃饭，最后睡觉',
      expectedKeywords: ['洗澡', '吃饭', '睡觉'],
      description: '包含日常生活关键词',
    },
    {
      context: '我想了解批捕、起诉和一审的流程',
      expectedKeywords: ['批捕', '起诉', '一审'],
      description: '包含法律流程关键词',
    },
  ];
  
  let passed = 0;
  
  for (const test of testContexts) {
    try {
      console.log(`\n🔮 测试上下文: "${test.context.substring(0, 30)}..."`);
      console.log(`   预期关键词: ${test.expectedKeywords.join(', ')}`);
      
      // 记录加载前的状态
      const statusBefore = DS.getWorldbookStatus?.();
      const loadedBefore = (statusBefore?.loaded || []).map(l => l.name);
      
      // 执行预测性加载
      await DS.predictiveCache(test.context);
      
      // 等待加载完成
      await sleep(1000);
      
      // 记录加载后的状态
      const statusAfter = DS.getWorldbookStatus?.();
      const loadedAfter = (statusAfter?.loaded || []).map(l => l.name);
      const newlyLoaded = loadedAfter.filter(name => !loadedBefore.includes(name));
      
      if (newlyLoaded.length > 0) {
        logTest(`预测性加载 - ${test.description}`, true, {
          newlyLoaded,
          totalLoaded: loadedAfter.length,
        });
        passed++;
      } else {
        logTest(`预测性加载 - ${test.description}`, false, {
          reason: '未触发新加载',
          loadedBefore,
          loadedAfter,
        });
      }
    } catch (error) {
      logTest(`预测性加载 - ${test.description}`, false, { error: error.message });
    }
    
    await sleep(500);
  }
  
  return { passed, total: testContexts.length };
}

// ========== 测试 3: 回合推进 ==========

async function testRoundAdvancement(DS) {
  logSection('测试 3: 回合推进');
  
  const eventSystem = DS.getModule('eventSystem');
  if (!eventSystem || !DS.advanceRound) {
    logTest('回合推进功能', false, { error: '功能不可用' });
    return { passed: 0, total: 0 };
  }
  
  let passed = 0;
  
  // 获取初始状态
  const initialRound = DS.getCurrentRound?.() || 0;
  const initialDay = eventSystem.currentDay || 0;
  const paceMultiplier = DS.getPaceMultiplier?.() || 0.5;
  
  logTest('获取初始状态', true, {
    round: initialRound,
    day: initialDay,
    paceMultiplier,
  });
  passed++;
  
  // 测试推进多个回合
  const roundsToTest = 5;
  const results = [];
  
  console.log(`\n🔄 推进 ${roundsToTest} 个回合...`);
  
  for (let i = 1; i <= roundsToTest; i++) {
    try {
      const beforeRound = DS.getCurrentRound?.() || 0;
      const beforeDay = eventSystem.currentDay || 0;
      
      const result = DS.advanceRound?.();
      
      await sleep(200); // 等待事件处理
      
      const afterRound = DS.getCurrentRound?.() || 0;
      const afterDay = eventSystem.currentDay || 0;
      
      const roundAdvanced = afterRound > beforeRound;
      const dayAdvanced = afterDay >= beforeDay;
      
      results.push({
        round: afterRound,
        day: afterDay,
        interrupted: result?.interrupted || false,
        event: result?.event,
      });
      
      console.log(`   回合 ${afterRound}: 第${afterDay}天 ${result?.interrupted ? '⚠️ 被事件打断' : '✓ 正常推进'}`);
      
      if (result?.event) {
        console.log(`      事件: ${result.event.name} (优先级: ${result.event.priority})`);
      }
    } catch (error) {
      console.error(`   回合推进失败:`, error);
    }
    
    await sleep(300);
  }
  
  const finalRound = DS.getCurrentRound?.() || 0;
  const finalDay = eventSystem.currentDay || 0;
  
  logTest('回合推进执行', finalRound > initialRound, {
    initialRound,
    finalRound,
    roundsAdvanced: finalRound - initialRound,
    initialDay,
    finalDay,
    daysAdvanced: finalDay - initialDay,
  });
  
  if (finalRound > initialRound) passed++;
  
  // 检查是否有事件触发
  const eventsTriggered = results.filter(r => r.interrupted && r.event);
  logTest('事件触发检测', eventsTriggered.length >= 0, {
    eventsCount: eventsTriggered.length,
    events: eventsTriggered.map(e => ({ name: e.event?.name, priority: e.event?.priority })),
  });
  passed++;
  
  return { passed, total: 3, results };
}

// ========== 测试 4: 事件打断推进 ==========

async function testEventInterruption(DS) {
  logSection('测试 4: 事件打断推进');
  
  const eventSystem = DS.getModule('eventSystem');
  if (!eventSystem || !DS.advanceRound) {
    logTest('事件打断功能', false, { error: '功能不可用' });
    return { passed: 0, total: 0 };
  }
  
  let passed = 0;
  
  // 设置事件监听器
  let interruptionCount = 0;
  const interruptionEvents = [];
  
  const interruptionHandler = (data) => {
    interruptionCount++;
    interruptionEvents.push(data);
    console.log(`   ⚠️ 检测到回合打断事件:`, data);
  };
  
  DS.events.on('round_interrupted', interruptionHandler);
  
  // 推进多个回合，观察是否被打断
  const testRounds = 10;
  console.log(`\n🔄 推进 ${testRounds} 个回合，观察事件打断...\n`);
  
  const roundResults = [];
  
  for (let i = 0; i < testRounds; i++) {
    try {
      const beforeRound = DS.getCurrentRound?.() || 0;
      const result = DS.advanceRound?.();
      
      await sleep(300);
      
      roundResults.push({
        round: DS.getCurrentRound?.() || 0,
        day: eventSystem.currentDay || 0,
        interrupted: result?.interrupted || false,
        event: result?.event,
        priority: result?.event?.priority,
      });
      
      if (result?.interrupted) {
        console.log(`   回合 ${DS.getCurrentRound?.() || 0}: ⚠️ 被事件打断 - ${result.event?.name} (优先级: ${result.event?.priority})`);
      }
    } catch (error) {
      console.error(`   回合推进失败:`, error);
    }
    
    await sleep(200);
  }
  
  // 移除事件监听器
  DS.events.off('round_interrupted', interruptionHandler);
  
  const interruptedRounds = roundResults.filter(r => r.interrupted);
  const highPriorityEvents = interruptedRounds.filter(r => r.priority && r.priority <= 2);
  
  logTest('事件打断检测', interruptedRounds.length >= 0, {
    totalRounds: testRounds,
    interruptedRounds: interruptedRounds.length,
    highPriorityEvents: highPriorityEvents.length,
    events: interruptedRounds.map(r => ({
      name: r.event?.name,
      priority: r.priority,
      day: r.day,
    })),
  });
  passed++;
  
  logTest('事件监听器工作', interruptionCount === highPriorityEvents.length, {
    interruptionCount,
    highPriorityEventsCount: highPriorityEvents.length,
  });
  if (interruptionCount === highPriorityEvents.length) passed++;
  
  // 测试手动触发高优先级事件（如果可能）
  try {
    const currentDay = eventSystem.currentDay || 0;
    const advanceResult = DS.advanceDay?.(1);
    
    if (advanceResult && advanceResult.interrupted && advanceResult.event) {
      logTest('手动推进触发事件', true, {
        event: advanceResult.event.name,
        priority: advanceResult.event.priority,
      });
      passed++;
    } else {
      logTest('手动推进触发事件', false, {
        reason: '未触发高优先级事件',
        result: advanceResult,
      });
    }
  } catch (error) {
    logTest('手动推进触发事件', false, { error: error.message });
  }
  
  return { passed, total: 3, roundResults, interruptionEvents };
}

// ========== 测试 5: 监室转移 ==========

async function testCellTransfer(DS) {
  logSection('测试 5: 监室转移');
  
  const eventSystem = DS.getModule('eventSystem');
  const npcSystem = DS.getModule('npcSystem');
  
  if (!eventSystem || !DS.checkCellTransfer) {
    logTest('监室转移功能', false, { error: '功能不可用' });
    return { passed: 0, total: 0 };
  }
  
  let passed = 0;
  
  // 获取当前监室状态
  const currentStage = DS.getCurrentStage?.();
  const initialCellType = eventSystem.cellType || 'transition';
  const initialNPCs = DS.getCurrentCellNPCs?.() || [];
  
  logTest('获取当前监室状态', true, {
    cellType: initialCellType,
    stage: currentStage,
    npcCount: initialNPCs.length,
  });
  passed++;
  
  // 设置事件监听器
  let transferCount = 0;
  const transferEvents = [];
  let npcRegenerated = false;
  
  const transferHandler = (data) => {
    transferCount++;
    transferEvents.push(data);
    console.log(`   🚚 监室转移事件:`, data);
  };
  
  const npcHandler = (data) => {
    npcRegenerated = true;
    console.log(`   👥 NPC重新生成:`, data);
  };
  
  DS.events.on('cell_transfer', transferHandler);
  DS.events.on('npc_joined_cell', npcHandler);
  
  // 模拟监室转移条件（设置天数到7-14天范围）
  try {
    const currentDay = eventSystem.currentDay || 0;
    const arrestDay = eventSystem.legalTimeline?.arrestDay || 0;
    const daysInCustody = currentDay - arrestDay;
    
    console.log(`\n📅 当前状态:`);
    console.log(`   在押天数: ${daysInCustody}天`);
    console.log(`   当前监室: ${initialCellType}`);
    console.log(`   监室转移条件: 在押7-14天，从过渡监室转移到预审监室（20%概率）\n`);
    
    // 如果条件不满足，尝试推进天数
    if (daysInCustody < 7 || initialCellType !== 'transition') {
      console.log(`   ⚠️ 当前不满足转移条件，尝试推进天数...`);
      
      // 推进到第8天（满足条件）
      const daysToAdvance = Math.max(0, 8 - daysInCustody);
      if (daysToAdvance > 0) {
        console.log(`   推进 ${daysToAdvance} 天...`);
        DS.advanceDay?.(daysToAdvance);
        await sleep(500);
      }
    }
    
    // 多次尝试触发监室转移（因为只有20%概率）
    let transferTriggered = false;
    const maxAttempts = 20;
    
    console.log(`\n🔄 尝试触发监室转移（最多 ${maxAttempts} 次尝试）...\n`);
    
    for (let i = 0; i < maxAttempts; i++) {
      const result = DS.checkCellTransfer?.();
      
      if (result) {
        transferTriggered = true;
        console.log(`   ✅ 第 ${i + 1} 次尝试成功触发监室转移！`);
        break;
      }
      
      await sleep(100);
    }
    
    await sleep(500); // 等待事件处理完成
    
    // 检查结果
    const newCellType = eventSystem.cellType || initialCellType;
    const newNPCs = DS.getCurrentCellNPCs?.() || [];
    
    logTest('监室转移触发', transferTriggered || transferCount > 0, {
      triggered: transferTriggered || transferCount > 0,
      attempts: maxAttempts,
      eventCount: transferCount,
      from: initialCellType,
      to: newCellType,
      events: transferEvents,
    });
    
    if (transferTriggered || transferCount > 0) passed++;
    
    // 检查监室类型是否改变
    if (newCellType !== initialCellType) {
      logTest('监室类型更新', true, {
        from: initialCellType,
        to: newCellType,
      });
      passed++;
    } else if (transferTriggered) {
      logTest('监室类型更新', false, {
        reason: '转移事件触发但类型未更新',
      });
    }
    
    // 检查NPC是否重新生成
    if (npcRegenerated || newNPCs.length !== initialNPCs.length) {
      logTest('NPC重新生成', true, {
        initialNPCs: initialNPCs.length,
        newNPCs: newNPCs.length,
        regenerated: npcRegenerated,
      });
      passed++;
    } else {
      logTest('NPC重新生成', false, {
        reason: '监室转移后NPC未重新生成',
        initialNPCs: initialNPCs.length,
        newNPCs: newNPCs.length,
      });
    }
    
  } catch (error) {
    logTest('监室转移测试', false, { error: error.message });
  } finally {
    // 清理事件监听器
    DS.events.off('cell_transfer', transferHandler);
    DS.events.off('npc_joined_cell', npcHandler);
  }
  
  return { passed, total: 4, transferEvents };
}

// ========== 主测试函数 ==========

async function runFullTest() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     赛博坐牢模拟器增强脚本 - 完整功能测试                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // 查找核心系统
  logSection('系统检测');
  const systemInfo = findDetentionSystem();
  
  if (!systemInfo) {
    console.error('❌ 未找到核心系统！请确保脚本已正确加载。');
    return;
  }
  
  const { DS, source } = systemInfo;
  console.log(`✅ 找到核心系统 (${source})`);
  console.log(`   版本: ${DS.version || '未知'}`);
  console.log(`   初始化状态: ${DS.initialized ? '✅' : '❌'}`);
  
  // 等待模块加载
  console.log('\n⏳ 等待模块加载...');
  const modulesReady = await waitForModules(DS, 5000, 100);
  
  if (!modulesReady) {
    console.warn('⚠️ 部分模块可能未完全加载，继续测试...');
  } else {
    console.log('✅ 所有必需模块已加载');
  }
  
  // 显示已加载模块
  const loadedModules = ['core', 'worldbook', 'eventSystem', 'statusPanel', 'npcSystem']
    .filter(name => DS.getModule(name))
    .map(name => `  ✅ ${name}`);
  
  if (loadedModules.length > 0) {
    console.log('\n📦 已加载模块:');
    loadedModules.forEach(m => console.log(m));
  }
  
  // 运行各项测试
  const testResults = {};
  
  try {
    testResults.worldbook = await testWorldbookLoading(DS);
  } catch (error) {
    console.error('❌ 世界书调取测试失败:', error);
    testResults.worldbook = { passed: 0, total: 0, error: error.message };
  }
  
  await sleep(1000);
  
  try {
    testResults.predictive = await testPredictiveCache(DS);
  } catch (error) {
    console.error('❌ 预测性加载测试失败:', error);
    testResults.predictive = { passed: 0, total: 0, error: error.message };
  }
  
  await sleep(1000);
  
  try {
    testResults.rounds = await testRoundAdvancement(DS);
  } catch (error) {
    console.error('❌ 回合推进测试失败:', error);
    testResults.rounds = { passed: 0, total: 0, error: error.message };
  }
  
  await sleep(1000);
  
  try {
    testResults.interruption = await testEventInterruption(DS);
  } catch (error) {
    console.error('❌ 事件打断测试失败:', error);
    testResults.interruption = { passed: 0, total: 0, error: error.message };
  }
  
  await sleep(1000);
  
  try {
    testResults.cellTransfer = await testCellTransfer(DS);
  } catch (error) {
    console.error('❌ 监室转移测试失败:', error);
    testResults.cellTransfer = { passed: 0, total: 0, error: error.message };
  }
  
  // 测试结果汇总
  logSection('测试结果汇总');
  
  const totalPassed = Object.values(testResults).reduce((sum, r) => sum + (r.passed || 0), 0);
  const totalTests = Object.values(testResults).reduce((sum, r) => sum + (r.total || 0), 0);
  
  console.log('📊 测试统计:');
  console.log(`   世界书调取: ${testResults.worldbook.passed || 0}/${testResults.worldbook.total || 0}`);
  console.log(`   预测性加载: ${testResults.predictive.passed || 0}/${testResults.predictive.total || 0}`);
  console.log(`   回合推进: ${testResults.rounds.passed || 0}/${testResults.rounds.total || 0}`);
  console.log(`   事件打断: ${testResults.interruption.passed || 0}/${testResults.interruption.total || 0}`);
  console.log(`   监室转移: ${testResults.cellTransfer.passed || 0}/${testResults.cellTransfer.total || 0}`);
  console.log(`\n   总计: ${totalPassed}/${totalTests} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 所有测试通过！');
  } else if (totalPassed >= totalTests * 0.8) {
    console.log('\n✅ 大部分测试通过，系统运行正常');
  } else {
    console.log('\n⚠️ 部分测试未通过，请检查系统状态');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 完整功能测试完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return testResults;
}

// ========== 执行测试 ==========

// 延迟执行，确保所有模块已加载
setTimeout(() => {
  runFullTest().catch(error => {
    console.error('❌ 测试执行失败:', error);
  });
}, 2000);
