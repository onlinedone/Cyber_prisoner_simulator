export {};

type JQueryStaticLike = typeof globalThis extends { $: infer T } ? T : (selector: any) => any;
declare const $: JQueryStaticLike;

/**
 * 知识库加载器：动态加载、预测性缓存、角色世界书管理
 * 使用酒馆助手的 API 操作世界书，通过名称（name）匹配
 */

interface WorldbookConfig {
  name: string; // 世界书名称（用于匹配）
  displayName: string; // 显示名称（中文名称，用于匹配）
  priority: number; // 优先级
  keywords: string[]; // 触发关键词（从描述中提取）
  autoLoad: boolean; // 是否自动加载
  description?: string; // 知识库描述
  position?: 'before_char' | 'after_char'; // 插入位置
  depth?: number; // 插入深度
  fallbackEntries?: unknown[]; // 降级条目（暂不使用）
}

interface LoadedWorldbook {
  name: string;
  displayName: string;
  entries: unknown[];
  fallback: boolean;
  error?: string;
  loadedAt: number;
}

interface WorldbookStatus {
  initialized: boolean;
  fallbackMode: boolean;
  characterWorldbook: string | null;
  loaded: Array<{
    name: string;
    displayName: string;
    entries: number;
    fallback: boolean;
    error?: string;
    loadedAt: string;
  }>;
  loading: Array<{
    name: string;
    displayName: string;
  }>;
  available: Array<{
    name: string;
    displayName: string;
    autoLoad: boolean;
  }>;
}

interface EventBus {
  on(event: string, callback: (data?: unknown) => void): void;
  emit(event: string, data?: unknown): void;
}

interface DetentionSystem {
  version: string;
  initialized: boolean;
  modules: Record<string, unknown>;
  config: Record<string, unknown>;
  state: Record<string, unknown>;
  events: EventBus;
  CacheManager: unknown;
  EventEmitter: unknown;
  ping(): boolean;
  registerModule(name: string, module: unknown): void;
  getModule<T = unknown>(name: string): T | undefined;
  handleError(error: unknown, context?: string): void;
}

// 知识库配置（根据实际知识库元数据优化）
const WORLDBOOKS: Record<string, WorldbookConfig> = {
  detention_rules: {
    name: 'detention_rules',
    displayName: '核心规则库',
    description: '看守所基本规范、管理制度、违规处罚机制等核心规则',
    priority: 10,
    keywords: [
      '监规',
      '处罚',
      '纪律',
      '规定',
      '违规',
      '管教',
      '报告',
      '管理制度',
      '基本规范',
      '违规处罚',
      '看守所规则',
      '监管制度',
      '违反',
      '处分',
      '警告',
      '禁闭',
      '扣分',
      '考核',
    ],
    autoLoad: true,
    position: 'before_char',
    depth: 4,
    fallbackEntries: [],
  },
  internal_basic_procedures: {
    name: 'internal_basic_procedures',
    displayName: '生活细节库',
    description: '入所搜身、吃饭、洗澡、审讯等日常生活流程的详细描述',
    priority: 9,
    keywords: [
      '吃饭',
      '洗澡',
      '睡觉',
      '如厕',
      '审讯',
      '会见',
      '放风',
      '点名',
      '劳动',
      '入所',
      '搜身',
      '日常生活',
      '生活流程',
      '日常流程',
      '生活细节',
      '起床',
      '洗漱',
      '用餐',
      '就寝',
      '体检',
      '登记',
      '分配',
    ],
    autoLoad: false,
    position: 'after_char',
    depth: 4,
    fallbackEntries: [],
  },
  internal_basic_legal: {
    name: 'internal_basic_legal',
    displayName: '法律细节库',
    description:
      '详细的司法流程，包括逮捕、起诉、一审、二审、死刑复核、死刑执行（枪决/注射/绞刑）等，还包括法律文书样本、程序性话语模板',
    priority: 8,
    keywords: [
      '批捕',
      '起诉',
      '开庭',
      '判决',
      '执行',
      '律师',
      '取保',
      '保释',
      '逮捕',
      '一审',
      '二审',
      '死刑复核',
      '死刑执行',
      '枪决',
      '注射',
      '绞刑',
      '司法流程',
      '法律文书',
      '程序性话语',
      '程序性',
      '司法程序',
      '检察院',
      '法院',
      '法官',
      '检察官',
      '辩护',
      '上诉',
      '终审',
    ],
    autoLoad: false,
    position: 'before_char',
    depth: 4,
    fallbackEntries: [],
  },
  legal_knowledge: {
    name: 'legal_knowledge',
    displayName: '专业知识库',
    description: '详细法律条文、量刑标准、司法程序',
    priority: 7,
    keywords: [
      '罪名',
      '量刑',
      '法律',
      '刑法',
      '刑期',
      '缓刑',
      '假释',
      '法律条文',
      '量刑标准',
      '司法程序',
      '刑法条文',
      '法律依据',
      '从轻',
      '从重',
      '减轻',
      '加重',
      '累犯',
      '自首',
      '立功',
      '认罪认罚',
    ],
    autoLoad: false,
    position: 'after_char',
    depth: 4,
    fallbackEntries: [],
  },
  environment_descriptions: {
    name: 'environment_descriptions',
    displayName: '环境描写库',
    description: '各场所的详细环境描写模板，包含枪决、注射、绞刑三种执行方式的不同刑场环境',
    priority: 6,
    keywords: [
      '监室',
      '审讯室',
      '会见室',
      '禁闭室',
      '法院',
      '刑场',
      '走廊',
      '铁门',
      '环境描写',
      '场所',
      '刑场环境',
      '执行方式',
      '枪决',
      '注射',
      '绞刑',
      '看守所',
      '监狱',
      '法庭',
      '羁押室',
      '提审室',
      '医务室',
      '食堂',
      '操场',
    ],
    autoLoad: false,
    position: 'before_char',
    depth: 4,
    fallbackEntries: [],
  },
  narrative_enhancements: {
    name: 'narrative_enhancements',
    displayName: '叙事增强库',
    description: '转折、回忆、梦境、反转等叙事增强功能',
    priority: 5,
    keywords: [
      '转折',
      '回忆',
      '梦境',
      '反转',
      '高潮',
      '心理',
      '情绪',
      '叙事增强',
      '叙事',
      '回忆杀',
      '梦境',
      '幻觉',
      '闪回',
      '内心',
      '思绪',
      '情感',
      '感受',
      '想法',
      '思考',
      '反思',
    ],
    autoLoad: false,
    position: 'after_char',
    depth: 4,
    fallbackEntries: [],
  },
};

