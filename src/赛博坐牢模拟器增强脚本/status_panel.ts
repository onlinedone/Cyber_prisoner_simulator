/**
 * 看守所模拟器 - 状态栏系统
 * 支持HTML注释格式的状态更新、缓慢变化机制、均值回归、趋势分析
 * 版本: 3.5.2
 */

// ========== 类型定义 ==========

interface ProtagonistState {
  name?: string;
  age?: number;
  crime?: string;
  health: number;
  mental: number;
  strength: number;
  intelligence: number;
  appearance?: {
    height?: number;
    weight?: number;
    hair?: string;
    condition?: string;
  };
  clothing?: {
    top?: string;
    bottom?: string;
    underwear?: string;
    underpants?: string;
    socks?: string;
    shoes?: string;
    restraints?: string;
    cleanliness?: string;
  };
  currentTask?: string;
  currentThought?: string;
  biggestWorry?: string;
  days?: number;
  stage?: string;
  cellType?: string;
}

interface StatusChange {
  value: number;
  timestamp: number;
}

interface TrendAnalysis {
  health: { value: number; trend: 'up' | 'down' | 'stable'; changes: StatusChange[] };
  mental: { value: number; trend: 'up' | 'down' | 'stable'; changes: StatusChange[] };
  strength: { value: number; trend: 'up' | 'down' | 'stable'; changes: StatusChange[] };
  intelligence: { value: number; trend: 'up' | 'down' | 'stable'; changes: StatusChange[] };
}

interface StatusPanelConfig {
  updateInterval: number;
  animationDuration: number;
  trendWindow: number;
  slowChangeThreshold: number;
  regressionRate: number;
  healthBaseline: number;
  mentalBaseline: number;
  parseRetryAttempts: number;
  parseRetryDelay: number;
  debugMode: boolean;
}

interface StatusPanelState {
  name: string;
  age: number;
  crime: string;
  health: number;
  mental: number;
  strength: number;
  intelligence: number;
  appearance: {
    height: number;
    weight: number;
    hair: string;
    condition: string;
  };
  clothing: {
    top: string;
    bottom: string;
    underwear: string;
    underpants: string;
    socks: string;
    shoes: string;
    restraints: string;
    cleanliness: string;
  };
  currentTask: string;
  currentThought: string;
  biggestWorry: string;
  days: number;
  stage: string;
  cellType: string;
  changes: {
    health: StatusChange[];
    mental: StatusChange[];
    strength: StatusChange[];
    intelligence: StatusChange[];
  };
  accumulated: {
    health: number;
    mental: number;
    strength: number;
    intelligence: number;
  };
  lastUpdate: number;
  stats: {
    totalUpdates: number;
    successfulParses: number;
    failedParses: number;
    lastParseTime: number;
  };
}

interface StatusPanelImpl {
  version: string;
  state: StatusPanelState;
  initialize(): void;
  destroy(): void;
  getState(): ProtagonistState;
  modifyValue(key: string, delta: number, reason?: string): void;
  getTrendAnalysis(): TrendAnalysis;
  getCurrentStage(): { days: number; stage: string; cellType: string };
  parseStatusUpdate(jsonStr: string, attempt?: number): boolean;
  reset(): void;
  exportData(): { version: string; timestamp: number; state: StatusPanelState };
  importData(data: { version?: string; state?: StatusPanelState }): boolean;
}

declare global {
  interface Window {
    detentionSystem?: DetentionSystem;
  }
}

interface DetentionSystem {
  version: string;
  initialized: boolean;
  modules: Record<string, unknown>;
  events: EventEmitter;
  registerModule(name: string, module: unknown): void;
  getModule<T = unknown>(name: string): T | undefined;
}

interface EventEmitter {
  on(event: string, callback: (data?: unknown) => void): void;
  off(event: string, callback: (data?: unknown) => void): void;
  emit(event: string, data?: unknown): void;
}

// ========== 状态栏系统实现 ==========

const CONFIG: StatusPanelConfig = {
  updateInterval: 500,
  animationDuration: 300,
  trendWindow: 5,
  slowChangeThreshold: 1.0,
  regressionRate: 0.005,
  healthBaseline: 70,
  mentalBaseline: 65,
  parseRetryAttempts: 3,
  parseRetryDelay: 100,
  debugMode: true,
};

const TREND_SYMBOLS = {
  up: '↑',
  down: '↓',
  stable: '●',
};

let state: StatusPanelState = {
  name: '',
  age: 0,
  crime: '',
  health: 75,
  mental: 70,
  strength: 65,
  intelligence: 70,
  appearance: {
    height: 0,
    weight: 0,
    hair: '',
    condition: '',
  },
  clothing: {
    top: '',
    bottom: '',
    underwear: '',
    underpants: '',
    socks: '',
    shoes: '',
    restraints: '无',
    cleanliness: '整洁',
  },
  currentTask: '',
  currentThought: '',
  biggestWorry: '',
  days: 0,
  stage: '刑事拘留',
  cellType: '过渡监室',
  changes: {
    health: [],
    mental: [],
    strength: [],
    intelligence: [],
  },
  accumulated: {
    health: 0,
    mental: 0,
    strength: 0,
    intelligence: 0,
  },
  lastUpdate: Date.now(),
  stats: {
    totalUpdates: 0,
    successfulParses: 0,
    failedParses: 0,
    lastParseTime: 0,
  },
};

