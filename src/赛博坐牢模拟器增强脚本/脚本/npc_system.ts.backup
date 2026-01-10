export {};

type JQueryStaticLike = typeof globalThis extends { $: infer T } ? T : (selector: any) => any;
declare const $: JQueryStaticLike;

/**
 * NPC 系统：按需生成女性看守所 NPC（囚犯/警察/律师/医生/家属等）。
 * 通过 registerModule 挂载到核心系统，提供生成与管理接口。
 */

type NPCGender = 'female' | 'male';
type NPCStatus = 'active' | 'removed';
type NPCRelationship = {
  toProtagonist: number;
  faction: string | null;
  allies: string[];
  enemies: string[];
  influence: number;
};
type NPCTraits = {
  aggression: number;
  sociability: number;
  intelligence: number;
  emotional: number;
  dominance: number;
  kindness: number;
};
type NPCPersonality = { traits: NPCTraits; tags: string[] };
type NPCAppearance = {
  height: number;
  weight: number;
  hair: string;
  eyes: string;
  skin: string;
  features: string;
};
type NPCBackground = {
  education: string;
  maritalStatus: string;
  hasChildren: boolean;
  childrenCount: number;
  hometown: string;
  priorConvictions: number;
};

type NPCBase = {
  id: string;
  name: string;
  gender: NPCGender;
  age: number;
  crime: string;
  sentence: number;
  appearance: NPCAppearance;
  personality: NPCPersonality;
  background: NPCBackground;
  relationship: NPCRelationship;
  cellType: string;
  daysInCustody: number;
  status: NPCStatus;
  createdAt: number;
};

type NPCPolice = {
  role: 'police';
  rank: string;
  attitude: number;
};

type NPCLawyer = {
  role: 'lawyer';
  type: string;
  experience: number;
  successRate: number;
};

type NPCDoctor = {
  role: 'doctor';
  specialty: string;
  experience: number;
};

type NPCFamily = {
  role: 'family';
  relation: string;
  supportLevel: number;
};

type NPCSpecial = NPCPolice | NPCLawyer | NPCDoctor | NPCFamily;
type NPC = NPCBase & Partial<NPCSpecial>;

type EventTriggeredPayload = { id?: string };
type CellTransferPayload = { to?: string };

interface EventSystemModule {
  getCurrentStageInfo?: () => { cellType?: string };
}

interface DetentionSystem {
  events: { on(event: string, callback: (data?: unknown) => void): void; emit(event: string, data?: unknown): void };
  registerModule(name: string, module: unknown): void;
  getModule<T = unknown>(name: string): T | undefined;
}

type ProtagonistOptions = {
  crimeType?: 'economic' | 'property' | 'violent' | 'drug' | 'social' | 'other' | string;
  crimeName?: string; // 指定具体罪名
  ageRange?: [number, number]; // [min, max]
  education?: 'high' | 'medium' | 'low' | 'custom'; // high: 本科及以上, medium: 大专/中专, low: 高中及以下
  profession?: string[]; // 职业背景关键词，如 ['企业家', '金融', '管理']
  excludeCrimes?: string[]; // 排除的罪名，如 ['学术腐败']
  background?: {
    isIntellectual?: boolean; // 是否高级知识分子
    isAcademic?: boolean; // 是否学术背景
    isBusiness?: boolean; // 是否商业背景
  };
};

type ProtagonistInfo = {
  name: string;
  age: number;
  crime: string;
  sentence: number;
  appearance: {
    height: number;
    weight: number;
    hair: string;
    skin: string;
    features: string;
    eyes: string;
  };
  background: {
    education: string;
    profession?: string;
    maritalStatus: string;
    hasChildren: boolean;
    childrenCount: number;
    hometown: string;
  };
  personality?: {
    traits: {
      intelligence: number;
      sociability: number;
      emotional: number;
    };
    tags: string[];
  };
};

type DetentionSystemWithNPC = DetentionSystem & {
  generateNPC?: (count?: number, context?: Record<string, unknown>) => NPC[];
  generateNPCForEvent?: (eventType: string) => NPC | { police: NPC; witnesses: NPC[] };
  generateProtagonist?: (options?: ProtagonistOptions) => ProtagonistInfo;
  getCurrentCellNPCs?: () => NPC[];
  setCurrentCellNPCs?: (npcs: NPC[]) => void;
  addNPCToCell?: (npc: NPC) => void;
  removeNPCFromCell?: (npcId: string) => NPC | null;
  findNPC?: (npcId: string) => NPC | undefined;
  updateNPCRelationship?: (npcId: string, delta: number) => void;
  exportNPCData?: () => { database: NPC[]; currentCell: NPC[] };
  importNPCData?: (data: { database?: NPC[]; currentCell?: NPC[] } | undefined) => boolean;
};

declare global {
  interface DetentionSystem {
    generateNPC?: (count?: number, context?: Record<string, unknown>) => NPC[];
    generateNPCForEvent?: (eventType: string) => NPC | { police: NPC; witnesses: NPC[] };
    generateProtagonist?: (options?: ProtagonistOptions) => ProtagonistInfo;
    getCurrentCellNPCs?: () => NPC[];
    setCurrentCellNPCs?: (npcs: NPC[]) => void;
    addNPCToCell?: (npc: NPC) => void;
    removeNPCFromCell?: (npcId: string) => NPC | null;
    findNPC?: (npcId: string) => NPC | undefined;
    updateNPCRelationship?: (npcId: string, delta: number) => void;
    exportNPCData?: () => { database: NPC[]; currentCell: NPC[] };
    importNPCData?: (data: { database?: NPC[]; currentCell?: NPC[] } | undefined) => boolean;
  }
}

