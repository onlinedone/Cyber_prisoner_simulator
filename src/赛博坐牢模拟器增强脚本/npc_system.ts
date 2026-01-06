export {};

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

type DetentionSystemWithNPC = DetentionSystem & {
  generateNPC?: (count?: number, context?: Record<string, unknown>) => NPC[];
  generateNPCForEvent?: (eventType: string) => NPC | { police: NPC; witnesses: NPC[] };
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

const DS = window.detentionSystem as DetentionSystemWithNPC | undefined;

if (!DS) {
  console.error('[NPC系统] 核心系统未加载');
} else {
  console.info('[NPC系统] 开始加载...');

  // ========== 姓名生成器 ==========
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

  // ========== 罪名生成器 ==========
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
  DS.getCurrentCellNPCs = () => NPCGenerator.getCurrentCellNPCs();
  DS.setCurrentCellNPCs = (npcs: NPC[]) => NPCGenerator.setCurrentCellNPCs(npcs);
  DS.addNPCToCell = (npc: NPC) => NPCGenerator.addNPCToCell(npc);
  DS.removeNPCFromCell = (npcId: string) => NPCGenerator.removeNPCFromCell(npcId);
  DS.findNPC = (npcId: string) => NPCGenerator.findNPCById(npcId);
  DS.updateNPCRelationship = (npcId: string, delta: number) => NPCGenerator.updateRelationship(npcId, delta);
  DS.exportNPCData = () => NPCGenerator.exportData();
  DS.importNPCData = (data?: { database?: NPC[]; currentCell?: NPC[] }) => NPCGenerator.importData(data);

  DS.registerModule('npcSystem', NPCGenerator);

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

  console.info('[NPC系统] 脚本加载完成 - 女性看守所版本');
}
