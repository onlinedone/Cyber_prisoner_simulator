/**
 * 外置脚本系统诊断脚本
 * 在角色卡的 post_history_instructions 中运行此脚本，查看详细诊断信息
 */

(function diagnoseDetentionSystem() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 外置脚本系统诊断');
  console.log('═══════════════════════════════════════════════════');
  
  const results = {
    windowAvailable: typeof window !== 'undefined',
    documentAvailable: typeof document !== 'undefined',
    mainWindowDS: null,
    iframeDS: null,
    finalDS: null,
    modules: {},
    methods: {},
    errors: []
  };
  
  // 1. 检查 window 和 document
  console.log('\n📋 1. 环境检查');
  console.log('  window 可用:', results.windowAvailable);
  console.log('  document 可用:', results.documentAvailable);
  
  if (!results.windowAvailable) {
    console.error('  ❌ window 对象不可用，无法继续诊断');
    return results;
  }
  
  // 2. 检查主窗口的 detentionSystem
  console.log('\n📋 2. 主窗口检查');
  if (window.detentionSystem) {
    results.mainWindowDS = window.detentionSystem;
    console.log('  ✅ 主窗口找到 window.detentionSystem');
    console.log('    版本:', window.detentionSystem.version || '未知');
    console.log('    已初始化:', window.detentionSystem.initialized || false);
    console.log('    ping 方法:', typeof window.detentionSystem.ping === 'function' ? '存在' : '不存在');
    
    if (typeof window.detentionSystem.ping === 'function') {
      try {
        const pingResult = window.detentionSystem.ping();
        console.log('    ping 结果:', pingResult ? '✅ 成功' : '❌ 失败');
      } catch (e) {
        console.error('    ping 错误:', e.message);
        results.errors.push('主窗口 ping 错误: ' + e.message);
      }
    }
  } else {
    console.log('  ❌ 主窗口未找到 window.detentionSystem');
  }
  
  // 3. 检查 iframe
  console.log('\n📋 3. iframe 检查');
  if (results.documentAvailable) {
    const iframes = document.querySelectorAll('iframe');
    console.log('  找到 iframe 数量:', iframes.length);
    
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      const iframeName = iframe.name || '';
      const iframeId = iframe.id || '';
      console.log(`  iframe[${i}]: name="${iframeName}", id="${iframeId}"`);
      
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && iframeWindow.detentionSystem) {
          console.log(`    ✅ iframe[${i}] 中找到 detentionSystem`);
          if (!results.iframeDS) {
            results.iframeDS = iframeWindow.detentionSystem;
            console.log(`      版本: ${iframeWindow.detentionSystem.version || '未知'}`);
            console.log(`      已初始化: ${iframeWindow.detentionSystem.initialized || false}`);
            
            if (typeof iframeWindow.detentionSystem.ping === 'function') {
              try {
                const pingResult = iframeWindow.detentionSystem.ping();
                console.log(`      ping 结果: ${pingResult ? '✅ 成功' : '❌ 失败'}`);
              } catch (e) {
                console.error(`      ping 错误: ${e.message}`);
                results.errors.push(`iframe[${i}] ping 错误: ${e.message}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`    ⚠️ iframe[${i}] 无法访问 (跨域或权限问题): ${e.message}`);
      }
    }
  } else {
    console.log('  ⚠️ document 不可用，无法检查 iframe');
  }
  
  // 4. 确定最终使用的 DS
  console.log('\n📋 4. 确定最终 DS');
  results.finalDS = results.mainWindowDS || results.iframeDS;
  if (results.finalDS) {
    console.log('  ✅ 找到可用的 detentionSystem');
    console.log('    来源:', results.mainWindowDS ? '主窗口' : 'iframe');
  } else {
    console.log('  ❌ 未找到可用的 detentionSystem');
    return results;
  }
  
  const DS = results.finalDS;
  
  // 5. 检查 getModule 方法
  console.log('\n📋 5. getModule 方法检查');
  if (DS.getModule) {
    console.log('  ✅ getModule 存在');
    console.log('    类型:', typeof DS.getModule);
    if (typeof DS.getModule === 'function') {
      console.log('    ✅ getModule 是函数');
    } else {
      console.error('    ❌ getModule 不是函数');
      results.errors.push('getModule 不是函数');
    }
  } else {
    console.error('  ❌ getModule 不存在');
    results.errors.push('getModule 不存在');
  }
  
  // 6. 检查已注册的模块
  console.log('\n📋 6. 已注册模块检查');
  if (DS.modules) {
    const moduleNames = Object.keys(DS.modules);
    console.log('  已注册模块数量:', moduleNames.length);
    console.log('  模块列表:', moduleNames.join(', ') || '无');
    
    for (const name of ['eventSystem', 'statusPanel', 'npcSystem', 'worldbook']) {
      try {
        const module = (DS.getModule && typeof DS.getModule === 'function') ? DS.getModule(name) : null;
        results.modules[name] = module ? '已注册' : '未注册';
        console.log(`    ${name}: ${module ? '✅ 已注册' : '❌ 未注册'}`);
      } catch (e) {
        results.modules[name] = '错误: ' + e.message;
        console.error(`    ${name}: ❌ 检查出错 - ${e.message}`);
        results.errors.push(`${name} 检查错误: ${e.message}`);
      }
    }
  } else {
    console.log('  ⚠️ DS.modules 不存在');
  }
  
  // 7. 检查暴露的方法
  console.log('\n📋 7. 暴露方法检查');
  const methodsToCheck = [
    { name: 'advanceDay', module: 'eventSystem' },
    { name: 'getState', module: 'statusPanel' },
    { name: 'generateNPC', module: 'npcSystem' },
    { name: 'loadWorldbook', module: 'worldbook' }
  ];
  
  for (const { name, module } of methodsToCheck) {
    if (DS[name]) {
      const isFunction = typeof DS[name] === 'function';
      results.methods[name] = isFunction ? '存在且是函数' : '存在但不是函数';
      console.log(`  ${name} (${module}): ${isFunction ? '✅ 存在且是函数' : '❌ 存在但不是函数'}`);
    } else {
      results.methods[name] = '不存在';
      console.log(`  ${name} (${module}): ❌ 不存在`);
    }
  }
  
  // 8. 综合诊断
  console.log('\n📋 8. 综合诊断');
  const moduleCount = Object.values(results.modules).filter(v => v === '已注册').length;
  const methodCount = Object.values(results.methods).filter(v => v === '存在且是函数').length;
  
  console.log('  已注册模块数:', moduleCount, '/ 4');
  console.log('  可用方法数:', methodCount, '/ 4');
  console.log('  错误数:', results.errors.length);
  
  if (moduleCount >= 2 && methodCount >= 2) {
    console.log('  ✅ 系统状态: 正常（完整功能）');
  } else if (moduleCount >= 1 || methodCount >= 1) {
    console.log('  ⚠️ 系统状态: 部分功能可用');
  } else {
    console.log('  ❌ 系统状态: 异常（降级模式）');
  }
  
  if (results.errors.length > 0) {
    console.log('\n  ❌ 发现的错误:');
    results.errors.forEach((error, index) => {
      console.log(`    ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 诊断完成');
  console.log('═══════════════════════════════════════════════════');
  
  return results;
})();
