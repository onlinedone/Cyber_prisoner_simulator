export {};

/**
 * 事件系统：按日推进、法律流程、条件事件、随机事件、心理独白等。
 * 通过 registerModule 挂载到核心系统，并暴露操作方法给其他模块。
 */

type EventPriority = 1 | 2 | 3 | 4;

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
  getCurrentStage?: () => unknown;
  checkCellTransfer?: () => boolean;
  setCaseComplexity?: (complexity: 'simple' | 'normal' | 'complex' | 'very_complex') => void;
  rollbackToStage?: (stage: Stage, reason?: string) => boolean;
  setDeathPenalty?: (flag: boolean) => void;
  getEventStatistics?: () => unknown;
  exportTimeline?: () => unknown;
  importTimeline?: (data: unknown) => boolean;
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
  readonly PRIORITY: {
    readonly LEGAL: 1;
    readonly CONDITION: 2;
    readonly RANDOM: 3;
    readonly DAILY: 4;
  };
  legalEvents: Record<string, unknown>;
  conditionEvents: Array<any>;
  randomEvents: Record<string, Array<{ id: string; name: string; weight: number }>>;
  innerMonologues: Array<{ id: string; text: string; weight: number }>;
  initialize(this: EventSystemImpl, startDay?: number): void;
  setCaseComplexity(this: EventSystemImpl, complexity: 'simple' | 'normal' | 'complex' | 'very_complex'): void;
  checkComplexityAdjustment(this: EventSystemImpl): void;
  rollbackToStage(this: EventSystemImpl, targetStage: Stage, reason?: string): boolean;
  handleUserRollback(this: EventSystemImpl, input: string): boolean;
  advanceDay(
    this: EventSystemImpl,
    days?: number,
  ): { interrupted: boolean; currentDay: number; event?: EventRecord; accumulatedEvents: EventRecord[] };
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
}

console.info('[事件系统] 开始加载...');

// #region agent log
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'event_system.ts:151',
    message: '事件系统开始加载',
    data: { hasDetentionSystem: !!window.detentionSystem, detentionSystemType: typeof window.detentionSystem },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  }),
}).catch(() => {});
// #endregion

const DS_RAW = window.detentionSystem as (DetentionSystem & EventSystemExports) | undefined;
if (!DS_RAW) {
  console.error('[事件系统] 核心系统未加载');
  throw new Error('[事件系统] 核心系统未加载，无法继续');
}

// 类型断言：DS 一定存在
const DS = DS_RAW as DetentionSystem & EventSystemExports;