let skipDisplayUpdate = false;
let isUpdating = false;
let mutationObserver: MutationObserver | null = null;
let updateLoopInterval: ReturnType<typeof setInterval> | null = null;

// ========== 工具函数 ==========

function debugLog(...args: unknown[]): void {
  if (CONFIG.debugMode) {
    console.log('[状态栏]', ...args);
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
  if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`;
  return `${seconds}秒`;
}

// ========== 状态管理 ==========

function recordChange(key: keyof typeof state.changes, delta: number): void {
  if (!state.changes[key]) {
    state.changes[key] = [];
  }

  state.changes[key].push({
    value: delta,
    timestamp: Date.now(),
  });

  if (state.changes[key].length > CONFIG.trendWindow) {
    state.changes[key].shift();
  }

  debugLog(`记录变化: ${key} ${delta > 0 ? '+' : ''}${delta}`);
}

function calculateTrend(key: keyof typeof state.changes): 'up' | 'down' | 'stable' {
  if (!state.changes[key] || state.changes[key].length === 0) {
    return 'stable';
  }

  const sum = state.changes[key].reduce((acc, change) => acc + change.value, 0);

  if (sum > 2) return 'up';
  if (sum < -2) return 'down';
  return 'stable';
}

function applyRegression(): void {
  const healthDelta = (CONFIG.healthBaseline - state.health) * CONFIG.regressionRate;
  if (Math.abs(healthDelta) > 0.01) {
    state.accumulated.health += healthDelta;
    if (Math.abs(state.accumulated.health) >= CONFIG.slowChangeThreshold) {
      const change = Math.floor(state.accumulated.health);
      state.health += change;
      state.accumulated.health -= change;
      recordChange('health', change);
      debugLog(`健康回归: ${change}`);
    }
  }

  const mentalDelta = (CONFIG.mentalBaseline - state.mental) * CONFIG.regressionRate;
  if (Math.abs(mentalDelta) > 0.01) {
    state.accumulated.mental += mentalDelta;
    if (Math.abs(state.accumulated.mental) >= CONFIG.slowChangeThreshold) {
      const change = Math.floor(state.accumulated.mental);
      state.mental += change;
      state.accumulated.mental -= change;
      recordChange('mental', change);
      debugLog(`精神回归: ${change}`);
    }
  }
}

function updateState(data: Partial<ProtagonistState>): void {
  if (isUpdating) {
    console.warn('[状态栏] 检测到并发更新，已忽略');
    return;
  }

  isUpdating = true;

  try {
    debugLog('开始更新状态:', data);

    state.stats.totalUpdates++;

    if (data.name !== undefined) state.name = data.name;
    if (data.age !== undefined) state.age = data.age;
    if (data.crime !== undefined) state.crime = data.crime;

    if (data.health !== undefined) {
      const delta = data.health - state.health;
      if (Math.abs(delta) >= CONFIG.slowChangeThreshold) {
        state.health = data.health;
        recordChange('health', delta);
        debugLog(`健康直接更新: ${state.health} (变化: ${delta})`);
      } else {
        state.accumulated.health += delta;
        debugLog(`健康累积变化: ${state.accumulated.health}`);
        if (Math.abs(state.accumulated.health) >= CONFIG.slowChangeThreshold) {
          const change = Math.floor(state.accumulated.health);
          state.health += change;
          state.accumulated.health -= change;
          recordChange('health', change);
          debugLog(`健康累积触发: ${state.health} (变化: ${change})`);
        }
      }
    }

    if (data.mental !== undefined) {
      const delta = data.mental - state.mental;
      if (Math.abs(delta) >= CONFIG.slowChangeThreshold) {
        state.mental = data.mental;
        recordChange('mental', delta);
        debugLog(`精神直接更新: ${state.mental} (变化: ${delta})`);
      } else {
        state.accumulated.mental += delta;
        debugLog(`精神累积变化: ${state.accumulated.mental}`);
        if (Math.abs(state.accumulated.mental) >= CONFIG.slowChangeThreshold) {
          const change = Math.floor(state.accumulated.mental);
          state.mental += change;
          state.accumulated.mental -= change;
          recordChange('mental', change);
          debugLog(`精神累积触发: ${state.mental} (变化: ${change})`);
        }
      }
    }

    if (data.strength !== undefined) {
      const delta = data.strength - state.strength;
      if (Math.abs(delta) >= CONFIG.slowChangeThreshold) {
        state.strength = data.strength;
        recordChange('strength', delta);
        debugLog(`力量直接更新: ${state.strength} (变化: ${delta})`);
      } else {
        state.accumulated.strength += delta;
        debugLog(`力量累积变化: ${state.accumulated.strength}`);
        if (Math.abs(state.accumulated.strength) >= CONFIG.slowChangeThreshold) {
          const change = Math.floor(state.accumulated.strength);
          state.strength += change;
          state.accumulated.strength -= change;
          recordChange('strength', change);
          debugLog(`力量累积触发: ${state.strength} (变化: ${change})`);
        }
      }
    }

    if (data.intelligence !== undefined) {
      const delta = data.intelligence - state.intelligence;
      if (Math.abs(delta) >= CONFIG.slowChangeThreshold) {
        state.intelligence = data.intelligence;
        recordChange('intelligence', delta);
        debugLog(`智力直接更新: ${state.intelligence} (变化: ${delta})`);
      } else {
        state.accumulated.intelligence += delta;
        debugLog(`智力累积变化: ${state.accumulated.intelligence}`);
        if (Math.abs(state.accumulated.intelligence) >= CONFIG.slowChangeThreshold) {
          const change = Math.floor(state.accumulated.intelligence);
          state.intelligence += change;
          state.accumulated.intelligence -= change;
          recordChange('intelligence', change);
          debugLog(`智力累积触发: ${state.intelligence} (变化: ${change})`);
        }
      }
    }

    if (data.appearance) {
      if (data.appearance.height !== undefined) state.appearance.height = data.appearance.height;
      if (data.appearance.weight !== undefined) state.appearance.weight = data.appearance.weight;
      if (data.appearance.hair !== undefined) state.appearance.hair = data.appearance.hair;
      if (data.appearance.condition !== undefined) state.appearance.condition = data.appearance.condition;
    }

    if (data.clothing) {
      if (data.clothing.top !== undefined) state.clothing.top = data.clothing.top;
      if (data.clothing.bottom !== undefined) state.clothing.bottom = data.clothing.bottom;
      if (data.clothing.underwear !== undefined) state.clothing.underwear = data.clothing.underwear;
      if (data.clothing.underpants !== undefined) state.clothing.underpants = data.clothing.underpants;
      if (data.clothing.socks !== undefined) state.clothing.socks = data.clothing.socks;
      if (data.clothing.shoes !== undefined) state.clothing.shoes = data.clothing.shoes;
      if (data.clothing.restraints !== undefined) state.clothing.restraints = data.clothing.restraints;
      if (data.clothing.cleanliness !== undefined) state.clothing.cleanliness = data.clothing.cleanliness;
    }

    if (data.currentTask !== undefined) state.currentTask = data.currentTask;
    if (data.currentThought !== undefined) state.currentThought = data.currentThought;
    if (data.biggestWorry !== undefined) state.biggestWorry = data.biggestWorry;

    if (data.days !== undefined) state.days = data.days;
    if (data.stage !== undefined) state.stage = data.stage;
    if (data.cellType !== undefined) state.cellType = data.cellType;

    state.lastUpdate = Date.now();

    debugLog('状态更新完成');

    updateDisplay();
  } catch (error) {
    console.error('[状态栏] 更新状态失败:', error);
  } finally {
    isUpdating = false;
  }
}

// ========== HTML注释解析 ==========

function parseCommentNode(node: Node): void {
  if (!node || node.nodeType !== Node.COMMENT_NODE) {
    return;
  }

  try {
    let content = (node as Comment).nodeValue || (node as Comment).textContent || '';
    content = content.trim();

    if (!content) {
      return;
    }

    debugLog('检测到注释节点:', content.substring(0, 100) + (content.length > 100 ? '...' : ''));

    if (content.startsWith('STATUS_UPDATE:')) {
      const jsonStr = content.substring('STATUS_UPDATE:'.length).trim();
      debugLog('提取JSON字符串:', jsonStr.substring(0, 100) + (jsonStr.length > 100 ? '...' : ''));
      parseStatusUpdate(jsonStr);
    }
  } catch (error) {
    console.error('[状态栏] 解析注释节点失败:', error);
  }
}

function parseStatusUpdate(jsonStr: string, attempt = 1): boolean {
  try {
    jsonStr = jsonStr.trim();
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    jsonStr = jsonStr.replace(/[\n\r\t]/g, '');

    debugLog(`尝试解析JSON (第${attempt}次):`, jsonStr.substring(0, 200) + (jsonStr.length > 200 ? '...' : ''));

    const data = JSON.parse(jsonStr) as Partial<ProtagonistState>;
    console.log('[状态栏] ✅ 成功解析状态更新:', data);

    state.stats.successfulParses++;
    state.stats.lastParseTime = Date.now();

    updateState(data);

    const DS = window.detentionSystem;
    if (DS && DS.events) {
      DS.events.emit('statusUpdated', data);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[状态栏] ❌ 解析失败 (尝试 ${attempt}/${CONFIG.parseRetryAttempts}):`, errorMessage);
    console.error('[状态栏] 原始JSON:', jsonStr);

    state.stats.failedParses++;

    if (attempt < CONFIG.parseRetryAttempts) {
      console.log(`[状态栏] 将在 ${CONFIG.parseRetryDelay}ms 后重试...`);
      setTimeout(() => {
        parseStatusUpdate(jsonStr, attempt + 1);
      }, CONFIG.parseRetryDelay);
      return false;
    } else {
      console.error('[状态栏] ❌ 已达到最大重试次数，放弃解析');

      const DS = window.detentionSystem;
      if (DS && DS.events) {
        DS.events.emit('parseError', {
          jsonStr,
          error: errorMessage,
          attempts: attempt,
        });
      }

      return false;
    }
  }
}