interface WorldbookLoaderImpl {
  loaded: Map<string, LoadedWorldbook>;
  loading: Map<string, Promise<LoadedWorldbook>>;
  initialized: boolean;
  fallbackMode: boolean;
  characterWorldbookId: string | null;
  failedBooks?: Set<string>; // 记录加载失败的世界书，避免重复尝试

  findCharacterWorldbook(): Promise<string | null>;
  loadWorldbook(bookName: string): Promise<LoadedWorldbook>;
  _loadWorldbookInternal(bookName: string, config: WorldbookConfig): Promise<LoadedWorldbook>;
  predictiveCache(context: string): Promise<void>;
  getRelevantEntries(context: string, maxEntries?: number): unknown[];
  dynamicLoad(userInput: string): Promise<void>;
  getStatus(): WorldbookStatus;
  unloadWorldbook(bookName: string): Promise<void>;
  reloadWorldbook(bookName: string): Promise<LoadedWorldbook>;
  initialize(): Promise<void>;
  shutdown(): void;
}

console.info('[知识库加载器] v5.1.0 启动...');

/**
 * 安全地获取世界书名称列表（支持多种访问方式）
 */
function safeGetWorldbookNames(): string[] {
  // 调试日志已禁用以避免 CORS 错误

  // 假设A: 尝试直接调用全局函数
  if (typeof (window as any).getWorldbookNames !== 'undefined') {
    // 调试日志已禁用以避免 CORS 错误
    return (window as any).getWorldbookNames();
  }

  // 假设B: 尝试通过 window.TavernHelper 访问
  if (typeof window !== 'undefined' && (window as any).TavernHelper) {
    const helper = (window as any).TavernHelper;
    if (typeof helper.getWorldbookNames === 'function') {
      // 调试日志已禁用以避免 CORS 错误
      return helper.getWorldbookNames();
    }
  }

  // 调试日志已禁用以避免 CORS 错误

  throw new Error(
    'getWorldbookNames 函数不可用。' +
      '请确保 Tavern Helper 已正确加载，' +
      '并检查 getWorldbookNames 是否在全局作用域或 window.TavernHelper 中可用。',
  );
}