// #region agent log
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'event_system.ts:160',
    message: '核心系统已找到',
    data: {
      version: DS.version,
      initialized: DS.initialized,
      hasEvents: !!DS.events,
      moduleCount: Object.keys(DS.modules || {}).length,
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  }),
}).catch(() => {});
// #endregion
// ---------------- 核心事件系统 ----------------
const EventSystem: EventSystemImpl = {
  currentDay: 0,
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

  // 特殊事件计数器
  eventCounters: {
    interrogation: 0,
    lawyerVisit: 0,
    familyVisit: 0,
    medicalVisit: 0,
    sceneIdentification: 0,
  } as Record<string, number>,

  // 死刑标记
  isDeathPenalty: false,

  // 上次阶段转换日期
  lastStageChangeDay: 0,

  // 事件优先级定义
  PRIORITY: {
    LEGAL: 1,
    CONDITION: 2,
    RANDOM: 3,
    DAILY: 4,
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
      id: 'interrogation',
      name: '提审',
      condition: (_state: ProtagonistState, system: typeof EventSystem) => {
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
        if (!system.legalTimeline.firstVerdictDay) return false;

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
        if (system.eventCounters.sceneIdentification > 0) return false;

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

    console.info('[事件系统] 初始化完成');
    console.info(`[事件系统] 起始日期: 第${startDay}天`);

    DS.events.emit('event_system_initialized', {
      day: this.currentDay,
      stage: this.currentStage,
    });
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

    for (let i = 0; i < days; i++) {
      this.currentDay++;
      this.lastEventDay = this.currentDay;

      this.checkComplexityAdjustment();

      const dayEvent = this.checkDayEvents();

      if (dayEvent) {
        events.push(dayEvent);

        this.eventHistory.push({
          ...dayEvent,
          day: this.currentDay,
        });

        if (Object.prototype.hasOwnProperty.call(this.eventCounters, dayEvent.id)) {
          this.eventCounters[dayEvent.id] = (this.eventCounters[dayEvent.id] || 0) + 1;
        }

        if ((dayEvent.priority ?? this.PRIORITY.DAILY) <= this.PRIORITY.RANDOM) {
          console.info(`[事件系统] 第${this.currentDay}天触发事件: ${dayEvent.name}`);
          DS.events.emit('event_triggered', dayEvent);
          return {
            interrupted: true,
            currentDay: this.currentDay,
            event: dayEvent,
            accumulatedEvents: events,
          };
        }
      }
    }

    return {
      interrupted: false,
      currentDay: this.currentDay,
      accumulatedEvents: events,
    };
  },

  checkDayEvents(): EventRecord {
    const legalEvent = this.checkLegalEvent();
    if (legalEvent) {
      return {
        ...legalEvent,
        priority: this.PRIORITY.LEGAL,
        day: this.currentDay,
      };
    }

    const conditionEvent = this.checkConditionEvent();
    if (conditionEvent) {
      return {
        ...conditionEvent,
        priority: this.PRIORITY.CONDITION,
        day: this.currentDay,
      };
    }

    if (Math.random() < 0.1) {
      const randomEvent = this.generateRandomEvent();
      if (randomEvent) {
        return {
          ...randomEvent,
          priority: this.PRIORITY.RANDOM,
          day: this.currentDay,
        };
      }
    }

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

    for (const event of this.conditionEvents) {
      if (event.stageChangeOnly && this.currentDay !== this.lastStageChangeDay) {
        continue;
      }

      if (event.checkAlways || !event.stageChangeOnly) {
        if (event.condition(state, this)) {
          if (Math.random() * 100 < event.weight) {
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
    const statusPanel = DS.getModule<{ getState?: () => ProtagonistState }>('statusPanel');
    if (statusPanel && statusPanel.getState) {
      return statusPanel.getState();
    }

    return {
      health: 80,
      mental: 70,
      strength: 60,
      intelligence: 70,
    };
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

    if (this.cellType === 'transition' && daysInCustody >= 7 && daysInCustody <= 14) {
      if (Math.random() < 0.2) {
        this.cellType = 'pretrial';
        DS.events.emit('cell_transfer', {
          from: 'transition',
          to: 'pretrial',
          reason: '过渡期结束',
          day: this.currentDay,
        });
        return true;
      }
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
    return {
      day: this.currentDay,
      stage: this.currentStage,
      cellType: this.cellType,
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
};

// 向核心暴露接口
DS.generateRandomEvent = (_context?: unknown) => EventSystem.generateRandomEvent();
DS.advanceDay = (days?: number) => EventSystem.advanceDay(days);
DS.getCurrentStage = () => EventSystem.getCurrentStageInfo();
DS.checkCellTransfer = () => EventSystem.checkCellTransfer();
DS.setCaseComplexity = (complexity: 'simple' | 'normal' | 'complex' | 'very_complex') =>
  EventSystem.setCaseComplexity(complexity);
DS.rollbackToStage = (stage: Stage, reason?: string) => EventSystem.rollbackToStage(stage, reason);
DS.setDeathPenalty = (isDeathPenalty: boolean) => EventSystem.setDeathPenalty(isDeathPenalty);
DS.getEventStatistics = () => EventSystem.getEventStatistics();
DS.exportTimeline = () => EventSystem.exportTimeline();
DS.importTimeline = (data: unknown) => EventSystem.importTimeline(data);

DS.registerModule('eventSystem', EventSystem);

// 监听用户输入，支持回退触发
DS.events.on('user_input', (data?: unknown) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'event_system.ts:1236',
      message: '收到用户输入事件',
      data: {
        hasData: !!data,
        dataType: typeof data,
        textLength:
          typeof (data as { text?: unknown } | undefined)?.text === 'string'
            ? (data as { text?: string }).text?.length
            : 0,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'E',
    }),
  }).catch(() => {});
  // #endregion
  const text =
    typeof (data as { text?: unknown } | undefined)?.text === 'string' ? (data as { text?: string }).text : undefined;
  if (text) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'event_system.ts:1242',
        message: '处理用户回退',
        data: { text: text.substring(0, 50) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {});
    // #endregion
    EventSystem.handleUserRollback(text);
  }
});

// 核心初始化完成后，初始化事件系统
DS.events.on('initialized', () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'event_system.ts:1246',
      message: '收到核心系统初始化事件',
      data: { currentDay: EventSystem.currentDay, currentStage: EventSystem.currentStage },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'B',
    }),
  }).catch(() => {});
  // #endregion
  try {
    EventSystem.initialize(0);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'event_system.ts:1250',
        message: '事件系统初始化成功',
        data: { currentDay: EventSystem.currentDay, currentStage: EventSystem.currentStage },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'event_system.ts:1254',
        message: '事件系统初始化失败',
        data: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    console.error('[事件系统] 初始化失败:', error);
  }
});

console.info('[事件系统] 脚本加载完成 v3.4.0');