function checkForStatusUpdate(element: Element): void {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  try {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null, false);

    let node: Node | null;
    let count = 0;
    while ((node = walker.nextNode())) {
      count++;
      parseCommentNode(node);
    }

    if (count > 0) {
      debugLog(`TreeWalker 扫描完成，找到 ${count} 个注释节点`);
    }
  } catch (error) {
    console.error('[状态栏] TreeWalker 扫描失败:', error);
  }
}

// ========== UI管理 ==========

function updateElement(id: string, value: string): void {
  const element = document.getElementById(id);
  if (element && element.textContent !== value) {
    element.textContent = value;

    element.classList.remove('updated');
    setTimeout(() => {
      element.classList.add('updated');
    }, 10);

    setTimeout(() => {
      element.classList.remove('updated');
    }, 500);
  }
}

function updateStat(key: 'health' | 'mental' | 'strength' | 'intelligence', value: number): void {
  value = Math.max(0, Math.min(100, value));

  const valueElement = document.getElementById(`${key}-value`);
  if (valueElement) {
    valueElement.textContent = Math.round(value).toString();
  }

  const barElement = document.getElementById(`${key}-bar`);
  if (barElement) {
    barElement.style.width = `${value}%`;

    const statBar = barElement.closest('.stat-bar');
    if (statBar) {
      statBar.classList.remove('changed');
      setTimeout(() => {
        statBar.classList.add('changed');
      }, 10);

      setTimeout(() => {
        statBar.classList.remove('changed');
      }, 500);
    }
  }

  const trend = calculateTrend(key);
  const trendElement = document.getElementById(`${key}-trend`);
  if (trendElement) {
    trendElement.textContent = TREND_SYMBOLS[trend];
    trendElement.style.color = trend === 'up' ? '#43e97b' : trend === 'down' ? '#f5576c' : '#999';
  }
}

