// 系统初始化检测和主角创建脚本
// 使用方法：复制此脚本到浏览器控制台执行

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 开始系统初始化检测...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let DS = null;
let 运行模式 = '降级模式(基础功能)';
let 模块状态 = {
  core: false,
  eventSystem: false,
  statusPanel: false,
  npcSystem: false,
  worldbook: false
};

// 等待系统初始化的函数
function waitForSystem(maxWait = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    const checkSystem = () => {
      if (typeof window !== 'undefined' && window.detentionSystem) {
        if (window.detentionSystem.ping && window.detentionSystem.ping()) {
          resolve(true);
          return;
        }
      }
      
      if (Date.now() - startTime < maxWait) {
        setTimeout(checkSystem, checkInterval);
      } else {
        console.warn('⚠️ 等待系统初始化超时');
        resolve(false);
      }
    };
    
    checkSystem();
  });
}

// 等待模块注册的函数
function waitForModules(maxWait = 3000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    const checkModules = () => {
      if (DS && DS.modules) {
        const moduleCount = Object.keys(DS.modules).length;
        if (moduleCount >= 4) {
          resolve(true);
          return;
        }
      }
      
      if (Date.now() - startTime < maxWait) {
        setTimeout(checkModules, checkInterval);
      } else {
        console.warn('⚠️ 等待模块注册超时');
        resolve(false);
      }
    };
    
    checkModules();
  });
}

// 主执行函数
async function initializeSystem() {
  // 等待系统初始化
  const systemReady = await waitForSystem(5000);
  
  if (!systemReady) {
    console.error('❌ 系统未就绪，无法继续');
    return;
  }
  
  // 检测核心系统
  if (typeof window !== 'undefined') {
    if (window.detentionSystem && window.detentionSystem.ping && window.detentionSystem.ping()) {
      DS = window.detentionSystem;
      模块状态.core = true;
      console.log('✅ 核心系统: 已加载');
      console.log('   版本:', DS.version || '未知');
      
      // 等待模块注册
      console.log('⏳ 等待模块注册...');
      await waitForModules(3000);
      
      // 检测各模块
      if (DS.getModule('eventSystem')) {
        模块状态.eventSystem = true;
        console.log('✅ 事件系统: 已加载');
      } else {
        console.log('❌ 事件系统: 未加载');
      }
      
      if (DS.getModule('statusPanel')) {
        模块状态.statusPanel = true;
        console.log('✅ 状态栏: 已加载');
      } else {
        console.log('❌ 状态栏: 未加载');
      }
      
      if (DS.getModule('npcSystem')) {
        模块状态.npcSystem = true;
        console.log('✅ NPC系统: 已加载');
      } else {
        console.log('❌ NPC系统: 未加载');
      }
      
      if (DS.getModule('worldbook')) {
        模块状态.worldbook = true;
        console.log('✅ 知识库加载器: 已加载');
      } else {
        console.log('❌ 知识库加载器: 未加载');
      }
      
      const 已加载模块数 = Object.values(模块状态).filter(v => v === true).length;
      if (已加载模块数 >= 2) {
        运行模式 = '外置脚本(完整功能)';
      } else if (已加载模块数 === 1) {
        运行模式 = '外置脚本(部分功能) - 仅核心系统';
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 模块加载状态汇总:');
      console.log('   运行模式:', 运行模式);
      console.log('   已加载模块数:', `${已加载模块数}/5`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 如果系统就绪，初始化主角状态
      if (运行模式 !== '降级模式(基础功能)') {
        // 随机生成主角信息
        const 姓氏列表 = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
        const 名字列表 = ['婷', '雨', '欣', '静', '芳', '莉', '娜', '敏', '洁', '萍'];
        const 罪名列表 = ['诈骗罪', '盗窃罪', '贩卖毒品罪', '故意伤害罪', '非法经营罪'];
        
        const 随机姓氏 = 姓氏列表[Math.floor(Math.random() * 姓氏列表.length)];
        const 随机名字1 = 名字列表[Math.floor(Math.random() * 名字列表.length)];
        const 随机名字2 = 名字列表[Math.floor(Math.random() * 名字列表.length)];
        const 主角姓名 = 随机姓氏 + 随机名字1 + 随机名字2;
        const 主角年龄 = 22 + Math.floor(Math.random() * 13); // 22-34岁
        const 主角罪名 = 罪名列表[Math.floor(Math.random() * 罪名列表.length)];
        const 主角身高 = 158 + Math.floor(Math.random() * 12); // 158-169cm
        const 主角体重 = 45 + Math.floor(Math.random() * 15); // 45-59kg
        
        const 主角信息 = {
          name: 主角姓名,
          age: 主角年龄,
          crime: 主角罪名,
          health: 80,
          mental: 70,
          strength: 65,
          intelligence: 70,
          appearance: {
            height: 主角身高,
            weight: 主角体重,
            hair: "黑色长发",
            condition: "身体状况良好"
          }
        };
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎭 生成主角信息:');
        console.log('   姓名:', 主角姓名);
        console.log('   年龄:', 主角年龄, '岁');
        console.log('   罪名:', 主角罪名);
        console.log('   身高:', 主角身高, 'cm');
        console.log('   体重:', 主角体重, 'kg');
        console.log('   健康:', 主角信息.health);
        console.log('   精神:', 主角信息.mental);
        console.log('   力量:', 主角信息.strength);
        console.log('   智力:', 主角信息.intelligence);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 初始化状态
        if (DS.initializeState && typeof DS.initializeState === 'function') {
          try {
            DS.initializeState(主角信息);
            console.log('✅ 主角状态已初始化');
            
            // 验证状态是否已更新
            if (模块状态.statusPanel && DS.getState && typeof DS.getState === 'function') {
              setTimeout(() => {
                const currentState = DS.getState();
                if (currentState && currentState.name === 主角姓名) {
                  console.log('✅ 状态栏已更新，主角信息已同步');
                } else {
                  console.warn('⚠️ 状态栏可能尚未更新，主角信息:', currentState);
                }
              }, 500);
            }
          } catch (error) {
            console.error('❌ 初始化主角状态失败:', error);
          }
        } else {
          console.error('❌ initializeState 方法不可用');
        }
      } else {
        console.warn('⚠️ 系统功能不完整，跳过主角初始化');
      }
    } else {
      console.error('❌ 核心系统不可用');
    }
  } else {
    console.error('❌ window 对象不可用');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ 系统初始化检测完成');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 执行初始化
initializeSystem().catch(error => {
  console.error('❌ 初始化过程出错:', error);
});
