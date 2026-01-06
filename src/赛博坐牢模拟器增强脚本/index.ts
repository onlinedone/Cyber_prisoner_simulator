/**
 * 看守所模拟器 - 完整系统整合
 * 整合核心系统、状态栏系统、事件系统、NPC系统、知识库加载器
 *
 * 加载顺序：
 * 1. 核心系统 (core.ts) - 提供基础功能和模块管理
 * 2. 状态栏系统 (status_panel.ts) - 状态追踪、HTML注释解析、缓慢变化机制
 * 3. 事件系统 (event_system.ts) - 按日推进、法律流程、随机事件
 * 4. NPC系统 (npc_system.ts) - NPC生成和管理
 * 5. 知识库加载器 (worldbook_loader.ts) - 动态加载知识库
 */

// #region agent log
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'index.ts:20',
    message: '脚本开始执行 - index.ts 顶层代码',
    data: {
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      windowDetentionSystem: typeof window !== 'undefined' && typeof (window as any).detentionSystem !== 'undefined',
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  }),
}).catch(() => {});
// #endregion

console.info('[看守所模拟器] 脚本文件已加载，开始执行...');

// 按顺序导入所有模块（必须在顶层）
import './core';
// #region agent log
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'index.ts:35',
    message: 'core.ts 导入完成',
    data: {
      timestamp: Date.now(),
      windowDetentionSystem: typeof window !== 'undefined' && typeof (window as any).detentionSystem !== 'undefined',
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  }),
}).catch(() => {});
// #endregion

import './status_panel';
import './event_system';
import './npc_system';
import './worldbook_loader';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: 'index.ts:55',
    message: '所有模块导入完成',
    data: {
      timestamp: Date.now(),
      windowDetentionSystem: typeof window !== 'undefined' && typeof (window as any).detentionSystem !== 'undefined',
      windowDetentionSystemType:
        typeof window !== 'undefined' ? typeof (window as any).detentionSystem : 'window undefined',
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'A',
  }),
}).catch(() => {});
// #endregion

console.info('[看守所模拟器] 所有模块已加载完成');
