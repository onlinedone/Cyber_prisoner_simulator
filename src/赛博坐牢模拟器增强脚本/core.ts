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
  // #region agent log
  console.log('[DEBUG-HYP-D] core.ts:172 - bootstrapDetentionSystem 函数开始执行', {
    timestamp: Date.now(),
    location: 'core.ts:172',
    hypothesisId: 'D',
  });
  // #endregion

  const events = new EventEmitter();
  const CacheManager = createCacheManager();

  // #region agent log
  console.log('[DEBUG-HYP-D] core.ts:175 - EventEmitter 和 CacheManager 已创建', {
    timestamp: Date.now(),
    eventsType: typeof events,
    cacheManagerType: typeof CacheManager,
    location: 'core.ts:175',
    hypothesisId: 'D',
  });
  // #endregion

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
  };

  // #region agent log
  console.log('[DEBUG-HYP-D] core.ts:365 - bootstrapDetentionSystem 准备返回 system 对象', {
    timestamp: Date.now(),
    systemType: typeof system,
    systemExists: !!system,
    hasVersion: 'version' in system,
    hasModules: 'modules' in system,
    hasEvents: 'events' in system,
    systemVersion: system.version,
    location: 'core.ts:365',
    hypothesisId: 'D',
  });
  // #endregion

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

// #region agent log
console.log('[DEBUG-HYP-B] core.ts:363 - 准备创建核心系统', {
  timestamp: Date.now(),
  windowExists: typeof window !== 'undefined',
  windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
  location: 'core.ts:363',
  hypothesisId: 'B',
});
// #endregion

// 立即创建核心系统，让其他模块可以立即访问
if (!window.detentionSystem) {
  // #region agent log
  console.log('[DEBUG-HYP-D] core.ts:365 - 开始调用 bootstrapDetentionSystem', {
    timestamp: Date.now(),
    location: 'core.ts:365',
    hypothesisId: 'D',
  });
  // #endregion

  try {
    window.detentionSystem = bootstrapDetentionSystem();

    // #region agent log
    console.log('[DEBUG-HYP-D] core.ts:365 - bootstrapDetentionSystem 执行完成', {
      timestamp: Date.now(),
      resultType: typeof window.detentionSystem,
      resultExists: !!window.detentionSystem,
      hasVersion: !!(window.detentionSystem && 'version' in window.detentionSystem),
      location: 'core.ts:365',
      hypothesisId: 'D',
    });
    // #endregion

    console.info('[核心系统] 核心系统对象已创建（脚本加载时）');
    console.info('[核心系统] window.detentionSystem 类型:', typeof window.detentionSystem);
    console.info('[核心系统] window.detentionSystem 值:', window.detentionSystem);
  } catch (error) {
    // #region agent log
    console.error('[DEBUG-HYP-D] core.ts:365 - bootstrapDetentionSystem 执行失败', {
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      location: 'core.ts:365',
      hypothesisId: 'D',
    });
    // #endregion
    throw error;
  }
} else {
  // #region agent log
  console.log('[DEBUG-HYP-E] core.ts:364 - window.detentionSystem 已存在，跳过创建', {
    timestamp: Date.now(),
    existingType: typeof window.detentionSystem,
    location: 'core.ts:364',
    hypothesisId: 'E',
  });
  // #endregion
}

// #region agent log
console.log('[DEBUG-HYP-F] core.ts:371 - 检查 jQuery 是否可用', {
  timestamp: Date.now(),
  jQueryExists: typeof $ !== 'undefined',
  jQueryType: typeof $,
  location: 'core.ts:371',
  hypothesisId: 'F',
});
// #endregion

$(() => {
  // #region agent log
  console.log('[DEBUG-HYP-F] core.ts:371 - jQuery ready 回调执行', {
    timestamp: Date.now(),
    windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
    location: 'core.ts:371',
    hypothesisId: 'F',
  });
  // #endregion

  console.info('[核心系统] 酒馆页面已加载（jQuery ready）');

  // 确保核心系统存在（双重保险）
  if (!window.detentionSystem) {
    // #region agent log
    console.warn('[DEBUG-HYP-E] core.ts:375 - 在 jQuery ready 时未找到核心系统，重新创建', {
      timestamp: Date.now(),
      location: 'core.ts:375',
      hypothesisId: 'E',
    });
    // #endregion

    console.warn('[核心系统] 警告：在 jQuery ready 时未找到核心系统，重新创建');
    window.detentionSystem = bootstrapDetentionSystem();
    console.info('[核心系统] 核心系统对象已创建（jQuery ready 时）');
  } else {
    // #region agent log
    console.log('[DEBUG-HYP-E] core.ts:375 - jQuery ready 时核心系统已存在', {
      timestamp: Date.now(),
      systemType: typeof window.detentionSystem,
      systemVersion: window.detentionSystem?.version,
      location: 'core.ts:375',
      hypothesisId: 'E',
    });
    // #endregion
  }

  const system = window.detentionSystem!;
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
    } catch (error) {
      console.error('[核心系统] initialize() 调用出错:', error);
      system.handleError(error, 'initialize');
    }
  }, 1000);
});

$(window).on('pagehide', () => {
  stopCacheCleanup();
});

console.info('[核心系统] 脚本加载完成');
console.info('[核心系统] 检查 window.detentionSystem:', {
  exists: typeof window.detentionSystem !== 'undefined',
  type: typeof window.detentionSystem,
  value: window.detentionSystem ? 'object' : 'undefined',
});
console.info('[核心系统] 检查 window.detentionSystem:', {
  exists: typeof window.detentionSystem !== 'undefined',
  type: typeof window.detentionSystem,
  value: window.detentionSystem ? 'object' : 'undefined',
});
