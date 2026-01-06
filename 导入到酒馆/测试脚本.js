/**
 * 看守所模拟器增强脚本 - 测试脚本
 * 在浏览器 F12 控制台中运行此脚本来测试系统是否正常工作
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
  console.log('🔍 开始测试看守所模拟器增强脚本');
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

  // 测试 1: 检查 window.detentionSystem 是否存在
  console.log('\n📋 测试 1: 检查核心系统');
  if (typeof window.detentionSystem !== 'undefined') {
    addTest('核心系统存在', true, 'window.detentionSystem 已创建');
    
    const DS = window.detentionSystem;
    
    // 测试 2: 检查核心系统版本
    if (DS.version) {
      addTest('核心系统版本', true, `版本: ${DS.version}`);
    } else {
      addTest('核心系统版本', false, '版本信息缺失');
    }
    
    // 测试 3: 检查初始化状态
    if (DS.initialized !== undefined) {
      addTest('初始化状态', true, `已初始化: ${DS.initialized}`);
    } else {
      addTest('初始化状态', false, '初始化状态缺失');
    }
    
    // 测试 4: 检查事件系统
    if (DS.events) {
      addTest('事件系统', true, '事件系统已加载');
    } else {
      addTest('事件系统', false, '事件系统缺失');
    }
    
    // 测试 5: 检查模块注册
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
    
    // 测试 6: 检查核心方法
    console.log('\n📋 测试 2: 检查核心方法');
    const coreMethods = ['ping', 'registerModule', 'getModule', 'handleError'];
    coreMethods.forEach(method => {
      if (typeof DS[method] === 'function') {
        addTest(`核心方法: ${method}`, true, '方法存在');
      } else {
        addTest(`核心方法: ${method}`, false, '方法缺失');
      }
    });
    
    // 测试 7: 测试 ping 方法
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
    
    // 测试 8: 检查事件系统模块
    console.log('\n📋 测试 3: 检查事件系统模块');
    const eventSystem = DS.getModule('eventSystem');
    if (eventSystem) {
      addTest('事件系统模块', true, '事件系统模块已注册');
      
      // 检查事件系统方法
      const eventMethods = ['advanceDay', 'getCurrentStage', 'generateRandomEvent'];
      eventMethods.forEach(method => {
        if (typeof DS[method] === 'function') {
          addTest(`事件方法: ${method}`, true, '方法存在');
        } else {
          addTest(`事件方法: ${method}`, false, '方法缺失', true);
        }
      });
    } else {
      addTest('事件系统模块', false, '事件系统模块未注册', true);
    }
    
    // 测试 9: 检查状态栏模块
    console.log('\n📋 测试 4: 检查状态栏模块');
    const statusPanel = DS.getModule('statusPanel');
    if (statusPanel) {
      addTest('状态栏模块', true, '状态栏模块已注册');
      
      if (typeof DS.getState === 'function') {
        try {
          const state = DS.getState();
          addTest('获取状态', true, `状态获取成功 (健康: ${state.health}, 精神: ${state.mental})`);
        } catch (error) {
          addTest('获取状态', false, `状态获取失败: ${error.message}`);
        }
      } else {
        addTest('获取状态', false, 'getState 方法缺失', true);
      }
    } else {
      addTest('状态栏模块', false, '状态栏模块未注册', true);
    }
    
    // 测试 10: 检查 NPC 系统模块
    console.log('\n📋 测试 5: 检查 NPC 系统模块');
    const npcSystem = DS.getModule('npcSystem');
    if (npcSystem) {
      addTest('NPC 系统模块', true, 'NPC 系统模块已注册');
      
      if (typeof DS.generateNPC === 'function') {
        addTest('NPC 生成方法', true, 'generateNPC 方法存在');
      } else {
        addTest('NPC 生成方法', false, 'generateNPC 方法缺失', true);
      }
    } else {
      addTest('NPC 系统模块', false, 'NPC 系统模块未注册', true);
    }
    
    // 测试 11: 检查知识库加载器模块
    console.log('\n📋 测试 6: 检查知识库加载器模块');
    const worldbook = DS.getModule('worldbook');
    if (worldbook) {
      addTest('知识库加载器模块', true, '知识库加载器模块已注册');
      
      if (typeof DS.loadWorldbook === 'function') {
        addTest('知识库加载方法', true, 'loadWorldbook 方法存在');
      } else {
        addTest('知识库加载方法', false, 'loadWorldbook 方法缺失', true);
      }
    } else {
      addTest('知识库加载器模块', false, '知识库加载器模块未注册', true);
    }
    
    // 测试 12: 检查 Token 预算
    console.log('\n📋 测试 7: 检查 Token 预算系统');
    if (typeof DS.checkTokenBudget === 'function') {
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
    } else {
      addTest('Token 预算', false, 'checkTokenBudget 方法缺失', true);
    }
    
    // 测试 13: 检查 DOM 元素（状态栏）
    console.log('\n📋 测试 8: 检查 UI 元素');
    const statusPanelElement = document.getElementById('detention-status-panel');
    if (statusPanelElement) {
      addTest('状态栏 UI', true, '状态栏 UI 元素已创建');
    } else {
      addTest('状态栏 UI', false, '状态栏 UI 元素未找到', true);
    }
    
  } else {
    addTest('核心系统存在', false, 'window.detentionSystem 未定义');
    console.error('❌ 核心系统未加载！请确保：');
    console.error('   1. 脚本已正确导入到酒馆中');
    console.error('   2. core.ts 模块已正确加载');
    console.error('   3. 检查浏览器控制台是否有错误信息');
  }
  
  // 测试 14: 检查控制台错误
  console.log('\n📋 测试 9: 检查常见错误');
  const consoleErrors = [];
  const originalError = console.error;
  console.error = function(...args) {
    consoleErrors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // 检查是否有 CORS 错误
  setTimeout(() => {
    const hasCorsError = consoleErrors.some(msg => 
      msg.includes('CORS') || 
      msg.includes('127.0.0.1:7242') ||
      msg.includes('fetch')
    );
    
    if (hasCorsError) {
      addTest('CORS 错误', false, '检测到 CORS 相关错误，请检查调试日志是否已移除');
    } else {
      addTest('CORS 错误', true, '未检测到 CORS 错误');
    }
    
    // 恢复原始 console.error
    console.error = originalError;
    
    // 输出测试总结
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
  }, 1000);
  
  // 立即返回测试结果（异步部分会在1秒后完成）
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
