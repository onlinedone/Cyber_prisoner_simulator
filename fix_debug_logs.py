#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量注释掉所有调试日志代码
将所有 fetch('http://127.0.0.1:7242/ingest/... 调用注释掉
"""

import re
import os

files = [
    'src/赛博坐牢模拟器增强脚本/脚本/core.ts',
    'src/赛博坐牢模拟器增强脚本/脚本/event_system.ts',
    'src/赛博坐牢模拟器增强脚本/脚本/npc_system.ts',
    'src/赛博坐牢模拟器增强脚本/脚本/worldbook_loader.ts',
    'src/赛博坐牢模拟器增强脚本/脚本/status_panel.ts',
    'src/赛博坐牢模拟器增强脚本/脚本/index.ts'
]

total_fixed = 0

def comment_fetch_block(content):
    """注释掉所有的 fetch 调用块"""
    fixed_count = 0
    
    # 模式1: 匹配已经被 if (isLocalDev) 包裹的整个 try-catch 块
    # 将整个块注释掉
    pattern1 = r'(\s+)(try\s*\{[^\}]*const isLocalDev[^\}]*if \(isLocalDev\) \{\s*)(fetch\(\'http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66\',\s*\{[^}]*method:\s*\'POST\',\s*headers:\s*\{[^}]*\},\s*body:\s*JSON\.stringify\(\{[^}]*\}\)[^}]*\}\)\s*\.catch\(\(\) => \{\}\);\s*\})\s*\} catch \(e\) \{[^}]*\})'
    
    def replace1(match):
        nonlocal fixed_count
        fixed_count += 1
        indent = match.group(1)
        return f'{indent}// 调试日志已禁用以避免 CORS 错误\n{indent}/* {match.group(0).strip().replace(chr(10), chr(10) + indent + "   ")} */'
    
    content = re.sub(pattern1, replace1, content, flags=re.MULTILINE | re.DOTALL)
    
    # 模式2: 匹配独立的 fetch 调用（在 // #region agent log 和 // #endregion 之间）
    # 使用更精确的匹配，逐行处理
    lines = content.split('\n')
    new_lines = []
    i = 0
    in_fetch_block = False
    fetch_indent = ''
    brace_count = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 检查是否是 fetch 调用的开始
        if re.search(r"fetch\('http://127\.0\.0\.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'", line):
            # 检查是否已经被注释或包裹
            if i > 0:
                prev_lines = '\n'.join(lines[max(0, i-5):i])
                if 'isLocalDev' in prev_lines or '// 调试日志已禁用' in prev_lines or '/*' in prev_lines:
                    new_lines.append(line)
                    i += 1
                    continue
            
            # 开始新的 fetch 块
            in_fetch_block = True
            fetch_indent = re.match(r'^(\s*)', line).group(1)
            brace_count = line.count('{') - line.count('}')
            
            # 添加注释
            new_lines.append(fetch_indent + '// 调试日志已禁用以避免 CORS 错误')
            new_lines.append(fetch_indent + '/* ' + line.strip())
            fixed_count += 1
            i += 1
            continue
        
        # 如果在 fetch 块中，继续处理
        if in_fetch_block:
            brace_count += line.count('{') - line.count('}')
            new_lines.append('   ' + line)
            
            # 检查是否是 fetch 块的结束
            if '.catch(() => {});' in line and brace_count <= 0:
                # 找到结束，添加注释结束
                if new_lines and new_lines[-1].strip():
                    last_line = new_lines.pop()
                    new_lines.append(last_line.replace('   ', '   ', 1) + ' */')
                in_fetch_block = False
                brace_count = 0
            i += 1
        else:
            new_lines.append(line)
            i += 1
    
    content = '\n'.join(new_lines)
    
    return content, fixed_count

for file_path in files:
    if not os.path.exists(file_path):
        print(f'文件不存在: {file_path}')
        continue
    
    print(f'处理文件: {file_path}')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        new_content, file_fixed = comment_fetch_block(content)
        
        if new_content != original_content and file_fixed > 0:
            # 备份原文件
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f'  已备份到: {backup_path}')
            
            # 保存修复后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'  ✓ 已注释 {file_fixed} 处调试日志代码')
            total_fixed += file_fixed
        else:
            print(f'  无需修复（可能已经修复过）')
    except Exception as e:
        print(f'  ✗ 处理失败: {e}')

print(f'\n修复完成！共注释 {total_fixed} 处调试日志代码')