// 在 jQuery ready 时初始化，确保核心系统已创建
$(() => {
  const DS_RAW = window.detentionSystem as DetentionSystem | undefined;
  if (!DS_RAW) {
    console.error('[知识库加载器] 核心系统未加载');
    console.error('[知识库加载器] 请确保 core.ts 已正确加载');
    return;
  }

  // 类型断言：DS 一定存在
  const DS = DS_RAW as DetentionSystem;

  // 设置角色标识
  (DS as DetentionSystem & { characterId?: string }).characterId = 'detention_center';
  console.info('[知识库加载器] ✓ 已设置角色标识');

  // ========== 知识库加载器 ==========
  const WorldbookLoader: WorldbookLoaderImpl = {
    loaded: new Map(),
    loading: new Map(),
    initialized: false,
    fallbackMode: false,
    characterWorldbookId: null,
    // 记录加载失败的世界书，避免重复尝试
    failedBooks: new Set<string>(),

    /**
     * 查找角色专属世界书
     */
    async findCharacterWorldbook(): Promise<string | null> {
      console.info('[知识库加载器] 查找角色专属世界书...');

      try {
        const charWorldbooks = getCharWorldbookNames('current');
        if (charWorldbooks.primary) {
          console.info(`[知识库加载器] ✓ 找到角色主世界书: ${charWorldbooks.primary}`);
          this.characterWorldbookId = charWorldbooks.primary;
          return charWorldbooks.primary;
        }

        if (charWorldbooks.additional.length > 0) {
          console.info(`[知识库加载器] ✓ 找到角色附加世界书: ${charWorldbooks.additional[0]}`);
          this.characterWorldbookId = charWorldbooks.additional[0];
          return charWorldbooks.additional[0];
        }

        console.warn('[知识库加载器] ⚠ 未找到角色专属世界书');
        return null;
      } catch (error) {
        console.error('[知识库加载器] 查找角色世界书失败:', error);
        return null;
      }
    },

    /**
     * 加载指定知识库
     */
    async loadWorldbook(bookName: string): Promise<LoadedWorldbook> {
      const config = WORLDBOOKS[bookName];
      if (!config) {
        throw new Error(`未知的知识库: ${bookName}`);
      }

      // 检查是否已标记为失败（仅在非手动重试时跳过）
      if (this.failedBooks?.has(bookName)) {
        console.warn(`[知识库加载器] ⚠ ${config.displayName} 之前加载失败，跳过以避免重复错误`);
        throw new Error(`世界书 "${bookName}" 之前加载失败，请检查世界书数据格式`);
      }

      // 检查是否已加载
      if (this.loaded.has(bookName)) {
        console.info(`[知识库加载器] ${config.displayName} 已加载，跳过`);
        return this.loaded.get(bookName)!;
      }

      // 检查是否正在加载
      if (this.loading.has(bookName)) {
        console.info(`[知识库加载器] ${config.displayName} 正在加载，等待...`);
        return await this.loading.get(bookName)!;
      }

      // 创建加载 Promise
      const loadPromise = this._loadWorldbookInternal(bookName, config);
      this.loading.set(bookName, loadPromise);

      try {
        const result = await loadPromise;
        this.loaded.set(bookName, result);
        // 如果成功加载，从失败列表中移除（允许重新加载）
        if (this.failedBooks?.has(bookName)) {
          this.failedBooks.delete(bookName);
          console.info(`[知识库加载器] ✓ ${config.displayName} 加载成功，已从失败列表移除`);
        }
        return result;
      } catch (error) {
        // 错误已在 _loadWorldbookInternal 中处理和标记，这里只需要重新抛出
        throw error;
      } finally {
        this.loading.delete(bookName);
      }
    },

    /**
     * 内部加载逻辑（优化匹配策略）
     */
    async _loadWorldbookInternal(bookName: string, config: WorldbookConfig): Promise<LoadedWorldbook> {
      console.info(`[知识库加载器] 开始加载: ${config.displayName} (${bookName})`);

      try {
        // 获取所有世界书名称
        // 调试日志已禁用以避免 CORS 错误
        const allWorldbookNames = safeGetWorldbookNames();
        // 调试日志已禁用以避免 CORS 错误

        // 优化匹配策略：优先匹配中文名称（displayName），因为实际知识库使用中文名称
        let targetWorldbookName: string | null = null;

        // 1. 优先精确匹配 displayName（中文名称）- 最可能的情况
        const exactDisplayMatch = allWorldbookNames.find(name => name === config.displayName);
        if (exactDisplayMatch) {
          targetWorldbookName = exactDisplayMatch;
          console.info(`[知识库加载器] ✓ 精确匹配中文名称: "${config.displayName}"`);
        } else if (allWorldbookNames.includes(config.name)) {
          // 2. 精确匹配 name（英文标识）
          targetWorldbookName = config.name;
          console.info(`[知识库加载器] ✓ 精确匹配英文标识: "${config.name}"`);
        } else {
          // 3. 模糊匹配：包含 displayName 或 name
          const fuzzyMatch = allWorldbookNames.find(
            name =>
              name.includes(config.displayName) ||
              config.displayName.includes(name) ||
              name.includes(config.name) ||
              config.name.includes(name),
          );
          if (fuzzyMatch) {
            targetWorldbookName = fuzzyMatch;
            console.info(`[知识库加载器] ✓ 模糊匹配: "${fuzzyMatch}"`);
          }
        }

        if (!targetWorldbookName) {
          const availableBooks = allWorldbookNames.join(', ');
          // 调试日志已禁用以避免 CORS 错误
          throw new Error(
            `未找到世界书: ${config.displayName} (${bookName})\n` +
              `可用的世界书: ${availableBooks}\n` +
              `提示: 请确保知识库名称与配置中的 displayName 或 name 匹配`,
          );
        }

        // 获取世界书内容
        // 调试日志已禁用以避免 CORS 错误

        let entries;
        let worldbookData: unknown;
        try {
          worldbookData = await getWorldbook(targetWorldbookName);
          // 调试日志已禁用以避免 CORS 错误

          // 处理返回值：getWorldbook 返回数组或包含 entries 的对象
          // ⚠️ 重要：数组也有 entries 属性（Array.prototype.entries 方法），必须先检查是否为数组
          if (Array.isArray(worldbookData)) {
            // getWorldbook 返回的是数组，直接使用
            entries = worldbookData;
          } else if (
            worldbookData &&
            typeof worldbookData === 'object' &&
            !Array.isArray(worldbookData) &&
            'entries' in worldbookData &&
            Array.isArray((worldbookData as { entries?: unknown }).entries)
          ) {
            // getWorldbook 返回的是对象，且 entries 字段是数组
            entries = (worldbookData as { entries: unknown[] }).entries;
          } else {
            // 其他情况：尝试将返回值作为数组使用（向后兼容）
            entries = Array.isArray(worldbookData) ? worldbookData : [];
          }

          // 调试日志已禁用以避免 CORS 错误
        } catch (getWorldbookError) {
          // 调试日志已禁用以避免 CORS 错误

          // 检查是否是特定世界书的数据问题，尝试备用名称
          const errorMessage =
            getWorldbookError instanceof Error ? getWorldbookError.message : String(getWorldbookError);
          console.warn(
            `[知识库加载器] ⚠ ${config.displayName} 加载失败 (使用名称: ${targetWorldbookName}):`,
            errorMessage,
          );

          // 检查是否是 map 相关的错误，这是世界书数据格式问题的典型表现
          const isDataFormatError =
            errorMessage.includes('map') ||
            errorMessage.includes('undefined') ||
            errorMessage.includes('Cannot read properties');

          if (isDataFormatError) {
            console.warn(
              `[知识库加载器] ⚠ 检测到数据格式错误，可能是世界书 "${targetWorldbookName}" 的数据损坏或不完整`,
            );
            console.warn(`[知识库加载器] ⚠ 错误详情: ${errorMessage}`);
            console.warn(
              `[知识库加载器] ⚠ 建议: 1) 检查世界书 "${targetWorldbookName}" 是否在酒馆中存在 2) 检查世界书数据格式是否正确 3) 尝试重新导入世界书`,
            );

            // 标记为失败，避免重复尝试
            if (this.failedBooks) {
              this.failedBooks.add(bookName);
              console.warn(`[知识库加载器] ⚠ 已将 "${bookName}" 标记为失败，后续将跳过此世界书`);
              // 调试日志已禁用以避免 CORS 错误
            }
          }

          // 无论是否是数据格式错误，都抛出错误，但提供更详细的错误信息
          const detailedError = new Error(
            `获取世界书内容失败: ${errorMessage}\n` +
              `世界书名称: ${targetWorldbookName}\n` +
              `配置名称: ${bookName} (${config.displayName})\n` +
              `错误类型: ${isDataFormatError ? '数据格式错误（可能是世界书数据损坏或不完整）' : '未知错误'}\n` +
              `建议: ${isDataFormatError ? '请检查世界书数据格式，或尝试重新导入世界书' : '请检查世界书是否存在，或联系开发者'}`,
          );
          throw detailedError;
        }

        // 检查返回值类型
        if (entries === undefined || entries === null) {
          // 调试日志已禁用以避免 CORS 错误
          throw new Error(
            `世界书 "${targetWorldbookName}" 返回值为空 (undefined/null)\n` +
              `原始数据类型: ${typeof worldbookData}\n` +
              `提示: 请确保世界书格式正确，应包含 entries 数组`,
          );
        }

        if (!Array.isArray(entries)) {
          // 调试日志已禁用以避免 CORS 错误
          throw new Error(
            `世界书 "${targetWorldbookName}" 返回值不是数组 (类型: ${typeof entries})\n` +
              `原始数据类型: ${typeof worldbookData}\n` +
              `提示: 世界书格式可能不正确，getWorldbook 应返回 entries 数组或包含 entries 字段的对象`,
          );
        }

        if (entries.length === 0) {
          throw new Error('世界书为空');
        }

        // 绑定到当前角色卡（添加到附加世界书）
        const charWorldbooks = getCharWorldbookNames('current');
        if (!charWorldbooks.additional.includes(targetWorldbookName)) {
          await rebindCharWorldbooks('current', {
            primary: charWorldbooks.primary,
            additional: [...charWorldbooks.additional, targetWorldbookName],
          });
          console.info(`[知识库加载器] ✓ 已绑定到角色卡: ${targetWorldbookName}`);
        }

        console.info(`[知识库加载器] ✓ ${config.displayName} 加载成功 (${entries.length} 条目)`);

        return {
          name: bookName,
          displayName: config.displayName,
          entries: entries,
          fallback: false,
          loadedAt: Date.now(),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[知识库加载器] ⚠ ${config.displayName} 加载失败:`, errorMessage);

        // 使用降级版本（如果有）
        if (config.fallbackEntries && config.fallbackEntries.length > 0) {
          console.info(`[知识库加载器] ⚠ ${config.displayName} 使用降级版本 (${config.fallbackEntries.length} 条目)`);
          this.fallbackMode = true;

          return {
            name: bookName,
            displayName: config.displayName,
            entries: config.fallbackEntries,
            fallback: true,
            error: errorMessage,
            loadedAt: Date.now(),
          };
        }

        throw error;
      }
    },

    /**
     * 预测性缓存（优化版：智能评分）
     */
    async predictiveCache(context: string): Promise<void> {
      if (!context || typeof context !== 'string') {
        return;
      }

      console.info('[知识库加载器] 执行预测性缓存...');

      const predictions: Array<{ bookName: string; score: number; priority: number; weightedScore: number }> = [];

      for (const bookName in WORLDBOOKS) {
        const config = WORLDBOOKS[bookName];

        if (this.loaded.has(bookName)) {
          continue;
        }

        let matchScore = 0;
        let weightedScore = 0;

        // 优化评分：考虑关键词长度和重要性
        for (const keyword of config.keywords) {
          if (context.includes(keyword)) {
            matchScore++;
            // 长关键词权重更高（更精确）
            const keywordWeight = keyword.length >= 3 ? 2 : 1;
            weightedScore += keywordWeight;

            // 如果关键词在描述中也出现，额外加分
            if (config.description && config.description.includes(keyword)) {
              weightedScore += 1;
            }
          }
        }

        // 如果匹配到描述中的关键词，额外加分
        if (config.description) {
          const descKeywords = config.description.match(/[\u4e00-\u9fa5]{2,}/g) || [];
          for (const descKw of descKeywords) {
            if (context.includes(descKw) && descKw.length >= 2) {
              weightedScore += 0.5;
            }
          }
        }

        if (matchScore > 0) {
          // 综合评分 = 优先级 * 10 + 加权匹配分
          const finalScore = config.priority * 10 + weightedScore;

          predictions.push({
            bookName,
            score: matchScore,
            priority: config.priority,
            weightedScore: finalScore,
          });
        }
      }

      // 按综合评分排序
      predictions.sort((a, b) => {
        if (Math.abs(b.weightedScore - a.weightedScore) > 1) {
          return b.weightedScore - a.weightedScore;
        }
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return b.score - a.score;
      });

      console.info(`[知识库加载器] 预测需要加载 ${predictions.length} 个知识库`);

      // 只加载评分足够高的知识库（阈值：至少匹配1个关键词且综合评分>10）
      const toLoad = predictions.filter(p => p.weightedScore > 10).slice(0, 3);

      if (toLoad.length === 0) {
        console.info('[知识库加载器] 未找到足够匹配的知识库，跳过预测性加载');
        return;
      }

      for (const pred of toLoad) {
        // 跳过已知失败的世界书
        if (this.failedBooks?.has(pred.bookName)) {
          console.debug(`[知识库加载器] 跳过已知失败的世界书: ${WORLDBOOKS[pred.bookName].displayName}`);
          continue;
        }

        console.info(
          `[知识库加载器] 预测性加载: ${WORLDBOOKS[pred.bookName].displayName} ` +
            `(匹配关键词: ${pred.score}, 综合评分: ${pred.weightedScore.toFixed(1)})`,
        );

        try {
          await this.loadWorldbook(pred.bookName);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`[知识库加载器] 预测性加载失败: ${pred.bookName}`, errorMessage);
          // 错误已在 loadWorldbook 中标记，这里不需要重复标记
        }
      }
    },

    /**
     * 获取相关条目（优化版：智能评分）
     */
    getRelevantEntries(context: string, maxEntries: number = 5): unknown[] {
      if (!context || typeof context !== 'string') {
        return [];
      }

      const allEntries: Array<{ entry: unknown; bookName: string; bookDisplayName: string; priority: number }> = [];

      this.loaded.forEach((bookData, bookName) => {
        if (bookData.entries && Array.isArray(bookData.entries)) {
          for (const entry of bookData.entries) {
            allEntries.push({
              entry,
              bookName: bookName,
              bookDisplayName: bookData.displayName,
              priority: WORLDBOOKS[bookName]?.priority || 0,
            });
          }
        }
      });

      const scoredEntries = allEntries.map(item => {
        let score = 0;
        const entry = item.entry as {
          keys?: string[];
          key?: string[];
          constant?: boolean;
          name?: string;
          content?: string;
        };
        const keys = entry.keys || entry.key || [];

        // 关键词匹配评分（长关键词权重更高）
        for (const key of keys) {
          if (context.includes(key)) {
            const keyWeight = key.length >= 3 ? 15 : 10;
            score += keyWeight;

            // 如果关键词在条目名称中也出现，额外加分
            if (entry.name && entry.name.includes(key)) {
              score += 5;
            }
          }
        }

        // 条目名称匹配
        if (entry.name && context.includes(entry.name)) {
          score += 20;
        }

        // 内容部分匹配（降低权重，避免误匹配）
        if (entry.content) {
          const contentMatch = entry.content.substring(0, 100);
          if (context.includes(contentMatch.substring(0, 10))) {
            score += 3;
          }
        }

        // 知识库优先级加成
        score += item.priority || 0;

        // 常量条目优先（但权重降低，避免过度依赖）
        if (entry.constant) {
          score += 30;
        }

        return {
          entry: item.entry,
          score,
          bookName: item.bookName,
          bookDisplayName: item.bookDisplayName,
        };
      });

      // 按分数排序
      scoredEntries.sort((a, b) => {
        if (Math.abs(b.score - a.score) > 5) {
          return b.score - a.score;
        }
        // 分数接近时，优先高优先级知识库
        const aPriority = WORLDBOOKS[a.bookName]?.priority || 0;
        const bPriority = WORLDBOOKS[b.bookName]?.priority || 0;
        return bPriority - aPriority;
      });

      const relevant = scoredEntries
        .filter(item => item.score > 0)
        .slice(0, maxEntries)
        .map(item => item.entry);

      if (relevant.length > 0) {
        console.info(
          `[知识库加载器] 找到 ${relevant.length} 个相关条目 ` +
            `(最高分: ${scoredEntries[0]?.score || 0}, 来源: ${scoredEntries[0]?.bookDisplayName || '未知'})`,
        );
      }

      return relevant;
    },

    /**
     * 动态加载（优化版：智能触发）
     */
    async dynamicLoad(userInput: string): Promise<void> {
      if (!userInput || typeof userInput !== 'string' || userInput.length < 3) {
        return;
      }

      console.info('[知识库加载器] 执行动态加载...');

      const triggers: Array<{
        bookName: string;
        keyword: string;
        priority: number;
        matchCount: number;
        score: number;
      }> = [];

      for (const bookName in WORLDBOOKS) {
        const config = WORLDBOOKS[bookName];

        if (this.loaded.has(bookName)) {
          continue;
        }

        let matchCount = 0;
        let bestKeyword = '';
        let maxKeywordLength = 0;

        // 找出匹配的关键词（优先长关键词）
        for (const keyword of config.keywords) {
          if (userInput.includes(keyword)) {
            matchCount++;
            if (keyword.length > maxKeywordLength) {
              maxKeywordLength = keyword.length;
              bestKeyword = keyword;
            }
          }
        }

        // 如果匹配到关键词，计算触发分数
        if (matchCount > 0) {
          // 分数 = 优先级 * 10 + 匹配数量 * 2 + 最长关键词长度
          const score = config.priority * 10 + matchCount * 2 + maxKeywordLength;

          triggers.push({
            bookName,
            keyword: bestKeyword,
            priority: config.priority,
            matchCount,
            score,
          });
        }
      }

      if (triggers.length === 0) {
        console.info('[知识库加载器] 未触发动态加载');
        return;
      }

      // 按分数排序
      triggers.sort((a, b) => {
        if (Math.abs(b.score - a.score) > 2) {
          return b.score - a.score;
        }
        return b.priority - a.priority;
      });

      console.info(`[知识库加载器] 触发 ${triggers.length} 个知识库的动态加载`);

      // 只加载前3个最相关的知识库
      const toLoad = triggers.slice(0, 3);

      for (const trigger of toLoad) {
        console.info(
          `[知识库加载器] 动态加载: ${WORLDBOOKS[trigger.bookName].displayName} ` +
            `(触发词: ${trigger.keyword}, 匹配数: ${trigger.matchCount}, 评分: ${trigger.score})`,
        );

        try {
          await this.loadWorldbook(trigger.bookName);
        } catch (error) {
          console.warn(`[知识库加载器] 动态加载失败: ${trigger.bookName}`, error);
        }
      }
    },

    /**
     * 获取加载状态
     */
    getStatus(): WorldbookStatus {
      const status: WorldbookStatus = {
        initialized: this.initialized,
        fallbackMode: this.fallbackMode,
        characterWorldbook: this.characterWorldbookId,
        loaded: [],
        loading: [],
        available: [],
      };

      this.loaded.forEach((data, name) => {
        status.loaded.push({
          name: name,
          displayName: data.displayName,
          entries: data.entries.length,
          fallback: data.fallback,
          error: data.error,
          loadedAt: new Date(data.loadedAt).toLocaleTimeString(),
        });
      });

      this.loading.forEach((_promise, name) => {
        status.loading.push({
          name: name,
          displayName: WORLDBOOKS[name]?.displayName || name,
        });
      });

      for (const bookName in WORLDBOOKS) {
        if (!this.loaded.has(bookName) && !this.loading.has(bookName)) {
          status.available.push({
            name: bookName,
            displayName: WORLDBOOKS[bookName].displayName,
            autoLoad: WORLDBOOKS[bookName].autoLoad,
          });
        }
      }

      return status;
    },

    /**
     * 卸载知识库
     */
    async unloadWorldbook(bookName: string): Promise<void> {
      if (!this.loaded.has(bookName)) {
        console.warn(`[知识库加载器] ${bookName} 未加载`);
        return;
      }

      console.info(`[知识库加载器] 卸载: ${WORLDBOOKS[bookName]?.displayName || bookName}`);

      // 从角色卡绑定中移除
      const charWorldbooks = getCharWorldbookNames('current');
      const loadedData = this.loaded.get(bookName);
      if (loadedData) {
        // 尝试找到实际绑定的世界书名称
        const allWorldbookNames = safeGetWorldbookNames();
        const targetName = allWorldbookNames.find(name => name === bookName || name.includes(bookName));

        if (targetName) {
          const newAdditional = charWorldbooks.additional.filter(name => name !== targetName);
          await rebindCharWorldbooks('current', {
            primary: charWorldbooks.primary,
            additional: newAdditional,
          });
        }
      }

      this.loaded.delete(bookName);
    },

    /**
     * 重新加载知识库
     */
    async reloadWorldbook(bookName: string): Promise<LoadedWorldbook> {
      console.info(`[知识库加载器] 重新加载: ${WORLDBOOKS[bookName]?.displayName || bookName}`);
      await this.unloadWorldbook(bookName);
      return await this.loadWorldbook(bookName);
    },

    /**
     * 初始化
     */
    async initialize(): Promise<void> {
      if (this.initialized) {
        console.info('[知识库加载器] 已初始化，跳过');
        return;
      }

      console.info('[知识库加载器] 初始化...');

      await this.findCharacterWorldbook();

      // 等待世界书列表可用
      let retries = 0;
      let availableWorldbooks: string[] = [];
      while (retries < 40) {
        try {
          availableWorldbooks = safeGetWorldbookNames();
          if (availableWorldbooks.length > 0) {
            console.info(`[知识库加载器] ✓ 世界书列表已就绪 (${availableWorldbooks.length} 个)`);
            console.info(`[知识库加载器] 可用世界书: ${availableWorldbooks.join(', ')}`);
            break;
          }
        } catch (error) {
          // 忽略错误，继续重试
        }

        console.info(`[知识库加载器] 等待世界书列表... (${retries + 1}/40)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      // 显示知识库配置信息
      console.info('[知识库加载器] 已配置的知识库:');
      for (const bookName in WORLDBOOKS) {
        const config = WORLDBOOKS[bookName];
        const isAvailable = availableWorldbooks.some(
          name => name === config.displayName || name === config.name || name.includes(config.displayName),
        );
        console.info(
          `  - ${config.displayName} (${bookName}): ` +
            `优先级=${config.priority}, ` +
            `自动加载=${config.autoLoad ? '是' : '否'}, ` +
            `可用=${isAvailable ? '✓' : '✗'}`,
        );
      }

      // 加载自动加载的知识库
      const autoLoadBooks: string[] = [];
      for (const bookName in WORLDBOOKS) {
        if (WORLDBOOKS[bookName].autoLoad) {
          autoLoadBooks.push(bookName);
        }
      }

      console.info(`[知识库加载器] 需要自动加载 ${autoLoadBooks.length} 个知识库`);

      for (const bookName of autoLoadBooks) {
        try {
          await this.loadWorldbook(bookName);
        } catch (err) {
          console.warn(`[知识库加载器] 自动加载失败: ${bookName}`, err);
        }
      }

      this.initialized = true;

      const status = this.getStatus();
      console.info('[知识库加载器] ✓ 初始化完成');
      console.table(status.loaded);

      // 检查是否进入降级模式
      if (this.fallbackMode) {
        console.warn('[知识库加载器] ⚠ 已进入降级模式');
        console.warn('[知识库加载器] ⚠ 部分知识库使用了内置降级数据');
        console.warn('[知识库加载器] ⚠ 脚本将自动退出，交由角色卡处理');

        const fallbackBooks = status.loaded.filter(b => b.fallback);
        console.table(fallbackBooks);

        // 延迟3秒后自动卸载
        setTimeout(() => {
          console.info('[知识库加载器] 降级模式：开始自动卸载...');
          this.shutdown();
        }, 3000);
      } else {
        console.info('[知识库加载器] ✓ 所有知识库正常加载，脚本保持运行');
      }
    },

    /**
     * 关闭并清理
     */
    shutdown(): void {
      console.info('[知识库加载器] 执行关闭流程...');

      // 清空所有加载的知识库
      this.loaded.clear();
      this.loading.clear();

      // 从核心系统注销
      delete (DS as DetentionSystem & { loadWorldbook?: unknown }).loadWorldbook;
      delete (DS as DetentionSystem & { unloadWorldbook?: unknown }).unloadWorldbook;
      delete (DS as DetentionSystem & { reloadWorldbook?: unknown }).reloadWorldbook;
      delete (DS as DetentionSystem & { predictiveCache?: unknown }).predictiveCache;
      delete (DS as DetentionSystem & { getRelevantEntries?: unknown }).getRelevantEntries;
      delete (DS as DetentionSystem & { getWorldbookStatus?: unknown }).getWorldbookStatus;
      delete (DS as DetentionSystem & { dynamicLoad?: unknown }).dynamicLoad;

      this.initialized = false;
      this.fallbackMode = false;

      console.info('[知识库加载器] ✓ 已完全卸载，交由角色卡处理');
      console.info('[知识库加载器] 脚本生命周期结束');
    },
  };

  // ========== 注册到核心系统 ==========
  (
    DS as DetentionSystem & {
      loadWorldbook?: (bookName: string) => Promise<LoadedWorldbook>;
      unloadWorldbook?: (bookName: string) => Promise<void>;
      reloadWorldbook?: (bookName: string) => Promise<LoadedWorldbook>;
      predictiveCache?: (context: string) => Promise<void>;
      dynamicLoad?: (userInput: string) => Promise<void>;
      getRelevantEntries?: (context: string, max?: number) => unknown[];
      getWorldbookStatus?: () => WorldbookStatus;
    }
  ).loadWorldbook = (bookName: string) => WorldbookLoader.loadWorldbook(bookName);
  (DS as DetentionSystem & { unloadWorldbook?: (bookName: string) => Promise<void> }).unloadWorldbook = (
    bookName: string,
  ) => WorldbookLoader.unloadWorldbook(bookName);
  (DS as DetentionSystem & { reloadWorldbook?: (bookName: string) => Promise<LoadedWorldbook> }).reloadWorldbook = (
    bookName: string,
  ) => WorldbookLoader.reloadWorldbook(bookName);
  (DS as DetentionSystem & { predictiveCache?: (context: string) => Promise<void> }).predictiveCache = (
    context: string,
  ) => WorldbookLoader.predictiveCache(context);
  (DS as DetentionSystem & { dynamicLoad?: (userInput: string) => Promise<void> }).dynamicLoad = (userInput: string) =>
    WorldbookLoader.dynamicLoad(userInput);
  (DS as DetentionSystem & { getRelevantEntries?: (context: string, max?: number) => unknown[] }).getRelevantEntries = (
    context: string,
    max?: number,
  ) => WorldbookLoader.getRelevantEntries(context, max);
  (DS as DetentionSystem & { getWorldbookStatus?: () => WorldbookStatus }).getWorldbookStatus = () =>
    WorldbookLoader.getStatus();

  DS.registerModule('worldbook', WorldbookLoader);

  // 同步到主窗口（iframe 环境）
  try {
    if (window.parent && window.parent !== window) {
      (window.parent as any).detentionSystem = DS;
      console.info('[知识库加载器] ✓ 已同步到主窗口');
    }
  } catch (e) {
    // 跨域限制，忽略
  }

  console.info('[知识库加载器] ✓ 已注册到核心系统');

  // ========== 监听事件系统 ==========
  DS.events.on('event_triggered', (eventData?: unknown) => {
    const event = eventData as { id?: string; description?: string } | undefined;
    if (event?.description) {
      WorldbookLoader.predictiveCache(event.description).catch(err => {
        console.warn('[知识库加载器] 预测性缓存失败:', err);
      });
    }
  });

  // ========== 监听用户输入（通过核心系统事件） ==========
  DS.events.on('user_input', (data?: unknown) => {
    const input = data as { text?: string } | undefined;
    if (input?.text && input.text.length > 5) {
      WorldbookLoader.dynamicLoad(input.text).catch(err => {
        console.warn('[知识库加载器] 动态加载失败:', err);
      });
    }
  });

  // ========== 自动初始化 ==========
  $(() => {
    console.info('[知识库加载器] 准备初始化...');

    // 延迟2秒后自动初始化
    setTimeout(async () => {
      console.info('[知识库加载器] 开始自动初始化...');

      try {
        await WorldbookLoader.initialize();
        console.info('[知识库加载器] ✓ 自动初始化完成');
      } catch (error) {
        console.error('[知识库加载器] ✗ 自动初始化失败:', error);
        console.info('[知识库加载器] 💡 请手动执行: window.initWorldbookLoader()');
      }
    }, 2000);
  });

  // ========== 手动初始化函数 ==========
  (window as typeof window & { initWorldbookLoader?: () => Promise<WorldbookStatus> }).initWorldbookLoader =
    async function () {
      console.info('[知识库加载器] 手动初始化...');

      if (WorldbookLoader.initialized) {
        console.info('[知识库加载器] 已经初始化过了');
        return WorldbookLoader.getStatus();
      }

      try {
        await WorldbookLoader.initialize();
        console.info('[知识库加载器] ✓ 手动初始化完成');
        return WorldbookLoader.getStatus();
      } catch (error) {
        console.error('[知识库加载器] ✗ 手动初始化失败:', error);
        throw error;
      }
    };

  console.info('[知识库加载器] ✓ 脚本加载完成');
  console.info('[知识库加载器] 💡 如需手动初始化，请执行: window.initWorldbookLoader()');
});
