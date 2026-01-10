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
        removed_count = 0
        
        while i < len(lines):
            line = lines[i]
            
            # 检查是否是 agent log 区域开始
            if '// #region agent log' in line or '#region agent log' in line:
                # 找到 agent log 区域，删除整个区域直到 #endregion
                indent = len(line) - len(line.lstrip())
                region_start = i
                i += 1
                
                # 跳过整个区域，直到找到 #endregion
                in_comment_block = False
                brace_count = 0
                
                while i < len(lines):
                    current_line = lines[i]
                    
                    # 检查是否进入注释块
                    if '/*' in current_line and '*/' not in current_line:
                        in_comment_block = True
                    if '*/' in current_line:
                        in_comment_block = False
                    
                    # 检查是否是 #endregion
                    if '// #endregion' in current_line or '#endregion' in current_line:
                        # 找到结束，跳过整个区域
                        removed_count += 1
                        # 添加简单注释
                        new_lines.append(' ' * indent + '// 调试日志已禁用以避免 CORS 错误\n')
                        i += 1
                        break
                    
                    i += 1
                    if i >= len(lines):
                        break
                
                continue
            
            # 检查是否是未注释的 fetch 调用
            if 'fetch(' in line and 'http://127.0.0.1:7242/ingest' in line:
                # 检查是否在注释中
                stripped = line.strip()
                if not stripped.startswith('//') and not stripped.startswith('/*'):
                    # 未注释的 fetch，需要删除
                    indent = len(line) - len(line.lstrip())
                    removed_count += 1
                    # 跳过这一行，继续查找直到 .catch(() => {});
                    i += 1
                    brace_count = 0
                    
                    while i < len(lines):
                        current_line = lines[i]
                        brace_count += current_line.count('{') - current_line.count('}')
                        
                        if '.catch(() => {});' in current_line and brace_count <= 0:
                            i += 1
                            # 添加注释
                            new_lines.append(' ' * indent + '// 调试日志已禁用以避免 CORS 错误\n')
                            break
                        i += 1
                        if i >= len(lines):
                            break
                    
                    continue
            
            new_lines.append(line)
            i += 1
        
        new_content = ''.join(new_lines)
        
        # 保存
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f'  已移除 {removed_count} 处调试代码块')
            
    except Exception as e:
        print(f'  错误: {str(e)}')

print('完成！')
