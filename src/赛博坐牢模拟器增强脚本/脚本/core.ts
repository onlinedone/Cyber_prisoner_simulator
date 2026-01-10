export {};

type JQueryStaticLike = typeof globalThis extends { $: infer T } ? T : (selector: any) => any;
declare const $: JQueryStaticLike;

// 调试日志已移除（避免 CORS 错误）

console.info('[核心系统] 开始加载...');

type BudgetStatus = 'critical' | 'warning' | 'normal';

interface BudgetInfo {
  used: number;
  total: number;
  percentage: string;
  remaining: number;
  status: BudgetStatus;
}

interface DetentionConfig {
  tokenBudget: number;
  fallbackBudget: number;
  compressionQuality: number;
  cacheExpiry: number;
  healthCheckInterval: number;
  healthCheckTimeout: number;
}

interface DetentionErrorInfo {
  message: string;
  context: string;
  timestamp: number;
  stack?: string;
}

interface DetentionState {
  mode: 'detecting' | 'external' | 'fallback';
  tokenUsed: number;
  lastHealthCheck: number;
  errors: DetentionErrorInfo[];
}

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

interface CacheManager {
  set<T>(key: string, value: T, ttl?: number | null): void;
  get<T>(key: string): T | null;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  cleanup(): void;
}

interface EnvironmentInfo {
  isSillyTavern: boolean;
  version: string | null;
  hasHelper: boolean;
  helperVersion: string | null;
  hasDataTable: boolean;
}

class EventEmitter {
  private readonly events = new Map<string, Array<(data?: unknown) => void>>();