function updateDisplay(): void {
  if (skipDisplayUpdate) return;

  try {
    updateElement('status-name', state.name || '未设定');
    updateElement('status-age', state.age ? `${state.age}岁` : '未设定');
    updateElement('status-crime', state.crime || '未设定');
    updateElement('status-days', `${state.days}天`);
    updateElement('status-stage', state.stage);
    updateElement('status-cell', state.cellType);

    updateStat('health', state.health);
    updateStat('mental', state.mental);
    updateStat('strength', state.strength);
    updateStat('intelligence', state.intelligence);

    updateElement('status-height', state.appearance.height ? `${state.appearance.height}cm` : '未设定');
    updateElement('status-weight', state.appearance.weight ? `${state.appearance.weight}kg` : '未设定');
    updateElement('status-hair', state.appearance.hair || '未设定');
    updateElement('status-condition', state.appearance.condition || '未设定');

    updateElement('status-top', state.clothing.top || '未设定');
    updateElement('status-bottom', state.clothing.bottom || '未设定');
    updateElement('status-underwear', state.clothing.underwear || '未设定');
    updateElement('status-underpants', state.clothing.underpants || '未设定');
    updateElement('status-socks', state.clothing.socks || '未设定');
    updateElement('status-shoes', state.clothing.shoes || '未设定');
    updateElement('status-restraints', state.clothing.restraints || '无');
    updateElement('status-cleanliness', state.clothing.cleanliness || '整洁');

    updateElement('status-task', state.currentTask || '无');
    updateElement('status-thought', state.currentThought || '无');
    updateElement('status-worry', state.biggestWorry || '无');
  } catch (error) {
    console.error('[状态栏] 更新显示失败:', error);
  }
}

