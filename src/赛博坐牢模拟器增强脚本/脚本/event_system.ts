export {};

/**
 * 事件系统：按日推进、法律流程、条件事件、随机事件、心理独白等。
 * 通过 registerModule 挂载到核心系统，并暴露操作方法给其他模块。
 */

type EventPriority = 1 | 2 | 3 | 4 | 5;

type Stage =
  | 'detention'
  | 'approval'
  | 'investigation'
  | 'prosecution'
  | 'trial1'
  | 'firstVerdict'
  | 'appeal'
  | 'trial2'
  | 'finalVerdict'
  | 'transfer'
  | 'execution'
  | 'deathReview'
  | 'end';

interface EventBus {
  on(event: string, callback: (data?: unknown) => void): void;
  emit(event: string, data?: unknown): void;
}

interface EventSystemExports {
  generateRandomEvent?: (context?: unknown) => EventRecord | null;
  advanceDay?: (days?: number) => unknown;
  getCurrentDay?: () => number;
  getCurrentStage?: () => unknown;
  checkCellTransfer?: () => boolean;
  setCaseComplexity?: (complexity: 'simple' | 'normal' | 'complex' | 'very_complex') => void;
  rollbackToStage?: (stage: Stage, reason?: string) => boolean;
  advanceToStage?: (stage: Stage, reason?: string) => boolean;
  setDeathPenalty?: (flag: boolean) => void;
  getEventStatistics?: () => unknown;
  exportTimeline?: () => unknown;
  importTimeline?: (data: unknown) => boolean;
  rollbackToInterruptSnapshot?: () => boolean;
}

interface DetentionSystem extends EventSystemExports {
  version: string;
  initialized: boolean;
  modules: Record<string, unknown>;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  events: EventBus;
  CacheManager: unknown;
  EventEmitter: unknown;
  ping(): boolean;
  checkTokenBudget(): unknown;
  updateTokenUsage(tokens: number): unknown;
  compressContent(content: unknown, quality?: number | null): string;
  registerModule(name: string, module: unknown): void;
  getModule<T = unknown>(name: string): T | undefined;
  handleError(error: unknown, context?: string): void;
  detectEnvironment(): unknown;
  initialize(): void;
}

interface ProtagonistState {
  health: number;
  mental: number;
  strength?: number;
  intelligence?: number;
}

interface Timeline {
  arrestDay: number;
  approvalDay: number | null;
  prosecutionDay: number | null;
  firstTrialDay: number | null;
  firstVerdictDay: number | null;
  secondTrialDay: number | null;
  finalVerdictDay: number | null;
  transferDay: number | null;
  executionDay: number | null;
}

interface EventRecord {
  id: string;
  name: string;
  type?: string;
  category?: string;
  description?: string;
  priority?: EventPriority;
  day?: number;
  stage?: Stage;
  isEnding?: boolean;
  endingType?: 'prison' | 'death';
  aiControlled?: boolean;
  text?: string;
  from?: string;
  to?: string;
  reason?: string;
}

declare global {
  interface Window {
    chat?: Array<{ mes?: string }>;
  }
}

interface EventSystemImpl {
  currentDay: number;
  lastEventDay: number;
  eventHistory: EventRecord[];
  legalTimeline: Timeline;
  currentStage: Stage;
  cellType: string;
  caseComplexity: 'simple' | 'normal' | 'complex' | 'very_complex';
  complexityMultiplier: number;
  eventCounters: Record<string, number>;
  isDeathPenalty: boolean;
  lastStageChangeDay: number;
  assignedOfficers: { police: string[]; prosecutor: string | null };
  getCurrentDayInternal(this: EventSystemImpl): number;
  readonly PRIORITY: {
    readonly LEGAL: 1;
    readonly PROCEDURAL: 2;
    readonly CONDITION: 3;
    readonly RANDOM: 4;
    readonly DAILY: 5;
  };
  legalEvents: Record<string, unknown>;
  conditionEvents: Array<any>;
  randomEvents: Record<string, Array<{ id: string; name: string; weight: number }>>;
  innerMonologues: Array<{ id: string; text: string; weight: number }>;
  initialize(this: EventSystemImpl, startDay?: number): void;
  setCaseComplexity(this: EventSystemImpl, complexity: 'simple' | 'normal' | 'complex' | 'very_complex'): void;
  checkComplexityAdjustment(this: EventSystemImpl): void;
  rollbackToStage(this: EventSystemImpl, targetStage: Stage, reason?: string): boolean;
  advanceToStage(this: EventSystemImpl, targetStage: Stage, reason?: string): boolean;
  handleUserRollback(this: EventSystemImpl, input: string): boolean;
  advanceDay(
    this: EventSystemImpl,
    days?: number,
  ): {
    interrupted: boolean;
    currentDay: number;
    tempCurrentDay?: number;
    pendingDays?: number;
    event?: EventRecord;
  };
  checkDayEvents(this: EventSystemImpl): EventRecord;
  checkLegalEvent(this: EventSystemImpl): EventRecord | null;
  checkConditionEvent(this: EventSystemImpl): EventRecord | null;
  generateRandomEvent(this: EventSystemImpl): EventRecord | null;
  generateInnerMonologue(this: EventSystemImpl): EventRecord | null;
  weightedRandom(this: EventSystemImpl, count: number, weights: number[]): number;
  getProtagonistState(this: EventSystemImpl): ProtagonistState;
  getRecentContext(this: EventSystemImpl): string;
  checkCellTransfer(this: EventSystemImpl): boolean;
  setDeathPenalty(this: EventSystemImpl, isDeathPenalty: boolean): void;
  getCurrentStageInfo(this: EventSystemImpl): unknown;
  getEventStatistics(this: EventSystemImpl): unknown;
  exportTimeline(this: EventSystemImpl): unknown;
  importTimeline(this: EventSystemImpl, data: any): boolean;
  saveStateToChatVars(this: EventSystemImpl): void;
  saveEventInterruptSnapshot(this: EventSystemImpl): void;
  rollbackToInterruptSnapshot(this: EventSystemImpl): boolean;
  confirmDayAdvancement(this: EventSystemImpl, pendingDays: number): void;
}

console.info('[事件系统] 开始加载...');

