<template>
  <div class="status-card">
    <div class="overlay" @click="closePanel"></div>
    <div class="status-card-content">
      <div class="header">
        <h2>📋 在押人员状态</h2>
        <div class="header-actions">
          <div class="round-info">
            <span class="round-label">第</span>
            <span class="round-number">{{ store.data.回合.当前回合 }}</span>
            <span class="round-label">回合</span>
          </div>
          <button class="close-btn" @click="closePanel" title="关闭">×</button>
        </div>
      </div>

      <div class="content">
        <!-- 基本信息 -->
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">姓名:</span>
              <span class="value">{{ store.data.状态.姓名 }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄:</span>
              <span class="value">{{ store.data.状态.年龄 }}岁</span>
            </div>
            <div class="info-item">
              <span class="label">罪名:</span>
              <span class="value">{{ store.data.状态.罪名 }}</span>
            </div>
            <div class="info-item">
              <span class="label">在押天数:</span>
              <span class="value">{{ store.data.状态.在押天数 }}天</span>
            </div>
            <div class="info-item">
              <span class="label">当前阶段:</span>
              <span class="value">{{ store.data.状态.当前阶段 }}</span>
            </div>
            <div class="info-item">
              <span class="label">监室类型:</span>
              <span class="value">{{ store.data.状态.监室类型 }}</span>
            </div>
          </div>
        </div>

        <!-- 核心状态 -->
        <div class="section">
          <h3 class="section-title">核心状态</h3>
          <div class="stat-bars">
            <StatBar label="健康" :value="store.data.状态.健康" color="#f5576c" />
            <StatBar label="精神" :value="store.data.状态.精神" color="#00f2fe" />
            <StatBar label="力量" :value="store.data.状态.力量" color="#38f9d7" />
            <StatBar label="智力" :value="store.data.状态.智力" color="#fee140" />
          </div>
        </div>

        <!-- 外貌信息 -->
        <div class="section">
          <h3 class="section-title">外貌信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">身高:</span>
              <span class="value">{{ store.data.外貌.身高 }}cm</span>
            </div>
            <div class="info-item">
              <span class="label">体重:</span>
              <span class="value">{{ store.data.外貌.体重 }}kg</span>
            </div>
            <div class="info-item">
              <span class="label">发型:</span>
              <span class="value">{{ store.data.外貌.发型 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">身体状况:</span>
              <span class="value">{{ store.data.外貌.身体状况 }}</span>
            </div>
          </div>
        </div>

        <!-- 穿着信息 -->
        <div class="section">
          <h3 class="section-title">穿着信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">上衣:</span>
              <span class="value" :data-clothing-top="store.data.穿着.上衣">{{ store.data.穿着.上衣 }}</span>
            </div>
            <div class="info-item">
              <span class="label">裤子:</span>
              <span class="value" :data-clothing-bottom="store.data.穿着.裤子">{{ store.data.穿着.裤子 }}</span>
            </div>
            <div class="info-item">
              <span class="label">内衣:</span>
              <span class="value">{{ store.data.穿着.内衣 }}</span>
            </div>
            <div class="info-item">
              <span class="label">内裤:</span>
              <span class="value">{{ store.data.穿着.内裤 }}</span>
            </div>
            <div class="info-item">
              <span class="label">袜子:</span>
              <span class="value">{{ store.data.穿着.袜子 }}</span>
            </div>
            <div class="info-item">
              <span class="label">鞋子:</span>
              <span class="value">{{ store.data.穿着.鞋子 }}</span>
            </div>
            <div class="info-item">
              <span class="label">戒具:</span>
              <span class="value">{{ store.data.穿着.戒具 }}</span>
            </div>
            <div class="info-item">
              <span class="label">洁净度:</span>
              <span class="value">{{ store.data.穿着.洁净度 }}</span>
            </div>
          </div>
        </div>

        <!-- 心理状态 -->
        <div class="section">
          <h3 class="section-title">心理状态</h3>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="label">当前任务:</span>
              <span class="value">{{ store.data.心理.当前任务 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">内心想法:</span>
              <span class="value">{{ store.data.心理.内心想法 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">最大担忧:</span>
              <span class="value">{{ store.data.心理.最大担忧 }}</span>
            </div>
          </div>
        </div>

        <!-- 回合控制 -->
        <div class="section">
          <h3 class="section-title">叙事节奏</h3>
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

function closePanel() {
  const appElement = document.getElementById('status-panel-app');
  if (appElement) {
    appElement.style.display = 'none';
  }
}

// 监听store变化，确保数据同步
watch(
  () => store.data,
  () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'App.vue:206',
        message: 'store.data变化',
        data: {
          上衣: store.data.穿着.上衣,
          裤子: store.data.穿着.裤子,
          上衣长度: store.data.穿着.上衣.length,
          裤子长度: store.data.穿着.裤子.length,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    // 数据更新时，确保显示最新信息
  },
  { deep: true },
);

onMounted(() => {
  // store 会自动从酒馆变量同步（通过 defineMvuDataStore 的 useIntervalFn）
  // 这里只需要确保初始同步即可，后续的同步由 index.ts 中的 syncStatusToStore() 和事件监听处理
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'App.vue:234',
      message: 'App.vue onMounted完成',
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'D',
    }),
  }).catch(() => {});
  // #endregion
});
</script>

<style lang="scss" scoped>
.status-card {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  font-family: var(--font-archive);
  color: #333;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
  backdrop-filter: blur(4px);
}

.status-card-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    margin: 0;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .round-info {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 8px;

    .round-label {
      color: #fff;
      font-size: 12px;
    }

    .round-number {
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      margin: 0 2px;
    }
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
  }
}

.content {
  max-height: calc(90vh - 80px);
  overflow-y: auto;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  margin: 0 0 12px 0;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
    }

    &.full-width {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .label {
      color: #666;
      font-size: 13px;
      font-weight: 500;
    }

    .value {
      color: #333;
      font-size: 13px;
      font-weight: 600;
      text-align: right;
    }
  }
}

.stat-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pace-control {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pace-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;

  .pace-label {
    color: #666;
    font-size: 13px;
  }

  .pace-value {
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
  }

  .pace-detail {
    color: #999;
    font-size: 12px;
  }
}

.pace-buttons {
  display: flex;
  gap: 8px;
}

.pace-btn {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #667eea;
  background: #fff;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  &.active {
    background: #667eea;
    color: #fff;
  }
}

.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}
</style>
