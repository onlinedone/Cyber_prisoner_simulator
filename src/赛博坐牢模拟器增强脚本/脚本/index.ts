/**
 * 看守所模拟器 - 完整系统整合
 * 整合核心系统、状态栏系统、事件系统、NPC系统、知识库加载器
 *
 * 加载顺序：
 * 1. 核心系统 (core.ts) - 提供基础功能和模块管理
 * 2. 状态栏系统 (status_panel.ts) - 状态追踪、HTML注释解析、缓慢变化机制（使用记忆增强插件，由角色卡显示状态栏）
 * 3. 事件系统 (event_system.ts) - 按日推进、法律流程、随机事件
 * 4. NPC系统 (npc_system.ts) - NPC生成和管理
 * 5. 知识库加载器 (worldbook_loader.ts) - 动态加载知识库
 */

// 调试日志已禁用以避免 CORS 错误

// 非常明显的日志，确保能看到
console.info('🔵 [看守所模拟器] 脚本文件开始执行！');
// 创建全局标记，便于检测脚本是否加载
(window as any).__DETENTION_SYSTEM_LOADED__ = true;
(window as any).__DETENTION_SYSTEM_LOADED_TIMESTAMP__ = Date.now();
console.log('[DEBUG-HYP-A] index.ts:13 - 脚本文件开始加载', {
  timestamp: Date.now(),
  windowExists: typeof window !== 'undefined',
  windowDetentionSystem: typeof window.detentionSystem,
  location: 'index.ts:13',
  hypothesisId: 'A',
});
console.info('[看守所模拟器] 脚本文件已加载，开始执行...');
console.info('[看守所模拟器] 如果看到这条消息，说明脚本正在执行！');

// 调试日志已禁用以避免 CORS 错误

// 按顺序导入所有模块（必须在顶层）
import './core';
import './event_system';
import './npc_system';
import './status_panel';
import './worldbook_loader';

// 调试日志已禁用以避免 CORS 错误

console.log('[DEBUG-HYP-A] index.ts:22 - 所有模块导入完成', {
  timestamp: Date.now(),
  windowDetentionSystemExists: typeof window.detentionSystem !== 'undefined',
  windowDetentionSystemType: typeof window.detentionSystem,
  windowDetentionSystemValue: window.detentionSystem ? 'object' : 'undefined',
  location: 'index.ts:22',
  hypothesisId: 'A',
});
console.info('[看守所模拟器] 所有模块已加载完成');
console.log('🔵 [看守所模拟器] 脚本执行完成！');
console.log('🔵 window.detentionSystem:', typeof window.detentionSystem !== 'undefined' ? '✅ 存在' : '❌ 不存在');
