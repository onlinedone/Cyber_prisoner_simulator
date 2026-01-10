/**
 * 记忆增强插件调试脚本
 * 使用方法：在浏览器 F12 控制台中直接粘贴并执行
 */

(function debugMemoryEnhancement() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 开始调试记忆增强插件');
  console.log('═══════════════════════════════════════════════════');

  // 检查所有可能的插件名称（包括 stMemoryEnhancement）
  const pluginNames = [
    'stMemoryEnhancement', // 实际使用的名称
    'MemoryEnhancement',
    'memoryEnhancement',
    'MemoryEnhancementPlugin',
    'memoryEnhancementPlugin',
  ];

  console.log('\n📋 检查 1: 查找插件对象');
  let foundPlugin = null;
  let foundPluginName = null;

  for (const name of pluginNames) {
    const exists = typeof window[name] !== 'undefined';
    console.log(`   ${exists ? '✅' : '❌'} window.${name}: ${exists ? '存在' : '不存在'}`);

    if (exists && !foundPlugin) {
      foundPlugin = window[name];
      foundPluginName = name;
    }
  }

  if (!foundPlugin) {
    console.log('\n❌ 未找到记忆增强插件对象');
    console.log('   检查了以下名称:', pluginNames.join(', '));
    console.log('\n💡 可能的原因:');
    console.log('   1. 插件未安装');
    console.log('   2. 插件未正确加载');
    console.log('   3. 插件使用了其他名称');
    console.log('   4. 插件在 iframe 中，需要从父窗口访问');

    // 检查 iframe
    console.log('\n📋 检查 2: 检查 iframe 环境');
    if (window.parent !== window) {
      console.log('   ⚠️  当前在 iframe 中，尝试从父窗口查找');
      for (const name of pluginNames) {
        try {
          const exists = typeof window.parent[name] !== 'undefined';
          console.log(`   ${exists ? '✅' : '❌'} window.parent.${name}: ${exists ? '存在' : '不存在'}`);
          if (exists && !foundPlugin) {
            foundPlugin = window.parent[name];
            foundPluginName = `parent.${name}`;
          }
        } catch (e) {
          console.log(`   ❌ window.parent.${name}: 无法访问 (${e.message})`);
        }
      }
    } else {
      console.log('   ✅ 当前在主窗口中');
    }

    // 检查所有 window 属性
    console.log('\n📋 检查 3: 搜索包含 "memory" 或 "Memory" 的 window 属性');
    const memoryKeys = Object.keys(window).filter(
      key => key.toLowerCase().includes('memory') || key.toLowerCase().includes('enhancement'),
    );
    if (memoryKeys.length > 0) {
      console.log('   找到以下相关属性:');
      memoryKeys.forEach(key => {
        console.log(`     - window.${key}: ${typeof window[key]}`);
      });
    } else {
      console.log('   ❌ 未找到包含 "memory" 或 "enhancement" 的属性');
    }

    console.log('\n═══════════════════════════════════════════════════');
    return { found: false, plugin: null, name: null };
  }

  console.log(`\n✅ 找到插件: window.${foundPluginName}`);
  console.log(`   类型: ${typeof foundPlugin}`);

  // 检查插件属性
  console.log('\n📋 检查 2: 插件对象属性');
  const pluginKeys = Object.keys(foundPlugin);
  console.log(`   属性数量: ${pluginKeys.length}`);
  console.log(`   属性列表: ${pluginKeys.slice(0, 20).join(', ')}${pluginKeys.length > 20 ? '...' : ''}`);

  // 检查 getState 方法
  console.log('\n📋 检查 3: getState 方法');
  if (typeof foundPlugin.getState === 'function') {
    console.log('   ✅ getState 方法存在');

    try {
      const state = foundPlugin.getState();
      console.log('   ✅ getState 执行成功');
      console.log(`   返回类型: ${typeof state}`);

      if (state && typeof state === 'object') {
        const stateKeys = Object.keys(state);
        console.log(`   状态属性数量: ${stateKeys.length}`);
        console.log(`   状态属性列表: ${stateKeys.slice(0, 20).join(', ')}${stateKeys.length > 20 ? '...' : ''}`);

        // 检查关键字段
        console.log('\n📋 检查 4: 关键状态字段');
        const keyFields = ['health', 'mental', 'name', 'age', 'day', 'days', 'stage'];
        keyFields.forEach(field => {
          const exists = field in state;
          const value = state[field];
          console.log(
            `   ${exists ? '✅' : '❌'} ${field}: ${exists ? (value !== undefined ? JSON.stringify(value).substring(0, 50) : 'undefined') : '不存在'}`,
          );
        });

        // 显示完整状态（截断）
        console.log('\n📋 检查 5: 完整状态对象（前1000字符）');
        const stateStr = JSON.stringify(state, null, 2);
        console.log(stateStr.substring(0, 1000) + (stateStr.length > 1000 ? '...' : ''));
      } else {
        console.log('   ⚠️  状态格式异常:', state);
      }
    } catch (e) {
      console.error('   ❌ getState 执行失败:', e.message);
      console.error('   错误堆栈:', e.stack);
    }
  } else {
    console.log('   ❌ getState 方法不存在');
    console.log(`   getState 类型: ${typeof foundPlugin.getState}`);
  }

  // 检查其他可能的方法
  console.log('\n📋 检查 6: 其他可能的方法');
  const possibleMethods = ['setState', 'updateState', 'save', 'load', 'clear', 'reset'];
  possibleMethods.forEach(method => {
    if (typeof foundPlugin[method] === 'function') {
      console.log(`   ✅ ${method} 方法存在`);
    }
  });

  // 检查 ext_getAllTables 方法（记忆增强插件的实际 API）
  console.log('\n📋 检查 7: ext_getAllTables 方法（记忆增强插件实际 API）');
  if (typeof foundPlugin.ext_getAllTables === 'function') {
    console.log('   ✅ ext_getAllTables 方法存在');
    try {
      const allTables = foundPlugin.ext_getAllTables();
      console.log('   ✅ ext_getAllTables 执行成功');
      console.log(`   返回类型: ${typeof allTables}`);

      if (allTables && typeof allTables === 'object') {
        const tableKeys = Object.keys(allTables);
        console.log(`   表格数量: ${tableKeys.length}`);
        console.log(`   表格名称: ${tableKeys.slice(0, 20).join(', ')}${tableKeys.length > 20 ? '...' : ''}`);

        // 查找可能包含状态数据的表格
        console.log('\n📋 检查 8: 查找状态相关表格');
        const stateRelatedTables = tableKeys.filter(
          key =>
            key.toLowerCase().includes('state') ||
            key.toLowerCase().includes('status') ||
            key.toLowerCase().includes('health') ||
            key.toLowerCase().includes('mental') ||
            key.toLowerCase().includes('character') ||
            key.toLowerCase().includes('protagonist'),
        );

        if (stateRelatedTables.length > 0) {
          console.log(`   找到 ${stateRelatedTables.length} 个可能的状态表格:`);
          stateRelatedTables.forEach(tableName => {
            const table = allTables[tableName];
            console.log(
              `     - ${tableName}: ${typeof table} (${Array.isArray(table) ? `数组，长度: ${table.length}` : typeof table})`,
            );
            if (table && typeof table === 'object' && !Array.isArray(table)) {
              const tableKeys = Object.keys(table);
              console.log(`       属性: ${tableKeys.slice(0, 10).join(', ')}${tableKeys.length > 10 ? '...' : ''}`);
            }
          });
        } else {
          console.log('   ⚠️  未找到明显包含状态数据的表格');
          // 显示所有表格的简要信息
          console.log('\n   所有表格的简要信息:');
          tableKeys.slice(0, 10).forEach(tableName => {
            const table = allTables[tableName];
            const type = Array.isArray(table) ? `数组[${table.length}]` : typeof table;
            console.log(`     - ${tableName}: ${type}`);
          });
        }

        // 尝试查找包含 health 或 mental 的数据
        console.log('\n📋 检查 9: 搜索包含 health/mental 的数据');
        let foundHealthData = false;
        for (const [tableName, tableData] of Object.entries(allTables)) {
          const searchInObject = (obj, path = '') => {
            if (obj === null || obj === undefined) return;
            if (typeof obj !== 'object') return;

            for (const [key, value] of Object.entries(obj)) {
              const currentPath = path ? `${path}.${key}` : key;
              if (key.toLowerCase().includes('health') || key.toLowerCase().includes('mental')) {
                console.log(`   ✅ 找到: ${tableName}.${currentPath} = ${JSON.stringify(value).substring(0, 100)}`);
                foundHealthData = true;
              }
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                searchInObject(value, currentPath);
              }
            }
          };

          if (Array.isArray(tableData)) {
            tableData.forEach((item, index) => {
              if (item && typeof item === 'object') {
                searchInObject(item, `[${index}]`);
              }
            });
          } else if (tableData && typeof tableData === 'object') {
            searchInObject(tableData, '');
          }
        }

        if (!foundHealthData) {
          console.log('   ⚠️  未找到包含 health/mental 的数据');
        }
      } else {
        console.log('   ⚠️  ext_getAllTables 返回格式异常:', allTables);
      }
    } catch (e) {
      console.error('   ❌ ext_getAllTables 执行失败:', e.message);
      console.error('   错误堆栈:', e.stack);
    }
  } else {
    console.log('   ❌ ext_getAllTables 方法不存在');
  }

  // 检查状态栏系统集成
  console.log('\n📋 检查 10: 状态栏系统集成');
  if (typeof window.detentionSystem !== 'undefined') {
    const DS = window.detentionSystem;
    const statusPanel = DS.getModule('statusPanel');

    if (statusPanel) {
      console.log('   ✅ 状态栏系统模块已注册');

      if (typeof statusPanel.getState === 'function') {
        try {
          const panelState = statusPanel.getState();
          console.log('   ✅ 状态栏系统可以获取状态');
          console.log(`   状态类型: ${typeof panelState}`);

          // 检查状态是否来自插件
          if (panelState && typeof panelState === 'object') {
            const hasHealth = 'health' in panelState;
            const hasMental = 'mental' in panelState;
            console.log(`   包含健康值: ${hasHealth ? '✅' : '❌'}`);
            console.log(`   包含精神值: ${hasMental ? '✅' : '❌'}`);
          }
        } catch (e) {
          console.error('   ❌ 状态栏系统获取状态失败:', e.message);
        }
      }
    } else {
      console.log('   ❌ 状态栏系统模块未注册');
    }
  } else {
    console.log('   ❌ window.detentionSystem 不存在');
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 调试结果汇总');
  console.log('═══════════════════════════════════════════════════');
  console.log(`插件对象: ${foundPlugin ? `✅ 找到 (${foundPluginName})` : '❌ 未找到'}`);
  console.log(`getState 方法: ${foundPlugin && typeof foundPlugin.getState === 'function' ? '✅ 存在' : '❌ 不存在'}`);
  console.log(`状态栏系统: ${typeof window.detentionSystem !== 'undefined' ? '✅ 存在' : '❌ 不存在'}`);
  console.log('═══════════════════════════════════════════════════');

  return {
    found: !!foundPlugin,
    plugin: foundPlugin,
    name: foundPluginName,
    hasGetState: foundPlugin && typeof foundPlugin.getState === 'function',
  };
})();
