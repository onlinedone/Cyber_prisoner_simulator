/**
 * 看守所模拟器 - 全面功能测试脚本
 * 使用方法：在浏览器 F12 控制台中直接粘贴并执行
 */

(function testDetentionSystem() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 开始测试看守所模拟器脚本功能');
  console.log('═══════════════════════════════════════════════════');

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  function pass(testName, details = '') {
    results.passed.push({ test: testName, details });
    console.log(`✅ ${testName}`, details ? `- ${details}` : '');
  }

  function fail(testName, error, details = '') {
    results.failed.push({ test: testName, error, details });
    console.error(`❌ ${testName}`, error, details ? `- ${details}` : '');
  }

  function warn(testName, message) {
    results.warnings.push({ test: testName, message });
    console.warn(`⚠️  ${testName}`, message);
  }

  // ========== 测试 1: 检查 window.detentionSystem 是否存在 ==========
  console.log('\n📋 测试 1: window.detentionSystem 基础检查');
  if (typeof window.detentionSystem !== 'undefined') {
    pass('window.detentionSystem 存在', `类型: ${typeof window.detentionSystem}`);
  } else {
    fail('window.detentionSystem 不存在', '脚本可能未加载或未执行');
    console.error('💡 提示: 请检查脚本是否正确导入，路径是否正确');
    console.error('💡 提示: 请检查 Network 标签中是否有 detention-system.js 的请求');
    console.error('💡 提示: 请检查控制台是否有脚本相关的错误信息');
    // 如果基础对象不存在，后续测试无法进行
    console.log('\n⚠️  由于 window.detentionSystem 不存在，跳过后续测试');
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 测试结果汇总:');
    console.log(`   ✅ 通过: ${results.passed.length}`);
    console.log(`   ❌ 失败: ${results.failed.length}`);
    console.log(`   ⚠️  警告: ${results.warnings.length}`);
    console.log('═══════════════════════════════════════════════════');
    return results;
  }

  const DS = window.detentionSystem;

  // ========== 测试 2: 检查核心系统属性 ==========
  console.log('\n📋 测试 2: 核心系统属性检查');

  const requiredProperties = ['version', 'initialized', 'modules', 'events', 'ping', 'getModule', 'registerModule'];

  requiredProperties.forEach(prop => {
    if (prop in DS) {
      const value = DS[prop];
      const type = typeof value;
      if (type === 'function') {
        pass(`DS.${prop} 存在`, `类型: function`);
      } else {
        pass(`DS.${prop} 存在`, `类型: ${type}, 值: ${JSON.stringify(value).substring(0, 50)}`);
      }
    } else {
      fail(`DS.${prop} 不存在`, '缺少必需属性');
    }
  });

  // ========== 测试 3: 检查 ping 方法 ==========
  console.log('\n📋 测试 3: ping 方法测试');
  if (typeof DS.ping === 'function') {
    try {
      const pingResult = DS.ping();
      if (pingResult === true) {
        pass('DS.ping() 返回 true', '核心系统响应正常');
      } else {
        warn('DS.ping() 返回值异常', `返回值: ${pingResult}`);
      }
    } catch (e) {
      fail('DS.ping() 执行失败', e.message);
    }
  } else {
    fail('DS.ping 不是函数', `类型: ${typeof DS.ping}`);
  }

  // ========== 测试 4: 检查版本信息 ==========
  console.log('\n📋 测试 4: 版本信息检查');
  if (DS.version) {
    pass('DS.version 存在', `版本: ${DS.version}`);
  } else {
    warn('DS.version 不存在或为空', '无法确定脚本版本');
  }

  // ========== 测试 5: 检查模块注册 ==========
  console.log('\n📋 测试 5: 模块注册检查');
  if (DS.modules && typeof DS.modules === 'object') {
    const moduleNames = Object.keys(DS.modules);
    pass('DS.modules 存在', `已注册模块数: ${moduleNames.length}`);

    if (moduleNames.length > 0) {
      console.log('   已注册的模块:');
      moduleNames.forEach(name => {
        console.log(`     - ${name}`);
      });
    } else {
      warn('DS.modules 为空', '没有模块被注册');
    }
  } else {
    fail('DS.modules 不存在或类型错误', `类型: ${typeof DS.modules}`);
  }

  // ========== 测试 6: 检查事件系统 ==========
  console.log('\n📋 测试 6: 事件系统检查');
  if (DS.events && typeof DS.events === 'object') {
    const hasOn = typeof DS.events.on === 'function';
    const hasEmit = typeof DS.events.emit === 'function';
    const hasOff = typeof DS.events.off === 'function';

    if (hasOn && hasEmit) {
      pass('DS.events 基本功能存在', 'on/emit 方法可用');

      // 测试事件监听
      try {
        let eventReceived = false;
        DS.events.on('test_event', () => {
          eventReceived = true;
        });
        DS.events.emit('test_event');
        setTimeout(() => {
          if (eventReceived) {
            pass('事件系统功能正常', '可以监听和触发事件');
          } else {
            warn('事件系统可能有问题', '事件监听未触发');
          }
        }, 100);
      } catch (e) {
        fail('事件系统测试失败', e.message);
      }
    } else {
      fail('DS.events 方法不完整', `on: ${hasOn}, emit: ${hasEmit}`);
    }
  } else {
    fail('DS.events 不存在或类型错误', `类型: ${typeof DS.events}`);
  }

  // ========== 测试 7: 检查核心模块 ==========
  console.log('\n📋 测试 7: 核心模块检查');
  const expectedModules = ['eventSystem', 'npcSystem', 'statusPanel', 'worldbook'];

  expectedModules.forEach(moduleName => {
    const module = DS.getModule(moduleName);
    if (module) {
      pass(`模块 ${moduleName} 已注册`, `类型: ${typeof module}`);
    } else {
      warn(`模块 ${moduleName} 未注册`, '可能未加载或未初始化');
    }
  });

  // ========== 测试 8: 检查事件系统模块 ==========
  console.log('\n📋 测试 8: 事件系统模块功能测试');
  const eventSystem = DS.getModule('eventSystem');
  if (eventSystem) {
    const hasAdvanceDay = typeof eventSystem.advanceDay === 'function';

    if (hasAdvanceDay) {
      pass('eventSystem.advanceDay 存在', '可以推进时间');
    } else {
      warn('eventSystem.advanceDay 不存在', '时间推进功能可能不可用');
    }

    // getCurrentDay 是直接设置在 DS 上的，不是 eventSystem 模块的方法
    if (typeof DS.getCurrentDay === 'function') {
      try {
        const currentDay = DS.getCurrentDay();
        pass('DS.getCurrentDay 可用', `当前天数: ${currentDay}`);
      } catch (e) {
        fail('DS.getCurrentDay 执行失败', e.message);
      }
    } else {
      warn('DS.getCurrentDay 不存在', '无法获取当前天数');
    }
  } else {
    warn('事件系统模块未找到', '跳过事件系统功能测试');
  }

  // ========== 测试 9: 检查 NPC 系统模块 ==========
  console.log('\n📋 测试 9: NPC 系统模块功能测试');
  const npcSystem = DS.getModule('npcSystem');
  if (npcSystem) {
    // generateNPC 是直接设置在 DS 上的，不是 npcSystem 模块的方法
    if (typeof DS.generateNPC === 'function') {
      pass('DS.generateNPC 存在', '可以生成 NPC');

      // 测试生成 NPC
      try {
        const npcs = DS.generateNPC(1);
        if (Array.isArray(npcs) && npcs.length > 0) {
          pass('DS.generateNPC 功能正常', `生成了 ${npcs.length} 个 NPC`);
          console.log('   生成的 NPC 示例:', npcs[0]);
        } else {
          warn('DS.generateNPC 返回异常', `返回值: ${JSON.stringify(npcs)}`);
        }
      } catch (e) {
        fail('DS.generateNPC 执行失败', e.message);
      }
    } else {
      warn('DS.generateNPC 不存在', 'NPC 生成功能可能不可用');
    }
  } else {
    warn('NPC 系统模块未找到', '跳过 NPC 系统功能测试');
  }

  // ========== 测试 10: 检查状态栏系统模块 ==========
  console.log('\n📋 测试 10: 状态栏系统模块检查');
  const statusPanel = DS.getModule('statusPanel');
  if (statusPanel) {
    pass('statusPanel 模块已注册', '状态栏系统可用');

    const hasGetState = typeof statusPanel.getState === 'function';
    const hasUpdateDisplay = typeof statusPanel.updateDisplay === 'function';

    if (hasGetState) {
      try {
        const state = statusPanel.getState();
        pass('statusPanel.getState 可用', `状态类型: ${typeof state}`);
      } catch (e) {
        warn('statusPanel.getState 执行失败', e.message);
      }
    } else {
      warn('statusPanel.getState 不存在', '无法获取状态');
    }
  } else {
    warn('状态栏系统模块未找到', '状态栏功能可能不可用');
  }

  // ========== 测试 11: 检查知识库加载器模块 ==========
  console.log('\n📋 测试 11: 知识库加载器模块检查');
  const worldbook = DS.getModule('worldbook');
  if (worldbook) {
    pass('worldbook 模块已注册', '知识库加载器可用');

    const hasLoadWorldbook = typeof worldbook.loadWorldbook === 'function';
    if (hasLoadWorldbook) {
      pass('worldbook.loadWorldbook 存在', '可以加载知识库');
    } else {
      warn('worldbook.loadWorldbook 不存在', '知识库加载功能可能不可用');
    }
  } else {
    warn('知识库加载器模块未找到', '知识库功能可能不可用');
  }

  // ========== 测试 12: 检查初始化状态 ==========
  console.log('\n📋 测试 12: 初始化状态检查');
  if (DS.initialized !== undefined) {
    if (DS.initialized === true) {
      pass('DS.initialized 为 true', '核心系统已初始化');
    } else {
      warn('DS.initialized 为 false', '核心系统可能未完全初始化');
    }
  } else {
    warn('DS.initialized 不存在', '无法确定初始化状态');
  }

  // ========== 测试 13: 检查全局别名 ==========
  console.log('\n📋 测试 13: 全局别名检查');
  if (typeof window.DS !== 'undefined') {
    pass('window.DS 别名存在', '可以使用 DS 作为快捷方式');
  } else {
    warn('window.DS 别名不存在', '只能使用 window.detentionSystem');
  }

  // ========== 测试 14: 检查记忆增强插件集成 ==========
  console.log('\n📋 测试 14: 记忆增强插件集成检查');

  // 检查所有可能的插件名称（包括 stMemoryEnhancement）
  const pluginNames = [
    'stMemoryEnhancement',
    'MemoryEnhancement',
    'memoryEnhancement',
    'MemoryEnhancementPlugin',
    'memoryEnhancementPlugin',
  ];

  let foundPlugin = null;
  let foundPluginName = null;

  for (const name of pluginNames) {
    if (typeof window[name] !== 'undefined') {
      foundPlugin = window[name];
      foundPluginName = name;
      break;
    }
  }

  if (foundPlugin) {
    pass(`window.${foundPluginName} 存在`, '记忆增强插件已加载');
    console.log(`   插件名称: ${foundPluginName}`);
    console.log(`   插件类型: ${typeof foundPlugin}`);
    console.log(`   插件属性: ${Object.keys(foundPlugin).slice(0, 10).join(', ')}`);

    if (typeof foundPlugin.getState === 'function') {
      pass(`${foundPluginName}.getState 可用`, '可以获取插件状态');

      try {
        const pluginState = foundPlugin.getState();
        if (pluginState && typeof pluginState === 'object') {
          pass('插件状态获取成功', `状态类型: ${typeof pluginState}`);
          console.log('   插件状态示例:', {
            hasHealth: 'health' in pluginState,
            hasMental: 'mental' in pluginState,
            hasName: 'name' in pluginState,
            hasDay: 'day' in pluginState || 'days' in pluginState,
            keys: Object.keys(pluginState).slice(0, 10),
          });
        } else {
          warn('插件状态格式异常', `状态类型: ${typeof pluginState}`);
        }
      } catch (e) {
        warn(`${foundPluginName}.getState 执行失败`, e.message);
      }
    } else {
      warn(`${foundPluginName}.getState 不存在`, '插件功能可能不完整');
    }
  } else {
    warn('记忆增强插件未找到', '检查了以下名称: ' + pluginNames.join(', '));
    console.log('   提示: 如果已安装插件，请检查插件是否正确加载');
    console.log('   提示: 插件可能使用其他名称，请查看插件文档');
  }

  // 额外检查：通过状态栏系统检测插件（使用之前已声明的 statusPanel 变量）
  if (statusPanel && typeof statusPanel.getState === 'function') {
    try {
      const state = statusPanel.getState();
      if (state && typeof state === 'object') {
        console.log('   状态栏系统状态:', {
          hasHealth: 'health' in state,
          hasMental: 'mental' in state,
          hasName: 'name' in state,
          hasDay: 'day' in state || 'days' in state,
        });
      }
    } catch (e) {
      console.warn('   无法通过状态栏系统获取状态:', e.message);
    }
  }

  // ========== 测试结果汇总 ==========
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 测试结果汇总');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ 通过: ${results.passed.length} 项`);
  console.log(`❌ 失败: ${results.failed.length} 项`);
  console.log(`⚠️  警告: ${results.warnings.length} 项`);
  console.log(`📈 总计: ${results.passed.length + results.failed.length + results.warnings.length} 项`);

  if (results.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    results.failed.forEach(({ test, error, details }) => {
      console.error(`   - ${test}: ${error}${details ? ` (${details})` : ''}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:');
    results.warnings.forEach(({ test, message }) => {
      console.warn(`   - ${test}: ${message}`);
    });
  }

  // 计算通过率
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  console.log(`\n📊 通过率: ${passRate}%`);

  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('\n🎉 所有测试通过！脚本功能正常！');
  } else if (results.failed.length === 0) {
    console.log('\n✅ 核心功能正常，但有一些警告（可能是可选的模块未加载）');
  } else {
    console.log('\n⚠️  发现一些问题，请检查失败的测试项');
  }

  console.log('═══════════════════════════════════════════════════');

  // 返回测试结果对象，方便进一步分析
  return {
    summary: {
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length,
      passRate: `${passRate}%`,
    },
    details: results,
    DS: window.detentionSystem,
  };
})();
