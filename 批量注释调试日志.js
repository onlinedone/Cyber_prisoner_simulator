// 批量注释掉所有调试日志代码
const fs = require('fs');
const path = require('path');

const files = [
  'src/赛博坐牢模拟器增强脚本/脚本/core.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/event_system.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/npc_system.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/worldbook_loader.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/status_panel.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/index.ts'
];

let totalFixed = 0;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  console.log(`处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixed = 0;

  // 模式1: 匹配已经被 if (isLocalDev) 包裹的 fetch 调用
  // 注释掉整个 try { ... if (isLocalDev) { fetch(...) } } catch {} 块
  const pattern1 = /(\s+)(try\s*\{[^}]*const isLocalDev[^}]*if \(isLocalDev\) \{\s*)(fetch\('http:\/\/127\.0\.0\.1:7242\/ingest\/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{[^}]*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);\s*\})\s*\} catch \(e\) \{[^}]*\})/g;
  
  content = content.replace(pattern1, (match, indent, tryPart, fetchPart) => {
    fileFixed++;
    return indent + '// 调试日志已禁用以避免 CORS 错误\n' + 
           indent + '/* ' + match.trimStart().replace(/\n/g, '\n' + indent + '   ') + ' */';
  });

  // 模式2: 匹配独立的 fetch 调用（没有被 if (isLocalDev) 包裹的）
  // 匹配：// #region agent log ... fetch(...) ... // #endregion
  const pattern2 = /(\/\/ #region agent log\s*\n(?:\s*\/\/[^\n]*\n)*?)(\s*)(fetch\('http:\/\/127\.0\.0\.1:7242\/ingest\/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{[^}]*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);\s*)(\/\/ #endregion)/g;
  
  content = content.replace(pattern2, (match, regionComment, indent, fetchCall, endComment) => {
    // 检查是否已经被注释
    if (match.includes('/*') || match.includes('// 调试日志已禁用')) {
      return match;
    }
    fileFixed++;
    return regionComment + indent + '// 调试日志已禁用以避免 CORS 错误\n' + 
           indent + '/* ' + fetchCall.trim() + ' */\n' + 
           indent + endComment;
  });

  // 模式3: 匹配单独的 fetch 调用（前面可能有 try 但没有 isLocalDev 检测）
  const pattern3 = /(^\s*)(fetch\('http:\/\/127\.0\.0\.1:7242\/ingest\/55a7313b-5b61-43ef-bdc3-1a322b93db66',\s*\{[^}]*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);)/gm;
  
  content = content.replace(pattern3, (match, indent, fetchCall) => {
    // 检查前面是否有 isLocalDev 检测（不在同一个替换中）
    const lines = content.split('\n');
    const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
    const prevLines = lines.slice(Math.max(0, lineIndex - 10), lineIndex);
    const hasIsLocalDev = prevLines.some(line => line.includes('isLocalDev'));
    
    if (hasIsLocalDev) {
      return match; // 已经被包裹，跳过
    }
    
    // 检查是否已经被注释
    if (match.includes('/*') || match.includes('// 调试日志已禁用')) {
      return match;
    }
    
    fileFixed++;
    return indent + '// 调试日志已禁用以避免 CORS 错误\n' + 
           indent + '/* ' + fetchCall.trim() + ' */';
  });

  if (content !== originalContent && fileFixed > 0) {
    // 备份原文件
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  已备份到: ${backupPath}`);

    // 保存修复后的文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ 已注释 ${fileFixed} 处调试日志代码`);
    totalFixed += fileFixed;
  } else {
    console.log(`  无需修复或修复失败`);
  }
});

console.log(`\n修复完成！共注释 ${totalFixed} 处调试日志代码`);