function addStyles(): void {
  if (document.getElementById('detention-status-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'detention-status-styles';
  style.textContent = `
    #detention-status-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 320px;
      max-height: 90vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }

    .status-header {
      background: rgba(0, 0, 0, 0.2);
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .status-header h3 {
      margin: 0;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .status-header-buttons {
      display: flex;
      gap: 8px;
    }

    .status-toggle, .status-debug-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-toggle:hover, .status-debug-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .status-content {
      max-height: calc(90vh - 60px);
      overflow-y: auto;
      padding: 16px;
    }

    .status-content::-webkit-scrollbar {
      width: 6px;
    }

    .status-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }

    .status-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .status-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    .status-section {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .status-section:last-child {
      margin-bottom: 0;
    }

    .status-section h4 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 2px solid #667eea;
      padding-bottom: 6px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .status-item:last-child {
      border-bottom: none;
    }

    .status-item.full-width {
      flex-direction: column;
      align-items: flex-start;
    }

    .status-item.full-width .value {
      width: 100%;
      margin-top: 4px;
      padding: 6px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 4px;
    }

    .status-item .label {
      color: #666;
      font-size: 13px;
      font-weight: 500;
    }

    .status-item .value {
      color: #333;
      font-size: 13px;
      font-weight: 600;
      text-align: right;
    }

    .stat-bar {
      margin-bottom: 12px;
    }

    .stat-bar:last-child {
      margin-bottom: 0;
    }

    .stat-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }

    .stat-value {
      color: #667eea;
      font-size: 14px;
    }

    .stat-trend {
      font-size: 16px;
      margin-left: 4px;
    }

    .stat-progress {
      height: 8px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .stat-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: 4px;
    }

    .stat-fill.health {
      background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-fill.mental {
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-fill.strength {
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-fill.intelligence {
      background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
    }

    .debug-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }

    .debug-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .debug-btn:hover {
      background: #764ba2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .stat-bar.changed {
      animation: pulse 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .status-item.updated {
      animation: fadeIn 0.3s ease;
    }

    @media (max-width: 768px) {
      #detention-status-panel {
        width: 280px;
        top: 10px;
        right: 10px;
      }
    }
  `;

  document.head.appendChild(style);
}

function createStatusPanel(): void {
  if (document.getElementById('detention-status-panel')) {
    console.log('[状态栏] 状态栏已存在，跳过创建');
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'detention-status-panel';
  panel.innerHTML = `
    <div class="status-header">
      <h3>📋 在押人员状态</h3>
      <div class="status-header-buttons">
        <button class="status-debug-btn" title="调试信息">🔧</button>
        <button class="status-toggle" title="折叠/展开">−</button>
      </div>
    </div>
    <div class="status-content">
      <div class="status-section basic-info">
        <h4>基本信息</h4>
        <div class="status-item">
          <span class="label">姓名:</span>
          <span class="value" id="status-name">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">年龄:</span>
          <span class="value" id="status-age">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">罪名:</span>
          <span class="value" id="status-crime">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">在押天数:</span>
          <span class="value" id="status-days">0天</span>
        </div>
        <div class="status-item">
          <span class="label">当前阶段:</span>
          <span class="value" id="status-stage">刑事拘留</span>
        </div>
        <div class="status-item">
          <span class="label">监室类型:</span>
          <span class="value" id="status-cell">过渡监室</span>
        </div>
      </div>

      <div class="status-section core-stats">
        <h4>核心状态</h4>
        <div class="stat-bar">
          <div class="stat-label">
            <span>健康</span>
            <span class="stat-value" id="health-value">75</span>
            <span class="stat-trend" id="health-trend">●</span>
          </div>
          <div class="stat-progress">
            <div class="stat-fill health" id="health-bar" style="width: 75%"></div>
          </div>
        </div>
        <div class="stat-bar">
          <div class="stat-label">
            <span>精神</span>
            <span class="stat-value" id="mental-value">70</span>
            <span class="stat-trend" id="mental-trend">●</span>
          </div>
          <div class="stat-progress">
            <div class="stat-fill mental" id="mental-bar" style="width: 70%"></div>
          </div>
        </div>
        <div class="stat-bar">
          <div class="stat-label">
            <span>力量</span>
            <span class="stat-value" id="strength-value">65</span>
            <span class="stat-trend" id="strength-trend">●</span>
          </div>
          <div class="stat-progress">
            <div class="stat-fill strength" id="strength-bar" style="width: 65%"></div>
          </div>
        </div>
        <div class="stat-bar">
          <div class="stat-label">
            <span>智力</span>
            <span class="stat-value" id="intelligence-value">70</span>
            <span class="stat-trend" id="intelligence-trend">●</span>
          </div>
          <div class="stat-progress">
            <div class="stat-fill intelligence" id="intelligence-bar" style="width: 70%"></div>
          </div>
        </div>
      </div>

      <div class="status-section appearance-info">
        <h4>外貌信息</h4>
        <div class="status-item">
          <span class="label">身高:</span>
          <span class="value" id="status-height">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">体重:</span>
          <span class="value" id="status-weight">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">发型:</span>
          <span class="value" id="status-hair">未设定</span>
        </div>
        <div class="status-item full-width">
          <span class="label">身体状况:</span>
          <span class="value" id="status-condition">未设定</span>
        </div>
      </div>

      <div class="status-section clothing-info">
        <h4>穿着信息</h4>
        <div class="status-item">
          <span class="label">上衣:</span>
          <span class="value" id="status-top">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">裤子:</span>
          <span class="value" id="status-bottom">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">内衣:</span>
          <span class="value" id="status-underwear">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">内裤:</span>
          <span class="value" id="status-underpants">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">袜子:</span>
          <span class="value" id="status-socks">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">鞋子:</span>
          <span class="value" id="status-shoes">未设定</span>
        </div>
        <div class="status-item">
          <span class="label">戒具:</span>
          <span class="value" id="status-restraints">无</span>
        </div>
        <div class="status-item">
          <span class="label">洁净度:</span>
          <span class="value" id="status-cleanliness">整洁</span>
        </div>
      </div>

      <div class="status-section psychological-info">
        <h4>心理状态</h4>
        <div class="status-item full-width">
          <span class="label">当前任务:</span>
          <span class="value" id="status-task">无</span>
        </div>
        <div class="status-item full-width">
          <span class="label">内心想法:</span>
          <span class="value" id="status-thought">无</span>
        </div>
        <div class="status-item full-width">
          <span class="label">最大担忧:</span>
          <span class="value" id="status-worry">无</span>
        </div>
      </div>

      <div class="status-section debug-info" style="display: none;">
        <h4>调试信息</h4>
        <div class="status-item">
          <span class="label">总更新次数:</span>
          <span class="value" id="debug-total-updates">0</span>
        </div>
        <div class="status-item">
          <span class="label">成功解析:</span>
          <span class="value" id="debug-success-parses">0</span>
        </div>
        <div class="status-item">
          <span class="label">失败解析:</span>
          <span class="value" id="debug-failed-parses">0</span>
        </div>
        <div class="status-item">
          <span class="label">最后更新:</span>
          <span class="value" id="debug-last-update">从未</span>
        </div>
        <div class="status-item">
          <span class="label">观察器状态:</span>
          <span class="value" id="debug-observer-status">未知</span>
        </div>
        <div class="debug-buttons">
          <button class="debug-btn" onclick="window.detentionSystem?.statusPanel?.debug?.scanAllComments()">扫描注释</button>
          <button class="debug-btn" onclick="console.log(window.detentionSystem?.statusPanel?.debug?.getDiagnostics())">诊断信息</button>
          <button class="debug-btn" onclick="window.detentionSystem?.statusPanel?.reset()">重置状态</button>
        </div>
      </div>
    </div>
  `;

  addStyles();

  document.body.appendChild(panel);

  const toggleBtn = panel.querySelector('.status-toggle');
  const content = panel.querySelector('.status-content') as HTMLElement;
  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = content.style.display === 'none';
      content.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });
  }

  const debugBtn = panel.querySelector('.status-debug-btn');
  const debugSection = panel.querySelector('.debug-info') as HTMLElement;
  if (debugBtn && debugSection) {
    debugBtn.addEventListener('click', () => {
      const isHidden = debugSection.style.display === 'none';
      debugSection.style.display = isHidden ? 'block' : 'none';
      updateDebugInfo();
    });
  }

  console.log('[状态栏] UI创建完成');
}

