/**
 * 测试跳过天数时的打断机制
 * 在控制台中运行此脚本，测试 advanceDay 功能
 */

// 查找核心系统
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
      if (
        iframeWindow &&
        iframeWindow.detentionSystem &&
        iframeWindow.detentionSystem.ping &&
        iframeWindow.detentionSystem.ping()
      ) {
        return { DS: iframeWindow.detentionSystem, source: 'iframe' };
      }
    } catch (e) {
      // 跨域限制
    }
  }

  return null;
}

// 测试跳过天数
async function testAdvanceDay(days = 5) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     测试跳过天数打断机制                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 查找系统
  const systemInfo = findDetentionSystem();
  if (!systemInfo) {
    console.error('❌ 未找到核心系统！请确保脚本已正确加载。');
    return;
  }

  const { DS, source } = systemInfo;
  console.log(`✅ 找到核心系统 (${source})`);

  // 获取事件系统
  const eventSystem = DS.getModule('eventSystem');
  if (!eventSystem || !DS.advanceDay) {
    console.error('❌ 事件系统未加载或 advanceDay 方法不可用');
    return;
  }

  const initialDay = eventSystem.currentDay || 0;
  console.log(`📅 当前天数: ${initialDay}\n`);

  console.log(`🔄 开始跳过 ${days} 天...\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // 诊断信息
    console.log('🔍 诊断信息:');
    console.log(`   DS 对象类型: ${typeof DS}`);
    console.log(`   DS.advanceDay 类型: ${typeof DS.advanceDay}`);
    console.log(`   DS.advanceDay 是否存在: ${!!DS.advanceDay}`);

    if (!DS.advanceDay) {
      console.error('❌ DS.advanceDay 方法不存在！');
      console.log(
        '   可用的方法:',
        Object.keys(DS).filter(k => typeof DS[k] === 'function'),
      );
      return null;
    }

    console.log(`   调用参数: ${days}\n`);

    const result = DS.advanceDay(days);

    console.log('🔍 返回值诊断:');
    console.log(`   返回值类型: ${typeof result}`);
    console.log(`   返回值是否为 null: ${result === null}`);
    console.log(`   返回值是否为 undefined: ${result === undefined}`);
    console.log(`   返回值内容:`, result);
    console.log('');

    if (!result) {
      console.error('❌ 返回值是 null 或 undefined！');
      return null;
    }

    console.log('\n📊 推进结果:');
    console.log(`   是否被打断: ${result.interrupted ? '✅ 是' : '❌ 否'}`);
    console.log(`   当前天数: ${result.currentDay}`);
    console.log(`   累积事件数: ${result.accumulatedEvents?.length || 0}`);

    if (result.interrupted && result.event) {
      console.log(`\n⚠️ 打断事件:`);
      console.log(`   事件名称: ${result.event.name}`);
      console.log(`   事件ID: ${result.event.id}`);
      console.log(`   优先级: ${result.event.priority}`);
      console.log(`   触发天数: ${result.event.day || result.currentDay}`);
      console.log(`   说明: 在第 ${result.event.day || result.currentDay} 天触发了事件，立即打断`);
    }

    if (result.accumulatedEvents && result.accumulatedEvents.length > 0) {
      console.log(`\n📋 累积的事件 (${result.accumulatedEvents.length} 个):`);
      result.accumulatedEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. 第${event.day}天: ${event.name} (优先级: ${event.priority})`);
      });
    }

    // 验证打断机制
    const expectedDay = result.interrupted && result.event ? result.event.day || result.currentDay : initialDay + days;

    console.log(`\n✅ 验证结果:`);
    console.log(`   预期天数: ${expectedDay}`);
    console.log(`   实际天数: ${result.currentDay}`);

    if (result.interrupted) {
      if (result.currentDay === expectedDay) {
        console.log(`   ✅ 打断机制正常：在第 ${result.currentDay} 天触发了事件并立即打断`);
      } else {
        console.log(
          `   ⚠️ 警告：事件在第 ${result.event?.day || result.currentDay} 天触发，但当前天数是 ${result.currentDay}`,
        );
        console.log(`   这可能是正常的，如果事件触发的天数就是当前天数`);
      }
    } else if (result.currentDay === expectedDay) {
      console.log(`   ✅ 正常推进：完成了 ${days} 天的推进`);
    } else {
      console.log(`   ⚠️ 警告：预期推进到第 ${expectedDay} 天，但实际是第 ${result.currentDay} 天`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return result;
  } catch (error) {
    console.error('❌ 推进失败:', error);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

// 执行测试
console.log('💡 使用方法:');
console.log('   直接调用: testAdvanceDay(5)  // 跳过5天');
console.log('   或者使用: window.DS.advanceDay(5)  // 如果DS已暴露到全局\n');

// 暴露到全局，方便调用
window.testAdvanceDay = testAdvanceDay;

// 尝试自动找到 DS 并暴露到全局
const systemInfo = findDetentionSystem();
if (systemInfo) {
  window.DS = systemInfo.DS;
  console.log('✅ 已将 DS 暴露到全局，可以直接使用:');
  console.log('   - window.DS.advanceDay(5)');
  console.log('   - 或简写: DS.advanceDay(5)\n');
} else {
  console.warn('⚠️ 无法自动找到系统，请确保脚本已加载');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