  on(event: string, callback: (data?: unknown) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: (data?: unknown) => void) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event: string, data?: unknown) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (error) {
        console.error(`[事件系统] 事件 ${event} 回调错误:`, error);
      }
    });
  }

  once(event: string, callback: (data?: unknown) => void) {
    const wrapper = (data?: unknown) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

interface DetentionSystem {
  version: string;
  initialized: boolean;
  modules: Record<string, unknown>;
  config: DetentionConfig;
  state: DetentionState;
  events: EventEmitter;
  CacheManager: CacheManager;
  EventEmitter: typeof EventEmitter;
  ping(): boolean;
  checkTokenBudget(): BudgetInfo;
  updateTokenUsage(tokens: number): BudgetInfo;
  compressContent(content: unknown, quality?: number | null): string;
  registerModule(name: string, module: unknown): void;
  getModule<T = unknown>(name: string): T | undefined;
  handleError(error: unknown, context?: string): void;
  detectEnvironment(): EnvironmentInfo;
  initialize(): void;
  initializeState?(state: {
    name?: string;
    age?: number;
    crime?: string;
    health?: number;
    mental?: number;
    strength?: number;
    intelligence?: number;
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
  }): void;
}

declare global {
  interface Window {
    detentionSystem?: DetentionSystem;
  }
}

const cacheStore: Map<string, CacheEntry<unknown>> = new Map();
let cacheCleanupTimer: ReturnType<typeof setInterval> | undefined;

function createCacheManager(): CacheManager {
  return {
    set<T>(key: string, value: T, ttl?: number | null) {
      const expiry = ttl ? Date.now() + ttl * 1000 : null;
      cacheStore.set(key, { value, expiry });
    },
    get<T>(key: string) {
      const item = cacheStore.get(key);
      if (!item) return null;
      if (item.expiry !== null && Date.now() > item.expiry) {
        cacheStore.delete(key);
        return null;
      }
      return item.value as T;
    },
    has(key: string) {
      return this.get(key) !== null;
    },
    delete(key: string) {
      cacheStore.delete(key);
    },
    clear() {
      cacheStore.clear();
    },
    cleanup() {
      const now = Date.now();
      for (const [key, item] of cacheStore.entries()) {
        if (item.expiry !== null && now > item.expiry) {
          cacheStore.delete(key);
        }
      }
    },
  };
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

function bootstrapDetentionSystem(): DetentionSystem {
  // 调试日志已禁用以避免 CORS 错误

  const events = new EventEmitter();
  const CacheManager = createCacheManager();

  // 调试日志已禁用以避免 CORS 错误

  const system: DetentionSystem = {
    version: '3.2.0',
    initialized: false,
    modules: {},
    config: {
      tokenBudget: 100000,
      fallbackBudget: 40000,
      compressionQuality: 0.8,
      cacheExpiry: 600000,
      healthCheckInterval: 500,
      healthCheckTimeout: 3000,
    },
    state: {
      mode: 'detecting',
      tokenUsed: 0,
      lastHealthCheck: 0,
      errors: [],
    },
    events,
    CacheManager,
    EventEmitter,

    ping() {
      system.state.lastHealthCheck = Date.now();
      return true;
    },

    checkTokenBudget() {
      const total = system.state.mode === 'external' ? system.config.tokenBudget : system.config.fallbackBudget;
      const used = system.state.tokenUsed;
      const percentage = (used / total) * 100;

      const status: BudgetStatus = percentage > 95 ? 'critical' : percentage > 85 ? 'warning' : 'normal';

      return {
        used,
        total,
        percentage: percentage.toFixed(2),
        remaining: total - used,
        status,
      };
    },

    updateTokenUsage(tokens: number) {
      system.state.tokenUsed += tokens;
      const budget = system.checkTokenBudget();

      if (budget.status === 'warning') {
        console.warn(`[Token预算] 警告: 已使用 ${budget.percentage}%`);
        system.events.emit('token_warning', budget);
      } else if (budget.status === 'critical') {
        console.error(`[Token预算] 严重: 已使用 ${budget.percentage}%`);
        system.events.emit('token_critical', budget);
      }

      return budget;
    },

    compressContent(content: unknown, quality: number | null = null) {
      const text = typeof content === 'string' ? content : JSON.stringify(content);
      const actualQuality = quality ?? system.config.compressionQuality;

      let compressed = text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      if (actualQuality < 0.9) {
        compressed = compressed.replace(/，/g, ',').replace(/。/g, '.').replace(/；/g, ';').replace(/：/g, ':');
      }

      const originalSize = text.length;
      const compressedSize = compressed.length;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

      console.info(`[内容压缩] 原始: ${originalSize} -> 压缩: ${compressedSize} (节省 ${ratio}%)`);

      return compressed;
    },

    registerModule(name: string, module: unknown) {
      if (system.modules[name]) {
        console.warn(`[核心系统] 模块 ${name} 已存在，将被覆盖`);
      }
      system.modules[name] = module;
      console.info(`[核心系统] 模块 ${name} 已注册`);
      system.events.emit('module_registered', { name, module });

      // 每次模块注册后，都尝试同步到主窗口（确保主窗口始终有最新的系统对象）
      try {
        if (window.parent && window.parent !== window) {
          (window.parent as typeof window.parent & { detentionSystem?: DetentionSystem }).detentionSystem = system;
          (window.parent as any).DS = system;
        }
      } catch (e) {
        // 跨域限制，忽略
      }
    },

    getModule<T = unknown>(name: string) {
      return system.modules[name] as T | undefined;
    },

    handleError(error: unknown, context: string = 'unknown') {
      const normalized = normalizeError(error);
      const errorInfo: DetentionErrorInfo = {
        message: normalized.message,
        context,
        timestamp: Date.now(),
        stack: normalized.stack,
      };

      system.state.errors.push(errorInfo);
      console.error(`[核心系统] 错误 [${context}]:`, normalized);
      system.events.emit('error', errorInfo);

      if (system.state.errors.length > 100) {
        system.state.errors.shift();
      }
    },

    detectEnvironment() {
      const env: EnvironmentInfo = {
        isSillyTavern: false,
        version: null,
        hasHelper: false,
        helperVersion: null,
        hasDataTable: false,
      };

      const isSillyTavernAvailable = typeof SillyTavern !== 'undefined';
      if (isSillyTavernAvailable || $('#send_textarea').length > 0) {
        env.isSillyTavern = true;
        if (typeof getTavernVersion === 'function') {
          env.version = getTavernVersion() ?? null;
        }
      }

      if (typeof getTavernHelperVersion === 'function') {
        env.hasHelper = true;
        env.helperVersion = getTavernHelperVersion() ?? null;
      }

      const windowWithTable = window as typeof window & {
        insertRow?: unknown;
        updateRow?: unknown;
      };
      if (typeof windowWithTable.insertRow === 'function' && typeof windowWithTable.updateRow === 'function') {
        env.hasDataTable = true;
      }

      return env;
    },

    initialize() {
      if (system.initialized) {
        console.warn('[核心系统] 已经初始化，跳过');
        return;
      }

      console.info('[核心系统] 开始初始化...');

      const env = system.detectEnvironment();
      console.info('[核心系统] 环境检测:', env);

      if (!env.isSillyTavern) {
        console.warn('[核心系统] 未检测到SillyTavern环境');
      }

      system.state.mode = 'external';
      system.initialized = true;

      console.info('[核心系统] 初始化完成');
      console.info(`[核心系统] 版本: ${system.version}`);
      console.info(`[核心系统] 模式: ${system.state.mode}`);
      console.info(`[核心系统] Token预算: ${system.config.tokenBudget}`);

      system.events.emit('initialized', { env, state: system.state });
    },

    // 初始化主角状态（用于用户检测脚本）
    initializeState(state?: {
      name?: string;
      age?: number;
      crime?: string;
      health?: number;
      mental?: number;
      strength?: number;
      intelligence?: number;
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
    }) {
      if (!state) {
        console.warn('[核心系统] initializeState 被调用但没有提供状态数据');
        return;
      }

      console.info('[核心系统] 初始化主角状态:', state);

      // 通过 stateChanged 事件通知状态栏系统更新状态
      system.events.emit('stateChanged', state);

      // 如果状态栏模块已注册，直接调用其更新方法
      const statusPanel = system.getModule('statusPanel') as
        | {
            initialize?: () => void;
            getState?: () => unknown;
          }
        | undefined;

      if (statusPanel) {
        console.info('[核心系统] ✓ 状态栏模块已找到，已通过事件通知状态更新');
      } else {
        console.warn('[核心系统] ⚠ 状态栏模块未找到，状态将通过事件在模块注册后更新');
      }
    },
  };

  // 调试日志已禁用以避免 CORS 错误

  return system;
}

function ensureCacheCleanup(system: DetentionSystem) {
  if (!cacheCleanupTimer) {
    cacheCleanupTimer = setInterval(() => system.CacheManager.cleanup(), 60000);
  }
}

function stopCacheCleanup() {
  if (cacheCleanupTimer) {
    clearInterval(cacheCleanupTimer);
    cacheCleanupTimer = undefined;
  }
}

// 调试日志已禁用以避免 CORS 错误

// 立即创建核心系统，让其他模块可以立即访问
if (!window.detentionSystem) {
  // 调试日志已禁用以避免 CORS 错误

  try {
    window.detentionSystem = bootstrapDetentionSystem();
    // 同时暴露 DS 作为便捷别名
    (window as any).DS = window.detentionSystem;
    console.info('[核心系统] ✓ 已将 DS 暴露到全局（作为 window.detentionSystem 的别名）');

    // 调试日志已禁用以避免 CORS 错误

    // 调试日志已禁用以避免 CORS 错误

    console.info('[核心系统] ✓ 核心系统对象已创建（脚本加载时）');
    console.info('[核心系统] window.detentionSystem 类型:', typeof window.detentionSystem);
    console.info('[核心系统] window.detentionSystem 值:', window.detentionSystem);
    // 创建全局标记
    (window as any).__DETENTION_SYSTEM_CORE_LOADED__ = true;
    (window as any).__DETENTION_SYSTEM_VERSION__ = window.detentionSystem.version;

    // 如果是 iframe 环境，尝试将系统暴露到主窗口
    try {
      if (window.parent && window.parent !== window) {
        // 调试日志已禁用以避免 CORS 错误

        // 在 jQuery ready 中执行，确保父窗口已加载
        $(() => {
          try {
            (window.parent as typeof window.parent & { detentionSystem?: DetentionSystem }).detentionSystem =
              window.detentionSystem;
            // 同时暴露 DS
            (window.parent as any).DS = window.detentionSystem;
            console.info('[核心系统] ✓ 已将系统暴露到主窗口（iframe 模式）');

            // 调试日志已禁用以避免 CORS 错误
          } catch (e) {
            console.warn('[核心系统] ⚠ 无法将系统暴露到主窗口（可能是跨域限制）:', e);

            // 调试日志已禁用以避免 CORS 错误
          }
        });

        // 立即尝试暴露（不等待 jQuery ready），以防检测脚本在主窗口立即运行
        try {
          (window.parent as typeof window.parent & { detentionSystem?: DetentionSystem }).detentionSystem =
            window.detentionSystem;
          (window.parent as any).DS = window.detentionSystem;
          console.info('[核心系统] ✓ 已立即将系统暴露到主窗口（iframe 模式，立即暴露）');

          // 调试日志已禁用以避免 CORS 错误
        } catch (e) {
          console.debug('[核心系统] 立即暴露失败（将在 jQuery ready 时重试）:', e);
        }
      } else {
        // 调试日志已禁用以避免 CORS 错误
      }
    } catch (e) {
      console.warn('[核心系统] ⚠ iframe 检测失败:', e);

      // 调试日志已禁用以避免 CORS 错误
    }
  } catch (error) {
    // 调试日志已禁用以避免 CORS 错误
    throw error;
  }
} else {
  // 调试日志已禁用以避免 CORS 错误
}

// 调试日志已禁用以避免 CORS 错误

$(() => {
  // 调试日志已禁用以避免 CORS 错误

  console.info('[核心系统] 酒馆页面已加载（jQuery ready）');

  // 确保核心系统存在（双重保险）
  if (!window.detentionSystem) {
    // 调试日志已禁用以避免 CORS 错误

    console.warn('[核心系统] 警告：在 jQuery ready 时未找到核心系统，重新创建');
    window.detentionSystem = bootstrapDetentionSystem();
    // 同时暴露 DS 作为便捷别名
    if (!(window as any).DS) {
      (window as any).DS = window.detentionSystem;
      console.info('[核心系统] ✓ 已将 DS 暴露到全局（作为 window.detentionSystem 的别名）');
    }
    console.info('[核心系统] 核心系统对象已创建（jQuery ready 时）');
  } else {
    // 调试日志已禁用以避免 CORS 错误
  }

  const system = window.detentionSystem!;

  // 同时暴露 DS 作为便捷别名（方便在控制台中直接使用）
  if (!(window as any).DS) {
    (window as any).DS = system;
    console.info('[核心系统] ✓ 已将 DS 暴露到全局（作为 window.detentionSystem 的别名）');
  }

  console.info('[核心系统] 当前核心系统状态:', {
    exists: !!system,
    version: system.version,
    initialized: system.initialized,
  });

  ensureCacheCleanup(system);

  console.info('[核心系统] 准备在 1 秒后初始化...');
  setTimeout(() => {
    console.info('[核心系统] setTimeout 回调执行，开始初始化...');
    try {
      system.initialize();
      console.info('[核心系统] initialize() 调用完成');

      // 初始化完成后，再次尝试暴露到主窗口（确保所有模块已注册）
      try {
        if (window.parent && window.parent !== window && system) {
          (window.parent as typeof window.parent & { detentionSystem?: DetentionSystem }).detentionSystem = system;
          // 同时也在主窗口暴露 DS
          (window.parent as any).DS = system;
          console.info('[核心系统] ✓ 初始化完成后已同步到主窗口');

          // 调试日志已禁用以避免 CORS 错误
        }
      } catch (e) {
        console.warn('[核心系统] ⚠ 初始化后暴露到主窗口失败:', e);

        // 调试日志已禁用以避免 CORS 错误
      }

      // 确保在当前窗口也暴露 DS（如果还没有）
      if (!(window as any).DS && system) {
        (window as any).DS = system;
        console.info('[核心系统] ✓ 初始化完成后已将 DS 暴露到全局');
      }
    } catch (error) {
      console.error('[核心系统] initialize() 调用出错:', error);
      system.handleError(error, 'initialize');
    }
  }, 1000);
});

$(window).on('pagehide', () => {
  stopCacheCleanup();
});

// ========== 事件监听：用户输入和回合推进 ==========
// 存储当前跳过的消息ID，用于在生成开始时停止生成
let skipMessageId: number | null = null;

$(() => {
  console.info('[核心系统] 正在注册消息拦截监听器...');

  // 存储需要拦截的跳过指令消息
  const skipCommandMessages = new Set<number>();

  // 监听用户消息渲染，立即拦截跳过指令
  // 使用 eventMakeFirst 确保我们的监听器在其他监听器（如 quick-reply 扩展）之前执行
  eventMakeFirst(tavern_events.USER_MESSAGE_RENDERED, async (message_id: number) => {
    try {
      const messages = getChatMessages(message_id, { role: 'user' });
      const userMessage = messages[0];
      if (!userMessage || !userMessage.message) return;

      const userInput = userMessage.message;

      // 优先检查是否为系统事件消息（通过 data 标记或内容）
      const messageData = userMessage.data as { isSystemEventMessage?: boolean } | undefined;
      const isSystemEventMessage = messageData?.isSystemEventMessage === true;
      const isSystemByContent =
        userInput.startsWith('[系统事件]') || (userInput.startsWith('[第') && userInput.includes(']'));

      if (isSystemEventMessage || isSystemByContent) {
        // 系统事件消息已在 event_triggered 中处理，不需要在这里做任何操作
        // 但是要阻止其他监听器（如 quick-reply 扩展）自动触发生成
        // 我们不需要隐藏消息，因为它已经在页面上了
        //
        // 重要：虽然我们无法阻止其他监听器执行，但我们可以：
        // 1. 确保我们的监听器优先执行（使用 eventMakeFirst）
        // 2. 在 GENERATION_STARTED 中检测并停止系统事件消息触发的生成
        // 3. 设置 waitingForEventResponse 标志，让其他监听器知道正在处理事件

        // 调试日志已禁用以避免 CORS 错误

        // 如果正在等待事件响应，立即停止任何可能被触发的生成
        if (waitingForEventResponse) {
          // 立即停止所有生成，防止其他监听器（如 quick-reply）自动触发生成
          try {
            await stopAllGeneration();
            // 调试日志已禁用以避免 CORS 错误
          } catch (error) {
            console.warn('[核心系统] 在USER_MESSAGE_RENDERED中停止生成失败:', error);
          }
        }

        return; // 直接返回，不进行任何处理
      }

      // 检测跳过指令（支持复合中文数字：十五、二十等，以及句号等标点）
      // 匹配：跳过15天、跳过十五天、推进15天、快速推进15天等
      const skipDayPattern =
        /(?:跳过|推进|快速推进|快进)\s*(\d+|十[一二三四五六七八九]?|[二三四五六七八九]十[一二三四五六七八九]?|百[一二三四五六七八九]?十?[一二三四五六七八九]?|千[一二三四五六七八九]?百?[一二三四五六七八九]?十?[一二三四五六七八九]?|万)\s*天[。，！？\s]*/;
      const skipDayMatch = userInput.match(skipDayPattern);

      if (skipDayMatch) {
        // 立即隐藏消息
        try {
          await setChatMessages([{ message_id, is_hidden: true, message: '.' }], { refresh: 'all' });
          skipCommandMessages.add(message_id);
          console.info(`[核心系统] ✓ 已在USER_MESSAGE_RENDERED中隐藏跳过天数指令消息 (message_id: ${message_id})`);

          // 调试日志已禁用以避免 CORS 错误
        } catch (error) {
          console.warn('[核心系统] 在USER_MESSAGE_RENDERED中隐藏消息失败:', error);
        }
      }
    } catch (error) {
      console.warn('[核心系统] USER_MESSAGE_RENDERED处理失败:', error);
    }
  });

  // 监听生成前事件，阻止跳过指令和系统事件消息触发AI生成
  eventOn(tavern_events.GENERATE_BEFORE_COMBINE_PROMPTS, () => {
    // 检查是否有待处理的跳过指令消息
    if (skipCommandMessages.size > 0) {
      // 清除标记，这些消息已经处理过了
      skipCommandMessages.clear();
      // 不阻止生成，因为消息已经被隐藏了
    }

    // 检查最后一条用户消息是否为系统事件消息
    try {
      const messages = getChatMessages(-1, { role: 'user' });
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage) {
        const messageData = lastUserMessage.data as { isSystemEventMessage?: boolean } | undefined;
        const isSystemEventMessage = messageData?.isSystemEventMessage === true;
        const userInput = lastUserMessage.message || '';
        const isSystemByContent =
          userInput.startsWith('[系统事件]') || (userInput.startsWith('[第') && userInput.includes(']'));

        if (isSystemEventMessage || isSystemByContent) {
          // 调试日志已禁用以避免 CORS 错误
          // 注意：GENERATE_BEFORE_COMBINE_PROMPTS 事件不能阻止生成，它只是一个通知事件
          // 真正的阻止应该在 MESSAGE_SENT 和 USER_MESSAGE_RENDERED 中完成
        }
      }
    } catch (error) {
      // 忽略错误，不影响正常流程
    }
  });

  // 监听生成开始事件，如果检测到正在生成跳过指令的消息或系统事件消息，立即停止
  // 追踪生成 ID，用于关联 triggerSlash 调用和生成事件
  let lastTriggerTime: number | null = null;
  let lastTriggerEventName: string | null = null;
  const generationTracking: Array<{
    generation_id: string | null;
    type: string;
    timestamp: number;
    triggerTime: number | null;
    eventName: string | null;
    source: 'iframe' | 'tavern';
  }> = [];

  // 同时监听 iframe_events 和 tavern_events 的 GENERATION_STARTED，因为可能触发的是不同的类型
  eventOn(iframe_events.GENERATION_STARTED, (generation_id: string) => {
    // 调试日志已禁用以避免 CORS 错误

    if (skipMessageId !== null) {
      console.info(`[核心系统] ⚠ 检测到正在生成跳过指令消息，立即停止生成 (generation_id: ${generation_id})`);

      // 调试日志已禁用以避免 CORS 错误

      stopGenerationById(generation_id).then(success => {
        if (success) {
          console.info(`[核心系统] ✓ 成功停止生成 (generation_id: ${generation_id})`);
        } else {
          console.warn(`[核心系统] 停止生成失败 (generation_id: ${generation_id})`);
        }
        // 清除标记
        skipMessageId = null;
      });
      return;
    }

    // 检查最后一条用户消息是否为系统事件消息（可能是其他监听器触发的自动生成）
    try {
      const messages = getChatMessages(-1, { role: 'user' });
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage) {
        const messageData = lastUserMessage.data as { isSystemEventMessage?: boolean } | undefined;
        const isSystemEventMessage = messageData?.isSystemEventMessage === true;
        const userInput = lastUserMessage.message || '';
        const isSystemByContent =
          userInput.startsWith('[系统事件]') || (userInput.startsWith('[第') && userInput.includes(']'));

        // 如果正在等待事件响应，且检测到系统事件消息，说明这是由其他监听器触发的自动生成，应该停止
        if (waitingForEventResponse && (isSystemEventMessage || isSystemByContent)) {
          console.warn(
            `[核心系统] ⚠ 检测到正在生成系统事件消息（可能由其他监听器触发），立即停止生成 (generation_id: ${generation_id})`,
          );

          // 调试日志已禁用以避免 CORS 错误

          stopGenerationById(generation_id).then(success => {
            if (success) {
              console.info(`[核心系统] ✓ 成功停止系统事件消息的自动生成 (generation_id: ${generation_id})`);
            } else {
              console.warn(`[核心系统] 停止系统事件消息的自动生成失败 (generation_id: ${generation_id})`);
            }
          });
        }
      }
    } catch (error) {
      // 忽略错误，不影响正常流程
    }
  });

  // 同时监听 tavern_events.GENERATION_STARTED（因为 triggerSlash 可能触发的是这个）
  eventOn(tavern_events.GENERATION_STARTED, (type: string, options: unknown, dry_run: boolean) => {
    // 调试日志已禁用以避免 CORS 错误
  });

  // 追踪收到的 AI 消息，检查是否有消息被分割
  const aiMessageTracking: Array<{
    message_id: number;
    timestamp: number;
    triggerTime: number | null;
    eventName: string | null;
    messageLength: number;
    messagePreview: string;
  }> = [];

  // 监听 AI 消息渲染，追踪消息是否被分割
  // 使用 eventMakeFirst 确保我们的监听器优先执行，以便追踪所有消息
  eventMakeFirst(tavern_events.CHARACTER_MESSAGE_RENDERED, (message_id: number) => {
    try {
      const messages = getChatMessages(message_id, { role: 'assistant' });
      const aiMessage = messages[0];
      if (aiMessage && aiMessage.message) {
        const now = Date.now();
        const messageText = aiMessage.message;

        // 检查这条消息是否已经被追踪过（避免重复）
        const alreadyTracked = aiMessageTracking.some(m => m.message_id === message_id);
        if (alreadyTracked) {
          console.warn(`[核心系统] ⚠ CHARACTER_MESSAGE_RENDERED 事件重复触发，message_id: ${message_id}`);
          return;
        }

        aiMessageTracking.push({
          message_id,
          timestamp: now,
          triggerTime: lastTriggerTime,
          eventName: lastTriggerEventName,
          messageLength: messageText.length,
          messagePreview: messageText.substring(0, 100),
        });

        // 调试日志已禁用以避免 CORS 错误

        // 检查是否有多个消息关联到同一个触发事件
        const relatedMessages = aiMessageTracking.filter(
          m => m.triggerTime === lastTriggerTime && m.eventName === lastTriggerEventName,
        );

        // 如果有关联消息，检查时间间隔（如果时间间隔很短，可能是分割）
        if (relatedMessages.length > 1) {
          const timeGaps = relatedMessages
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((m, i, arr) => (i > 0 ? m.timestamp - arr[i - 1].timestamp : 0))
            .filter(gap => gap > 0);

          console.warn(
            `[核心系统] ⚠ 检测到可能的消息分割：事件 "${lastTriggerEventName}" 触发的生成产生了 ${relatedMessages.length} 条消息`,
            {
              messageIds: relatedMessages.map(m => m.message_id),
              lengths: relatedMessages.map(m => m.messageLength),
              timeGaps,
              totalLength: relatedMessages.reduce((sum, m) => sum + m.messageLength, 0),
            },
          );

          // 调试日志已禁用以避免 CORS 错误
        }

        // 检查是否有其他消息在很短时间内创建（即使 triggerTime 不匹配，也可能是相关的）
        const recentMessages = aiMessageTracking.filter(
          m => m.message_id !== message_id && Math.abs(m.timestamp - now) < 3000,
        );
        if (recentMessages.length > 0) {
          console.info(
            `[核心系统] 检测到附近有 ${recentMessages.length} 条其他消息（3秒内）`,
            recentMessages.map(m => ({ id: m.message_id, timeDiff: Math.abs(m.timestamp - now) })),
          );
        }
      }
    } catch (error) {
      console.warn('[核心系统] CHARACTER_MESSAGE_RENDERED 追踪失败:', error);
    }
  });

  // 监听用户消息发送，触发动态世界书加载和天数跳过
  // 使用同步方式立即处理，避免延迟
  eventOn(tavern_events.MESSAGE_SENT, async (message_id: number | string) => {
    // 调试日志已禁用以避免 CORS 错误

    try {
      console.info(`[核心系统] 📨 MESSAGE_SENT 事件触发，message_id: ${message_id}`);

      // 早期检查：如果正在等待事件响应，快速检查是否为系统消息并跳过
      // 这样可以避免在事件处理过程中重复处理消息
      if (waitingForEventResponse) {
        // 调试日志已禁用以避免 CORS 错误

        // 快速检查消息是否为系统事件消息
        const messages = getChatMessages(-1, { role: 'user' });
        const userMessage = messages.find(m => m.message_id === Number(message_id));

        if (userMessage) {
          // 优先通过 data 标记检查
          const messageData = userMessage.data as { isSystemEventMessage?: boolean } | undefined;
          const isSystemEventMessage = messageData?.isSystemEventMessage === true;
          const userInput = userMessage.message || '';
          const isSystemByContent =
            userInput.startsWith('[系统事件]') || (userInput.startsWith('[第') && userInput.includes(']'));

          if (isSystemEventMessage || isSystemByContent) {
            // 调试日志已禁用以避免 CORS 错误

            // 直接返回，不触发任何处理（包括 user_input 事件）
            return;
          }
        }
      }

      // 获取用户输入内容
      const messages = getChatMessages(-1, { role: 'user' });

      // 调试日志已禁用以避免 CORS 错误

      const userMessage = messages.find(m => m.message_id === Number(message_id));

      // 调试日志已禁用以避免 CORS 错误

      if (userMessage && userMessage.message) {
        const userInput = userMessage.message;
        console.info('[核心系统] 检测到用户输入:', userInput.substring(0, 50) + '...');

        // 优先通过 data 标记检查是否为系统事件消息（更快、更可靠）
        const messageData = userMessage.data as { isSystemEventMessage?: boolean } | undefined;
        const isSystemEventMessage = messageData?.isSystemEventMessage === true;

        // 跳过系统生成的消息（通过 data 标记或消息内容识别）
        if (
          isSystemEventMessage ||
          userInput.startsWith('[系统事件]') ||
          (userInput.startsWith('[第') && userInput.includes(']'))
        ) {
          // 这是系统生成的事件消息，不是用户的跳过指令，直接跳过
          // 调试日志已禁用以避免 CORS 错误

          // 系统消息已跳过，不再触发任何事件，因为：
          // 1. event_triggered 监听器已经处理了事件消息的创建和AI生成
          // 2. 动态世界书加载应该在 event_triggered 监听器中处理（如果需要）
          // 3. 避免任何可能的重复处理
          // 不再触发 user_input 事件，避免任何潜在的副作用
          // const DS_EMIT_SYSTEM = window.detentionSystem;
          // if (DS_EMIT_SYSTEM && DS_EMIT_SYSTEM.events) {
          //   DS_EMIT_SYSTEM.events.emit('user_input', { text: userInput, message_id });
          // }

          // 调试日志已禁用以避免 CORS 错误

          return;
        }

        // 检测"生成主角"、"创建主角"指令
        const protagonistPattern = /(?:生成|创建|随机生成|随机创建)\s*(\d+)?\s*(?:名|个)?\s*(?:主角|角色|人物)/;
        const protagonistMatch = userInput.match(protagonistPattern);

        if (protagonistMatch) {
          // 调试日志已禁用以避免 CORS 错误

          console.info('[核心系统] 检测到生成主角指令:', userInput);

          try {
            const DS_PROTAGONIST = window.detentionSystem;
            const npcSystem = DS_PROTAGONIST?.getModule('npcSystem') as {
              generateProtagonist?: (options?: {
                crimeType?: string;
                excludeCrimes?: string[];
                background?: {
                  isIntellectual?: boolean;
                  isAcademic?: boolean;
                  isBusiness?: boolean;
                };
                ageRange?: [number, number];
                education?: string;
                profession?: string[];
              }) => {
                name?: string;
                age?: number;
                crime?: string;
                appearance?: {
                  height?: number;
                  weight?: number;
                  hair?: string;
                  skin?: string;
                  features?: string;
                };
                background?: {
                  education?: string;
                  profession?: string;
                };
                personality?: {
                  tags?: string[];
                };
              };
            };

            if (npcSystem && npcSystem.generateProtagonist) {
              // 解析用户要求
              const options: {
                crimeType?: string;
                excludeCrimes?: string[];
                background?: {
                  isIntellectual?: boolean;
                  isAcademic?: boolean;
                  isBusiness?: boolean;
                };
                ageRange?: [number, number];
                education?: string;
                profession?: string[];
              } = {};

              // 检测犯罪类型要求
              if (userInput.includes('经济犯罪') || userInput.includes('经济')) {
                options.crimeType = 'economic';
              }
              if (userInput.includes('学术腐败')) {
                options.excludeCrimes = ['学术腐败'];
              } else if (userInput.includes('不得是学术腐败') || userInput.includes('非学术腐败')) {
                options.excludeCrimes = ['学术腐败'];
              }

              // 检测背景要求
              if (userInput.includes('高级知识分子') || userInput.includes('知识分子')) {
                options.background = { ...options.background, isIntellectual: true };
              }
              if (userInput.includes('非学术') || userInput.includes('不得是学术')) {
                options.background = { ...options.background, isAcademic: false };
              }
              if (userInput.includes('商业') || userInput.includes('企业')) {
                options.background = { ...options.background, isBusiness: true };
              }

              // 检测年龄要求（简化处理）
              if (userInput.includes('35') || userInput.includes('45')) {
                options.ageRange = [35, 45];
              }

              // 检测教育要求
              if (userInput.includes('高学历') || userInput.includes('本科') || userInput.includes('研究生')) {
                options.education = 'high';
              }

              // 调试日志已禁用以避免 CORS 错误

              const protagonistData = npcSystem.generateProtagonist(options);

              // 调试日志已禁用以避免 CORS 错误

              if (protagonistData && protagonistData.name) {
                // 保存主角信息到聊天变量
                const chatId = SillyTavern.getCurrentChatId();
                if (chatId) {
                  const protagonistInfo = {
                    name: protagonistData.name,
                    age: protagonistData.age || 30,
                    crime: protagonistData.crime || '经济犯罪',
                    appearance: protagonistData.appearance || {
                      height: 168,
                      weight: 58,
                      hair: '黑色长发',
                      skin: '白皙',
                      features: '气质优雅',
                    },
                    background: protagonistData.background || {},
                    personality: protagonistData.personality || {},
                  };

                  // 使用replaceVariables保存主角信息
                  replaceVariables(
                    {
                      protagonist: protagonistInfo,
                      protagonist_name: protagonistData.name,
                      protagonist_age: protagonistData.age || 30,
                      protagonist_crime: protagonistData.crime || '经济犯罪',
                    },
                    { type: 'chat' },
                  );

                  console.info(
                    '[核心系统] ✓ 主角已生成并保存:',
                    protagonistData.name,
                    protagonistData.age,
                    protagonistData.crime,
                  );

                  // 调试日志已禁用以避免 CORS 错误
                }
              } else {
                console.warn('[核心系统] generateProtagonist返回空数据');
              }
            } else {
              console.warn('[核心系统] NPC系统或generateProtagonist不可用');
            }
          } catch (error) {
            console.error('[核心系统] 生成主角失败:', error);

            // 调试日志已禁用以避免 CORS 错误
          }

          // 主角生成指令已处理，继续处理其他逻辑（不return，允许后续逻辑执行）
        }

        // 检测"跳过X天"、"推进X天"、"快速推进X天"指令（支持数字和复合中文数字）
        // 支持：跳过10天、推进15天、快速推进二十天等
        const skipDayPattern =
          /(?:跳过|推进|快速推进|快进)\s*(\d+|十[一二三四五六七八九]?|[二三四五六七八九]十[一二三四五六七八九]?|百[一二三四五六七八九]?十?[一二三四五六七八九]?|千[一二三四五六七八九]?百?[一二三四五六七八九]?十?[一二三四五六七八九]?|万)\s*天[。，！？\s]*/;
        const skipDayMatch = userInput.match(skipDayPattern);

        // 调试日志已禁用以避免 CORS 错误

        const DS_CHECK = window.detentionSystem;
        if (DS_CHECK && DS_CHECK.initialized) {
          const eventSystem = DS_CHECK.getModule('eventSystem');
          if (eventSystem && (DS_CHECK as any).advanceDay) {
            let daysToSkip = 0;

            // 解析数字（支持中文数字和阿拉伯数字，包括复合数字如"十五"、"二十"等）
            const parseNumber = (numStr: string): number => {
              // 先尝试解析阿拉伯数字
              const parsed = parseInt(numStr, 10);
              if (!isNaN(parsed)) return parsed;

              // 中文数字映射
              const chineseDigits: Record<string, number> = {
                零: 0,
                一: 1,
                二: 2,
                三: 3,
                四: 4,
                五: 5,
                六: 6,
                七: 7,
                八: 8,
                九: 9,
                十: 10,
                百: 100,
                千: 1000,
                万: 10000,
              };

              // 简单情况：直接匹配
              if (numStr in chineseDigits) return chineseDigits[numStr];

              // 复合数字解析（如"十五"、"二十"、"二十三"等）
              let result = 0;

              // 处理"十X"格式（如"十五"、"十六"）
              if (numStr.startsWith('十')) {
                result = 10;
                const rest = numStr.slice(1);
                if (rest in chineseDigits) result += chineseDigits[rest];
              }
              // 处理"X十"格式（如"二十"、"三十"）
              else if (numStr.endsWith('十')) {
                const prefix = numStr.slice(0, -1);
                if (prefix in chineseDigits) result = chineseDigits[prefix] * 10;
              }
              // 处理"X十Y"格式（如"二十三"、"三十五"）
              else {
                const shiIndex = numStr.indexOf('十');
                if (shiIndex > -1) {
                  const before = numStr.slice(0, shiIndex);
                  const after = numStr.slice(shiIndex + 1);
                  const beforeNum = before in chineseDigits ? chineseDigits[before] : 0;
                  const afterNum = after in chineseDigits ? chineseDigits[after] : 0;
                  result = (beforeNum || 1) * 10 + afterNum; // 如果没有"十"前面的数字，默认为1（如"十五"）
                }
              }

              return result > 0 ? result : 0;
            };

            // 匹配"跳过X天"、"推进X天"、"快速推进X天"等
            if (skipDayMatch) {
              daysToSkip = parseNumber(skipDayMatch[1]);
              if (daysToSkip > 0) {
                console.info(`[核心系统] 检测到跳过/推进天数指令: ${skipDayMatch[0].trim()} (${daysToSkip}天)`);
              }
            }

            // 执行天数跳过
            if (daysToSkip > 0) {
              // 检查是否已经处理过这条消息（防止重复执行）
              if (skipCommandMessages.has(Number(message_id))) {
                console.debug(`[核心系统] 跳过指令消息 ${message_id} 已处理，跳过重复执行`);
                return;
              }

              // 标记这条消息，用于在生成开始时停止生成
              skipMessageId = Number(message_id);

              // 调试日志已禁用以避免 CORS 错误

              // 立即停止所有正在进行的生成，防止AI响应跳过指令
              try {
                await stopAllGeneration();
                console.info(`[核心系统] ✓ 已停止所有正在进行的生成`);

                // 调试日志已禁用以避免 CORS 错误

                // 等待生成完全停止（复用event_triggered的等待逻辑）
                const waitForGenerationToStop = (): Promise<void> => {
                  return new Promise(resolve => {
                    let resolved = false;
                    let eventReturn: { stop: () => void } | null = null;

                    const cleanup = () => {
                      if (eventReturn) {
                        eventReturn.stop();
                        eventReturn = null;
                      }
                    };

                    // 使用 eventOnce 只监听一次生成结束事件
                    eventReturn = eventOnce(tavern_events.GENERATION_ENDED, () => {
                      if (!resolved) {
                        // 额外等待800ms确保完全结束
                        setTimeout(() => {
                          if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            cleanup();
                            resolve();
                          }
                        }, 800);
                      }
                    });

                    // 超时机制：如果2500ms内没有收到GENERATION_ENDED，则超时
                    const timeout = setTimeout(() => {
                      if (!resolved) {
                        resolved = true;
                        cleanup();
                        // 调试日志已禁用以避免 CORS 错误
                        resolve();
                      }
                    }, 2500);

                    // 如果不在生成，立即resolve
                    if (typeof builtin === 'undefined' || !builtin.duringGenerating || !builtin.duringGenerating()) {
                      if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        cleanup();
                        resolve();
                      }
                    }
                  });
                };

                await waitForGenerationToStop();

                // 等待完成后，再次检查并强制停止（如果仍在生成）
                let finalCheckCount = 0;
                while (
                  typeof builtin !== 'undefined' &&
                  builtin.duringGenerating &&
                  builtin.duringGenerating() &&
                  finalCheckCount < 5
                ) {
                  finalCheckCount++;
                  console.warn(`[核心系统] ⚠ 等待后仍在生成，再次强制停止 (第${finalCheckCount}次)`);
                  await stopAllGeneration();
                  // 等待500ms后再次检查
                  await new Promise(resolve => setTimeout(resolve, 500));
                }

                // 调试日志已禁用以避免 CORS 错误
              } catch (stopError) {
                console.warn('[核心系统] 停止生成失败:', stopError);
              }

              // 检查消息是否已经在USER_MESSAGE_RENDERED中被隐藏
              const checkMessages = getChatMessages(Number(message_id), { role: 'user' });
              const existingMessage = checkMessages[0];
              const alreadyHidden = existingMessage?.is_hidden === true || skipCommandMessages.has(Number(message_id));

              if (!alreadyHidden) {
                // 立即隐藏用户的原始消息，防止AI看到并处理
                try {
                  await setChatMessages([{ message_id: Number(message_id), is_hidden: true, message: '.' }], {
                    refresh: 'all',
                  });
                  skipCommandMessages.add(Number(message_id));
                  console.info(`[核心系统] ✓ 已在MESSAGE_SENT中隐藏跳过指令消息 (message_id: ${message_id})`);

                  // 调试日志已禁用以避免 CORS 错误
                } catch (hideError) {
                  console.warn('[核心系统] 隐藏消息失败:', hideError);
                  // 调试日志已禁用以避免 CORS 错误
                }
              } else {
                console.info(`[核心系统] 跳过指令消息已在USER_MESSAGE_RENDERED中被隐藏 (message_id: ${message_id})`);
              }

              // 在跳过天数前，强制加载环境描写库和生活细节库
              try {
                const worldbookLoader = DS_CHECK.getModule('worldbook') as {
                  loadWorldbook?: (bookName: string) => Promise<unknown>;
                };
                if (worldbookLoader && worldbookLoader.loadWorldbook) {
                  console.info('[核心系统] 跳过天数时强制加载环境描写库和生活细节库');
                  // 并行加载，不等待完成（避免阻塞）
                  Promise.all([
                    worldbookLoader.loadWorldbook('environment_descriptions').catch(err => {
                      console.warn('[核心系统] 加载环境描写库失败:', err);
                    }),
                    worldbookLoader.loadWorldbook('internal_basic_procedures').catch(err => {
                      console.warn('[核心系统] 加载生活细节库失败:', err);
                    }),
                  ]).catch(() => {
                    // 忽略错误，继续执行
                  });
                }
              } catch (loadError) {
                console.warn('[核心系统] 强制加载世界书失败:', loadError);
              }

              // 在后台执行天数推进和事件判定
              try {
                const result = (DS_CHECK as any).advanceDay(daysToSkip) as {
                  interrupted?: boolean;
                  currentDay?: number;
                  tempCurrentDay?: number;
                  pendingDays?: number;
                  event?: { name?: string; priority?: number };
                };

                // 调试日志已禁用以避免 CORS 错误

                if (result && result.interrupted && result.event) {
                  // 优先使用事件的实际发生天数，而不是currentDay（可能还没有更新）
                  const eventDay = result.event.day ?? result.tempCurrentDay ?? result.currentDay ?? 0;
                  console.info(`[核心系统] 跳过 ${daysToSkip} 天后触发事件: ${result.event.name} (第${eventDay}天)`);

                  // 调试日志已禁用以避免 CORS 错误

                  // 事件已经在 advanceDay 中通过 DS.events.emit('event_triggered') 触发
                  // event_triggered 监听器会自动创建用户消息并触发AI生成
                  // 这里不需要额外处理，等待 event_triggered 监听器处理即可
                } else {
                  // 如果没有事件打断，需要立即确认天数推进（因为没有AI回复需要等待）
                  if (result.pendingDays !== undefined && result.pendingDays > 0) {
                    const eventSystem = DS_CHECK.getModule('eventSystem') as {
                      confirmDayAdvancement?: (pendingDays: number) => void;
                    };
                    if (eventSystem && eventSystem.confirmDayAdvancement) {
                      eventSystem.confirmDayAdvancement(result.pendingDays);
                    }
                  }

                  const finalDay = result.tempCurrentDay ?? result.currentDay ?? 0;
                  console.info(`[核心系统] 成功跳过 ${daysToSkip} 天，当前第 ${finalDay} 天`);

                  // 如果没有事件打断，创建一个隐藏的消息说明已跳过，但不触发AI生成
                  // 这样用户可以看到跳过的结果，但不会让AI响应
                  try {
                    await createChatMessages([
                      {
                        role: 'system',
                        message: `[系统] 已跳过 ${daysToSkip} 天，当前第 ${finalDay} 天`,
                        is_hidden: true,
                      },
                    ]);
                  } catch (createError) {
                    console.warn('[核心系统] 创建系统消息失败:', createError);
                  }
                }
              } catch (error) {
                console.error('[核心系统] 执行跳过天数失败:', error);

                // 调试日志已禁用以避免 CORS 错误
              }

              // 清除标记（原始消息已删除，不需要再停止生成）
              skipMessageId = null;

              // 跳过指令已经处理，不再触发动态世界书加载
              return;
            }
          }
        }

        // 发出 user_input 事件，触发动态世界书加载
        const DS_EMIT = window.detentionSystem;
        if (DS_EMIT && DS_EMIT.events) {
          DS_EMIT.events.emit('user_input', { text: userInput, message_id });
        }
      }
    } catch (error) {
      console.warn('[核心系统] 处理用户输入事件失败:', error);
    }
  });

  // 标记是否正在等待事件响应（防止在事件响应期间继续推进）
  let waitingForEventResponse = false;

  console.info('[核心系统] ✓ 已注册用户输入和天数跳过事件监听');
  console.info('[核心系统] ✓ MESSAGE_SENT 监听器已注册，可以检测"跳过X天"指令');

  // 监听事件触发，自动发送给AI
  const DS_EVENT = window.detentionSystem as DetentionSystem & {
    generateNPC?: (
      count?: number,
      context?: Record<string, unknown>,
    ) => Array<{
      name?: string;
      role?: string;
      age?: number;
      rank?: string;
      type?: string;
      relation?: string;
      relationship?: { influence?: number };
    }>;
    generateNPCForEvent?: (
      eventType: string,
    ) =>
      | { name: string; role?: string; age?: number; rank?: string; type?: string; relation?: string }
      | { police: { name: string; rank?: string }; witnesses: Array<{ name: string }> };
    getCurrentCellNPCs?: () => Array<{ name?: string; relationship?: { influence?: number } }>;
    setCurrentCellNPCs?: (npcs: Array<{ name?: string; relationship?: { influence?: number } }>) => void;
  };
  if (DS_EVENT && DS_EVENT.events) {
    DS_EVENT.events.on('event_triggered', async (eventData?: unknown) => {
      try {
        const event = eventData as
          | {
              id?: string;
              name?: string;
              description?: string;
              type?: string;
              priority?: number;
              day?: number;
              text?: string;
            }
          | undefined;

        if (!event || !event.name) {
          // 调试日志已禁用以避免 CORS 错误
          return;
        }

        // 处理高优先级事件（优先级 <= 4，即非日常事件）
        // 优先级定义：LEGAL(1), PROCEDURAL(2), CONDITION(3), RANDOM(4), DAILY(5)
        // 优先级 <= 4 的事件都应该触发AI输出（因为它们在 advanceDay 中会打断推进）
        const eventPriority = event.priority ?? 5;
        if (eventPriority > 4) {
          console.debug(`[核心系统] 跳过日常事件 ${event.name} 的AI触发（优先级: ${eventPriority}）`);
          // 调试日志已禁用以避免 CORS 错误
          return;
        }

        // 设置等待事件响应标志，防止在响应期间继续推进
        // 在创建消息之前就设置标志，确保 MESSAGE_SENT 监听器能够识别这是系统消息
        waitingForEventResponse = true;

        // 调试日志已禁用以避免 CORS 错误

        console.info(`[核心系统] 检测到高优先级事件: ${event.name}，准备触发AI生成`);

        // 检查是否是跳过后的事件打断，需要包含前几天的情况描述
        const eventSystem = DS_EVENT.getModule('eventSystem') as {
          currentDay?: number;
          advanceDay?: (days: number) => { accumulatedEvents?: unknown[] };
        };
        // 优先使用事件对象中的 day 字段，因为它才是事件实际发生的天数
        // eventSystem.currentDay 可能还没有更新（因为天数推进是在AI回复后才确认的）
        const currentDay = event.day ?? eventSystem?.currentDay ?? 0;

        let userInput = '';

        // 不再生成"前几日情况"表述，这部分已经纳入提示词中

        // 添加当前事件的描述，使用明确的指令格式，让AI知道这是系统触发的事件
        const eventText = event.text || event.description || `${event.name}发生了`;

        // 获取NPC信息并注入到userInput中
        let npcInfoText = '';
        const eventId = event.id || '';

        // 调试日志已禁用以避免 CORS 错误

        // 对于需要特定NPC的事件（如提审、律师会见等），生成或获取NPC信息
        if (
          eventId &&
          [
            'interrogation',
            'lawyer_visit',
            'family_visit',
            'medical_visit',
            'scene_identification',
            'prosecutor_interrogation',
          ].includes(eventId)
        ) {
          try {
            if (typeof DS_EVENT.generateNPCForEvent === 'function') {
              const eventNPC = DS_EVENT.generateNPCForEvent(eventId);

              // 调试日志已禁用以避免 CORS 错误

              if (eventNPC && typeof eventNPC === 'object') {
                // 处理单个NPC（如警察、律师等）
                if ('name' in eventNPC && typeof (eventNPC as { name: string }).name === 'string') {
                  const npc = eventNPC as {
                    name: string;
                    role?: string;
                    age?: number;
                    rank?: string;
                    type?: string;
                    relation?: string;
                  };
                  const npcDesc =
                    npc.role === 'police'
                      ? `${npc.name}（${npc.rank || '民警'}）`
                      : npc.role === 'lawyer'
                        ? `${npc.name}（${npc.type || '律师'}）`
                        : npc.role === 'family'
                          ? `${npc.name}（${npc.relation || '家属'}）`
                          : npc.role === 'doctor'
                            ? `${npc.name}（医生）`
                            : npc.name;
                  npcInfoText = `\n\n【相关NPC信息】${npcDesc}（已由NPC系统生成，请使用此名字，不要自行生成其他名字）。`;
                }
                // 处理多个NPC（如指认现场事件）
                else if ('police' in eventNPC && 'witnesses' in eventNPC) {
                  const sceneData = eventNPC as {
                    police: { name: string; rank?: string };
                    witnesses: Array<{ name: string }>;
                  };
                  const policeDesc = `${sceneData.police.name}（${sceneData.police.rank || '民警'}）`;
                  const witnessesDesc = sceneData.witnesses.map(w => w.name).join('、');
                  npcInfoText = `\n\n【相关NPC信息】警察：${policeDesc}；证人：${witnessesDesc}（已由NPC系统生成，请使用这些名字，不要自行生成其他名字）。`;
                }
              }
            }
          } catch (npcError) {
            console.warn('[核心系统] 生成事件NPC失败:', npcError);

            // 调试日志已禁用以避免 CORS 错误
          }
        }

        // 对于监室转移事件，需要生成新监室的NPC（因为转移到了新监室）
        if (eventId === 'cell_transfer') {
          try {
            // 获取目标监室类型（从事件数据中获取，如果没有则从事件系统获取）
            const eventSystemModule = DS_EVENT.getModule('eventSystem') as
              | {
                  cellType?: string;
                }
              | undefined;
            const targetCellType = (event as { to?: string }).to || eventSystemModule?.cellType || 'pretrial';

            // 调试日志已禁用以避免 CORS 错误

            // 直接生成新监室的NPC（不依赖cell_transfer事件监听器，确保同步执行）
            if (typeof DS_EVENT.generateNPC === 'function' && typeof DS_EVENT.setCurrentCellNPCs === 'function') {
              const npcCount = Math.floor(Math.random() * 5) + 3; // 3-7人
              const newNPCs = DS_EVENT.generateNPC(npcCount, { cellType: targetCellType });

              // 调试日志已禁用以避免 CORS 错误

              if (Array.isArray(newNPCs) && newNPCs.length > 0) {
                // 设置当前监室NPC（确保NPC系统状态一致）
                DS_EVENT.setCurrentCellNPCs(newNPCs);
                console.info(`[核心系统] ✓ 已为监室转移生成${newNPCs.length}个新NPC`);

                // 找出牢头（影响力最高的）
                const cellBoss = newNPCs.reduce((max, npc) => {
                  const influence = (npc as { relationship?: { influence?: number } }).relationship?.influence ?? 0;
                  const maxInfluence = (max as { relationship?: { influence?: number } }).relationship?.influence ?? 0;
                  return influence > maxInfluence ? npc : max;
                }, newNPCs[0]);

                const otherNPCs = newNPCs.filter(npc => npc !== cellBoss);
                const cellBossName = (cellBoss as { name?: string }).name || '未知';
                const otherNames = otherNPCs
                  .map((npc: { name?: string }) => npc.name)
                  .filter(Boolean)
                  .join('、');

                npcInfoText = `\n\n【监室NPC信息】新监室牢头：${cellBossName}；其他狱友：${otherNames || '暂无'}（已由NPC系统随机生成，请使用这些名字，不要自行生成其他名字）。`;
              }
            }
          } catch (cellNPCError) {
            console.warn('[核心系统] 生成监室转移NPC失败:', cellNPCError);

            // 调试日志已禁用以避免 CORS 错误
          }
        }

        // 对于其他涉及监室NPC的事件（如随机事件），也获取当前监室的NPC列表
        // 随机事件的category应该是'random'，或者事件ID包含随机事件的标识
        const eventCategory = (event as { category?: string }).category;
        if (
          !npcInfoText &&
          (eventCategory === 'random' || event.priority === 4) &&
          typeof DS_EVENT.getCurrentCellNPCs === 'function'
        ) {
          try {
            let cellNPCs = DS_EVENT.getCurrentCellNPCs();

            // 如果当前监室没有NPC，且是第0天或第1天（初始场景），生成初始监室NPC
            if ((!cellNPCs || (Array.isArray(cellNPCs) && cellNPCs.length === 0)) && currentDay <= 1) {
              console.info('[核心系统] 检测到初始场景，生成初始监室NPC');

              // 调试日志已禁用以避免 CORS 错误

              if (typeof DS_EVENT.generateNPC === 'function') {
                const eventSystemModule = DS_EVENT.getModule('eventSystem') as
                  | {
                      cellType?: string;
                    }
                  | undefined;
                const cellType = eventSystemModule?.cellType || 'transition';
                const initialNPCCount = Math.floor(Math.random() * 5) + 3; // 3-7人
                const initialNPCs = DS_EVENT.generateNPC(initialNPCCount, { cellType });

                if (Array.isArray(initialNPCs) && initialNPCs.length > 0) {
                  if (typeof DS_EVENT.setCurrentCellNPCs === 'function') {
                    DS_EVENT.setCurrentCellNPCs(initialNPCs);
                    console.info(`[核心系统] ✓ 已生成${initialNPCs.length}个初始监室NPC`);
                  }
                  cellNPCs = initialNPCs;
                }
              }
            }

            if (Array.isArray(cellNPCs) && cellNPCs.length > 0) {
              // 随机选择1-3个NPC参与事件
              const selectedNPCs = cellNPCs.sort(() => Math.random() - 0.5).slice(0, Math.min(3, cellNPCs.length));
              const npcNames = selectedNPCs
                .map((npc: { name?: string }) => npc.name)
                .filter(Boolean)
                .join('、');
              if (npcNames) {
                npcInfoText = `\n\n【相关NPC信息】参与事件的狱友：${npcNames}（已由NPC系统生成，请使用这些名字，不要自行生成其他名字）。`;
              }
            }
          } catch (cellNPCError) {
            console.warn('[核心系统] 获取随机事件NPC失败:', cellNPCError);

            // 调试日志已禁用以避免 CORS 错误
          }
        }

        // 如果事件有自定义的text字段（打断事件模板），直接使用它，不添加额外的"描述事件发展"指令
        // 因为打断事件模板已经包含了完整的指令（描述事件前经历，在事件即将开始时结束）
        if (event.text) {
          // 使用打断事件模板，它已经包含了完整的指令
          userInput = `[系统事件] 第${currentDay}天：${eventText}${npcInfoText}`;
        } else {
          // 对于没有自定义text的事件（非打断事件），使用原来的逻辑
          userInput = `[系统事件] 第${currentDay}天：${eventText}。请详细描述事件的发展和主角的反应。${npcInfoText}`;
        }

        // 调试日志已禁用以避免 CORS 错误

        // 调试日志已禁用以避免 CORS 错误

        // 调试日志已禁用以避免 CORS 错误

        // 先停止所有正在进行的生成（在创建消息之前）
        await stopAllGeneration();

        // 调试日志已禁用以避免 CORS 错误

        // 创建用户消息
        // 调试日志已禁用以避免 CORS 错误

        // 在创建消息前再次停止所有生成，确保不会有自动触发
        await stopAllGeneration();

        // 调试日志已禁用以避免 CORS 错误

        // 使用 refresh: 'affected' 创建消息，这样消息会显示并触发 MESSAGE_SENT 事件
        // MESSAGE_SENT 监听器会通过检查消息内容来跳过系统消息，避免重复处理
        // 注意：createChatMessages 是异步的，可能在内部立即触发 MESSAGE_SENT 事件
        const createPromise = createChatMessages(
          [
            {
              role: 'user',
              message: userInput,
              is_hidden: false,
              // 添加 data 标记，帮助 MESSAGE_SENT 监听器识别这是系统生成的事件消息
              data: {
                isSystemEventMessage: true,
                eventId: event.id,
                eventName: event.name,
              },
            },
          ],
          { refresh: 'affected' }, // 使用 'affected' 让消息显示，但 MESSAGE_SENT 监听器会跳过它
        );

        // 调试日志已禁用以避免 CORS 错误

        // 等待消息创建完成
        await createPromise;

        // 创建消息后立即再次停止所有生成，防止消息创建触发自动生成
        // 给 MESSAGE_SENT 事件处理时间完成
        await new Promise(resolve => setTimeout(resolve, 150)); // 增加延迟，确保 MESSAGE_SENT 事件处理完成
        await stopAllGeneration();

        // 调试日志已禁用以避免 CORS 错误

        // 调试日志已禁用以避免 CORS 错误

        // 标记事件消息的message_id，用于检测是否被删除/重新生成
        // 等待一小段时间确保消息已创建并 MESSAGE_SENT 事件已处理
        await new Promise(resolve => setTimeout(resolve, 200));
        const eventMessageId = getLastMessageId();

        // 调试日志已禁用以避免 CORS 错误

        // 调试日志已禁用以避免 CORS 错误

        // 确保没有正在进行的生成，然后再触发AI生成
        try {
          // 再次停止所有正在进行的生成（防止createChatMessages触发了新生成）
          await stopAllGeneration();

          // 调试日志已禁用以避免 CORS 错误

          // 等待生成完全停止（通过监听 GENERATION_ENDED 事件或超时）
          const waitForGenerationToStop = (): Promise<void> => {
            return new Promise(resolve => {
              let resolved = false;
              let eventReturn: { stop: () => void } | null = null;
              let generationStartedReturn: { stop: () => void } | null = null;
              let generationEndedReceived = false;
              let generationStartedCount = 0;

              const cleanup = () => {
                if (eventReturn) {
                  eventReturn.stop();
                  eventReturn = null;
                }
                if (generationStartedReturn) {
                  generationStartedReturn.stop();
                  generationStartedReturn = null;
                }
              };

              // 监听 GENERATION_STARTED 事件，如果检测到新生成则立即停止
              generationStartedReturn = eventOn(
                tavern_events.GENERATION_STARTED,
                async (type: string, options: unknown, dry_run: boolean) => {
                  generationStartedCount++;
                  const now = Date.now();
                  // 调试日志已禁用以避免 CORS 错误
                  await stopAllGeneration();
                },
              );

              // 使用 eventOnce 只监听一次生成结束事件
              eventReturn = eventOnce(tavern_events.GENERATION_ENDED, () => {
                if (!resolved) {
                  generationEndedReceived = true;
                  // 调试日志已禁用以避免 CORS 错误
                  // 即使收到GENERATION_ENDED，也等待一段时间确保完全停止
                  setTimeout(() => {
                    if (!resolved) {
                      resolved = true;
                      clearTimeout(timeout);
                      cleanup();
                      resolve();
                    }
                  }, 800); // 收到事件后额外等待800ms，确保完全停止
                }
              });

              // 超时机制：如果2000ms内没有收到GENERATION_ENDED，则超时
              const timeout = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  cleanup();
                  // 调试日志已禁用以避免 CORS 错误
                  resolve();
                }
              }, 2500); // 增加到2500ms超时，给更多时间
            });
          };

          await waitForGenerationToStop();

          // 调试日志已禁用以避免 CORS 错误

          // 检查是否仍在生成，如果是在生成，等待生成自然结束而不是强制停止
          const waitForGenerationToComplete = (): Promise<void> => {
            return new Promise(resolve => {
              // 如果不在生成，直接resolve
              if (typeof builtin === 'undefined' || !builtin.duringGenerating || !builtin.duringGenerating()) {
                resolve();
                return;
              }

              // 调试日志已禁用以避免 CORS 错误

              let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

              // 等待 GENERATION_ENDED 事件
              const eventReturn = eventOnce(tavern_events.GENERATION_ENDED, () => {
                if (timeoutHandle) {
                  clearTimeout(timeoutHandle);
                  timeoutHandle = null;
                }
                // 额外等待500ms确保完全结束
                setTimeout(() => {
                  // 调试日志已禁用以避免 CORS 错误
                  resolve();
                }, 500);
              });

              // 超时保护：最多等待10秒
              timeoutHandle = setTimeout(() => {
                eventReturn.stop();
                timeoutHandle = null;
                // 调试日志已禁用以避免 CORS 错误
                resolve(); // 即使超时也resolve，因为我们已经尽力了
              }, 10000);
            });
          };

          await waitForGenerationToComplete();

          // 最后确认一次：如果仍在生成，再次强制停止（最多尝试3次）
          let forceStopAttempts = 0;
          while (
            typeof builtin !== 'undefined' &&
            builtin.duringGenerating &&
            builtin.duringGenerating() &&
            forceStopAttempts < 3
          ) {
            forceStopAttempts++;
            console.warn(`[核心系统] ⚠ 检测到仍在生成，再次强制停止 (第${forceStopAttempts}次)，事件: ${event.name}`);
            await stopAllGeneration();
            // 等待500ms后再次检查
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // 如果强制停止后仍在生成，记录警告但继续触发（因为我们已经尽力了）
          if (typeof builtin !== 'undefined' && builtin.duringGenerating && builtin.duringGenerating()) {
            // 调试日志已禁用以避免 CORS 错误
            console.warn(`[核心系统] ⚠ 强制停止后仍在生成，但继续触发AI生成，事件: ${event.name}`);
            // 不再返回，继续触发AI生成
          }

          // 额外等待300ms确保完全准备好
          await new Promise(resolve => setTimeout(resolve, 300));

          // 调试日志已禁用以避免 CORS 错误

          // 触发AI生成
          // 保存事件名称，用于后续回调（避免闭包问题）
          const eventName = event.name;
          const eventId = event.id;
          lastTriggerTime = Date.now();
          lastTriggerEventName = event.name;
          generationTracking.length = 0; // 清空之前的追踪记录

          // 记录 triggerSlash 调用前的消息列表，用于对比
          let messagesBeforeTrigger: Array<{ message_id: number; role: string; messageLength: number }> = [];
          let lastAssistantMessage: { message_id: number; message: string; messageLength: number } | null = null;
          try {
            const allMessages = getChatMessages(-1);
            messagesBeforeTrigger = allMessages.map(m => ({
              message_id: m.message_id || 0,
              role: m.role || 'unknown',
              messageLength: (m.message || '').length,
            }));

            // 检查最后一个助手消息，看是否可能是未完成的（可能被流式生成更新）
            const assistantMessages = allMessages.filter(m => m.role === 'assistant');
            if (assistantMessages.length > 0) {
              const lastAssistant = assistantMessages[assistantMessages.length - 1];
              lastAssistantMessage = {
                message_id: lastAssistant.message_id || 0,
                message: lastAssistant.message || '',
                messageLength: (lastAssistant.message || '').length,
              };
            }
          } catch (error) {
            console.warn('[核心系统] 获取 triggerSlash 前的消息列表失败:', error);
          }

          // 检查最后一个助手消息是否可能是未完成的（内容很短或包含特定标记）
          // 如果检测到，记录警告（但不删除，因为可能是正常的）
          const lastAssistantMessageId = lastAssistantMessage?.message_id || null;
          const lastAssistantMessageLength = lastAssistantMessage?.messageLength || 0;
          const lastAssistantMessagePreview = lastAssistantMessage?.message?.substring(0, 100) || '';
          const potentiallyIncompleteMessage =
            lastAssistantMessageId !== null &&
            (lastAssistantMessageLength < 100 || // 内容很短，可能是未完成的
              lastAssistantMessagePreview.includes('<thinking>') || // 包含思考标记，可能是未完成的
              lastAssistantMessagePreview.includes('...')); // 包含省略号，可能是未完成的

          // 调试日志已禁用以避免 CORS 错误

          await triggerSlash('/trigger');

          // 调试日志已禁用以避免 CORS 错误

          console.info(`[核心系统] ✓ 已触发AI生成，事件: ${event.name}`);

          // 监听AI生成完成，清除等待标志，并在回复结束时保存状态快照
          const generationEndHandler = eventOnce(tavern_events.GENERATION_ENDED, (message_id: number) => {
            const endTime = Date.now();
            waitingForEventResponse = false;
            console.debug(`[核心系统] AI响应事件完成，清除等待标志: ${eventName}`);

            // 检查是否有多个消息关联到这次生成
            const relatedMessages = aiMessageTracking.filter(
              m => m.triggerTime === lastTriggerTime && m.eventName === lastTriggerEventName,
            );

            // 检查是否有消息 ID 不匹配（可能的消息分割）
            const messageIdMatched = relatedMessages.some(m => m.message_id === message_id);

            // 尝试获取 message_id 对应的消息（检查是否存在但未被 CHARACTER_MESSAGE_RENDERED 捕获）
            let messageEndContent: string | null = null;
            let messageEndLength = 0;
            try {
              const messageEnd = getChatMessages(message_id, { role: 'assistant' });
              if (messageEnd && messageEnd.length > 0 && messageEnd[0].message) {
                messageEndContent = messageEnd[0].message;
                messageEndLength = messageEndContent.length;
              }
            } catch (error) {
              // 忽略错误
            }

            // 检查 message_id 5 的内容（如果存在），看看是否与本次生成相关
            let message5Content: string | null = null;
            let message5Length = 0;
            let message5Preview: string | null = null;
            try {
              const message5 = getChatMessages(5, { role: 'assistant' });
              if (message5 && message5.length > 0 && message5[0].message) {
                message5Content = message5[0].message;
                message5Length = message5Content.length;
                message5Preview = message5Content.substring(0, 300);
              }
            } catch (error) {
              // 忽略错误
            }

            // 检查是否 message_id 5 的内容包含本次生成的内容（说明内容被更新到了 message_id 5）
            // 使用事件名称来检查，更通用
            const message5ContainsEventContent = message5Content && eventName && message5Content.includes(eventName);
            // 检查是否包含系统事件标记（作为备用检测）
            const message5ContainsSystemEvent =
              message5Content &&
              (message5Content.includes('[系统事件]') ||
                (message5Content.includes('第') && message5Content.includes('天')));
            // 如果 message_id 6 不存在但 message_id 5 包含本次生成的内容，说明内容被更新到了 message_id 5
            const contentUpdatedToMessage5 =
              !messageEndContent && (message5ContainsEventContent || message5ContainsSystemEvent);

            // 获取所有助手消息，检查是否有其他消息在时间窗口内
            let allAssistantMessages: Array<{ message_id: number; messageLength: number; timestamp?: number }> = [];
            try {
              const allMessages = getChatMessages(-1, { role: 'assistant' });
              allAssistantMessages = allMessages.map(m => ({
                message_id: m.message_id || 0,
                messageLength: (m.message || '').length,
              }));
              // 尝试从 aiMessageTracking 中获取时间戳
              allAssistantMessages = allAssistantMessages.map(msg => {
                const tracked = aiMessageTracking.find(t => t.message_id === msg.message_id);
                return { ...msg, timestamp: tracked?.timestamp };
              });
            } catch (error) {
              // 忽略错误
            }

            // 调试日志已禁用以避免 CORS 错误

            // 检查是否是内容被更新到了已存在的 message_id 5（无论是否有 relatedMessages）
            if (contentUpdatedToMessage5) {
              // 使用正确的 message_id（5）而不是期望的 message_id（6）
              const actualMessageId = 5;

              console.warn(
                `[核心系统] ⚠ 检测到流式生成将内容更新到了已存在的 message_id ${actualMessageId}，而不是创建新的 message_id ${message_id}。将使用实际的 message_id ${actualMessageId} 进行处理。`,
                {
                  expectedMessageId: message_id,
                  actualMessageId,
                  message5Length,
                  message5ContainsEventContent,
                  message5ContainsSystemEvent,
                  relatedMessagesCount: relatedMessages.length,
                },
              );

              // 调试日志已禁用以避免 CORS 错误

              // 优化：使用实际的 message_id 进行后续处理（如果需要）
              // 注意：这里不修改 message_id 变量，因为 GENERATION_ENDED 事件已经传递了期望的 message_id
              // 但我们可以记录实际的 message_id 用于日志和调试
            } else if (relatedMessages.length > 0 && !messageIdMatched) {
              // 如果检测到消息 ID 不匹配或多条消息，记录警告（但不是 contentUpdatedToMessage5 的情况）
              console.warn(
                `[核心系统] ⚠ 检测到消息 ID 不匹配：GENERATION_ENDED 的 message_id (${message_id}) 与 CHARACTER_MESSAGE_RENDERED 追踪的消息 ID 不一致`,
                {
                  generationEndMessageId: message_id,
                  trackedMessageIds: relatedMessages.map(m => m.message_id),
                  allTrackedMessages: aiMessageTracking.map(m => ({
                    id: m.message_id,
                    triggerTime: m.triggerTime,
                    eventName: m.eventName,
                    length: m.messageLength,
                  })),
                },
              );

              // 调试日志已禁用以避免 CORS 错误
            } else if (!contentUpdatedToMessage5 && relatedMessages.length > 1) {
              // 检查是否有多条消息关联到同一个触发事件（可能是消息分割）
              // 检测到多条消息关联到同一个触发事件（可能是消息分割）
              console.warn(
                `[核心系统] ⚠ 检测到可能的消息分割：事件 "${lastTriggerEventName}" 触发的生成产生了 ${relatedMessages.length} 条消息`,
                {
                  eventName: lastTriggerEventName,
                  triggerTime: lastTriggerTime,
                  generationEndMessageId: message_id,
                  relatedMessageIds: relatedMessages.map(m => m.message_id),
                  totalLength: relatedMessages.reduce((sum, m) => sum + m.messageLength, 0),
                },
              );

              // 调试日志已禁用以避免 CORS 错误
            }

            // 在AI回复结束时，确认天数推进并保存状态快照
            try {
              const eventSystem = DS_EVENT.getModule('eventSystem') as {
                saveStateToChatVars?: () => void;
                saveEventInterruptSnapshot?: () => void;
                confirmDayAdvancement?: (pendingDays: number) => void;
              };

              // 检查事件数据中是否有待确认的天数推进
              const eventWithPending = event as { pendingDayAdvancement?: number };
              if (eventSystem && eventWithPending.pendingDayAdvancement !== undefined) {
                // 确认天数推进（在AI完成回复后）
                if (eventSystem.confirmDayAdvancement) {
                  eventSystem.confirmDayAdvancement(eventWithPending.pendingDayAdvancement);
                }
              }

              if (eventSystem && eventSystem.saveStateToChatVars) {
                // 先保存当前状态
                eventSystem.saveStateToChatVars();
                // 然后将当前状态复制为快照（用于回退）
                // 注意：这里保存的快照是"回复结束时的状态"，用于后续可能的打断回退
                if (eventSystem.saveEventInterruptSnapshot) {
                  eventSystem.saveEventInterruptSnapshot();
                }
                console.debug('[核心系统] 已保存AI回复结束时的状态快照');

                // 调试日志已禁用以避免 CORS 错误
              }
            } catch (error) {
              console.warn('[核心系统] 保存AI回复结束时状态快照失败:', error);
            }
          });

          // 监听生成停止事件（用户手动停止）
          const generationStoppedHandler = eventOnce(tavern_events.GENERATION_STOPPED, () => {
            // 检查事件消息是否还存在，如果不存在或被删除，可能需要回退
            try {
              const messages = getChatMessages(eventMessageId, { role: 'user' });
              if (!messages || messages.length === 0) {
                // 事件消息已被删除，可能是用户打断了生成并删除了消息
                // 回退到事件打断时的状态
                const eventSystem = DS_EVENT.getModule('eventSystem') as {
                  rollbackToInterruptSnapshot?: () => boolean;
                };
                if (eventSystem && eventSystem.rollbackToInterruptSnapshot) {
                  const rollbackSuccess = eventSystem.rollbackToInterruptSnapshot();
                  if (rollbackSuccess) {
                    console.info(`[核心系统] ✓ 检测到事件消息被删除，已回退到事件打断时的状态`);
                    // 调试日志已禁用以避免 CORS 错误
                  }
                }
              }
            } catch (error) {
              console.warn('[核心系统] 检查事件消息状态失败:', error);
            }

            waitingForEventResponse = false;
            generationEndHandler.stop();
          });

          // 超时保护：如果30秒后AI仍未响应，清除标志
          setTimeout(() => {
            if (waitingForEventResponse) {
              waitingForEventResponse = false;
              generationStoppedHandler.stop();
              console.warn(`[核心系统] ⚠ 事件响应等待超时（30秒），清除等待标志: ${eventName}`);
            }
          }, 30000);

          // 调试日志已禁用以避免 CORS 错误
        } catch (error) {
          console.error(`[核心系统] ✗ 触发AI生成失败:`, error);

          // 调试日志已禁用以避免 CORS 错误
        }
      } catch (error) {
        console.error('[核心系统] 处理事件触发AI生成失败:', error);
      }
    });

    console.info('[核心系统] 已注册事件触发AI生成监听');
  }
});