function updateDebugInfo(): void {
  updateElement('debug-total-updates', state.stats.totalUpdates.toString());
  updateElement('debug-success-parses', state.stats.successfulParses.toString());
  updateElement('debug-failed-parses', state.stats.failedParses.toString());

  const lastUpdate =
    state.stats.lastParseTime > 0 ? new Date(state.stats.lastParseTime).toLocaleTimeString('zh-CN') : '从未';
  updateElement('debug-last-update', lastUpdate);

  const observerStatus = mutationObserver ? '运行中' : '已停止';
  updateElement('debug-observer-status', observerStatus);
}

// ========== 监听器管理 ==========

function startCommentListener(): void {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  console.log('[状态栏] 启动HTML注释监听...');

  mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.COMMENT_NODE) {
            parseCommentNode(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            checkForStatusUpdate(node as Element);
          }
        }
      }

      if (mutation.type === 'characterData') {
        if (mutation.target.nodeType === Node.COMMENT_NODE) {
          parseCommentNode(mutation.target);
        }
      }
    }
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: false,
  });

  console.log('[状态栏] 执行初始扫描...');
  setTimeout(() => {
    checkForStatusUpdate(document.body);
  }, 1000);

  console.log('[状态栏] HTML注释监听已启动');
}

function stopCommentListener(): void {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
    console.log('[状态栏] HTML注释监听已停止');
  }
}

function startUpdateLoop(): void {
  if (updateLoopInterval) {
    clearInterval(updateLoopInterval);
  }

  updateLoopInterval = setInterval(() => {
    updateDisplay();
    applyRegression();
  }, CONFIG.updateInterval);

  debugLog('更新循环已启动');
}

function stopUpdateLoop(): void {
  if (updateLoopInterval) {
    clearInterval(updateLoopInterval);
    updateLoopInterval = null;
    debugLog('更新循环已停止');
  }
}

// ========== 状态栏API ==========

