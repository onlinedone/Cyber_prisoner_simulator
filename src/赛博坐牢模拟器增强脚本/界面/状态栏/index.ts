import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

// 从status_panel获取状态信息
function getStatusFromPanel() {
  const DS = window.detentionSystem;
  if (!DS) return null;

  const statusPanel = DS.getModule<{ getState: () => any; state: any }>('statusPanel');
  if (!statusPanel) return null;

  return statusPanel.getState ? statusPanel.getState() : statusPanel.state;
}

// 同步状态到store
function syncStatusToStore() {
  const status = getStatusFromPanel();
  if (!status) return;

  const statData = getVariables({ type: 'message', message_id: getCurrentMessageId() });
  if (!statData.stat_data) {
    statData.stat_data = {};
  }

  // 同步状态信息
  if (status.name) statData.stat_data.状态 = { ...statData.stat_data.状态, 姓名: status.name };
  if (status.age) statData.stat_data.状态 = { ...statData.stat_data.状态, 年龄: status.age };
  if (status.crime) statData.stat_data.状态 = { ...statData.stat_data.状态, 罪名: status.crime };
  if (status.health !== undefined) statData.stat_data.状态 = { ...statData.stat_data.状态, 健康: status.health };
  if (status.mental !== undefined) statData.stat_data.状态 = { ...statData.stat_data.状态, 精神: status.mental };
  if (status.strength !== undefined) statData.stat_data.状态 = { ...statData.stat_data.状态, 力量: status.strength };
  if (status.intelligence !== undefined)
    statData.stat_data.状态 = { ...statData.stat_data.状态, 智力: status.intelligence };
  if (status.days !== undefined) statData.stat_data.状态 = { ...statData.stat_data.状态, 在押天数: status.days };
  if (status.stage) statData.stat_data.状态 = { ...statData.stat_data.状态, 当前阶段: status.stage };
  if (status.cellType) statData.stat_data.状态 = { ...statData.stat_data.状态, 监室类型: status.cellType };

  // 同步外貌信息
  if (status.appearance) {
    statData.stat_data.外貌 = {
      身高: status.appearance.height || 0,
      体重: status.appearance.weight || 0,
      发型: status.appearance.hair || '未设定',
      身体状况: status.appearance.condition || '未设定',
    };
  }

  // 同步穿着信息
  if (status.clothing) {
    statData.stat_data.穿着 = {
      上衣: status.clothing.top || '未设定',
      裤子: status.clothing.bottom || '未设定',
      内衣: status.clothing.underwear || '未设定',
      内裤: status.clothing.underpants || '未设定',
      袜子: status.clothing.socks || '未设定',
      鞋子: status.clothing.shoes || '未设定',
      戒具: status.clothing.restraints || '无',
      洁净度: status.clothing.cleanliness || '整洁',
    };
  }

  // 同步心理状态
  if (status.currentTask || status.currentThought || status.biggestWorry) {
    statData.stat_data.心理 = {
      当前任务: status.currentTask || '无',
      内心想法: status.currentThought || '无',
      最大担忧: status.biggestWorry || '无',
    };
  }

  // 同步回合信息
  const DS = window.detentionSystem;
  if (DS) {
    const eventSystem = DS.getModule<{ currentRound?: number; paceMultiplier?: number }>('eventSystem');
    if (eventSystem) {
      statData.stat_data.回合 = {
        当前回合: eventSystem.currentRound || 0,
        叙事节奏: eventSystem.paceMultiplier === 0.25 ? '慢速' : eventSystem.paceMultiplier === 1.0 ? '快速' : '正常',
        节奏倍数: eventSystem.paceMultiplier || 0.5,
      };
    }
  }

  replaceVariables(statData.stat_data, { type: 'message', message_id: getCurrentMessageId() });
}

$(async () => {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));

  createApp(App).use(createPinia()).mount('#app');

  // 监听AI回复完成，同步状态
  eventOn(tavern_events.MESSAGE_RECEIVED, () => {
    setTimeout(() => {
      syncStatusToStore();
    }, 500);
  });

  // 监听状态更新事件
  const DS = window.detentionSystem;
  if (DS && DS.events) {
    DS.events.on('statusUpdated', () => {
      syncStatusToStore();
    });
  }

  // 定期同步状态（作为备用方案）
  setInterval(() => {
    syncStatusToStore();
  }, 2000);
});