// 在 jQuery ready 时初始化，确保核心系统已创建
$(() => {
  const DS_RAW = window.detentionSystem as (DetentionSystem & EventSystemExports) | undefined;

  // 保存状态的防抖定时器
  let saveStateTimer: ReturnType<typeof setTimeout> | null = null;
  if (!DS_RAW) {
    console.error('[事件系统] 核心系统未加载');
    console.error('[事件系统] 请确保 core.ts 已正确加载');
    return;
  }

  // 类型断言：DS 一定存在
  const DS = DS_RAW as DetentionSystem & EventSystemExports;

  // ========== 记忆增强插件集成：天数获取 ==========
  /**
   * 从记忆增强插件的时空表格获取天数（唯一数据源）
   * @returns 天数，如果无法获取则返回回退值
   */
  function getCurrentDayFromMemoryEnhancement(fallback: number = 0): number {
    try {
      // 尝试通过 statusPanel 模块获取状态（它已经集成了记忆增强插件）
      const statusPanel = DS.getModule('statusPanel') as {
        getState?: () => { days?: number; day?: number };
      };

      if (statusPanel && statusPanel.getState) {
        const state = statusPanel.getState();
        if (state && (state.days !== undefined || state.day !== undefined)) {
          const dayFromMemory = state.days ?? state.day ?? fallback;
          // 调试日志已禁用以避免 CORS 错误
          return dayFromMemory;
        }
      }

      // 调试日志已禁用以避免 CORS 错误
      return fallback;
    } catch (error) {
      console.warn('[事件系统] 从记忆增强插件获取天数失败:', error);
      // 调试日志已禁用以避免 CORS 错误
      return fallback;
    }
  }

  // ---------------- 核心事件系统 ----------------
  const EventSystem: EventSystemImpl = {
    currentDay: 0, // 保留作为回退值，但实际使用时优先从记忆增强插件读取

    /**
     * 获取当前天数（从记忆增强插件读取，作为唯一数据源）
     * @returns 当前天数
     */
    getCurrentDayInternal(): number {
      return getCurrentDayFromMemoryEnhancement(this.currentDay);
    },

    lastEventDay: 0,
    eventHistory: [] as EventRecord[],
    legalTimeline: {
      arrestDay: 0,
      approvalDay: null,
      prosecutionDay: null,
      firstTrialDay: null,
      firstVerdictDay: null,
      secondTrialDay: null,
      finalVerdictDay: null,
      transferDay: null,
      executionDay: null,
    } as Timeline,
    currentStage: 'detention' as Stage,
    cellType: 'transition',

    // 案件复杂度
    caseComplexity: 'normal' as 'simple' | 'normal' | 'complex' | 'very_complex',
    complexityMultiplier: 1.0,

    // 特殊事件计数器（键名必须与事件ID匹配）
    eventCounters: {
      interrogation: 0,
      prosecutor_interrogation: 0,
      lawyer_visit: 0,
      family_visit: 0,
      medical_visit: 0,
      scene_identification: 0,
    } as Record<string, number>,

    // 死刑标记
    isDeathPenalty: false,

    // 上次阶段转换日期
    lastStageChangeDay: 0,

    // 负责案件的固定人员（公安和检察官）
    assignedOfficers: {
      police: [] as string[],
      prosecutor: null as string | null,
    },

    // 事件优先级定义
    // LEGAL: 1 - 重大法律事件（批准逮捕、起诉、开庭等）
    // PROCEDURAL: 2 - 程序性事件（提审、律师会见、家属探视）
    // CONDITION: 3 - 条件触发事件（精神崩溃、健康危机等）
    // RANDOM: 4 - 随机事件
    // DAILY: 5 - 日常事件
    PRIORITY: {
      LEGAL: 1,
      PROCEDURAL: 2,
      CONDITION: 3,
      RANDOM: 4,
      DAILY: 5,
    } as const,

    // 法律流程事件（参数化配置）
    legalEvents: {
      approval: {
        name: '批准逮捕',
        minDay: 30,
        maxDay: 37,
        stage: 'approval',
        description: '检察院批准逮捕决定',
        nextStage: 'investigation',
      },
      investigation: {
        name: '侦查羁押',
        duration: [60, 210],
        stage: 'investigation',
        description: '公安机关侦查阶段',
        nextStage: 'prosecution',
      },
      prosecution: {
        name: '审查起诉',
        duration: [30, 45],
        stage: 'prosecution',
        description: '检察院审查起诉',
        nextStage: 'trial1',
      },
      firstTrial: {
        name: '一审开庭',
        duration: [30, 45],
        stage: 'trial1',
        description: '法院一审审理',
        nextStage: 'firstVerdict',
      },
      firstVerdict: {
        name: '一审判决',
        duration: [7, 30],
        stage: 'firstVerdict',
        description: '一审判决宣告',
        nextStage: 'appeal',
      },
      appeal: {
        name: '上诉期',
        duration: [10, 10],
        stage: 'appeal',
        description: '10天上诉期',
        nextStage: 'trial2',
      },
      secondTrial: {
        name: '二审审理',
        duration: [60, 90],
        stage: 'trial2',
        description: '二审法院审理',
        nextStage: 'finalVerdict',
      },
      finalVerdict: {
        name: '终审判决',
        duration: [7, 14],
        stage: 'finalVerdict',
        description: '二审判决宣告',
        nextStage: 'transfer',
      },
      transfer: {
        name: '移送监狱',
        duration: [30, 90],
        stage: 'transfer',
        description: '移送监狱执行',
        nextStage: 'end',
      },
      deathReview: {
        name: '死刑复核',
        duration: [180, 720],
        stage: 'deathReview',
        description: '最高法院死刑复核',
        nextStage: 'execution',
      },
      execution: {
        name: '执行死刑',
        duration: [1, 7],
        stage: 'execution',
        description: '死刑执行',
        nextStage: 'end',
      },
    },

    // 条件触发事件
    conditionEvents: [
      {
        id: 'mental_breakdown',
        name: '精神崩溃',
        condition: (state: ProtagonistState) => state.mental < 20,
        weight: 100,
        description: '精神状态极度恶化，出现自杀倾向',
        checkAlways: true,
      },
      {
        id: 'health_crisis',
        name: '健康危机',
        condition: (state: ProtagonistState) => state.health < 30,
        weight: 100,
        description: '健康状况严重恶化，需要紧急医疗',
        checkAlways: true,
      },
      {
        id: 'major_twist',
        name: '重大转折',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          if (system.currentDay !== system.lastStageChangeDay) return false;
          return Math.random() < 0.15;
        },
        weight: 100,
        description: '案件出现重大转折',
        stageChangeOnly: true,
      },
      {
        id: 'evidence_reversal',
        name: '证据反转',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          if (system.currentDay !== system.lastStageChangeDay) return false;
          return Math.random() < 0.1;
        },
        weight: 100,
        description: '新证据出现，案情反转',
        stageChangeOnly: true,
      },
      {
        id: 'prosecutor_interrogation',
        name: '检察官提审',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          // 逮捕审查时（30-37天之间）100%触发一次特殊提审，会有一名检察官+2名警官参与
          // 条件：arrestDay已设置，且approvalDay为null，且在30-37天之间，且未触发过
          if (
            system.legalTimeline.arrestDay > 0 &&
            system.legalTimeline.approvalDay === null &&
            system.eventCounters.prosecutor_interrogation === 0
          ) {
            const daysInCustody = system.currentDay - system.legalTimeline.arrestDay;
            const minDays = Math.floor(30 * system.complexityMultiplier);
            const maxDays = Math.floor(37 * system.complexityMultiplier);

            // 在30-37天之间，100%触发
            if (daysInCustody >= minDays && daysInCustody <= maxDays) {
              return true;
            }
          }
          return false;
        },
        weight: 100,
        description: '检察官提审讯问（检察官+2名警官）',
        category: 'procedural',
      },
      {
        id: 'interrogation',
        name: '提审',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          // 前10天必定触发一次提审
          if (system.currentDay <= 10 && system.eventCounters.interrogation === 0) {
            const remainingDays = 10 - system.currentDay + 1;
            const requiredTriggers = 1; // 还需要触发1次

            // 如果剩余天数等于需要的触发次数，强制触发（确保必定触发）
            if (remainingDays === requiredTriggers) {
              // 调试日志已禁用以避免 CORS 错误
              return true;
            }

            // 在前10天内，提高触发概率，确保尽早触发
            // 剩余天数越少，触发概率越高
            const forcedProbability = requiredTriggers / remainingDays; // 确保在剩余天数内必定触发一次
            const shouldTrigger = Math.random() < forcedProbability;

            // 调试日志已禁用以避免 CORS 错误

            if (shouldTrigger) {
              return true;
            }
          }

          // 正常流程：需要在 investigation 阶段
          if (system.currentStage !== 'investigation') return false;

          const daysSinceApproval = system.legalTimeline.approvalDay
            ? system.currentDay - system.legalTimeline.approvalDay
            : 0;

          let baseProbability = 0.15;

          if (daysSinceApproval < 30) {
            baseProbability = 0.25;
          } else if (daysSinceApproval < 60) {
            baseProbability = 0.15;
          } else {
            baseProbability = 0.08;
          }

          const decayFactor = Math.pow(0.7, system.eventCounters.interrogation);
          const finalProbability = baseProbability * decayFactor;

          return Math.random() < finalProbability;
        },
        weight: 100,
        description: '公安机关提审讯问',
        category: 'procedural',
      },
      {
        id: 'lawyer_visit',
        name: '律师会见',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          // 进入未决犯监室前不会触发律师会见（必须在 pretrial 或 convicted 监室）
          if (system.cellType === 'transition') {
            return false;
          }

          // 提审事件触发前，不触发律师会见事件
          if (!system.eventCounters.interrogation || system.eventCounters.interrogation === 0) {
            return false;
          }

          let baseProbability = 0.03;

          const daysInCustody = system.currentDay - system.legalTimeline.arrestDay;
          if (daysInCustody <= 14) {
            baseProbability = 0.15;
          }

          if (system.legalTimeline.firstTrialDay) {
            const daysToTrial = system.legalTimeline.firstTrialDay - system.currentDay;
            if (daysToTrial > 0 && daysToTrial <= 7) {
              baseProbability = 0.3;
            }
          }

          if (system.legalTimeline.secondTrialDay) {
            const daysToTrial2 = system.legalTimeline.secondTrialDay - system.currentDay;
            if (daysToTrial2 > 0 && daysToTrial2 <= 7) {
              baseProbability = 0.25;
            }
          }

          return Math.random() < baseProbability;
        },
        weight: 90,
        description: '律师前来会见',
        category: 'procedural',
      },
      {
        id: 'family_visit',
        name: '家属探视',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          // 一审判决前不会触发家人探视
          if (!system.legalTimeline.firstVerdictDay) {
            return false;
          }

          let baseProbability = 0.05;

          if (system.isDeathPenalty) {
            baseProbability = 0.1;
          }

          const lastVisit = system.eventHistory
            .filter(e => e.id === 'family_visit')
            .sort((a, b) => (b.day ?? 0) - (a.day ?? 0))[0];

          if (lastVisit && system.currentDay - (lastVisit.day ?? 0) < 30) {
            return false;
          }

          return Math.random() < baseProbability;
        },
        weight: 85,
        description: '家属前来探视',
        category: 'procedural',
      },
      {
        id: 'medical_visit',
        name: '外出就医',
        condition: (state: ProtagonistState, system: typeof EventSystem) => {
          if (state.health >= 25) return false;

          let probability = 0;
          if (state.health < 10) {
            probability = 0.4;
          } else if (state.health < 15) {
            probability = 0.25;
          } else if (state.health < 20) {
            probability = 0.15;
          } else {
            probability = 0.08;
          }

          const lastMedical = system.eventHistory
            .filter(e => e.id === 'medical_visit')
            .sort((a, b) => (b.day ?? 0) - (a.day ?? 0))[0];

          if (lastMedical && system.currentDay - (lastMedical.day ?? 0) < 7) {
            return false;
          }

          return Math.random() < probability;
        },
        weight: 95,
        description: '健康状况严重，需外出就医',
        category: 'procedural',
      },
      {
        id: 'scene_identification',
        name: '指认现场',
        condition: (_state: ProtagonistState, system: typeof EventSystem) => {
          if (system.currentStage !== 'investigation') return false;
          if (system.eventCounters.scene_identification > 0) return false;

          const daysSinceApproval = system.legalTimeline.approvalDay
            ? system.currentDay - system.legalTimeline.approvalDay
            : 0;

          if (daysSinceApproval < 15 || daysSinceApproval > 120) {
            return false;
          }

          const baseProbability = 0.08;

          const recentContext = system.getRecentContext ? system.getRecentContext() : '';
          const keywords = ['现场', '案发地', '指认', '带回', '勘查'];
          const hasKeyword = keywords.some(kw => recentContext.includes(kw));

          const finalProbability = hasKeyword ? baseProbability * 3 : baseProbability;

          return Math.random() < finalProbability;
        },
        weight: 80,
        description: '公安机关带往案发现场指认',
        category: 'procedural',
        aiControlled: true,
      },
    ],

    // 随机事件库
    randomEvents: {
      violence: [
        { id: 'newcomer_bullying', name: '新人欺凌', weight: 30 },
        { id: 'bed_dispute', name: '床位争夺', weight: 25 },
        { id: 'food_robbery', name: '食物抢夺', weight: 20 },
        { id: 'faction_conflict', name: '派系冲突', weight: 15 },
        { id: 'revenge', name: '报复行动', weight: 10 },
      ],
      medical: [
        { id: 'epidemic', name: '传染病爆发', weight: 15 },
        { id: 'mental_illness', name: '精神疾病发作', weight: 25 },
        { id: 'chronic_disease', name: '慢性病恶化', weight: 20 },
        { id: 'injury', name: '意外受伤', weight: 20 },
        { id: 'gynecological', name: '妇科问题', weight: 10 },
        { id: 'malnutrition', name: '营养不良', weight: 10 },
      ],
      emotional: [
        { id: 'deep_friendship', name: '深度友谊建立', weight: 20 },
        { id: 'betrayal', name: '闺蜜反目', weight: 15 },
        { id: 'motherly_bond', name: '母女般关系', weight: 15 },
        { id: 'jealousy', name: '嫉妒与排挤', weight: 20 },
        { id: 'secret_sharing', name: '秘密分享', weight: 15 },
        { id: 'collective_exclusion', name: '集体排斥', weight: 10 },
        { id: 'romance', name: '恋情萌芽', weight: 5 },
      ],
      accident: [
        { id: 'facility_failure', name: '设施故障', weight: 25 },
        { id: 'safety_incident', name: '安全事故', weight: 20 },
        { id: 'external_news', name: '外部消息', weight: 30 },
        { id: 'extreme_weather', name: '极端天气', weight: 15 },
        { id: 'management_change', name: '管理变化', weight: 10 },
      ],
    },

    // 心理独白库
    innerMonologues: [
      { id: 'worry_about_family', text: '不知道家里人现在怎么样了...', weight: 20 },
      { id: 'regret_past', text: '如果当初没有做那件事就好了...', weight: 20 },
      { id: 'fear_future', text: '不知道判决会是什么结果...', weight: 18 },
      { id: 'miss_freedom', text: '好想念外面的阳光和自由...', weight: 15 },
      { id: 'self_reflection', text: '我到底是怎么走到这一步的...', weight: 12 },
      { id: 'hope_for_leniency', text: '希望法官能从轻判决...', weight: 10 },
      { id: 'worry_about_children', text: '孩子们现在还好吗...', weight: 15 },
      { id: 'fear_of_inmates', text: '这里的人看起来都很可怕...', weight: 12 },
      { id: 'loneliness', text: '从来没有感觉这么孤独过...', weight: 15 },
      { id: 'time_perception', text: '在这里，时间过得好慢...', weight: 10 },
      { id: 'dream_of_past', text: '昨晚又梦到了以前的生活...', weight: 12 },
      { id: 'worry_about_health', text: '身体越来越差了，不知道能不能撑下去...', weight: 10 },
      { id: 'guilt', text: '对不起那些被我伤害的人...', weight: 8 },
      { id: 'anger', text: '为什么只有我被抓，其他人都没事...', weight: 8 },
      { id: 'acceptance', text: '也许这就是我应得的惩罚...', weight: 7 },
      { id: 'hope_for_appeal', text: '上诉还有希望吗...', weight: 8 },
      { id: 'fear_of_death', text: '如果被判死刑怎么办...', weight: 5 },
      { id: 'nostalgia', text: '好想吃一顿家里做的饭...', weight: 10 },
    ],

    // 初始化
    initialize(startDay = 0) {
      // 尝试从聊天变量加载保存的数据
      try {
        // 检查是否有当前聊天ID，如果没有则跳过加载，避免触发 saveChat 错误
        const currentChatId =
          typeof SillyTavern !== 'undefined' && SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : null;

        if (!currentChatId) {
          console.debug('[事件系统] 没有打开的聊天文件，跳过从聊天变量加载状态');
          // 调试日志已禁用以避免 CORS 错误
          // 使用默认值
          this.currentDay = startDay;
          this.legalTimeline.arrestDay = startDay;
          this.currentStage = 'detention';
          this.cellType = 'transition';
          this.caseComplexity = 'normal';
          this.complexityMultiplier = 1.0;
          this.isDeathPenalty = false;
          this.lastStageChangeDay = startDay;
          this.lastEventDay = startDay;

          for (const key of Object.keys(this.eventCounters)) {
            this.eventCounters[key] = 0;
          }

          // 初始化固定人员
          this.assignedOfficers = {
            police: [],
            prosecutor: null,
          };

          console.info('[事件系统] 初始化完成（使用默认值，聊天文件未创建）');
          console.info(`[事件系统] 起始日期: 第${this.currentDay}天`);
          return;
        }

        // 尝试获取聊天变量，如果失败则使用默认值
        let chatVars: Record<string, any> | null = null;
        try {
          chatVars = getVariables({ type: 'chat' });
          // 验证获取到的变量是否有效
          if (!chatVars || typeof chatVars !== 'object') {
            throw new Error('聊天变量无效或为空');
          }
        } catch (getVarsError) {
          console.debug('[事件系统] 获取聊天变量失败，聊天文件可能未创建:', getVarsError);
          // 调试日志已禁用以避免 CORS 错误
          // 使用默认值
          this.currentDay = startDay;
          this.legalTimeline.arrestDay = startDay;
          this.currentStage = 'detention';
          this.cellType = 'transition';
          this.caseComplexity = 'normal';
          this.complexityMultiplier = 1.0;
          this.isDeathPenalty = false;
          this.lastStageChangeDay = startDay;
          this.lastEventDay = startDay;

          for (const key of Object.keys(this.eventCounters)) {
            this.eventCounters[key] = 0;
          }

          console.info('[事件系统] 初始化完成（使用默认值，无法获取聊天变量）');
          console.info(`[事件系统] 起始日期: 第${this.currentDay}天`);
          return;
        }

        if (chatVars && typeof chatVars === 'object') {
          const savedData = (chatVars as Record<string, unknown>).detentionSystemState as
            | {
                currentDay?: number;
                currentStage?: string;
                cellType?: string;
                legalTimeline?: Timeline;
                caseComplexity?: string;
                isDeathPenalty?: boolean;
                eventCounters?: Record<string, number>;
                eventHistory?: EventRecord[];
                lastStageChangeDay?: number;
                assignedOfficers?: { police?: string | string[] | null; prosecutor?: string | null };
              }
            | undefined;

          if (savedData && typeof savedData === 'object') {
            console.info('[事件系统] 从聊天变量加载保存的状态数据');
            this.currentDay = savedData.currentDay ?? startDay;
            this.currentStage = (savedData.currentStage as Stage) ?? 'detention';
            this.cellType = savedData.cellType ?? 'transition';
            this.caseComplexity =
              (savedData.caseComplexity as 'simple' | 'normal' | 'complex' | 'very_complex') ?? 'normal';
            this.isDeathPenalty = Boolean(savedData.isDeathPenalty);
            this.lastStageChangeDay = savedData.lastStageChangeDay ?? startDay;
            this.lastEventDay = this.currentDay;

            if (savedData.legalTimeline && typeof savedData.legalTimeline === 'object') {
              this.legalTimeline = { ...this.legalTimeline, ...savedData.legalTimeline };
            } else {
              this.legalTimeline.arrestDay = this.currentDay;
            }

            if (savedData.eventCounters && typeof savedData.eventCounters === 'object') {
              this.eventCounters = { ...this.eventCounters, ...savedData.eventCounters };
            } else {
              for (const key of Object.keys(this.eventCounters)) {
                this.eventCounters[key] = 0;
              }
            }

            if (Array.isArray(savedData.eventHistory)) {
              this.eventHistory = [...savedData.eventHistory];
            }

            if (savedData.assignedOfficers && typeof savedData.assignedOfficers === 'object') {
              // 兼容旧格式：如果police是字符串，转换为数组；如果是null，转为空数组
              const savedPolice = savedData.assignedOfficers.police;
              let policeArray: string[] = [];
              if (Array.isArray(savedPolice)) {
                policeArray = savedPolice;
              } else if (typeof savedPolice === 'string' && savedPolice) {
                policeArray = [savedPolice];
              }

              this.assignedOfficers = {
                police: policeArray,
                prosecutor: savedData.assignedOfficers.prosecutor ?? null,
              };
            } else {
              this.assignedOfficers = {
                police: [],
                prosecutor: null,
              };
            }

            console.info(`[事件系统] 已加载保存的状态: 第${this.currentDay}天`);
          } else {
            // 没有保存的数据，使用默认值
            this.currentDay = startDay;
            this.legalTimeline.arrestDay = startDay;
            this.currentStage = 'detention';
            this.cellType = 'transition';
            this.caseComplexity = 'normal';
            this.complexityMultiplier = 1.0;
            this.isDeathPenalty = false;
            this.lastStageChangeDay = startDay;
            this.lastEventDay = startDay;

            for (const key of Object.keys(this.eventCounters)) {
              this.eventCounters[key] = 0;
            }
          }
        } else {
          // 没有聊天变量，使用默认值
          this.currentDay = startDay;
          this.legalTimeline.arrestDay = startDay;
          this.currentStage = 'detention';
          this.cellType = 'transition';
          this.caseComplexity = 'normal';
          this.complexityMultiplier = 1.0;
          this.isDeathPenalty = false;
          this.lastStageChangeDay = startDay;
          this.lastEventDay = startDay;

          for (const key of Object.keys(this.eventCounters)) {
            this.eventCounters[key] = 0;
          }
        }
      } catch (error) {
        console.warn('[事件系统] 加载聊天变量失败，使用默认值:', error);
        // 加载失败，使用默认值
        this.currentDay = startDay;
        this.legalTimeline.arrestDay = startDay;
        this.currentStage = 'detention';
        this.cellType = 'transition';
        this.caseComplexity = 'normal';
        this.complexityMultiplier = 1.0;
        this.isDeathPenalty = false;
        this.lastStageChangeDay = startDay;
        this.lastEventDay = startDay;

        for (const key of Object.keys(this.eventCounters)) {
          this.eventCounters[key] = 0;
        }
      }

      console.info('[事件系统] 初始化完成');
      console.info(`[事件系统] 起始日期: 第${this.currentDay}天`);

      // 延迟保存初始状态到聊天变量，避免在角色卡加载时立即保存导致冲突
      // 只有在已经有聊天文件的情况下才保存
      setTimeout(() => {
        try {
          // 检查是否有当前聊天ID，如果有则保存，否则跳过
          const currentChatId =
            typeof SillyTavern !== 'undefined' && SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : null;

          if (currentChatId) {
            // 调试日志已禁用以避免 CORS 错误
            this.saveStateToChatVars();
          } else {
            // 调试日志已禁用以避免 CORS 错误
            console.debug('[事件系统] 初始化时无聊天ID，跳过保存状态');
          }
        } catch (error) {
          console.warn('[事件系统] 初始化后保存状态失败:', error);
        }
      }, 2000); // 延迟2秒，确保角色卡和聊天文件都已加载

      DS.events.emit('event_system_initialized', {
        day: this.currentDay,
        stage: this.currentStage,
      });
    },

    // 保存状态到聊天变量（使用防抖避免频繁保存）
    saveStateToChatVars() {
      // 清除之前的定时器
      if (saveStateTimer) {
        clearTimeout(saveStateTimer);
        saveStateTimer = null;
      }

      // 使用防抖，延迟500ms保存，避免频繁调用导致保存冲突
      // 增加延迟时间，确保酒馆的保存操作已完成
      saveStateTimer = setTimeout(() => {
        try {
          // 检查是否有当前聊天ID，如果没有则跳过保存，避免触发 saveChat 错误
          const currentChatId =
            typeof SillyTavern !== 'undefined' && SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : null;

          if (!currentChatId) {
            console.debug('[事件系统] 没有打开的聊天文件，跳过保存状态到聊天变量');
            // 调试日志已禁用以避免 CORS 错误
            saveStateTimer = null;
            return;
          }

          const stateData = {
            currentDay: this.currentDay,
            currentStage: this.currentStage,
            cellType: this.cellType,
            legalTimeline: { ...this.legalTimeline },
            caseComplexity: this.caseComplexity,
            isDeathPenalty: this.isDeathPenalty,
            eventCounters: { ...this.eventCounters },
            eventHistory: [...this.eventHistory],
            lastStageChangeDay: this.lastStageChangeDay,
            assignedOfficers: { ...this.assignedOfficers },
          };

          // 调试日志已禁用以避免 CORS 错误

          // 检查数据大小，如果太大则截断 eventHistory
          const stateDataStr = JSON.stringify(stateData);
          if (stateDataStr.length > 100000) {
            // 如果数据太大，只保留最近的50条事件历史
            console.warn('[事件系统] 状态数据过大，截断事件历史');
            const truncatedStateData = {
              ...stateData,
              eventHistory: this.eventHistory.slice(-50),
            };
            // 调试日志已禁用以避免 CORS 错误
            stateData.eventHistory = truncatedStateData.eventHistory;
          }

          // 额外检查：确保聊天变量可以访问（避免在聊天文件未创建时触发保存）
          try {
            const testChatVars = getVariables({ type: 'chat' });
            if (!testChatVars || typeof testChatVars !== 'object') {
              console.debug('[事件系统] 无法获取聊天变量，聊天文件可能未创建，跳过保存状态');
              // 调试日志已禁用以避免 CORS 错误
              saveStateTimer = null;
              return;
            }
          } catch (testError) {
            console.debug('[事件系统] 测试获取聊天变量失败，聊天文件可能未创建，跳过保存状态:', testError);
            // 调试日志已禁用以避免 CORS 错误
            saveStateTimer = null;
            return;
          }

          // 额外检查：确保聊天变量可以访问（避免在聊天文件未创建时触发保存）
          try {
            const testChatVars = getVariables({ type: 'chat' });
            if (!testChatVars || typeof testChatVars !== 'object') {
              console.debug('[事件系统] 无法获取聊天变量，聊天文件可能未创建，跳过保存状态');
              // 调试日志已禁用以避免 CORS 错误
              saveStateTimer = null;
              return;
            }
          } catch (testError) {
            console.debug('[事件系统] 测试获取聊天变量失败，聊天文件可能未创建，跳过保存状态:', testError);
            // 调试日志已禁用以避免 CORS 错误
            saveStateTimer = null;
            return;
          }

          // 使用 updateVariablesWith 而不是 replaceVariables，更安全
          // 这样可以避免完全替换变量表，只更新需要的部分
          updateVariablesWith(
            variables => {
              return { ...variables, detentionSystemState: stateData };
            },
            { type: 'chat' },
          );

          // 调试日志已禁用以避免 CORS 错误
          console.debug('[事件系统] ✓ 状态已保存到聊天变量 (防抖)');
        } catch (error) {
          // 调试日志已禁用以避免 CORS 错误
          console.warn('[事件系统] 保存状态到聊天变量失败 (updateVariablesWith):', error);
          // 如果 updateVariablesWith 失败，不再尝试 replaceVariables，避免进一步冲突
          // 因为错误可能是服务器端的，重复尝试可能导致更多问题
        }
        saveStateTimer = null;
      }, 500); // 增加到500ms延迟
    },

    setCaseComplexity(complexity: 'simple' | 'normal' | 'complex' | 'very_complex') {
      const validComplexities: Record<string, number> = {
        simple: 0.8,
        normal: 1.0,
        complex: 1.3,
        very_complex: 1.6,
      };

      if (complexity in validComplexities) {
        this.caseComplexity = complexity;
        this.complexityMultiplier = validComplexities[complexity];

        console.info(`[事件系统] 案件复杂度设置为: ${complexity} (时限倍数: ${this.complexityMultiplier})`);

        DS.events.emit('complexity_changed', {
          complexity: this.caseComplexity,
          multiplier: this.complexityMultiplier,
        });
      } else {
        console.warn(`[事件系统] 无效的复杂度: ${complexity}`);
      }
    },

    checkComplexityAdjustment() {
      if (this.currentDay % 30 !== 0) return;

      DS.events.emit('request_complexity_assessment', {
        day: this.currentDay,
        stage: this.currentStage,
        eventHistory: this.eventHistory,
      });
    },

    rollbackToStage(targetStage: Stage, reason = '特殊情况') {
      console.info(`[事件系统] 法律程序回退: ${this.currentStage} -> ${targetStage}`);
      console.info(`[事件系统] 回退原因: ${reason}`);

      const stageOrder: Stage[] = [
        'detention',
        'approval',
        'investigation',
        'prosecution',
        'trial1',
        'firstVerdict',
        'appeal',
        'trial2',
        'finalVerdict',
        'transfer',
        'execution',
      ];

      const targetIndex = stageOrder.indexOf(targetStage);
      const currentIndex = stageOrder.indexOf(this.currentStage);

      if (targetIndex === -1 || targetIndex >= currentIndex) {
        console.warn('[事件系统] 无效的回退目标或无需回退');
        return false;
      }

      const timelineKeys: Partial<Record<Stage, keyof Timeline>> = {
        approval: 'approvalDay',
        investigation: 'approvalDay',
        prosecution: 'prosecutionDay',
        trial1: 'firstTrialDay',
        firstVerdict: 'firstVerdictDay',
        appeal: 'firstVerdictDay',
        trial2: 'secondTrialDay',
        finalVerdict: 'finalVerdictDay',
        transfer: 'transferDay',
        execution: 'executionDay',
      };

      for (let i = targetIndex + 1; i < stageOrder.length; i++) {
        const stage = stageOrder[i];
        const key = timelineKeys[stage];
        if (key && this.legalTimeline[key]) {
          this.legalTimeline[key] = null as never;
        }
      }

      this.currentStage = targetStage;

      if (targetIndex <= stageOrder.indexOf('investigation')) {
        this.cellType = 'pretrial';
      }

      this.eventHistory.push({
        id: 'procedure_rollback',
        name: '程序回退',
        type: 'legal',
        day: this.currentDay,
        from: stageOrder[currentIndex],
        to: targetStage,
        reason,
      });

      DS.events.emit('procedure_rollback', {
        from: stageOrder[currentIndex],
        to: targetStage,
        reason,
        day: this.currentDay,
      });

      return true;
    },

    // 强制推进到指定阶段（向前推进，不是回退）
    advanceToStage(targetStage: Stage, reason = '用户请求强制推进') {
      console.info(`[事件系统] 强制推进阶段: ${this.currentStage} -> ${targetStage}`);
      console.info(`[事件系统] 推进原因: ${reason}`);

      const stageOrder: Stage[] = [
        'detention',
        'approval',
        'investigation',
        'prosecution',
        'trial1',
        'firstVerdict',
        'appeal',
        'trial2',
        'finalVerdict',
        'transfer',
        'execution',
      ];

      const targetIndex = stageOrder.indexOf(targetStage);
      const currentIndex = stageOrder.indexOf(this.currentStage);

      if (targetIndex === -1) {
        console.warn(`[事件系统] 无效的目标阶段: ${targetStage}`);
        return false;
      }

      if (targetIndex <= currentIndex) {
        console.warn(`[事件系统] 目标阶段 ${targetStage} 不在当前阶段 ${this.currentStage} 之后，无法推进`);
        return false;
      }

      // 设置时间线标记
      const timelineKeys: Partial<Record<Stage, keyof Timeline>> = {
        approval: 'approvalDay',
        investigation: 'approvalDay',
        prosecution: 'prosecutionDay',
        trial1: 'firstTrialDay',
        firstVerdict: 'firstVerdictDay',
        appeal: 'firstVerdictDay',
        trial2: 'secondTrialDay',
        finalVerdict: 'finalVerdictDay',
        transfer: 'transferDay',
        execution: 'executionDay',
      };

      // 设置从当前阶段到目标阶段之间的所有时间线标记
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        const stage = stageOrder[i];
        const key = timelineKeys[stage];
        if (key && !this.legalTimeline[key]) {
          // 设置为当前天数（表示已经到达这个阶段）
          (this.legalTimeline as any)[key] = this.currentDay;
        }
      }

      // 更新当前阶段
      this.currentStage = targetStage;
      this.lastStageChangeDay = this.currentDay;

      // 更新监室类型
      // 侦查阶段及之后到一审判决前：未决犯监室
      if (targetIndex >= stageOrder.indexOf('investigation') && targetIndex < stageOrder.indexOf('firstVerdict')) {
        this.cellType = 'pretrial';
      }
      // 一审判决后到执行前：已决犯监室
      if (targetIndex >= stageOrder.indexOf('firstVerdict')) {
        this.cellType = 'convicted';
      }

      // 如果是死刑执行前夕，特殊处理
      if (targetStage === 'execution') {
        this.isDeathPenalty = true;
        // 设置执行日期为当前天数
        this.legalTimeline.executionDay = this.currentDay;
      }

      // 记录事件历史
      this.eventHistory.push({
        id: 'procedure_advance',
        name: '强制阶段推进',
        type: 'legal',
        day: this.currentDay,
        from: stageOrder[currentIndex],
        to: targetStage,
        reason,
      });

      // 保存状态
      this.saveStateToChatVars();

      // 发出事件
      DS.events.emit('procedure_advance', {
        from: stageOrder[currentIndex],
        to: targetStage,
        reason,
        day: this.currentDay,
      });

      console.info(`[事件系统] ✓ 已强制推进到阶段: ${targetStage} (第${this.currentDay}天)`);

      return true;
    },

    handleUserRollback(input: string) {
      const rollbackPatterns = [
        { pattern: /回退.*?到.*?(侦查|审查起诉|一审|二审)/, stage: null as Stage | null },
        { pattern: /撤回.*?(起诉|判决)/, stage: null as Stage | null },
        { pattern: /重新.*?(侦查|审理)/, stage: null as Stage | null },
      ];

      for (const rule of rollbackPatterns) {
        const match = input.match(rule.pattern);
        if (match) {
          let targetStage: Stage | null = null;

          if (match[1].includes('侦查')) {
            targetStage = 'investigation';
          } else if (match[1].includes('审查起诉')) {
            targetStage = 'prosecution';
          } else if (match[1].includes('一审')) {
            targetStage = 'trial1';
          } else if (match[1].includes('二审')) {
            targetStage = 'trial2';
          }

          if (targetStage) {
            return this.rollbackToStage(targetStage, '用户请求');
          }
        }
      }

      return false;
    },

    advanceDay(days = 1) {
      const events: EventRecord[] = [];
      // 从记忆增强插件获取当前天数（唯一数据源）
      const startDay = this.getCurrentDayInternal();

      // 使用临时变量计算天数，不立即更新currentDay
      // 天数将在AI完成回复后通过confirmDayAdvancement确认更新
      // 从记忆增强插件获取当前天数（唯一数据源）
      let tempCurrentDay = this.getCurrentDayInternal();

      // 调试日志已禁用以避免 CORS 错误

      // 确保days是整数且>=1
      const daysToAdvance = Math.max(1, Math.floor(days));

      // 逐日判定事件，直到发生前三类事件（LEGAL, PROCEDURAL, CONDITION）打断，或者推进完所有天数
      for (let i = 0; i < daysToAdvance; i++) {
        tempCurrentDay++;
        // 注意：不立即更新 this.currentDay，而是使用临时变量
        // 只有在AI完成回复后，才会通过 confirmDayAdvancement 确认更新

        // 调试日志已禁用以避免 CORS 错误

        // 临时设置currentDay用于事件判定，但不持久化
        const originalCurrentDay = this.currentDay;
        this.currentDay = tempCurrentDay;
        this.lastEventDay = tempCurrentDay;

        // 调试日志已禁用以避免 CORS 错误

        this.checkComplexityAdjustment();

        const dayEvent = this.checkDayEvents();

        // 恢复originalCurrentDay，等待AI完成回复后再确认更新
        this.currentDay = originalCurrentDay;

        // 调试日志已禁用以避免 CORS 错误

        // 如果是第0天的事件，跳过（不应该发生）
        if (tempCurrentDay === 0 && dayEvent && dayEvent.id !== 'no_event') {
          // 调试日志已禁用以避免 CORS 错误
          continue; // 跳过第0天的事件，继续处理下一天
        }

        if (dayEvent) {
          events.push(dayEvent);

          this.eventHistory.push({
            ...dayEvent,
            day: tempCurrentDay,
          });

          if (Object.prototype.hasOwnProperty.call(this.eventCounters, dayEvent.id)) {
            this.eventCounters[dayEvent.id] = (this.eventCounters[dayEvent.id] || 0) + 1;
          }

          // 获取事件优先级
          // 前四类事件（LEGAL: 1, PROCEDURAL: 2, CONDITION: 3, RANDOM: 4）都会打断，只有日常事件（DAILY: 5）继续推进
          const eventPriority = dayEvent.priority ?? this.PRIORITY.DAILY;
          const shouldInterrupt = eventPriority <= this.PRIORITY.RANDOM;

          // 调试日志已禁用以避免 CORS 错误

          // 前四类事件（LEGAL: 1, PROCEDURAL: 2, CONDITION: 3, RANDOM: 4）应该立即打断，不再继续推进后续天数
          // 只有日常事件（DAILY: 5）继续推进，简单记录即可
          if (shouldInterrupt) {
            console.info(
              `[事件系统] 第${tempCurrentDay}天触发事件: ${dayEvent.name} (优先级: ${eventPriority})，立即打断天数推进`,
            );

            // 注意：不立即更新currentDay，而是保存待确认的天数
            // 天数将在AI完成回复后通过confirmDayAdvancement确认更新
            // 保存待确认的天数到临时变量，供后续确认使用
            const pendingDays = tempCurrentDay - startDay;

            // 保存当前状态（事件打断时的状态，使用原始currentDay）
            this.saveStateToChatVars();

            // 构建事件数据，不再包含accumulatedEvents（前几日情况已纳入提示词）
            // 在事件数据中包含待确认的天数信息
            const eventData = {
              ...dayEvent,
              day: tempCurrentDay, // 使用临时天数
              pendingDayAdvancement: pendingDays, // 待确认的天数推进
              startDay, // 起始天数
            };
            DS.events.emit('event_triggered', eventData);

            // 调试日志已禁用以避免 CORS 错误

            const result = {
              interrupted: true,
              currentDay: this.currentDay, // 返回原始currentDay
              tempCurrentDay, // 返回临时天数供参考
              pendingDays, // 待确认的天数
              event: { ...dayEvent, day: tempCurrentDay },
            };

            // 调试日志已禁用以避免 CORS 错误

            return result;
          } else {
            // 非打断事件（DAILY: 5）继续推进，不打断
            // 注意：RANDOM事件也会打断，所以这里只有DAILY事件会继续
            console.debug(
              `[事件系统] 第${tempCurrentDay}天触发事件: ${dayEvent.name} (优先级: ${eventPriority})，继续推进`,
            );
            // 调试日志已禁用以避免 CORS 错误
          }
        } else {
          // 调试日志已禁用以避免 CORS 错误
        }
      }

      // 调试日志已禁用以避免 CORS 错误

      // 循环结束，检查是否有前四类事件打断（LEGAL, PROCEDURAL, CONDITION, RANDOM）
      const interruptedEvent = events.find(e => {
        const priority = e.priority ?? this.PRIORITY.DAILY;
        return priority <= this.PRIORITY.RANDOM;
      });

      // 保存状态到聊天变量（使用原始currentDay）
      this.saveStateToChatVars();

      // 计算待确认的天数推进
      const pendingDays = tempCurrentDay - startDay;

      // 如果有前四类事件，返回打断结果
      if (interruptedEvent) {
        return {
          interrupted: true,
          currentDay: this.currentDay, // 返回原始currentDay
          tempCurrentDay, // 返回临时天数供参考
          pendingDays, // 待确认的天数
          event: { ...interruptedEvent, day: tempCurrentDay },
        };
      }

      // 没有打断事件，返回推进结果
      // 注意：天数不会立即更新，需要等待AI完成回复后通过confirmDayAdvancement确认
      return {
        interrupted: false,
        currentDay: this.currentDay, // 返回原始currentDay
        tempCurrentDay, // 返回临时天数供参考
        pendingDays, // 待确认的天数
      };
    },

    checkDayEvents(): EventRecord {
      // 调试日志已禁用以避免 CORS 错误

      // 第0天不应该发生任何事件
      if (this.currentDay === 0) {
        // 调试日志已禁用以避免 CORS 错误
        return {
          id: 'no_event',
          name: '无事件',
          type: 'daily',
          description: '第0天不触发事件',
          priority: this.PRIORITY.DAILY,
          day: 0,
        };
      }

      // 获取当前日期（用于生成打断模板）
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();

      // 1. 优先检查监室转移（重大法律事件，第一优先级）
      const cellTransferResult = this.checkCellTransfer();
      if (cellTransferResult) {
        // 监室转移是一个特殊事件，优先级设为 LEGAL（与重大法律事件同级）
        // 调试日志已禁用以避免 CORS 错误

        // 获取监室转移的中文名称
        const cellTypeNames: Record<string, string> = {
          transition: '过渡监室',
          pretrial: '未决犯监室',
          convicted: '已决犯监室',
        };
        const fromCellName = cellTypeNames['transition'] || '过渡监室';
        const toCellName = cellTypeNames[this.cellType] || '未决犯监室';

        return {
          id: 'cell_transfer',
          name: '监室转移',
          type: 'legal',
          description: `从${fromCellName}转移至${toCellName}`,
          priority: this.PRIORITY.LEGAL,
          day: this.currentDay,
          from: 'transition',
          to: this.cellType,
          reason: '过渡期结束',
          text: `${month}月${day}日，触发了监室转移事件。请描述从上次回复到事件发生前这一段时间内主角的主要经历和状态变化，并在事件即将开始时结束（不要描述事件本身，只描述事件发生前的准备和状态）。`,
        };
      }

      // 2. 检查重大法律事件（第二优先级）
      const legalEvent = this.checkLegalEvent();
      if (legalEvent) {
        // 调试日志已禁用以避免 CORS 错误
        return {
          ...legalEvent,
          priority: this.PRIORITY.LEGAL,
          day: this.currentDay,
          text: `${month}月${day}日，触发了${legalEvent.name}事件。请描述从上次回复到事件发生前这一段时间内主角的主要经历和状态变化，并在事件即将开始时结束（不要描述事件本身，只描述事件发生前的准备和状态）。`,
        };
      }

      // 3. 检查特殊触发性事件（程序性事件和条件触发事件，第三优先级）
      const conditionEvent = this.checkConditionEvent();
      if (conditionEvent) {
        // 判断是否为程序性事件（提审、律师会见、家属探视、检察官提审）
        const isProcedural =
          conditionEvent.id === 'interrogation' ||
          conditionEvent.id === 'lawyer_visit' ||
          conditionEvent.id === 'family_visit' ||
          conditionEvent.id === 'prosecutor_interrogation';

        const eventPriority = isProcedural ? this.PRIORITY.PROCEDURAL : this.PRIORITY.CONDITION;

        // 处理提审和检察官提审事件：生成并保存固定人员姓名
        if (conditionEvent.id === 'interrogation' || conditionEvent.id === 'prosecutor_interrogation') {
          const policeNames = ['张警官', '李警官', '王警官', '刘警官', '陈警官', '赵警官', '孙警官', '周警官'];
          const prosecutorNames = ['张检察官', '李检察官', '王检察官', '刘检察官', '陈检察官', '赵检察官'];

          // 如果是检察官提审（30-37天之间的特殊提审），确保有1名检察官+2名警官
          if (conditionEvent.id === 'prosecutor_interrogation') {
            // 如果还没有分配2名警官，生成2名固定的警官姓名
            if (this.assignedOfficers.police.length < 2) {
              const usedNames = new Set(this.assignedOfficers.police);
              while (this.assignedOfficers.police.length < 2) {
                const availableNames = policeNames.filter(name => !usedNames.has(name));
                if (availableNames.length === 0) break;
                const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
                this.assignedOfficers.police.push(selectedName);
                usedNames.add(selectedName);
              }
              console.info(`[事件系统] 已分配固定警官: ${this.assignedOfficers.police.join('、')}`);
            }

            // 如果还没有分配检察官，生成一个固定的检察官姓名
            if (!this.assignedOfficers.prosecutor) {
              this.assignedOfficers.prosecutor = prosecutorNames[Math.floor(Math.random() * prosecutorNames.length)];
              console.info(`[事件系统] 已分配固定检察官: ${this.assignedOfficers.prosecutor}`);
            }

            // 更新事件描述：检察官+2名警官
            conditionEvent.description = `检察官提审讯问（${this.assignedOfficers.prosecutor}负责，${this.assignedOfficers.police.join('、')}协助）`;
          }
          // 如果是普通提审
          else if (conditionEvent.id === 'interrogation') {
            // 确保至少有2名警官
            if (this.assignedOfficers.police.length < 2) {
              const usedNames = new Set(this.assignedOfficers.police);
              while (this.assignedOfficers.police.length < 2) {
                const availableNames = policeNames.filter(name => !usedNames.has(name));
                if (availableNames.length === 0) break;
                const selectedName = availableNames[Math.floor(Math.random() * availableNames.length)];
                this.assignedOfficers.police.push(selectedName);
                usedNames.add(selectedName);
              }
              console.info(`[事件系统] 已分配固定警官: ${this.assignedOfficers.police.join('、')}`);
            }

            // 羁押审查和起诉阶段，每次提审有50%概率有检察官参与
            const hasApproval = this.legalTimeline.approvalDay !== null;
            const beforeFirstTrial =
              !this.legalTimeline.firstTrialDay || this.currentDay < this.legalTimeline.firstTrialDay;
            const isInvestigationOrProsecution =
              this.currentStage === 'investigation' || this.currentStage === 'prosecution';

            if (hasApproval && beforeFirstTrial && isInvestigationOrProsecution && Math.random() < 0.5) {
              // 如果还没有分配检察官，生成一个固定的检察官姓名
              if (!this.assignedOfficers.prosecutor) {
                this.assignedOfficers.prosecutor = prosecutorNames[Math.floor(Math.random() * prosecutorNames.length)];
                console.info(`[事件系统] 已分配固定检察官: ${this.assignedOfficers.prosecutor}`);
              }
              // 更新事件描述：2名警官+检察官参与
              conditionEvent.description = `公安机关提审讯问（${this.assignedOfficers.police.join('、')}负责），${this.assignedOfficers.prosecutor}参与提审`;
            } else {
              // 更新事件描述：只有2名警官
              conditionEvent.description = `公安机关提审讯问（${this.assignedOfficers.police.join('、')}负责）`;
            }
          }
        }

        // 调试日志已禁用以避免 CORS 错误

        // 高优先级事件（LEGAL、PROCEDURAL、CONDITION）需要打断
        const shouldInterrupt = eventPriority <= this.PRIORITY.CONDITION;

        return {
          ...conditionEvent,
          priority: eventPriority,
          day: this.currentDay,
          text: shouldInterrupt
            ? `${month}月${day}日，触发了${conditionEvent.name}事件。请描述从上次回复到事件发生前这一段时间内主角的主要经历和状态变化，并在事件即将开始时结束（不要描述事件本身，只描述事件发生前的准备和状态）。`
            : undefined,
        };
      }

      // 4. 检查一般随机事件（第四优先级，第0天不触发，进入未决犯监室前不触发，概率5%）
      if (this.currentDay > 0 && this.cellType !== 'transition' && Math.random() < 0.05) {
        const randomEvent = this.generateRandomEvent();
        if (randomEvent) {
          return {
            ...randomEvent,
            priority: this.PRIORITY.RANDOM,
            day: this.currentDay,
            text: `${month}月${day}日，触发了${randomEvent.name}事件。请描述从上次回复到事件发生前这一段时间内主角的主要经历和状态变化，并在事件即将开始时结束（不要描述事件本身，只描述事件发生前的准备和状态）。`,
          };
        }
      }

      // 5. 检查日常事件（心理独白，第五优先级）
      if (Math.random() < 0.15) {
        const monologue = this.generateInnerMonologue();
        if (monologue) {
          return {
            ...monologue,
            priority: this.PRIORITY.DAILY,
            day: this.currentDay,
          };
        }
      }

      // 6. 默认日常事件
      return {
        id: 'daily_routine',
        name: '日常生活',
        type: 'daily',
        priority: this.PRIORITY.DAILY,
        day: this.currentDay,
        description: '平静的一天',
      };
    },

    checkLegalEvent(): EventRecord | null {
      const daysInCustody = this.currentDay - this.legalTimeline.arrestDay;
      const stageBefore = this.currentStage;

      if (!this.legalTimeline.approvalDay) {
        const minDays = Math.floor(30 * this.complexityMultiplier);
        const maxDays = Math.floor(37 * this.complexityMultiplier);

        if (daysInCustody >= minDays && daysInCustody <= maxDays) {
          if (Math.random() < 0.3) {
            this.legalTimeline.approvalDay = this.currentDay;
            this.currentStage = 'investigation';
            this.lastStageChangeDay = this.currentDay;
            return {
              id: 'approval',
              name: '批准逮捕',
              type: 'legal',
              stage: 'approval',
              description: '检察院批准逮捕决定下达',
              from: stageBefore,
              to: 'investigation',
            };
          }
        }
      }

      if (this.legalTimeline.approvalDay && !this.legalTimeline.prosecutionDay) {
        const daysSinceApproval = this.currentDay - this.legalTimeline.approvalDay;
        const minDays = Math.floor(60 * this.complexityMultiplier);
        const maxDays = Math.floor(210 * this.complexityMultiplier);

        if (daysSinceApproval >= minDays && daysSinceApproval <= maxDays && Math.random() < 0.02) {
          this.legalTimeline.prosecutionDay = this.currentDay;
          this.currentStage = 'prosecution';
          this.lastStageChangeDay = this.currentDay;
          return {
            id: 'prosecution',
            name: '检察院起诉',
            type: 'legal',
            stage: 'prosecution',
            description: '检察院向法院提起公诉',
            from: stageBefore,
            to: 'prosecution',
          };
        }
      }

      if (this.legalTimeline.prosecutionDay && !this.legalTimeline.firstTrialDay) {
        const daysSinceProsecution = this.currentDay - this.legalTimeline.prosecutionDay;
        const minDays = Math.floor(30 * this.complexityMultiplier);
        const maxDays = Math.floor(45 * this.complexityMultiplier);

        if (daysSinceProsecution >= minDays && daysSinceProsecution <= maxDays && Math.random() < 0.05) {
          this.legalTimeline.firstTrialDay = this.currentDay;
          this.currentStage = 'trial1';
          this.lastStageChangeDay = this.currentDay;

          if (this.cellType === 'transition') {
            this.cellType = 'pretrial';
            DS.events.emit('cell_transfer', {
              from: 'transition',
              to: 'pretrial',
              reason: '等待开庭',
            });
          }

          return {
            id: 'first_trial',
            name: '一审开庭',
            type: 'legal',
            stage: 'trial1',
            description: '法院一审开庭审理',
            from: stageBefore,
            to: 'trial1',
          };
        }
      }

      if (this.legalTimeline.firstTrialDay && !this.legalTimeline.firstVerdictDay) {
        const daysSinceTrial = this.currentDay - this.legalTimeline.firstTrialDay;
        const minDays = Math.floor(7 * this.complexityMultiplier);
        const maxDays = Math.floor(30 * this.complexityMultiplier);

        if (daysSinceTrial >= minDays && daysSinceTrial <= maxDays && Math.random() < 0.1) {
          this.legalTimeline.firstVerdictDay = this.currentDay;
          this.currentStage = 'appeal';
          this.lastStageChangeDay = this.currentDay;

          this.cellType = 'convicted';
          DS.events.emit('cell_transfer', {
            from: 'pretrial',
            to: 'convicted',
            reason: '一审判决宣告',
          });

          return {
            id: 'first_verdict',
            name: '一审判决',
            type: 'legal',
            stage: 'firstVerdict',
            description: '法院宣告一审判决',
            from: stageBefore,
            to: 'appeal',
          };
        }
      }

      if (
        this.legalTimeline.firstVerdictDay &&
        !this.legalTimeline.secondTrialDay &&
        !this.legalTimeline.finalVerdictDay
      ) {
        const daysSinceVerdict = this.currentDay - this.legalTimeline.firstVerdictDay;

        if (daysSinceVerdict === 10) {
          if (Math.random() < 0.7) {
            this.legalTimeline.secondTrialDay = this.currentDay;
            this.currentStage = 'trial2';
            this.lastStageChangeDay = this.currentDay;

            return {
              id: 'appeal_filed',
              name: '提起上诉',
              type: 'legal',
              stage: 'appeal',
              description: '向上级法院提起上诉',
              from: stageBefore,
              to: 'trial2',
            };
          } else {
            this.legalTimeline.finalVerdictDay = this.currentDay;
            this.currentStage = 'transfer';
            this.lastStageChangeDay = this.currentDay;

            return {
              id: 'verdict_final',
              name: '判决生效',
              type: 'legal',
              stage: 'finalVerdict',
              description: '未上诉，一审判决生效',
              from: stageBefore,
              to: 'transfer',
            };
          }
        }
      }

      if (this.legalTimeline.secondTrialDay && !this.legalTimeline.finalVerdictDay) {
        const daysSinceAppeal = this.currentDay - this.legalTimeline.secondTrialDay;
        const minDays = Math.floor(60 * this.complexityMultiplier);
        const maxDays = Math.floor(90 * this.complexityMultiplier);

        if (daysSinceAppeal >= minDays && daysSinceAppeal <= maxDays && Math.random() < 0.03) {
          this.legalTimeline.finalVerdictDay = this.currentDay;
          this.currentStage = 'transfer';
          this.lastStageChangeDay = this.currentDay;

          return {
            id: 'final_verdict',
            name: '二审判决',
            type: 'legal',
            stage: 'finalVerdict',
            description: '二审法院宣告终审判决',
            from: stageBefore,
            to: 'transfer',
          };
        }
      }

      if (this.legalTimeline.finalVerdictDay && !this.legalTimeline.transferDay && !this.isDeathPenalty) {
        const daysSinceVerdict = this.currentDay - this.legalTimeline.finalVerdictDay;
        const minDays = Math.floor(30 * this.complexityMultiplier);
        const maxDays = Math.floor(90 * this.complexityMultiplier);

        if (daysSinceVerdict >= minDays && daysSinceVerdict <= maxDays && Math.random() < 0.02) {
          this.legalTimeline.transferDay = this.currentDay;
          this.currentStage = 'end';
          this.lastStageChangeDay = this.currentDay;

          return {
            id: 'transfer_prison',
            name: '移送监狱',
            type: 'legal',
            stage: 'transfer',
            description: '移送监狱执行刑罚',
            isEnding: true,
            endingType: 'prison',
            from: stageBefore,
            to: 'end',
          };
        }
      }

      if (this.legalTimeline.finalVerdictDay && this.isDeathPenalty && !this.legalTimeline.executionDay) {
        const daysSinceVerdict = this.currentDay - this.legalTimeline.finalVerdictDay;
        const minDays = 180;
        const maxDays = 720;

        if (daysSinceVerdict >= minDays && daysSinceVerdict <= maxDays && Math.random() < 0.005) {
          this.legalTimeline.executionDay = this.currentDay + 7;
          this.currentStage = 'execution';
          this.lastStageChangeDay = this.currentDay;

          return {
            id: 'death_review_approved',
            name: '死刑复核核准',
            type: 'legal',
            stage: 'deathReview',
            description: '最高法院核准死刑，7日内执行',
            from: stageBefore,
            to: 'execution',
          };
        }
      }

      if (this.legalTimeline.executionDay && this.currentDay >= this.legalTimeline.executionDay) {
        this.currentStage = 'end';
        this.lastStageChangeDay = this.currentDay;

        return {
          id: 'execution',
          name: '执行死刑',
          type: 'legal',
          stage: 'execution',
          description: '死刑执行',
          isEnding: true,
          endingType: 'death',
          from: stageBefore,
          to: 'end',
        };
      }

      return null;
    },

    checkConditionEvent(): EventRecord | null {
      const state = this.getProtagonistState();

      // 调试日志已禁用以避免 CORS 错误

      for (const event of this.conditionEvents) {
        if (event.stageChangeOnly && this.currentDay !== this.lastStageChangeDay) {
          continue;
        }

        if (event.checkAlways || !event.stageChangeOnly) {
          const conditionResult = event.condition(state, this);
          // 调试日志已禁用以避免 CORS 错误

          if (conditionResult) {
            const randomCheck = Math.random() * 100 < event.weight;
            // 调试日志已禁用以避免 CORS 错误

            if (randomCheck) {
              // 调试日志已禁用以避免 CORS 错误

              return {
                id: event.id,
                name: event.name,
                type: event.category || 'condition',
                description: event.description,
                aiControlled: event.aiControlled || false,
              };
            }
          }
        }
      }

      return null;
    },

    generateRandomEvent(): EventRecord | null {
      const types = ['violence', 'medical', 'emotional', 'accident'] as const;
      const weights = [25, 30, 30, 15];

      const typeIndex = this.weightedRandom(types.length, weights);
      const eventType = types[typeIndex];
      const eventList = this.randomEvents[eventType];

      const eventWeights = eventList.map(e => e.weight);
      const eventIndex = this.weightedRandom(eventList.length, eventWeights);
      const event = eventList[eventIndex];

      return {
        id: event.id,
        name: event.name,
        type: eventType,
        category: 'random',
        description: `随机事件: ${event.name}`,
      };
    },

    generateInnerMonologue(): EventRecord | null {
      const weights = this.innerMonologues.map(m => m.weight);
      const index = this.weightedRandom(this.innerMonologues.length, weights);
      const monologue = this.innerMonologues[index];

      return {
        id: monologue.id,
        name: '心理独白',
        type: 'monologue',
        category: 'daily',
        description: monologue.text,
        text: monologue.text,
      };
    },

    weightedRandom(count: number, weights: number[]): number {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;

      for (let i = 0; i < count; i++) {
        random -= weights[i];
        if (random <= 0) {
          return i;
        }
      }

      return count - 1;
    },

    getProtagonistState(): ProtagonistState {
      // 标记：这是新版本的代码，支持记忆强化插件
      console.log('[事件系统] getProtagonistState: 新版本代码已加载，支持记忆强化插件');

      // 调试日志已禁用以避免 CORS 错误

      // 优先使用状态栏模块的 getState()，它已经集成了记忆增强插件支持
      // 状态栏模块会按优先级顺序：记忆增强插件 > 状态栏模块 > 聊天记录解析 > 默认值
      const statusPanel = DS.getModule<{ getState?: () => ProtagonistState }>('statusPanel');

      // 调试日志已禁用以避免 CORS 错误

      if (statusPanel && statusPanel.getState) {
        const state = statusPanel.getState();
        // 调试日志已禁用以避免 CORS 错误
        // 返回完整的状态对象（状态栏模块已经处理了记忆增强插件的优先级）
        return state;
      }

      // 状态栏模块不可用，使用默认值（完整的状态对象）
      const fallbackState: ProtagonistState = {
        health: 70,
        mental: 65,
        strength: 50,
        intelligence: 55,
        // 其他字段使用 undefined，符合 ProtagonistState 接口定义
      };

      // 调试日志已禁用以避免 CORS 错误

      console.warn('[事件系统] 状态栏模块不可用，使用默认状态值');
      return fallbackState;
    },

    getRecentContext(): string {
      if (Array.isArray(window.chat)) {
        const recentMessages = window.chat.slice(-5);
        return recentMessages.map(m => m.mes || '').join(' ');
      }
      return '';
    },

    checkCellTransfer() {
      const daysInCustody = this.currentDay - this.legalTimeline.arrestDay;

      // 过渡监室转移至未决犯监室属于重大法律事件，必定触发打断
      if (this.cellType === 'transition' && daysInCustody >= 7 && daysInCustody <= 14) {
        this.cellType = 'pretrial';
        DS.events.emit('cell_transfer', {
          from: 'transition',
          to: 'pretrial',
          reason: '过渡期结束',
          day: this.currentDay,
        });
        return true;
      }

      return false;
    },

    setDeathPenalty(isDeathPenalty: boolean) {
      this.isDeathPenalty = isDeathPenalty;
      console.info(`[事件系统] 死刑标记设置为: ${isDeathPenalty}`);

      DS.events.emit('death_penalty_status_changed', {
        isDeathPenalty: this.isDeathPenalty,
        day: this.currentDay,
      });
    },

    getCurrentStageInfo() {
      // 将监室类型从英文转换为中文
      const cellTypeNames: Record<string, string> = {
        transition: '过渡监室',
        pretrial: '未决犯监室',
        convicted: '已决犯监室',
      };
      const cellTypeChinese = cellTypeNames[this.cellType] || '过渡监室';

      return {
        day: this.currentDay,
        stage: this.currentStage,
        cellType: cellTypeChinese,
        cellTypeRaw: this.cellType, // 保留原始英文值供内部使用
        daysInCustody: this.currentDay - this.legalTimeline.arrestDay,
        timeline: { ...this.legalTimeline },
        complexity: this.caseComplexity,
        complexityMultiplier: this.complexityMultiplier,
        isDeathPenalty: this.isDeathPenalty,
        eventCounters: { ...this.eventCounters },
      };
    },

    getEventStatistics() {
      const stats: {
        totalEvents: number;
        byType: Record<string, number>;
        byPriority: Record<number, number>;
        recentEvents: EventRecord[];
      } = {
        totalEvents: this.eventHistory.length,
        byType: {},
        byPriority: {},
        recentEvents: this.eventHistory.slice(-10),
      };

      this.eventHistory.forEach((event: EventRecord) => {
        const type = event.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        const priority = event.priority || 4;
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      });

      return stats;
    },

    exportTimeline() {
      return {
        currentDay: this.currentDay,
        currentStage: this.currentStage,
        cellType: this.cellType,
        timeline: { ...this.legalTimeline },
        complexity: this.caseComplexity,
        isDeathPenalty: this.isDeathPenalty,
        eventCounters: { ...this.eventCounters },
        eventHistory: [...this.eventHistory],
        lastStageChangeDay: this.lastStageChangeDay,
      };
    },

    importTimeline(data: any) {
      if (!data) return false;

      try {
        this.currentDay = data.currentDay || 0;
        this.currentStage = (data.currentStage as Stage) || 'detention';
        this.cellType = data.cellType || 'transition';
        this.legalTimeline = (data.timeline as Timeline) || ({} as Timeline);
        this.caseComplexity = data.complexity || 'normal';
        this.isDeathPenalty = Boolean(data.isDeathPenalty);
        this.eventCounters = data.eventCounters || {};
        this.eventHistory = data.eventHistory || [];
        this.lastStageChangeDay = data.lastStageChangeDay || 0;

        console.info('[事件系统] 时间线导入成功');
        return true;
      } catch (error) {
        console.error('[事件系统] 时间线导入失败:', error);
        return false;
      }
    },

    // 保存事件打断时的状态快照（用于回退）
    // 注意：此方法在advanceDay中被调用，但快照应该反映的是"上一次回复结束时的状态"
    // 因此应该在每次AI回复结束时调用saveStateToChatVars，并在打断时基于当前状态保存快照
    saveEventInterruptSnapshot() {
      try {
        // 检查是否有当前聊天ID，如果没有则跳过保存，避免触发 saveChat 错误
        const currentChatId =
          typeof SillyTavern !== 'undefined' && SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : null;

        if (!currentChatId) {
          console.debug('[事件系统] 没有打开的聊天文件，跳过保存事件打断快照');
          // 调试日志已禁用以避免 CORS 错误
          return;
        }

        // 额外检查：确保聊天变量可以访问（避免在聊天文件未创建时触发保存）
        try {
          const testChatVars = getVariables({ type: 'chat' });
          if (!testChatVars || typeof testChatVars !== 'object') {
            console.debug('[事件系统] 无法获取聊天变量，聊天文件可能未创建，跳过保存事件打断快照');
            // 调试日志已禁用以避免 CORS 错误
            return;
          }
        } catch (testError) {
          console.debug('[事件系统] 测试获取聊天变量失败，聊天文件可能未创建，跳过保存事件打断快照:', testError);
          // 调试日志已禁用以避免 CORS 错误
          return;
        }

        // 快照保存的是当前状态（打断时的状态）
        // 这个状态应该已经在上一次回复结束时通过saveStateToChatVars保存过
        const snapshot = {
          currentDay: this.currentDay,
          currentStage: this.currentStage,
          cellType: this.cellType,
          legalTimeline: { ...this.legalTimeline },
          caseComplexity: this.caseComplexity,
          isDeathPenalty: this.isDeathPenalty,
          eventCounters: { ...this.eventCounters },
          eventHistory: [...this.eventHistory],
          lastStageChangeDay: this.lastStageChangeDay,
          snapshotTime: Date.now(),
        };

        // 使用 updateVariablesWith 而不是 replaceVariables，更安全
        try {
          // 调试日志已禁用以避免 CORS 错误

          updateVariablesWith(
            variables => {
              return { ...variables, detentionSystemInterruptSnapshot: snapshot };
            },
            { type: 'chat' },
          );

          // 调试日志已禁用以避免 CORS 错误
        } catch (updateError) {
          // 调试日志已禁用以避免 CORS 错误
          // 如果 updateVariablesWith 失败，不再尝试 replaceVariables，避免进一步冲突
          console.warn('[事件系统] 保存事件打断快照失败 (updateVariablesWith):', updateError);
        }

        console.debug('[事件系统] 事件打断快照已保存');

        // 调试日志已禁用以避免 CORS 错误
      } catch (error) {
        console.warn('[事件系统] 保存事件打断快照失败:', error);
      }
    },

    // 回退到事件打断时的状态
    // 确认天数推进（在AI完成回复后调用）
    confirmDayAdvancement(pendingDays: number): void {
      if (pendingDays > 0) {
        // 从记忆增强插件获取当前天数（唯一数据源）
        const oldDay = this.getCurrentDayInternal();
        const newDay = oldDay + pendingDays;

        // 更新内部状态（作为回退值）
        this.currentDay = newDay;
        this.lastEventDay = newDay;

        // 同步到记忆增强插件（通过 statusPanel 模块）
        try {
          const statusPanel = DS.getModule('statusPanel') as {
            getState?: () => { days?: number; day?: number };
            modifyValue?: (key: string, delta: number, reason?: string) => void;
          };

          if (statusPanel && statusPanel.modifyValue) {
            // 直接设置天数差值
            statusPanel.modifyValue('days', pendingDays, `确认天数推进${pendingDays}天`);
            console.info(`[事件系统] ✓ 已同步天数到记忆增强插件: ${oldDay} -> ${newDay} (推进了${pendingDays}天)`);
          } else {
            console.warn('[事件系统] ⚠ statusPanel 模块不可用，无法同步天数到记忆增强插件');
          }
        } catch (error) {
          console.warn('[事件系统] ⚠ 同步天数到记忆增强插件失败:', error);
        }

        console.info(`[事件系统] ✓ 已确认天数推进: ${oldDay} -> ${newDay} (推进了${pendingDays}天)`);

        // 保存更新后的状态
        this.saveStateToChatVars();

        // 调试日志已禁用以避免 CORS 错误
      }
    },

    rollbackToInterruptSnapshot(): boolean {
      try {
        const chatVars = getVariables({ type: 'chat' });
        const snapshot = (chatVars as Record<string, unknown>).detentionSystemInterruptSnapshot as
          | {
              currentDay?: number;
              currentStage?: string;
              cellType?: string;
              legalTimeline?: Timeline;
              caseComplexity?: string;
              isDeathPenalty?: boolean;
              eventCounters?: Record<string, number>;
              eventHistory?: EventRecord[];
              lastStageChangeDay?: number;
            }
          | undefined;

        if (!snapshot || typeof snapshot !== 'object') {
          console.warn('[事件系统] 未找到事件打断快照，无法回退');
          return false;
        }

        console.info('[事件系统] 回退到事件打断时的状态');

        this.currentDay = snapshot.currentDay ?? this.currentDay;
        this.currentStage = (snapshot.currentStage as Stage) ?? this.currentStage;
        this.cellType = snapshot.cellType ?? this.cellType;
        this.caseComplexity =
          (snapshot.caseComplexity as 'simple' | 'normal' | 'complex' | 'very_complex') ?? this.caseComplexity;
        this.isDeathPenalty = Boolean(snapshot.isDeathPenalty);
        this.lastStageChangeDay = snapshot.lastStageChangeDay ?? this.lastStageChangeDay;

        if (snapshot.legalTimeline && typeof snapshot.legalTimeline === 'object') {
          this.legalTimeline = { ...this.legalTimeline, ...snapshot.legalTimeline };
        }

        if (snapshot.eventCounters && typeof snapshot.eventCounters === 'object') {
          this.eventCounters = { ...this.eventCounters, ...snapshot.eventCounters };
        }

        if (Array.isArray(snapshot.eventHistory)) {
          this.eventHistory = [...snapshot.eventHistory];
        }

        // 保存回退后的状态
        this.saveStateToChatVars();

        // 调试日志已禁用以避免 CORS 错误

        return true;
      } catch (error) {
        console.error('[事件系统] 回退到事件打断快照失败:', error);
        return false;
      }
    },
  };

  // 向核心暴露接口
  DS.generateRandomEvent = (_context?: unknown) => EventSystem.generateRandomEvent();
  DS.advanceDay = (days?: number) => {
    // 调试日志已禁用以避免 CORS 错误
    const result = EventSystem.advanceDay(days);
    // 调试日志已禁用以避免 CORS 错误
    return result;
  };
  // 从记忆增强插件获取天数（唯一数据源）
  DS.getCurrentDay = () => getCurrentDayFromMemoryEnhancement(EventSystem.currentDay);
  DS.getCurrentStage = () => EventSystem.getCurrentStageInfo();
  DS.checkCellTransfer = () => EventSystem.checkCellTransfer();
  DS.setCaseComplexity = (complexity: 'simple' | 'normal' | 'complex' | 'very_complex') =>
    EventSystem.setCaseComplexity(complexity);
  DS.rollbackToStage = (stage: Stage, reason?: string) => EventSystem.rollbackToStage(stage, reason);
  DS.advanceToStage = (stage: Stage, reason?: string) => EventSystem.advanceToStage(stage, reason);
  DS.setDeathPenalty = (isDeathPenalty: boolean) => EventSystem.setDeathPenalty(isDeathPenalty);
  DS.getEventStatistics = () => EventSystem.getEventStatistics();
  DS.exportTimeline = () => EventSystem.exportTimeline();
  DS.importTimeline = (data: unknown) => EventSystem.importTimeline(data);
  DS.rollbackToInterruptSnapshot = () => EventSystem.rollbackToInterruptSnapshot();

  DS.registerModule('eventSystem', EventSystem);

  // 同步到主窗口（iframe 环境）
  try {
    if (window.parent && window.parent !== window) {
      (window.parent as any).detentionSystem = DS;
      console.info('[事件系统] ✓ 已同步到主窗口');
    }
  } catch (e) {
    // 跨域限制，忽略
  }

  // 监听用户输入，支持回退触发
  DS.events.on('user_input', (data?: unknown) => {
    const text =
      typeof (data as { text?: unknown } | undefined)?.text === 'string' ? (data as { text?: string }).text : undefined;
    if (text) {
      EventSystem.handleUserRollback(text);
    }
  });

  // 核心初始化完成后，初始化事件系统
  DS.events.on('initialized', () => {
    try {
      EventSystem.initialize(0);
    } catch (error) {
      console.error('[事件系统] 初始化失败:', error);
    }
  });

  console.info('[事件系统] 脚本加载完成 v3.4.0');
});
