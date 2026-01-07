<template>
  <div class="card">
    <!-- 回合信息条 -->
    <div class="round-bar">
      <span class="round-label">第</span>
      <span class="round-number">{{ store.data.回合.当前回合 }}</span>
      <span class="round-label">回合</span>
    </div>

    <div class="content-area">
      <!-- 基本信息 -->
      <div class="section">
        <div class="section-head">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">姓名:</span>
            <span class="info-value">{{ store.data.状态.姓名 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄:</span>
            <span class="info-value">{{ store.data.状态.年龄 }}岁</span>
          </div>
          <div class="info-item">
            <span class="info-label">罪名:</span>
            <span class="info-value">{{ store.data.状态.罪名 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">在押天数:</span>
            <span class="info-value">{{ store.data.状态.在押天数 }}天</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前阶段:</span>
            <span class="info-value">{{ store.data.状态.当前阶段 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">监室类型:</span>
            <span class="info-value">{{ store.data.状态.监室类型 }}</span>
          </div>
        </div>
      </div>

      <!-- 核心状态 -->
      <div class="section">
        <div class="section-head">核心状态</div>
        <div class="stat-bars">
          <StatBar label="健康" :value="store.data.状态.健康" />
          <StatBar label="精神" :value="store.data.状态.精神" />
          <StatBar label="力量" :value="store.data.状态.力量" />
          <StatBar label="智力" :value="store.data.状态.智力" />
        </div>
      </div>

      <!-- 外貌信息 -->
      <div class="section">
        <div class="section-head">外貌信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">身高:</span>
            <span class="info-value">{{ store.data.外貌.身高 }}cm</span>
          </div>
          <div class="info-item">
            <span class="info-label">体重:</span>
            <span class="info-value">{{ store.data.外貌.体重 }}kg</span>
          </div>
          <div class="info-item">
            <span class="info-label">发型:</span>
            <span class="info-value">{{ store.data.外貌.发型 }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">身体状况:</span>
            <span class="info-value">{{ store.data.外貌.身体状况 }}</span>
          </div>
        </div>
      </div>

      <!-- 穿着信息 -->
      <div class="section">
        <div class="section-head">穿着信息</div>
        <div class="attire-list">
          <div class="attire-item">
            <span class="attire-slot">【上衣】</span>
            {{ store.data.穿着.上衣 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【裤子】</span>
            {{ store.data.穿着.裤子 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【内衣】</span>
            {{ store.data.穿着.内衣 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【内裤】</span>
            {{ store.data.穿着.内裤 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【袜子】</span>
            {{ store.data.穿着.袜子 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【鞋子】</span>
            {{ store.data.穿着.鞋子 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【戒具】</span>
            {{ store.data.穿着.戒具 }}
          </div>
          <div class="attire-item">
            <span class="attire-slot">【洁净度】</span>
            {{ store.data.穿着.洁净度 }}
          </div>
        </div>
      </div>

      <!-- 心理状态 -->
      <div class="section">
        <div class="section-head">心理状态</div>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="info-label">当前任务:</span>
            <span class="info-value">{{ store.data.心理.当前任务 }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">内心想法:</span>
            <span class="info-value">{{ store.data.心理.内心想法 }}</span>
          </div>
          <div class="info-item full-width">
            <span class="info-label">最大担忧:</span>
            <span class="info-value">{{ store.data.心理.最大担忧 }}</span>
          </div>
        </div>
      </div>

      <!-- 叙事节奏 -->
      <div class="section">
        <div class="section-head">叙事节奏</div>
        <div class="pace-control">
          <div class="pace-info">
            <span class="pace-label">当前节奏:</span>
            <span class="pace-value">{{ store.data.回合.叙事节奏 }}</span>
            <span class="pace-detail">(每次推进{{ store.data.回合.节奏倍数 }}天)</span>
          </div>
          <div class="pace-buttons">
            <button
              class="pace-btn"
              :class="{ active: store.data.回合.叙事节奏 === '慢速' }"
              @click="setPace('慢速', 0.25)"
            >
              慢速 (1/4天)
            </button>
            <button
              class="pace-btn"
              :class="{ active: store.data.回合.叙事节奏 === '正常' }"
              @click="setPace('正常', 0.5)"
            >
              正常 (半天)
            </button>
            <button
              class="pace-btn"
              :class="{ active: store.data.回合.叙事节奏 === '快速' }"
              @click="setPace('快速', 1.0)"
            >
              快速 (1天)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import StatBar from './components/StatBar.vue';
import { useDataStore } from './store';

const store = useDataStore();

function setPace(pace: '慢速' | '正常' | '快速', multiplier: number) {
  store.data.回合.叙事节奏 = pace;
  store.data.回合.节奏倍数 = multiplier;

  // 同步到事件系统
  const DS = window.detentionSystem;
  if (DS && DS.setPaceMultiplier) {
    DS.setPaceMultiplier(multiplier);
  }
}

// 监听store变化，确保数据同步
watch(
  () => store.data,
  () => {
    // 数据更新时，确保显示最新信息
  },
  { deep: true },
);

onMounted(() => {
  // 从status_panel同步状态
  const DS = window.detentionSystem;
  if (DS) {
    const statusPanel = DS.getModule<{ getState: () => any; state: any }>('statusPanel');
    if (statusPanel) {
      const status = statusPanel.getState ? statusPanel.getState() : statusPanel.state;

      if (status) {
        // 更新store
        if (status.name) store.data.状态.姓名 = status.name;
        if (status.age) store.data.状态.年龄 = status.age;
        if (status.crime) store.data.状态.罪名 = status.crime;
        if (status.health !== undefined) store.data.状态.健康 = status.health;
        if (status.mental !== undefined) store.data.状态.精神 = status.mental;
        if (status.strength !== undefined) store.data.状态.力量 = status.strength;
        if (status.intelligence !== undefined) store.data.状态.智力 = status.intelligence;
        if (status.days !== undefined) store.data.状态.在押天数 = status.days;
        if (status.stage) store.data.状态.当前阶段 = status.stage;
        if (status.cellType) store.data.状态.监室类型 = status.cellType;

        if (status.appearance) {
          if (status.appearance.height) store.data.外貌.身高 = status.appearance.height;
          if (status.appearance.weight) store.data.外貌.体重 = status.appearance.weight;
          if (status.appearance.hair) store.data.外貌.发型 = status.appearance.hair;
          if (status.appearance.condition) store.data.外貌.身体状况 = status.appearance.condition;
        }

        if (status.clothing) {
          if (status.clothing.top) store.data.穿着.上衣 = status.clothing.top;
          if (status.clothing.bottom) store.data.穿着.裤子 = status.clothing.bottom;
          if (status.clothing.underwear) store.data.穿着.内衣 = status.clothing.underwear;
          if (status.clothing.underpants) store.data.穿着.内裤 = status.clothing.underpants;
          if (status.clothing.socks) store.data.穿着.袜子 = status.clothing.socks;
          if (status.clothing.shoes) store.data.穿着.鞋子 = status.clothing.shoes;
          if (status.clothing.restraints) store.data.穿着.戒具 = status.clothing.restraints;
          if (status.clothing.cleanliness) store.data.穿着.洁净度 = status.clothing.cleanliness;
        }

        if (status.currentTask) store.data.心理.当前任务 = status.currentTask;
        if (status.currentThought) store.data.心理.内心想法 = status.currentThought;
        if (status.biggestWorry) store.data.心理.最大担忧 = status.biggestWorry;
      }

      // 从事件系统获取回合信息
      const eventSystem = DS.getModule<{ currentRound?: number; paceMultiplier?: number }>('eventSystem');
      if (eventSystem) {
        if (eventSystem.currentRound !== undefined) {
          store.data.回合.当前回合 = eventSystem.currentRound;
        }
        if (eventSystem.paceMultiplier !== undefined) {
          store.data.回合.节奏倍数 = eventSystem.paceMultiplier;
          store.data.回合.叙事节奏 =
            eventSystem.paceMultiplier === 0.25 ? '慢速' : eventSystem.paceMultiplier === 1.0 ? '快速' : '正常';
        }
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  max-width: 720px;
  background-color: var(--c-mint-cream);
  border: 3px solid var(--c-granite);
  box-shadow: 5px 5px 0px rgba(60, 73, 63, 0.16);
  display: flex;
  flex-direction: column;
  font-family: var(--font-archive);
  color: var(--c-granite);
  font-size: 13px;
  line-height: 1.35;
  margin: 0 auto;
}

.round-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: var(--c-grey-olive);
  color: var(--c-mint-cream);
  font-weight: bold;
  border-bottom: 2px solid var(--c-granite);

  .round-label {
    font-size: 0.9rem;
  }

  .round-number {
    font-size: 1.2rem;
    margin: 0 4px;
  }
}

.content-area {
  padding: 12px;
  min-height: 0;
}

.section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-head {
  font-size: 0.95rem;
  border-bottom: 3px solid var(--c-celadon);
  display: inline-block;
  margin-bottom: 8px;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px dashed var(--c-ash-grey);

    &:last-child {
      border-bottom: none;
    }

    &.full-width {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .info-label {
      color: var(--c-grey-olive);
      font-size: 0.85rem;
    }

    .info-value {
      color: var(--c-granite);
      font-weight: 600;
      font-size: 0.85rem;
    }
  }
}

.stat-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attire-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 7px;
}

.attire-item {
  border: 1px solid var(--c-grey-olive);
  padding: 6px;
  font-size: 0.82rem;
  background: #fff;
}

.attire-slot {
  color: var(--c-grey-olive);
  font-size: 0.72rem;
  display: block;
  margin-bottom: 2px;
}

.pace-control {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pace-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--c-grey-olive);

  .pace-label {
    color: var(--c-grey-olive);
    font-size: 0.85rem;
  }

  .pace-value {
    color: var(--c-granite);
    font-weight: bold;
    font-size: 0.9rem;
  }

  .pace-detail {
    color: var(--c-grey-olive);
    font-size: 0.75rem;
  }
}

.pace-buttons {
  display: flex;
  gap: 8px;
}

.pace-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1.5px solid var(--c-granite);
  background: var(--c-mint-cream);
  color: var(--c-granite);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 2px 2px 0px rgba(60, 73, 63, 0.16);
  transition: all 0.2s;

  &:hover {
    background: var(--c-ash-grey);
  }

  &:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0px rgba(60, 73, 63, 0.16);
  }

  &.active {
    background: var(--c-celadon);
    color: var(--c-granite);
  }

  &:focus-visible {
    outline: 2px dashed var(--c-granite);
    outline-offset: 2px;
  }
}

@media (max-width: 600px) {
  .info-grid,
  .attire-list {
    grid-template-columns: 1fr;