const StatusPanel: StatusPanelImpl & {
  state: StatusPanelState;
  getState(): ProtagonistState;
} = {
  version: '3.5.2',

  state,

  initialize() {
    console.log('[状态栏] 初始化状态栏系统 v3.5.2');

    createStatusPanel();
    startUpdateLoop();
    startCommentListener();

    const DS = window.detentionSystem;
    if (DS && DS.events) {
      DS.events.on('stateChanged', (data?: unknown) => {
        debugLog('状态变化事件:', data);
        if (data && typeof data === 'object') {
          updateState(data as Partial<ProtagonistState>);
        }
      });

      DS.events.on('dayAdvanced', (data?: unknown) => {
        debugLog('日期推进事件:', data);
        if (data && typeof data === 'object') {
          const d = data as { days?: number; stage?: string; cellType?: string };
          if (d.days !== undefined) state.days = d.days;
          if (d.stage !== undefined) state.stage = d.stage;
          if (d.cellType !== undefined) state.cellType = d.cellType;
          updateDisplay();
        }
      });
    }

    console.log('[状态栏] 初始化完成');
    console.log('[状态栏] 调试模式:', CONFIG.debugMode ? '开启' : '关闭');
  },

  destroy() {
    console.log('[状态栏] 开始销毁...');

    stopCommentListener();
    stopUpdateLoop();

    const panel = document.getElementById('detention-status-panel');
    if (panel) {
      panel.remove();
      console.log('[状态栏] UI已移除');
    }

    const styles = document.getElementById('detention-status-styles');
    if (styles) {
      styles.remove();
      console.log('[状态栏] 样式已移除');
    }

    const DS = window.detentionSystem;
    if (DS && DS.events) {
      DS.events.off('stateChanged', () => {});
      DS.events.off('dayAdvanced', () => {});
    }

    console.log('[状态栏] 销毁完成');
  },

  getState(): ProtagonistState {
    return {
      name: state.name,
      age: state.age,
      crime: state.crime,
      health: state.health,
      mental: state.mental,
      strength: state.strength,
      intelligence: state.intelligence,
      appearance: { ...state.appearance },
      clothing: { ...state.clothing },
      currentTask: state.currentTask,
      currentThought: state.currentThought,
      biggestWorry: state.biggestWorry,
      days: state.days,
      stage: state.stage,
      cellType: state.cellType,
    };
  },

  modifyValue(key: string, delta: number, reason = ''): void {
    if ((state as Record<string, unknown>)[key] === undefined) {
      console.error(`[状态栏] 未知的状态键: ${key}`);
      return;
    }

    const oldValue = (state as Record<string, number>)[key];
    const newValue = Math.max(0, Math.min(100, oldValue + delta));

    if (newValue !== oldValue) {
      (state as Record<string, number>)[key] = newValue;
      recordChange(key as keyof typeof state.changes, delta);

      console.log(
        `[状态栏] ${key} 变化: ${oldValue} → ${newValue} (${delta > 0 ? '+' : ''}${delta}) ${reason ? `原因: ${reason}` : ''}`,
      );

      const DS = window.detentionSystem;
      if (DS && DS.events) {
        DS.events.emit('valueChanged', {
          key,
          oldValue,
          newValue,
          delta,
          reason,
        });
      }

      updateDisplay();
    }
  },

  getTrendAnalysis(): TrendAnalysis {
    return {
      health: {
        value: state.health,
        trend: calculateTrend('health'),
        changes: state.changes.health || [],
      },
      mental: {
        value: state.mental,
        trend: calculateTrend('mental'),
        changes: state.changes.mental || [],
      },
      strength: {
        value: state.strength,
        trend: calculateTrend('strength'),
        changes: state.changes.strength || [],
      },
      intelligence: {
        value: state.intelligence,
        trend: calculateTrend('intelligence'),
        changes: state.changes.intelligence || [],
      },
    };
  },

  getCurrentStage() {
    return {
      days: state.days,
      stage: state.stage,
      cellType: state.cellType,
    };
  },

  parseStatusUpdate,

  reset() {
    state = {
      name: '',
      age: 0,
      crime: '',
      health: 75,
      mental: 70,
      strength: 65,
      intelligence: 70,
      appearance: {
        height: 0,
        weight: 0,
        hair: '',
        condition: '',
      },
      clothing: {
        top: '',
        bottom: '',
        underwear: '',
        underpants: '',
        socks: '',
        shoes: '',
        restraints: '无',
        cleanliness: '整洁',
      },
      currentTask: '',
      currentThought: '',
      biggestWorry: '',
      days: 0,
      stage: '刑事拘留',
      cellType: '过渡监室',
      changes: {
        health: [],
        mental: [],
        strength: [],
        intelligence: [],
      },
      accumulated: {
        health: 0,
        mental: 0,
        strength: 0,
        intelligence: 0,
      },
      lastUpdate: Date.now(),
      stats: {
        totalUpdates: 0,
        successfulParses: 0,
        failedParses: 0,
        lastParseTime: 0,
      },
    };

    updateDisplay();
    console.log('[状态栏] 状态已重置');
  },

  exportData() {
    return {
      version: '3.5.2',
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
    };
  },

  importData(data: { version?: string; state?: StatusPanelState }): boolean {
    if (!data || !data.state) {
      console.error('[状态栏] 无效的导入数据');
      return false;
    }

    try {
      if (data.version && data.version !== '3.5.2') {
        console.warn(`[状态栏] 数据版本不匹配: ${data.version} vs 3.5.2`);
      }

      state = data.state;

      if (!state.changes) {
        state.changes = {
          health: [],
          mental: [],
          strength: [],
          intelligence: [],
        };
      }

      if (!state.accumulated) {
        state.accumulated = {
          health: 0,
          mental: 0,
          strength: 0,
          intelligence: 0,
        };
      }

      if (!state.stats) {
        state.stats = {
          totalUpdates: 0,
          successfulParses: 0,
          failedParses: 0,
          lastParseTime: 0,
        };
      }

      state.lastUpdate = Date.now();

      updateDisplay();
      console.log('[状态栏] 数据导入成功');
      return true;
    } catch (error) {
      console.error('[状态栏] 导入数据失败:', error);
      return false;
    }
  },
};

// ========== 调试工具 ==========

function scanAllComments(): unknown[] {
  console.log('[状态栏] 开始扫描页面中的所有注释...');

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null, false);

  const comments: Array<{ content: string; fullContent: string; isStatusUpdate: boolean; length: number }> = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const content = ((node as Comment).nodeValue || (node as Comment).textContent || '').trim();
    comments.push({
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      fullContent: content,
      isStatusUpdate: content.startsWith('STATUS_UPDATE:'),
      length: content.length,
    });

    if (content.startsWith('STATUS_UPDATE:')) {
      console.log('[状态栏] ✅ 找到状态更新注释:', content.substring(0, 100));
      parseCommentNode(node);
    }
  }

  console.log(`[状态栏] 扫描完成，共找到 ${comments.length} 个注释`);
  console.log('[状态栏] 其中状态更新注释:', comments.filter(c => c.isStatusUpdate).length);
  console.table(comments);

  return comments;
}

