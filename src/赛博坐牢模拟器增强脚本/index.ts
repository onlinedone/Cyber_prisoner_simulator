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
console.log('[DEBUG-HYP-A] index.ts:13 - 脚本文件开始加载', {
  timestamp: Date.now(),
  windowExists: typeof window !== 'undefined',
  windowDetentionSystem: typeof window.detentionSystem,
  location: 'index.ts:13',
  hypothesisId: 'A'
});
// #endregion
console.info('[看守所模拟器] 脚本文件已加载，开始执行...');

// 按顺序导入所有模块（必须在顶层）
import './core';
import './status_panel';
import './event_system';
import './npc_system';
import './worldbook_loader';

// #region agent log
console.log('[DEBUG-HYP-A] index.ts:22 - 所有模块导入完成', {
  timestamp: Date.now(),
  windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
  windowDetentionSystemType: typeof window.detentionSystem,
  windowDetentionSystemValue: window.detentionSystem ? 'object' : 'undefined',
  location: 'index.ts:22',
  hypothesisId: 'A'
});
// #endregion
console.info('[看守所模拟器] 所有模块已加载完成');