// #region agent log - HYP-A: 检查核心系统是否已创建
try {
  fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'npc_system.ts:检查核心系统',
      message: 'NPC系统开始加载，检查核心系统',
      data: {
        windowExists: typeof window !== 'undefined',
        windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
        windowDetentionSystemType: typeof window.detentionSystem,
        hasPing:
          typeof window.detentionSystem !== 'undefined' && typeof (window.detentionSystem as any).ping === 'function',
        pingResult:
          typeof window.detentionSystem !== 'undefined' && typeof (window.detentionSystem as any).ping === 'function'
            ? (window.detentionSystem as any).ping()
            : 'N/A',
        isIframe: typeof window !== 'undefined' && window.parent !== window,
        currentUrl: typeof window !== 'undefined' && window.location ? window.location.href : 'N/A',
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'npc-load-debug',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
} catch (e) {
  console.error('[NPC系统] 调试日志发送失败:', e);
}
// #endregion

console.info('[NPC系统] 开始加载...');

// ========== 姓名生成器（全局定义，不依赖DS）==========
const NameGenerator = {
  surnames: {
    tier1: {
      names: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周'],
      weight: 35,
    },
    tier2: {
      names: [
        '徐',
        '孙',
        '马',
        '朱',
        '胡',
        '郭',
        '何',
        '林',
        '高',
        '罗',
        '郑',
        '梁',
        '谢',
        '宋',
        '唐',
        '许',
        '韩',
        '冯',
        '邓',
        '曹',
      ],
      weight: 30,
    },
    tier3: {
      names: [
        '彭',
        '曾',
        '肖',
        '田',
        '董',
        '袁',
        '潘',
        '于',
        '蒋',
        '蔡',
        '余',
        '杜',
        '叶',
        '程',
        '苏',
        '魏',
        '吕',
        '丁',
        '任',
        '沈',
        '姚',
        '卢',
        '姜',
        '崔',
        '钟',
        '谭',
        '陆',
        '汪',
        '范',
        '金',
      ],
      weight: 20,
    },
    tier4: {
      names: [
        '石',
        '廖',
        '贾',
        '夏',
        '韦',
        '付',
        '方',
        '白',
        '邹',
        '孟',
        '熊',
        '秦',
        '邱',
        '江',
        '尹',
        '薛',
        '闫',
        '段',
        '雷',
        '侯',
        '龙',
        '史',
        '陶',
        '黎',
        '贺',
        '顾',
        '毛',
        '郝',
        '龚',
        '邵',
      ],
      weight: 10,
    },
    tier5: {
      names: ['万', '覃', '武', '乔', '严', '赖', '文', '洪', '季', '莫', '欧阳', '司马', '上官', '诸葛', '东方'],
      weight: 5,
    },
  },
  givenNames: {
    vintage: {
      single: ['芳', '丽', '娟', '英', '华', '玉', '秀', '珍', '红', '梅', '兰', '霞', '燕', '萍', '静'],
      double: [
        ['秀', '英'],
        ['秀', '兰'],
        ['秀', '珍'],
        ['秀', '芳'],
        ['丽', '华'],
        ['丽', '娟'],
        ['丽', '萍'],
        ['丽', '芳'],
        ['玉', '兰'],
        ['玉', '梅'],
        ['玉', '华'],
        ['玉', '珍'],
        ['春', '梅'],
        ['春', '兰'],
        ['春', '华'],
        ['春', '燕'],
        ['小', '红'],
        ['小', '芳'],
        ['小', '丽'],
        ['小', '燕'],
      ],
      weight: 25,
    },
    classic: {
      single: ['婷', '洁', '莉', '敏', '艳', '娜', '倩', '雪', '琳', '颖', '晶', '欣', '慧', '佳', '薇'],
      double: [
        ['雅', '婷'],
        ['雅', '洁'],
        ['雅', '琳'],
        ['雅', '欣'],
        ['晓', '燕'],
        ['晓', '丽'],
        ['晓', '红'],
        ['晓', '霞'],
        ['文', '静'],
        ['文', '慧'],
        ['文', '娟'],
        ['文', '婷'],
        ['志', '红'],
        ['志', '华'],
        ['志', '英'],
        ['志', '芳'],
        ['海', '燕'],
        ['海', '霞'],
        ['海', '英'],
        ['海', '丽'],
      ],
      weight: 35,
    },
    modern: {
      single: [
        '婷',
        '洁',
        '莉',
        '敏',
        '艳',
        '娜',
        '倩',
        '雪',
        '琳',
        '颖',
        '晶',
        '欣',
        '慧',
        '佳',
        '薇',
        '涵',
        '萱',
        '琪',
        '瑶',
        '诗',
      ],
      double: [
        ['雨', '婷'],
        ['雨', '欣'],
        ['雨', '涵'],
        ['雨', '萱'],
        ['思', '琪'],
        ['思', '涵'],
        ['思', '雨'],
        ['思', '颖'],
        ['梦', '琪'],
        ['梦', '瑶'],
        ['梦', '涵'],
        ['梦', '萱'],
        ['诗', '涵'],
        ['诗', '琪'],
        ['诗', '雨'],
        ['诗', '婷'],
        ['欣', '怡'],
        ['欣', '悦'],
        ['欣', '然'],
        ['欣', '妍'],
      ],
      weight: 30,
    },
    contemporary: {
      single: ['涵', '萱', '琪', '瑶', '诗', '语', '馨', '妍', '彤', '悦', '然', '怡', '可', '依', '梓'],
      double: [
        ['梓', '涵'],
        ['梓', '萱'],
        ['梓', '琪'],
        ['梓', '瑶'],
        ['子', '涵'],
        ['子', '萱'],
        ['子', '琪'],
        ['子', '瑶'],
        ['雨', '桐'],
        ['雨', '彤'],
        ['雨', '馨'],
        ['雨', '诺'],
        ['诗', '语'],
        ['诗', '涵'],
        ['诗', '雨'],
        ['诗', '琪'],
        ['可', '欣'],
        ['可', '馨'],
        ['可', '心'],
        ['可', '儿'],
      ],
      weight: 10,
    },
  },
  badNames: [
    '史珍香',
    '范统',
    '杜子腾',
    '范剑',
    '朱逸群',
    '秦寿生',
    '杜琦燕',
    '魏生津',
    '费彦',
    '殷静',
    '范婉',
    '胡丽晶',
  ],
  badChars: ['屎', '尿', '粪', '死', '丧', '病', '残', '废', '贱', '奴', '妓', '娼'],

  generate(birthYear: number): string {
    let attempts = 0;
    const maxAttempts = 50;
    while (attempts < maxAttempts) {
      attempts++;
      const surname = this.selectSurname();
      const givenName = this.selectGivenName(birthYear);
      const fullName = surname + givenName;
      if (this.isValidName(fullName)) return fullName;
    }
    return '张' + this.givenNames.classic.single[0];
  },

  selectSurname(): string {
    const tiers = Object.values(this.surnames);
    const totalWeight = tiers.reduce((sum, tier) => sum + tier.weight, 0);
    let random = Math.random() * totalWeight;
    for (const tier of tiers) {
      random -= tier.weight;
      if (random <= 0) {
        return tier.names[Math.floor(Math.random() * tier.names.length)];
      }
    }
    return this.surnames.tier1.names[0];
  },

  selectGivenName(birthYear: number): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const style = age >= 50 ? 'vintage' : age >= 35 ? 'classic' : age >= 20 ? 'modern' : 'contemporary';
    const styleData = this.givenNames[style as keyof typeof this.givenNames];
    const useDouble = Math.random() < 0.6;
    if (useDouble && styleData.double.length > 0) {
      const pair = styleData.double[Math.floor(Math.random() * styleData.double.length)];
      return pair[0] + pair[1];
    }
    return styleData.single[Math.floor(Math.random() * styleData.single.length)];
  },

  isValidName(name: string): boolean {
    if (this.badNames.includes(name)) return false;
    return !this.badChars.some(char => name.includes(char));
  },
};

