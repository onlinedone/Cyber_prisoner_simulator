# -*- coding: utf-8 -*-
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

for file_path in files:
    if not os.path.exists(file_path):
        print(f'文件不存在: {file_path}')
        continue
    
    print(f'处理文件: {file_path}')
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        i = 0
        file_fixed = 0
        
        while i < len(lines):
            line = lines[i]
            
            # 检查是否是 fetch 调用的开始
            if "fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66'" in line:
                # 检查前面是否有 isLocalDev 或已经被注释
                if i > 0:
                    prev_context = ''.join(lines[max(0, i-5):i])
                    if 'isLocalDev' in prev_context or '// 调试日志已禁用' in prev_context or '/*' in prev_context or '*/' in prev_context:
                        new_lines.append(line)
                        i += 1
                        continue
                
                # 检查是否已经被注释
                if '/*' in line or '// 调试日志已禁用' in line:
                    new_lines.append(line)
                    i += 1
                    continue
                
                # 找到 fetch 调用，注释掉整个块
                indent = len(line) - len(line.lstrip())
                indent_str = ' ' * indent
                
                # 添加注释开始
                new_lines.append(indent_str + '// 调试日志已禁用以避免 CORS 错误\n')
                new_lines.append(indent_str + '/* ' + line.lstrip())
                file_fixed += 1
                i += 1
                
                # 继续读取直到找到 .catch(() => {}); 或 // #endregion
                brace_count = line.count('{') - line.count('}')
                in_string = False
                string_char = None
                
                while i < len(lines):
                    current_line = lines[i]
                    
                    brace_count += current_line.count('{')
                    brace_count -= current_line.count('}')
                    
                    new_lines.append(current_line)
                    
                    # 检查是否是结束
                    if '.catch(() => {});' in current_line:
                        # 添加注释结束
                        if new_lines and new_lines[-1].endswith('\n'):
                            new_lines[-1] = new_lines[-1].rstrip() + ' */\n'
                        elif new_lines:
                            new_lines[-1] = new_lines[-1] + ' */\n'
                        i += 1
                        break
                    
                    # 如果遇到 // #endregion，也结束
                    if '// #endregion' in current_line and brace_count <= 0:
                        # 在 // #endregion 前添加注释结束
                        if new_lines and new_lines[-1].endswith('\n'):
                            new_lines[-1] = new_lines[-1].rstrip() + ' */\n'
                        elif new_lines:
                            new_lines[-1] = new_lines[-1] + ' */\n'
                        i += 1
                        break
                    
                    i += 1
                    if i >= len(lines):
                        break
                
                if i >= len(lines):
                    break
                continue
            
            new_lines.append(line)
            i += 1
        
        new_content = ''.join(new_lines)
        
        # 检查是否有变化
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        if new_content != original_content and file_fixed > 0:
            # 备份原文件
            backup_path = file_path + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f'  已备份到: {backup_path}')
            
            # 保存修复后的文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'  OK: 已注释 {file_fixed} 处调试日志代码')
            total_fixed += file_fixed
        else:
            print(f'  无需修复（可能已经修复过）')
            
    except Exception as e:
        print(f'  错误: {str(e)}')

print(f'\n修复完成！共注释 {total_fixed} 处调试日志代码')