function getDiagnostics(): {
  version: string;
  timestamp: string;
  observer: { active: boolean; status: string };
  state: { lastUpdate: string; timeSinceUpdate: number; timeSinceUpdateFormatted: string };
  stats: {
    totalUpdates: number;
    successfulParses: number;
    failedParses: number;
    successRate: string;
    lastParseTime: string;
  };
  currentState: ProtagonistState;
  config: StatusPanelConfig;
} {
  const diagnostics = {
    version: '3.5.2',
    timestamp: new Date().toLocaleString('zh-CN'),
    observer: {
      active: mutationObserver !== null,
      status: mutationObserver ? '运行中' : '已停止',
    },
    state: {
      lastUpdate: new Date(state.lastUpdate).toLocaleString('zh-CN'),
      timeSinceUpdate: Date.now() - state.lastUpdate,
      timeSinceUpdateFormatted: formatDuration(Date.now() - state.lastUpdate),
    },
    stats: {
      totalUpdates: state.stats.totalUpdates,
      successfulParses: state.stats.successfulParses,
      failedParses: state.stats.failedParses,
      successRate:
        state.stats.totalUpdates > 0
          ? `${((state.stats.successfulParses / state.stats.totalUpdates) * 100).toFixed(2)}%`
          : 'N/A',
      lastParseTime:
        state.stats.lastParseTime > 0 ? new Date(state.stats.lastParseTime).toLocaleString('zh-CN') : '从未',
    },
    currentState: StatusPanel.getState(),
    config: CONFIG,
  };

  console.log('=== 状态栏诊断信息 ===');
  console.log('版本:', diagnostics.version);
  console.log('时间:', diagnostics.timestamp);
  console.log('观察器状态:', diagnostics.observer.status);
  console.log('最后更新:', diagnostics.state.lastUpdate);
  console.log('距离上次更新:', diagnostics.state.timeSinceUpdateFormatted);
  console.log('统计信息:', diagnostics.stats);
  console.log('当前状态:', diagnostics.currentState);
  console.log('======================');

  return diagnostics;
}

// 扩展 StatusPanel 对象
(
  StatusPanel as StatusPanelImpl & {
    debug?: {
      scanAllComments: () => unknown[];
      getDiagnostics: () => ReturnType<typeof getDiagnostics>;
      parseCommentNode: (node: Node) => void;
      checkForStatusUpdate: (element: Element) => void;
    };
  }
).debug = {
  scanAllComments,
  getDiagnostics,
  parseCommentNode,
  checkForStatusUpdate,
};

// ========== 模块注册 ==========

$(() => {
  console.info('[状态栏] 脚本开始加载 v3.5.2');

  const DS = window.detentionSystem;
  if (!DS) {
    console.error('[状态栏] 核心系统未加载');
    return;
  }

  // 向核心系统暴露接口
  (
    DS as DetentionSystem & {
      getState?: () => ProtagonistState;
      modifyValue?: (key: string, delta: number, reason?: string) => void;
      getTrendAnalysis?: () => TrendAnalysis;
      getCurrentStage?: () => { days: number; stage: string; cellType: string };
      parseStatusUpdate?: (jsonStr: string) => boolean;
    }
  ).getState = () => StatusPanel.getState();
  (DS as DetentionSystem & { modifyValue?: (key: string, delta: number, reason?: string) => void }).modifyValue = (
    key: string,
    delta: number,
    reason?: string,
  ) => StatusPanel.modifyValue(key, delta, reason);
  (DS as DetentionSystem & { getTrendAnalysis?: () => TrendAnalysis }).getTrendAnalysis = () =>
    StatusPanel.getTrendAnalysis();
  (
    DS as DetentionSystem & {
      getCurrentStage?: () => { days: number; stage: string; cellType: string };
    }
  ).getCurrentStage = () => StatusPanel.getCurrentStage();
  (DS as DetentionSystem & { parseStatusUpdate?: (jsonStr: string) => boolean }).parseStatusUpdate = (
    jsonStr: string,
  ) => StatusPanel.parseStatusUpdate(jsonStr);

  // 注册模块
  DS.registerModule('statusPanel', StatusPanel);

  // 暴露到 window 对象（方便调试）
  (window.detentionSystem as DetentionSystem & { statusPanel?: StatusPanelImpl }).statusPanel = StatusPanel;

  // 等待核心系统初始化后，初始化状态栏
  DS.events.on('initialized', () => {
    console.info('[状态栏] 核心系统已初始化，开始初始化状态栏');
    setTimeout(() => {
      try {
        StatusPanel.initialize();
        console.info('[状态栏] ✓ 状态栏初始化成功');
      } catch (error) {
        console.error('[状态栏] ✗ 状态栏初始化失败:', error);
      }
    }, 500);
  });

  // 如果核心系统已经初始化，直接初始化状态栏
  if (DS.initialized) {
    setTimeout(() => {
      try {
        StatusPanel.initialize();
        console.info('[状态栏] ✓ 状态栏初始化成功');
      } catch (error) {
        console.error('[状态栏] ✗ 状态栏初始化失败:', error);
      }
    }, 500);
  }

  console.info('[状态栏] 脚本加载完成 v3.5.2');
});

// 页面卸载时清理
$(window).on('pagehide', () => {
  console.log('[状态栏] 页面即将卸载，执行清理...');
  stopCommentListener();
  stopUpdateLoop();
});
