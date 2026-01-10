// 批量注释掉所有调试日志代码
import fs from 'node:fs';

const files = [
  'src/赛博坐牢模拟器增强脚本/脚本/core.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/event_system.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/npc_system.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/worldbook_loader.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/status_panel.ts',
  'src/赛博坐牢模拟器增强脚本/脚本/index.ts'
];

let totalFixed = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    continue;
  }

  console.log(`处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixed = 0;

  // 使用正则表达式匹配所有 fetch 调用并注释掉
  // 匹配从 fetch('http://127.0.0.1:7242/ingest/... 到 .catch(() => {}); 的完整块
  
  // 模式1: 匹配独立的 fetch 调用（没有被 try-catch 或 if 包裹）
  const lines = content.split('\n');
  const newLines: string[] = [];
  let inFetchBlock = false;
  let braceCount = 0;
  let fetchIndent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 检查是否是 fetch 调用的开始
    if (trimmedLine.startsWith("fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'")) {
      // 检查前面是否有 isLocalDev 或已经被注释
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (prevLine.includes('isLocalDev') || prevLine.includes('// 调试日志已禁用') || prevLine.includes('/*')) {
        // 已经被处理过，跳过
        newLines.push(line);
        continue;
      }

      // 开始新的 fetch 块
      inFetchBlock = true;
      fetchBlockStart = i;
      fetchIndent = line.match(/^(\s*)/)?.[1] || '';
      braceCount = (line.match(/\{/g) || []).length;
      
      // 添加注释
      newLines.push(fetchIndent + '// 调试日志已禁用以避免 CORS 错误');
      newLines.push(fetchIndent + '/* ' + trimmedLine);
      fileFixed++;
      continue;
    }

    // 如果在 fetch 块中，继续处理
    if (inFetchBlock) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      newLines.push('   ' + line);
      
      // 检查是否是 fetch 块的结束
      if (trimmedLine.includes('.catch(() => {});') && braceCount <= 0) {
        // 找到结束，添加注释结束
        const lastLine = newLines.pop();
        if (lastLine) {
          newLines.push(lastLine.replace(/^   /, '   ') + ' */');
        }
        inFetchBlock = false;
        braceCount = 0;
      }
    } else {
      newLines.push(line);
    }
  }

  const newContent = newLines.join('\n');

  if (newContent !== originalContent && fileFixed > 0) {
    // 备份原文件
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  已备份到: ${backupPath}`);

    // 保存修复后的文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✓ 已注释 ${fileFixed} 处调试日志代码`);
    totalFixed += fileFixed;
  } else {
    console.log(`  无需修复（可能已经修复过）`);
  }
}

console.log(`\n修复完成！共注释 ${totalFixed} 处调试日志代码`);