console.info('[核心系统] 脚本加载完成');
console.info('[核心系统] ✨ 实时监听测试 - 修改时间: ' + new Date().toLocaleTimeString());

// 详细检查系统状态（用于调试初始化问题）
const systemCheck = {
  exists: typeof window.detentionSystem !== 'undefined',
  type: typeof window.detentionSystem,
  value: window.detentionSystem ? 'object' : 'undefined',
  hasPing: window.detentionSystem && typeof (window.detentionSystem as DetentionSystem).ping === 'function',
  pingResult:
    window.detentionSystem && typeof (window.detentionSystem as DetentionSystem).ping === 'function'
      ? (window.detentionSystem as DetentionSystem).ping()
      : 'N/A',
  hasInitializeState:
    window.detentionSystem &&
    typeof (window.detentionSystem as DetentionSystem & { initializeState?: unknown }).initializeState === 'function',
  hasModules: window.detentionSystem && 'modules' in (window.detentionSystem as DetentionSystem),
  modulesCount:
    window.detentionSystem && 'modules' in (window.detentionSystem as DetentionSystem)
      ? Object.keys((window.detentionSystem as DetentionSystem).modules).length
      : 0,
  isIframe: window.parent !== window,
  hasParent: !!window.parent,
  parentHasDetentionSystem:
    window.parent && window.parent !== window
      ? typeof (window.parent as typeof window.parent & { detentionSystem?: DetentionSystem }).detentionSystem !==
        'undefined'
      : 'N/A',
  parentHasDS: window.parent && window.parent !== window ? typeof (window.parent as any).DS !== 'undefined' : 'N/A',
};

console.info('[核心系统] 检查 window.detentionSystem:', systemCheck);

// 调试日志已禁用以避免 CORS 错误
