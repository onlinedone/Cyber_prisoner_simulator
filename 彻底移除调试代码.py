# -*- coding: utf-8 -*-
"""
彻底移除所有调试代码，包括注释块中的
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

total_removed = 0

for file_path in files:
    if not os.path.exists(file_path):
        print(f'文件不存在: {file_path}')
        continue
    
    print(f'处理文件: {file_path}')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        file_removed = 0
        
        # 模式1: 移除所有未注释的 fetch 调用（包括 if (isLocalDev) 包裹的）
        # 匹配：try { ... if (isLocalDev) { fetch(...) } } catch {}
        pattern1 = r'(\s+)(try\s*\{[^}]*const isLocalDev[^}]*if \(isLocalDev\) \{\s*fetch\([^}]*\}\)\s*\}\s*\} catch \(e?\) \{[^}]*\})'
        def remove1(match):
            nonlocal file_removed
            file_removed += 1
            return match.group(1) + '// 调试日志已禁用以避免 CORS 错误'
        
        content = re.sub(pattern1, remove1, content, flags=re.MULTILINE | re.DOTALL)
        
        # 模式2: 移除所有未注释的独立 fetch 调用
        pattern2 = r'(\s+)(fetch\(''http://127\.0\.0\.1:7242/ingest/[^']*'',\s*\{[^}]*method:\s*''POST'',[^}]*\}\)\s*\.catch\([^}]*\);)'
        def remove2(match):
            nonlocal file_removed
            file_removed += 1
            return match.group(1) + '// 调试日志已禁用以避免 CORS 错误'
        
        content = re.sub(pattern2, remove2, content, flags=re.MULTILINE | re.DOTALL)
        
        # 模式3: 移除所有注释块中的调试代码（/* ... */）
        # 匹配：// #region agent log ... /* fetch(...) */ ... // #endregion
        pattern3 = r'(\s*)(// #region agent log[^\n]*\n(?:(?://[^\n]*\n)*))(\s*/\*[^*]*\*+(?:[^/*][^*]*\*+)*/\s*)'
        def remove3(match):
            nonlocal file_removed
            file_removed += 1
            return match.group(1) + '// 调试日志已禁用以避免 CORS 错误'
        
        content = re.sub(pattern3, remove3, content, flags=re.MULTILINE | re.DOTALL)
        
        # 模式4: 移除整个 agent log 区域（包括注释块）
        pattern4 = r'(\s*)(// #region agent log[^\n]*\n(?:(?://[^\n]*\n)*)?)(\s*/\*[^*]*\*+(?:[^/*][^*]*\*+)*/\s*)(\s*// #endregion)'
        def remove4(match):
            nonlocal file_removed
            file_removed += 1
            return match.group(1) + '// 调试日志已禁用以避免 CORS 错误'
        
        content = re.sub(pattern4, remove4, content, flags=re.MULTILINE | re.DOTALL)
        
        # 模式5: 直接移除所有包含 fetch('http://127.0.0.1:7242/ingest 的整块代码
        # 使用多行模式，匹配从 fetch 开始到 .catch(() => {}); 结束的整个块
        lines = content.split('\n')
        new_lines = []
        i = 0
        in_fetch_block = False
        fetch_indent = ''
        brace_count = 0
        
        while i < len(lines):
            line = lines[i]
            trimmed = line.strip()
            
            # 检查是否是 fetch 调用的开始（未注释的）
            if 'fetch(' in line and 'http://127.0.0.1:7242/ingest' in line and not line.strip().startswith('//') and not line.strip().startswith('/*'):
                # 检查是否在注释块中
                if i > 0:
                    prev_context = '\n'.join(lines[max(0, i-3):i])
                    if '/*' in prev_context and '*/' not in prev_context:
                        # 在注释块中，跳过
                        new_lines.append(line)
                        i += 1
                        continue
                
                # 开始新的 fetch 块
                in_fetch_block = True
                fetch_indent = line[:len(line) - len(line.lstrip())]
                brace_count = line.count('{') - line.count('}')
                file_removed += 1
                
                # 跳过这一行
                i += 1
                continue
            
            # 如果在 fetch 块中，继续处理
            if in_fetch_block:
                brace_count += line.count('{') - line.count('}')
                
                # 检查是否是结束
                if '.catch(() => {});' in line or '.catch(() => {});' in trimmed:
                    # 找到结束
                    if brace_count <= 0:
                        in_fetch_block = False
                        brace_count = 0
                        # 添加注释说明
                        new_lines.append(fetch_indent + '// 调试日志已禁用以避免 CORS 错误')
                i += 1
                continue
            
            new_lines.append(line)
            i += 1
        
        content = '\n'.join(new_lines)
        
        if content != original_content:
            # 备份
            backup_path = file_path + '.backup2'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f'  已备份到: {backup_path}')
            
            # 保存
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'  OK: 已移除 {file_removed} 处调试代码')
            total_removed += file_removed
        else:
            print(f'  无需修复')
            
    except Exception as e:
        print(f'  错误: {str(e)}')

print(f'\n完成！共移除 {total_removed} 处调试代码')
