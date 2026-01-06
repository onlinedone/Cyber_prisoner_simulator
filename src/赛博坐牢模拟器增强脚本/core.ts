export { };

type JQueryStaticLike = typeof globalThis extends { $: infer T } ? T : (selector: any) => any;
declare const $: JQueryStaticLike;

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
    }
  };
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

function bootstrapDetentionSystem(): DetentionSystem {
  const events = new EventEmitter();
  const CacheManager = createCacheManager();

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
      healthCheckTimeout: 3000
    },
    state: {
      mode: 'detecting',
      tokenUsed: 0,
      lastHealthCheck: 0,
      errors: []
    },
    events,
    CacheManager,
    EventEmitter,

    ping() {
      system.state.lastHealthCheck = Date.now();
      return true;
    },

    checkTokenBudget() {
      const total = system.state.mode === 'external'
        ? system.config.tokenBudget
        : system.config.fallbackBudget;
      const used = system.state.tokenUsed;
      const percentage = (used / total) * 100;

      const status: BudgetStatus =
        percentage > 95 ? 'critical' : percentage > 85 ? 'warning' : 'normal';

      return {
        used,
        total,
        percentage: percentage.toFixed(2),
        remaining: total - used,
        status
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
        compressed = compressed
          .replace(/，/g, ',')
          .replace(/。/g, '.')
          .replace(/；/g, ';')
          .replace(/：/g, ':');
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
        stack: normalized.stack
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
        hasDataTable: false
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
    }
  };

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

$(() => {
  console.info('[核心系统] 酒馆页面已加载');
  const system = window.detentionSystem ?? bootstrapDetentionSystem();
  window.detentionSystem = system;

  ensureCacheCleanup(system);

  setTimeout(() => {
    try {
      system.initialize();
    } catch (error) {
      system.handleError(error, 'initialize');
    }
  }, 1000);
});

$(window).on('pagehide', () => {
  stopCacheCleanup();
});

console.info('[核心系统] 脚本加载完成');