// ========== 罪名生成器（全局定义，不依赖DS）==========
const CrimeGenerator = {
  characterBookCrimes: [
    '危险驾驶罪',
    '盗窃罪',
    '诈骗罪',
    '故意伤害罪',
    '走私毒品罪',
    '贩卖毒品罪',
    '运输毒品罪',
    '制造毒品罪',
    '交通肇事罪',
    '寻衅滋事罪',
    '抢劫罪',
    '故意杀人罪',
    '开设赌场罪',
    '敲诈勒索罪',
    '贪污罪',
    '受贿罪',
    '聚众斗殴罪',
    '非法拘禁罪',
    '容留他人吸毒罪',
    '掩饰隐瞒犯罪所得罪',
    '帮助信息网络犯罪活动罪',
    '职务侵占罪',
  ],
  crimes: {
    violent: {
      names: ['故意杀人罪', '故意伤害罪', '抢劫罪', '绑架罪', '非法拘禁罪', '聚众斗殴罪'],
      weight: 12,
      sentenceRange: [3, 20] as [number, number],
    },
    property: {
      names: [
        '盗窃罪',
        '诈骗罪',
        '抢夺罪',
        '敲诈勒索罪',
        '职务侵占罪',
        '挪用资金罪',
        '贪污罪',
        '受贿罪',
        '掩饰隐瞒犯罪所得罪',
      ],
      weight: 35,
      sentenceRange: [1, 15] as [number, number],
    },
    drug: {
      names: [
        '贩卖毒品罪',
        '运输毒品罪',
        '制造毒品罪',
        '走私毒品罪',
        '非法持有毒品罪',
        '容留他人吸毒罪',
        '引诱他人吸毒罪',
      ],
      weight: 20,
      sentenceRange: [3, 15] as [number, number],
    },
    economic: {
      names: ['非法吸收公众存款罪', '集资诈骗罪', '合同诈骗罪', '信用卡诈骗罪', '洗钱罪', '虚开发票罪', '逃税罪'],
      weight: 15,
      sentenceRange: [2, 10] as [number, number],
    },
    social: {
      names: [
        '寻衅滋事罪',
        '聚众斗殴罪',
        '开设赌场罪',
        '组织卖淫罪',
        '传播淫秽物品罪',
        '妨害公务罪',
        '帮助信息网络犯罪活动罪',
      ],
      weight: 13,
      sentenceRange: [1, 7] as [number, number],
    },
    other: {
      names: ['交通肇事罪', '危险驾驶罪', '生产销售伪劣产品罪', '非法经营罪', '污染环境罪', '走私罪'],
      weight: 5,
      sentenceRange: [1, 5] as [number, number],
    },
  },

  generate(): { crime: string; sentence: number; category: { sentenceRange: [number, number] } } {
    if (Math.random() < 0.3) {
      const crime = this.characterBookCrimes[Math.floor(Math.random() * this.characterBookCrimes.length)];
      const category = this.findCategoryByCrime(crime);
      const sentence = this.generateSentence(category ? category.sentenceRange : [1, 10]);
      return { crime, sentence, category: category || this.crimes.property };
    }

    const categories = Object.values(this.crimes);
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    let random = Math.random() * totalWeight;
    for (const category of categories) {
      random -= category.weight;
      if (random <= 0) {
        const crime = category.names[Math.floor(Math.random() * category.names.length)];
        const sentence = this.generateSentence(category.sentenceRange);
        return { crime, sentence, category };
      }
    }

    return { crime: '盗窃罪', sentence: 3, category: this.crimes.property };
  },

  findCategoryByCrime(crimeName: string) {
    for (const key of Object.keys(this.crimes)) {
      const category = this.crimes[key as keyof typeof this.crimes];
      if (category.names.includes(crimeName)) return category;
    }
    return null;
  },

  generateSentence(range: [number, number]): number {
    const [min, max] = range;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// 在 jQuery ready 时初始化，确保核心系统已创建
$(() => {
  const DS_RAW = window.detentionSystem as DetentionSystemWithNPC | undefined;

  if (!DS_RAW) {
    console.error('❌ [NPC系统] 核心系统未加载！');
    console.error('[NPC系统] window.detentionSystem:', typeof window.detentionSystem);
    console.error('[NPC系统] window.__DETENTION_SYSTEM_LOADED__:', (window as any).__DETENTION_SYSTEM_LOADED__);
    console.error(
      '[NPC系统] window.__DETENTION_SYSTEM_CORE_LOADED__:',
      (window as any).__DETENTION_SYSTEM_CORE_LOADED__,
    );
    // #region agent log - HYP-B: 核心系统未找到
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'npc_system.ts:核心系统未找到',
          message: 'NPC系统检测到核心系统未加载',
          data: {
            windowType: typeof window,
            detentionSystemType: typeof window.detentionSystem,
            modulesLoaded:
              typeof window.detentionSystem !== 'undefined' && (window.detentionSystem as any).modules
                ? Object.keys((window.detentionSystem as any).modules)
                : [],
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'npc-load-debug',
          hypothesisId: 'B',
        }),
      }).catch(() => {});
    } catch (e) {
      console.error('[NPC系统] 调试日志发送失败:', e);
    }
    // #endregion
    return;
  }

  // 类型断言：DS 一定存在
  const DS = DS_RAW as DetentionSystemWithNPC;

  console.info('✓ [NPC系统] 开始加载...');
  // 创建全局标记
  (window as any).__NPC_SYSTEM_LOADING__ = true;
  // #region agent log - HYP-C: 核心系统已找到，开始初始化
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'npc_system.ts:核心系统已找到',
        message: 'NPC系统检测到核心系统，开始初始化',
        data: {
          hasGenerateNPC: typeof DS.generateNPC === 'function',
          hasGenerateNPCForEvent: typeof DS.generateNPCForEvent === 'function',
          hasGetCurrentCellNPCs: typeof DS.getCurrentCellNPCs === 'function',
          hasModules: 'modules' in DS,
          modulesCount: 'modules' in DS ? Object.keys(DS.modules).length : 0,
          moduleNames: 'modules' in DS ? Object.keys(DS.modules) : [],
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'npc-load-debug',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
  } catch (e) {
    console.error('[NPC系统] 调试日志发送失败:', e);
  }
  // #endregion

  // ========== NPC生成器 ==========
  const NPCGenerator = {
    npcDatabase: [] as NPC[],
    currentCellNPCs: [] as NPC[],

    generate(count = 1, context: Record<string, unknown> = {}): NPC[] {
      const npcs: NPC[] = [];
      for (let i = 0; i < count; i++) {
        const npc = this.generateSingle(context);
        npcs.push(npc);
        this.npcDatabase.push(npc);
      }
      return npcs;
    },

    generateSingle(context: Record<string, unknown> = {}): NPC {
      const eventSystem = DS.getModule<EventSystemModule>('eventSystem');
      const stageInfo = eventSystem?.getCurrentStageInfo ? eventSystem.getCurrentStageInfo() : {};

      const age = this.generateAge();
      const birthYear = new Date().getFullYear() - age;
      const name = NameGenerator.generate(birthYear);
      const crimeData = CrimeGenerator.generate();
      const appearance = this.generateAppearance(age);
      const personality = this.generatePersonality();
      const background = this.generateBackground(age, crimeData);
      const relationship = this.generateRelationship();

      const cellType =
        typeof stageInfo?.cellType === 'string' ? stageInfo.cellType : (context.cellType as string) || 'transition';
      this.adjustByCellType(personality, relationship, cellType);

      const npc: NPC = {
        id: this.generateId(),
        name,
        gender: 'female',
        age,
        crime: crimeData.crime,
        sentence: crimeData.sentence,
        appearance,
        personality,
        background,
        relationship,
        cellType,
        daysInCustody: Math.floor(Math.random() * 365) + 30,
        status: 'active',
        createdAt: Date.now(),
      };
      return npc;
    },

    generateAge(): number {
      const random = Math.random();
      if (random < 0.05) return Math.floor(Math.random() * 3) + 18;
      if (random < 0.25) return Math.floor(Math.random() * 10) + 21;
      if (random < 0.55) return Math.floor(Math.random() * 10) + 31;
      if (random < 0.8) return Math.floor(Math.random() * 10) + 41;
      if (random < 0.95) return Math.floor(Math.random() * 10) + 51;
      return Math.floor(Math.random() * 15) + 61;
    },

    generateAppearance(age: number): NPCAppearance {
      const heights = [150, 155, 160, 165, 170, 175];
      const weights = [45, 50, 55, 60, 65, 70, 75];
      const height = heights[Math.floor(Math.random() * heights.length)];
      const weight = weights[Math.floor(Math.random() * weights.length)];
      const hairStyles =
        age > 50
          ? ['短发', '花白短发', '灰白短发', '稀疏短发']
          : ['长发', '短发', '马尾', '齐肩发', '波浪卷', '直发', '卷发'];
      const skinTones = ['白皙', '偏白', '自然', '偏黑', '黝黑'];
      const features = ['清秀', '普通', '憔悴', '精致', '沧桑', '姣好', '端庄'];
      return {
        height,
        weight,
        hair: hairStyles[Math.floor(Math.random() * hairStyles.length)],
        eyes: '黑色',
        skin: skinTones[Math.floor(Math.random() * skinTones.length)],
        features: features[Math.floor(Math.random() * features.length)],
      };
    },

    generatePersonality(): NPCPersonality {
      const traits: NPCTraits = {
        aggression: Math.floor(Math.random() * 100),
        sociability: Math.floor(Math.random() * 100),
        intelligence: Math.floor(Math.random() * 100),
        emotional: Math.floor(Math.random() * 100),
        dominance: Math.floor(Math.random() * 100),
        kindness: Math.floor(Math.random() * 100),
      };
      const tags: string[] = [];
      if (traits.aggression > 70) tags.push('暴力倾向');
      if (traits.sociability > 70) tags.push('善于交际');
      if (traits.intelligence > 70) tags.push('聪明');
      if (traits.emotional > 70) tags.push('情绪化');
      if (traits.dominance > 70) tags.push('强势');
      if (traits.kindness > 70) tags.push('善良');
      if (traits.aggression < 30) tags.push('温和');
      if (traits.sociability < 30) tags.push('孤僻');
      if (traits.emotional < 30) tags.push('冷静');
      if (traits.dominance < 30) tags.push('顺从');
      return { traits, tags };
    },

    generateBackground(
      age: number,
      _crimeData: { crime: string; sentence: number; category: { sentenceRange: [number, number] } },
    ): NPCBackground {
      const educations = ['小学', '初中', '高中', '中专', '大专', '本科', '研究生'];
      const educationWeights = [10, 25, 30, 15, 10, 8, 2];
      const educationIndex = this.weightedRandom(educations.length, educationWeights);
      const maritalStatuses = ['未婚', '已婚', '离异', '丧偶'];
      const maritalWeights = age < 25 ? [80, 15, 5, 0] : age < 40 ? [20, 60, 15, 5] : [10, 50, 30, 10];
      const maritalIndex = this.weightedRandom(maritalStatuses.length, maritalWeights);
      const hasChildren = maritalStatuses[maritalIndex] !== '未婚' && Math.random() < 0.7;
      const childrenCount = hasChildren ? Math.floor(Math.random() * 3) + 1 : 0;
      return {
        education: educations[educationIndex],
        maritalStatus: maritalStatuses[maritalIndex],
        hasChildren,
        childrenCount,
        hometown: this.generateHometown(),
        priorConvictions: Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
      };
    },

    generateHometown(): string {
      const provinces = [
        '河南',
        '山东',
        '四川',
        '广东',
        '江苏',
        '河北',
        '湖南',
        '安徽',
        '湖北',
        '浙江',
        '广西',
        '云南',
        '江西',
        '辽宁',
        '黑龙江',
        '陕西',
        '福建',
        '山西',
        '贵州',
        '重庆',
      ];
      return provinces[Math.floor(Math.random() * provinces.length)];
    },

    generateRelationship(): NPCRelationship {
      return {
        toProtagonist: 50,
        faction: null,
        allies: [],
        enemies: [],
        influence: Math.floor(Math.random() * 100),
      };
    },

    adjustByCellType(personality: NPCPersonality, relationship: NPCRelationship, cellType: string) {
      if (cellType === 'transition') {
        personality.traits.emotional += 10;
        relationship.influence -= 20;
      } else if (cellType === 'pretrial') {
        personality.traits.emotional += 15;
        personality.traits.aggression += 5;
      } else if (cellType === 'convicted') {
        personality.traits.emotional -= 10;
        personality.traits.aggression += 10;
        relationship.influence += 10;
      }
      (Object.keys(personality.traits) as Array<keyof NPCTraits>).forEach(key => {
        personality.traits[key] = Math.max(0, Math.min(100, personality.traits[key]));
      });
      relationship.influence = Math.max(0, Math.min(100, relationship.influence));
    },

    weightedRandom(count: number, weights: number[]): number {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;
      for (let i = 0; i < count; i++) {
        random -= weights[i];
        if (random <= 0) return i;
      }
      return count - 1;
    },

    generateId(): string {
      return 'npc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    },

    generateForEvent(eventType: string): NPC | { police: NPC; witnesses: NPC[] } {
      if (eventType === 'interrogation') return this.generatePolice();
      if (eventType === 'lawyer_visit') return this.generateLawyer();
      if (eventType === 'family_visit') return this.generateFamily();
      if (eventType === 'medical_visit') return this.generateDoctor();
      if (eventType === 'scene_identification') {
        return { police: this.generatePolice(), witnesses: this.generate(2, { type: 'witness' }) };
      }
      return this.generateSingle({ eventType });
    },

    generatePolice(): NPC {
      const age = Math.floor(Math.random() * 20) + 25;
      const birthYear = new Date().getFullYear() - age;
      const name = NameGenerator.generate(birthYear);
      const ranks = ['民警', '警长', '副队长', '队长'];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const npc: NPC = {
        id: this.generateId(),
        name,
        gender: 'female',
        age,
        role: 'police',
        rank,
        appearance: this.generateAppearance(age),
        personality: {
          traits: {
            aggression: Math.floor(Math.random() * 30) + 40,
            sociability: Math.floor(Math.random() * 40) + 30,
            intelligence: Math.floor(Math.random() * 30) + 50,
            emotional: Math.floor(Math.random() * 40) + 20,
            dominance: Math.floor(Math.random() * 30) + 60,
            kindness: Math.floor(Math.random() * 60) + 20,
          },
          tags: ['严肃', '专业'],
        },
        attitude: Math.floor(Math.random() * 40) + 30,
        crime: '——',
        sentence: 0,
        background: this.generateBackground(age, { crime: '', sentence: 0, category: { sentenceRange: [0, 0] } }),
        relationship: this.generateRelationship(),
        cellType: 'staff',
        daysInCustody: 0,
        status: 'active',
        createdAt: Date.now(),
      };
      return npc;
    },

    generateLawyer(): NPC {
      const age = Math.floor(Math.random() * 25) + 28;
      const birthYear = new Date().getFullYear() - age;
      const isFemale = Math.random() < 0.8;
      const name = NameGenerator.generate(birthYear);
      const types = ['法律援助律师', '私人律师', '知名律师'];
      const typeWeights = [50, 40, 10];
      const typeIndex = this.weightedRandom(types.length, typeWeights);
      const npc: NPC = {
        id: this.generateId(),
        name,
        gender: isFemale ? 'female' : 'male',
        age,
        role: 'lawyer',
        type: types[typeIndex],
        appearance: this.generateAppearance(age),
        personality: {
          traits: {
            aggression: Math.floor(Math.random() * 20) + 20,
            sociability: Math.floor(Math.random() * 30) + 60,
            intelligence: Math.floor(Math.random() * 20) + 70,
            emotional: Math.floor(Math.random() * 40) + 30,
            dominance: Math.floor(Math.random() * 40) + 40,
            kindness: Math.floor(Math.random() * 40) + 40,
          },
          tags: ['专业', '理性'],
        },
        experience: Math.floor(Math.random() * 20) + 5,
        successRate: Math.floor(Math.random() * 40) + 40,
        crime: '——',
        sentence: 0,
        background: this.generateBackground(age, { crime: '', sentence: 0, category: { sentenceRange: [0, 0] } }),
        relationship: this.generateRelationship(),
        cellType: 'external',
        daysInCustody: 0,
        status: 'active',
        createdAt: Date.now(),
      };
      return npc;
    },

    generateFamily(): NPC {
      const relationships = ['母亲', '父亲', '丈夫', '妻子', '姐姐', '妹妹', '女儿', '儿子'];
      const weights = [30, 20, 15, 10, 10, 10, 3, 2];
      const relationIndex = this.weightedRandom(relationships.length, weights);
      const relation = relationships[relationIndex];
      let age = 40;
      let isFemale = true;
      if (relation === '母亲') {
        age = Math.floor(Math.random() * 20) + 45;
        isFemale = true;
      } else if (relation === '父亲') {
        age = Math.floor(Math.random() * 20) + 45;
        isFemale = false;
      } else if (relation === '丈夫') {
        age = Math.floor(Math.random() * 30) + 25;
        isFemale = false;
      } else if (relation === '妻子') {
        age = Math.floor(Math.random() * 30) + 25;
        isFemale = true;
      } else if (relation === '姐姐' || relation === '妹妹') {
        age = Math.floor(Math.random() * 30) + 20;
        isFemale = true;
      } else if (relation === '女儿') {
        age = Math.floor(Math.random() * 15) + 5;
        isFemale = true;
      } else if (relation === '儿子') {
        age = Math.floor(Math.random() * 15) + 5;
        isFemale = false;
      }
      const birthYear = new Date().getFullYear() - age;
      const name = NameGenerator.generate(birthYear);
      const npc: NPC = {
        id: this.generateId(),
        name,
        gender: isFemale ? 'female' : 'male',
        age,
        role: 'family',
        relation,
        appearance: this.generateAppearance(age),
        personality: {
          traits: {
            aggression: Math.floor(Math.random() * 30) + 10,
            sociability: Math.floor(Math.random() * 50) + 30,
            intelligence: Math.floor(Math.random() * 60) + 30,
            emotional: Math.floor(Math.random() * 50) + 40,
            dominance: Math.floor(Math.random() * 50) + 20,
            kindness: Math.floor(Math.random() * 30) + 60,
          },
          tags: ['关心', '担忧'],
        },
        supportLevel: Math.floor(Math.random() * 40) + 60,
        crime: '——',
        sentence: 0,
        background: this.generateBackground(age, { crime: '', sentence: 0, category: { sentenceRange: [0, 0] } }),
        relationship: this.generateRelationship(),
        cellType: 'external',
        daysInCustody: 0,
        status: 'active',
        createdAt: Date.now(),
      };
      return npc;
    },

    generateDoctor(): NPC {
      const age = Math.floor(Math.random() * 25) + 30;
      const birthYear = new Date().getFullYear() - age;
      const name = NameGenerator.generate(birthYear);
      const specialties = ['内科', '外科', '精神科', '妇科', '急诊科'];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      const npc: NPC = {
        id: this.generateId(),
        name,
        gender: 'female',
        age,
        role: 'doctor',
        specialty,
        appearance: this.generateAppearance(age),
        personality: {
          traits: {
            aggression: Math.floor(Math.random() * 20) + 10,
            sociability: Math.floor(Math.random() * 40) + 40,
            intelligence: Math.floor(Math.random() * 20) + 70,
            emotional: Math.floor(Math.random() * 40) + 30,
            dominance: Math.floor(Math.random() * 40) + 40,
            kindness: Math.floor(Math.random() * 30) + 60,
          },
          tags: ['专业', '冷静'],
        },
        experience: Math.floor(Math.random() * 25) + 5,
        crime: '——',
        sentence: 0,
        background: this.generateBackground(age, { crime: '', sentence: 0, category: { sentenceRange: [0, 0] } }),
        relationship: this.generateRelationship(),
        cellType: 'external',
        daysInCustody: 0,
        status: 'active',
        createdAt: Date.now(),
      };
      return npc;
    },

    /**
     * 生成主角信息
     * @param options 主角生成选项
     * @returns 主角信息对象
     */
    generateProtagonist(options: ProtagonistOptions = {}): ProtagonistInfo {
      // #region agent log - HYP-PROTAGONIST: 开始生成主角
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'npc_system.ts:generateProtagonist开始',
            message: '开始生成主角',
            data: {
              options: options,
              hasOptions: !!options,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'protagonist-generation',
            hypothesisId: 'PROTAGONIST_START',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion

      // 1. 生成年龄
      let age: number;
      if (options.ageRange && options.ageRange.length === 2) {
        const [min, max] = options.ageRange;
        age = Math.floor(Math.random() * (max - min + 1)) + min;
      } else if (options.background?.isIntellectual || options.background?.isBusiness) {
        // 高级知识分子或商业背景：35-45岁
        age = Math.floor(Math.random() * 11) + 35;
      } else {
        // 默认：28-42岁
        age = Math.floor(Math.random() * 15) + 28;
      }
      const birthYear = new Date().getFullYear() - age;

      // 2. 生成姓名
      const name = NameGenerator.generate(birthYear);

      // 3. 生成罪名
      let crimeData: { crime: string; sentence: number; category: { sentenceRange: [number, number] } };
      if (options.crimeName) {
        // 如果指定了具体罪名
        const category = CrimeGenerator.findCategoryByCrime(options.crimeName);
        const sentenceRange = category ? category.sentenceRange : [2, 10];
        crimeData = {
          crime: options.crimeName,
          sentence: CrimeGenerator.generateSentence(sentenceRange),
          category: category || CrimeGenerator.crimes.economic,
        };
      } else if (options.crimeType) {
        // 如果指定了犯罪类型
        const categoryKey = options.crimeType as keyof typeof CrimeGenerator.crimes;
        if (CrimeGenerator.crimes[categoryKey]) {
          const category = CrimeGenerator.crimes[categoryKey];
          const crime = category.names[Math.floor(Math.random() * category.names.length)];
          // 检查是否需要排除某些罪名
          let filteredCrimes = category.names;
          if (options.excludeCrimes && options.excludeCrimes.length > 0) {
            filteredCrimes = category.names.filter(c => !options.excludeCrimes!.includes(c));
          }
          if (filteredCrimes.length === 0) {
            filteredCrimes = category.names; // 如果全部被排除，使用原列表
          }
          const selectedCrime = filteredCrimes[Math.floor(Math.random() * filteredCrimes.length)];
          crimeData = {
            crime: selectedCrime,
            sentence: CrimeGenerator.generateSentence(category.sentenceRange),
            category: category,
          };
        } else {
          // 默认使用经济犯罪
          const category = CrimeGenerator.crimes.economic;
          const filteredCrimes = options.excludeCrimes
            ? category.names.filter(c => !options.excludeCrimes!.includes(c))
            : category.names;
          const selectedCrime =
            filteredCrimes.length > 0
              ? filteredCrimes[Math.floor(Math.random() * filteredCrimes.length)]
              : category.names[0];
          crimeData = {
            crime: selectedCrime,
            sentence: CrimeGenerator.generateSentence(category.sentenceRange),
            category: category,
          };
        }
      } else if (options.background?.isIntellectual || options.background?.isBusiness) {
        // 高级知识分子或商业背景：优先经济犯罪
        const category = CrimeGenerator.crimes.economic;
        const filteredCrimes = options.excludeCrimes
          ? category.names.filter(c => !options.excludeCrimes!.includes(c))
          : category.names;
        const selectedCrime =
          filteredCrimes.length > 0
            ? filteredCrimes[Math.floor(Math.random() * filteredCrimes.length)]
            : category.names[0];
        crimeData = {
          crime: selectedCrime,
          sentence: CrimeGenerator.generateSentence(category.sentenceRange),
          category: category,
        };
      } else {
        // 默认生成
        crimeData = CrimeGenerator.generate();
        // 应用排除列表
        if (options.excludeCrimes && options.excludeCrimes.includes(crimeData.crime)) {
          // 如果生成的罪名在排除列表中，重新生成
          let attempts = 0;
          while (attempts < 10 && options.excludeCrimes.includes(crimeData.crime)) {
            crimeData = CrimeGenerator.generate();
            attempts++;
          }
        }
      }

      // 4. 生成外貌
      const appearance = this.generateAppearance(age);

      // 5. 生成教育背景
      let education: string;
      if (options.education === 'high') {
        const highEducations = ['本科', '研究生', '硕士', '博士'];
        education = highEducations[Math.floor(Math.random() * highEducations.length)];
      } else if (options.education === 'medium') {
        const mediumEducations = ['大专', '中专', '高职'];
        education = mediumEducations[Math.floor(Math.random() * mediumEducations.length)];
      } else if (options.education === 'low') {
        const lowEducations = ['小学', '初中', '高中'];
        education = lowEducations[Math.floor(Math.random() * lowEducations.length)];
      } else if (options.background?.isIntellectual) {
        // 高级知识分子：本科及以上
        const highEducations = ['本科', '研究生', '硕士', '博士'];
        education = highEducations[Math.floor(Math.random() * highEducations.length)];
      } else if (options.background?.isBusiness) {
        // 商业背景：大专及以上
        const businessEducations = ['大专', '本科', '研究生', 'MBA'];
        education = businessEducations[Math.floor(Math.random() * businessEducations.length)];
      } else {
        // 默认：根据年龄决定
        if (age < 30) {
          const educations = ['高中', '大专', '本科', '研究生'];
          const weights = [20, 30, 40, 10];
          education = educations[this.weightedRandom(educations.length, weights)];
        } else {
          const educations = ['高中', '大专', '本科', '研究生', '硕士', '博士'];
          const weights = [15, 25, 35, 10, 10, 5];
          education = educations[this.weightedRandom(educations.length, weights)];
        }
      }

      // 6. 生成职业背景
      let profession: string | undefined;
      if (options.profession && options.profession.length > 0) {
        profession = options.profession[Math.floor(Math.random() * options.profession.length)];
      } else if (options.background?.isBusiness) {
        const businessProfessions = ['企业家', '公司高管', '金融从业者', '投资顾问', '企业管理者'];
        profession = businessProfessions[Math.floor(Math.random() * businessProfessions.length)];
      } else if (options.background?.isIntellectual && !options.background?.isAcademic) {
        // 高级知识分子但非学术背景
        const intellectualProfessions = ['企业高管', '金融从业者', '咨询顾问', '高级管理者', '技术总监'];
        profession = intellectualProfessions[Math.floor(Math.random() * intellectualProfessions.length)];
      } else if (options.background?.isAcademic) {
        const academicProfessions = ['教授', '研究员', '学者', '高校教师', '科研人员'];
        profession = academicProfessions[Math.floor(Math.random() * academicProfessions.length)];
      }

      // 7. 生成婚姻状况
      const maritalStatuses = age < 30 ? ['未婚', '已婚'] : age < 40 ? ['已婚', '离异', '未婚'] : ['已婚', '离异'];
      const maritalWeights =
        age < 30
          ? [40, 60]
          : age < 40
            ? [60, 25, 15]
            : education === '博士' || education === '硕士'
              ? [70, 30]
              : [65, 35];
      const maritalIndex = this.weightedRandom(maritalStatuses.length, maritalWeights);
      const maritalStatus = maritalStatuses[maritalIndex];

      // 8. 生成子女信息
      const hasChildren = maritalStatus !== '未婚' && age > 28 && Math.random() < 0.7;
      const childrenCount = hasChildren ? (age < 35 ? 1 : Math.floor(Math.random() * 2) + 1) : 0;

      // 9. 生成家乡
      const hometown = this.generateHometown();

      // 10. 生成性格特质（针对主角）
      const personality: ProtagonistInfo['personality'] = {
        traits: {
          intelligence: options.background?.isIntellectual
            ? Math.floor(Math.random() * 15) + 80
            : options.background?.isBusiness
              ? Math.floor(Math.random() * 20) + 70
              : Math.floor(Math.random() * 30) + 60,
          sociability: options.background?.isBusiness
            ? Math.floor(Math.random() * 25) + 60
            : Math.floor(Math.random() * 40) + 40,
          emotional: Math.floor(Math.random() * 40) + 30,
        },
        tags: [],
      };

      // 添加标签
      if (options.background?.isIntellectual) {
        personality.tags.push('高学历', '理性');
        if (!options.background.isAcademic) {
          personality.tags.push('非学术背景');
        }
      }
      if (options.background?.isBusiness) {
        personality.tags.push('商业背景', '精明');
      }
      if (personality.traits.intelligence >= 75) {
        personality.tags.push('聪明');
      }
      if (personality.traits.sociability >= 60) {
        personality.tags.push('善于交际');
      }

      // #region agent log - HYP-PROTAGONIST: 主角生成完成
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'npc_system.ts:generateProtagonist完成',
            message: '主角生成完成',
            data: {
              name: name,
              age: age,
              crime: crimeData.crime,
              sentence: crimeData.sentence,
              education: education,
              profession: profession,
              personalityTags: personality.tags,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'protagonist-generation',
            hypothesisId: 'PROTAGONIST_COMPLETE',
          }),
        }).catch(() => {});
      } catch (e) {}
      // #endregion

      return {
        name,
        age,
        crime: crimeData.crime,
        sentence: crimeData.sentence,
        appearance: {
          height: appearance.height,
          weight: appearance.weight,
          hair: appearance.hair,
          skin: appearance.skin,
          features: appearance.features,
          eyes: appearance.eyes,
        },
        background: {
          education,
          profession,
          maritalStatus,
          hasChildren,
          childrenCount,
          hometown,
        },
        personality,
      };
    },

    getCurrentCellNPCs(): NPC[] {
      return this.currentCellNPCs;
    },

    setCurrentCellNPCs(npcs: NPC[]) {
      this.currentCellNPCs = npcs;
      DS.events.emit('cell_npcs_changed', { npcs });
    },

    addNPCToCell(npc: NPC) {
      this.currentCellNPCs.push(npc);
      DS.events.emit('npc_joined_cell', { npc });
    },

    removeNPCFromCell(npcId: string): NPC | null {
      const index = this.currentCellNPCs.findIndex(n => n.id === npcId);
      if (index !== -1) {
        const npc = this.currentCellNPCs.splice(index, 1)[0];
        DS.events.emit('npc_left_cell', { npc });
        return npc;
      }
      return null;
    },

    findNPCById(npcId: string): NPC | undefined {
      return this.npcDatabase.find(n => n.id === npcId) || this.currentCellNPCs.find(n => n.id === npcId);
    },

    updateRelationship(npcId: string, delta: number) {
      const npc = this.findNPCById(npcId);
      if (npc && npc.relationship) {
        npc.relationship.toProtagonist = Math.max(0, Math.min(100, npc.relationship.toProtagonist + delta));
        DS.events.emit('relationship_changed', {
          npcId,
          npcName: npc.name,
          value: npc.relationship.toProtagonist,
          delta,
        });
      }
    },

    exportData() {
      return {
        database: this.npcDatabase,
        currentCell: this.currentCellNPCs,
      };
    },

    importData(data: { database?: NPC[]; currentCell?: NPC[] } | undefined): boolean {
      if (!data) return false;
      try {
        this.npcDatabase = data.database || [];
        this.currentCellNPCs = data.currentCell || [];
        console.info('[NPC系统] 数据导入成功');
        return true;
      } catch (error) {
        console.error('[NPC系统] 数据导入失败:', error);
        return false;
      }
    },

    clearData() {
      this.npcDatabase = [];
      this.currentCellNPCs = [];
      console.info('[NPC系统] 数据已清空');
    },
  };

  // ========== 注册到核心系统 ==========
  DS.generateNPC = (count?: number, context?: Record<string, unknown>) => NPCGenerator.generate(count, context ?? {});
  DS.generateNPCForEvent = (eventType: string) => NPCGenerator.generateForEvent(eventType);
  DS.generateProtagonist = (options?: ProtagonistOptions) => NPCGenerator.generateProtagonist(options);
  DS.getCurrentCellNPCs = () => NPCGenerator.getCurrentCellNPCs();
  DS.setCurrentCellNPCs = (npcs: NPC[]) => NPCGenerator.setCurrentCellNPCs(npcs);
  DS.addNPCToCell = (npc: NPC) => NPCGenerator.addNPCToCell(npc);
  DS.removeNPCFromCell = (npcId: string) => NPCGenerator.removeNPCFromCell(npcId);
  DS.findNPC = (npcId: string) => NPCGenerator.findNPCById(npcId);
  DS.updateNPCRelationship = (npcId: string, delta: number) => NPCGenerator.updateRelationship(npcId, delta);
  DS.exportNPCData = () => NPCGenerator.exportData();
  DS.importNPCData = (data?: { database?: NPC[]; currentCell?: NPC[] }) => NPCGenerator.importData(data);

  DS.registerModule('npcSystem', NPCGenerator);

  // #region agent log - HYP-D: 模块注册完成
  try {
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'npc_system.ts:模块注册',
        message: 'NPC系统模块注册完成',
        data: {
          registeredModule: DS.getModule('npcSystem') ? '已注册' : '未注册',
          hasGenerateNPC: typeof DS.generateNPC === 'function',
          hasGenerateNPCForEvent: typeof DS.generateNPCForEvent === 'function',
          hasGetCurrentCellNPCs: typeof DS.getCurrentCellNPCs === 'function',
          modulesCount: Object.keys(DS.modules).length,
          moduleNames: Object.keys(DS.modules),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'npc-load-debug',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
  } catch (e) {
    console.error('[NPC系统] 调试日志发送失败:', e);
  }
  // #endregion

  // 同步到主窗口（iframe 环境）
  try {
    if (window.parent && window.parent !== window) {
      // #region agent log - HYP-E: 同步到主窗口前
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'npc_system.ts:同步到主窗口前',
            message: '准备同步NPC系统到主窗口',
            data: {
              parentExists: !!window.parent,
              parentIsDifferent: window.parent !== window,
              parentHasDetentionSystem: typeof (window.parent as any).detentionSystem !== 'undefined',
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'npc-load-debug',
            hypothesisId: 'E',
          }),
        }).catch(() => {});
      } catch (e) {
        console.error('[NPC系统] 调试日志发送失败:', e);
      }
      // #endregion

      // 同步整个 DS 对象（包含所有已挂载的方法）
      const parentWindow = window.parent as typeof window.parent & { detentionSystem?: DetentionSystem };
      parentWindow.detentionSystem = DS;
      // 确保主窗口的 DS 也有所有方法
      if (parentWindow.detentionSystem) {
        parentWindow.detentionSystem.generateNPC = DS.generateNPC;
        parentWindow.detentionSystem.generateNPCForEvent = DS.generateNPCForEvent;
        parentWindow.detentionSystem.generateProtagonist = DS.generateProtagonist;
        parentWindow.detentionSystem.getCurrentCellNPCs = DS.getCurrentCellNPCs;
        parentWindow.detentionSystem.setCurrentCellNPCs = DS.setCurrentCellNPCs;
        parentWindow.detentionSystem.addNPCToCell = DS.addNPCToCell;
        parentWindow.detentionSystem.removeNPCFromCell = DS.removeNPCFromCell;
        parentWindow.detentionSystem.findNPC = DS.findNPC;
        parentWindow.detentionSystem.updateNPCRelationship = DS.updateNPCRelationship;
        parentWindow.detentionSystem.exportNPCData = DS.exportNPCData;
        parentWindow.detentionSystem.importNPCData = DS.importNPCData;
        parentWindow.detentionSystem.generateProtagonist = DS.generateProtagonist;
      }
      console.info('[NPC系统] ✓ 已同步到主窗口，包括所有NPC方法');

      // 验证同步是否成功
      const parentDS = (window.parent as any).detentionSystem;
      if (parentDS) {
        const verification = {
          hasGenerateNPC: typeof parentDS.generateNPC === 'function',
          hasGenerateNPCForEvent: typeof parentDS.generateNPCForEvent === 'function',
          hasGenerateProtagonist: typeof parentDS.generateProtagonist === 'function',
          hasGetCurrentCellNPCs: typeof parentDS.getCurrentCellNPCs === 'function',
          hasSetCurrentCellNPCs: typeof parentDS.setCurrentCellNPCs === 'function',
          modulesCount: parentDS.modules ? Object.keys(parentDS.modules).length : 0,
          hasNPCSystemModule: !!(
            parentDS.getModule &&
            typeof parentDS.getModule === 'function' &&
            parentDS.getModule('npcSystem')
          ),
        };
        // 验证成功时使用 info，只有在验证失败时才使用 error
        if (verification.hasGenerateNPC && verification.hasNPCSystemModule) {
          console.info('[NPC系统] ✓ 主窗口验证结果:', verification);
        } else {
          console.error('[NPC系统] ⚠️ 警告：主窗口同步可能不完整！', verification);
        }
      } else {
        console.error('[NPC系统] ❌ 错误：主窗口 detentionSystem 为空！');
      }

      // #region agent log - HYP-F: 同步到主窗口后
      try {
        fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'npc_system.ts:同步到主窗口后',
            message: 'NPC系统已同步到主窗口',
            data: {
              parentHasDetentionSystem: typeof (window.parent as any).detentionSystem !== 'undefined',
              parentHasGenerateNPC: typeof (window.parent as any).detentionSystem?.generateNPC === 'function',
              parentHasGenerateProtagonist:
                typeof (window.parent as any).detentionSystem?.generateProtagonist === 'function',
              parentHasGenerateNPCForEvent:
                typeof (window.parent as any).detentionSystem?.generateNPCForEvent === 'function',
              iframeHasGenerateProtagonist: typeof DS.generateProtagonist === 'function',
              parentModulesCount: (window.parent as any).detentionSystem?.modules
                ? Object.keys((window.parent as any).detentionSystem.modules).length
                : 0,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'npc-load-debug',
            hypothesisId: 'F',
          }),
        }).catch(() => {});
      } catch (e) {
        console.error('[NPC系统] 调试日志发送失败:', e);
      }
      // #endregion
    }
  } catch (e) {
    // #region agent log - HYP-G: 同步失败
    try {
      fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'npc_system.ts:同步失败',
          message: 'NPC系统同步到主窗口失败',
          data: {
            error: e instanceof Error ? e.message : String(e),
            errorType: typeof e,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'npc-load-debug',
          hypothesisId: 'G',
        }),
      }).catch(() => {});
    } catch (logError) {
      console.error('[NPC系统] 调试日志发送失败:', logError);
    }
    // #endregion
    console.warn('[NPC系统] 同步到主窗口失败:', e);
  }

  // ========== 监听事件系统 ==========
  DS.events.on('event_triggered', (event?: unknown) => {
    const eventId =
      typeof (event as EventTriggeredPayload | undefined)?.id === 'string'
        ? (event as EventTriggeredPayload).id
        : undefined;
    if (!eventId) return;
    if (['interrogation', 'lawyer_visit', 'family_visit', 'medical_visit', 'scene_identification'].includes(eventId)) {
      const npc = NPCGenerator.generateForEvent(eventId);
      DS.events.emit('event_npc_generated', { event, npc });
    }
  });

  // ========== 监听监室转移 ==========
  DS.events.on('cell_transfer', (data?: unknown) => {
    const to = (data as CellTransferPayload | undefined)?.to;
    const newCellType = typeof to === 'string' ? to : 'transition';
    const npcCount = Math.floor(Math.random() * 5) + 3;
    const newNPCs = NPCGenerator.generate(npcCount, { cellType: newCellType });
    NPCGenerator.setCurrentCellNPCs(newNPCs);
    console.info(`[NPC系统] 监室转移，生成${npcCount}个新女性囚犯NPC`);
  });

  console.info('✓ [NPC系统] 脚本加载完成 - 女性看守所版本');
  (window as any).__NPC_SYSTEM_LOADED__ = true;
  (window as any).__NPC_SYSTEM_LOADED_TIMESTAMP__ = Date.now();
});
