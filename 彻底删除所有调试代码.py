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
        
        # 模式1: 删除所有包含 fetch 的注释块 /* ... */
        # 使用多行模式匹配完整的注释块
        def remove_comment_blocks(text):
            lines = text.split('\n')
            new_lines = []
            i = 0
            removed = 0
            
            while i < len(lines):
                line = lines[i]
                
                # 检查是否是 agent log 区域开始
                if '// #region agent log' in line or '#region agent log' in line:
                    indent = len(line) - len(line.lstrip())
                    region_start = i
                    i += 1
                    in_comment = False
                    comment_start = -1
                    
                    # 跳过整个区域直到 #endregion
                    while i < len(lines):
                        current_line = lines[i]
                        
                        # 检查是否进入注释块
                        if '/*' in current_line:
                            in_comment = True
                            comment_start = i
                        
                        # 检查注释块是否包含 fetch 调用
                        if in_comment and 'fetch(' in current_line and 'http://127.0.0.1:7242/ingest' in current_line:
                            # 找到包含 fetch 的注释块，删除整个区域
                            # 继续查找直到找到注释块结束和 #endregion
                            while i < len(lines):
                                if '*/' in lines[i]:
                                    in_comment = False
                                if '// #endregion' in lines[i] or '#endregion' in lines[i]:
                                    removed += 1
                                    new_lines.append(' ' * indent + '// 调试日志已禁用以避免 CORS 错误\n')
                                    i += 1
                                    break
                                i += 1
                            break
                        
                        # 如果只是普通的 agent log 区域（没有 fetch），也删除
                        if '// #endregion' in current_line or '#endregion' in current_line:
                            removed += 1
                            new_lines.append(' ' * indent + '// 调试日志已禁用以避免 CORS 错误\n')
                            i += 1
                            break
                        
                        i += 1
                    continue
                
                new_lines.append(line)
                i += 1
            
            return '\n'.join(new_lines), removed
        
        content, file_removed = remove_comment_blocks(content)
        
        # 模式2: 删除所有未注释的 fetch 调用
        lines = content.split('\n')
        new_lines = []
        i = 0
        in_fetch = False
        fetch_indent = ''
        
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            # 检查是否是未注释的 fetch 调用
            if 'fetch(' in line and 'http://127.0.0.1:7242/ingest' in line:
                if not stripped.startswith('//') and not stripped.startswith('/*'):
                    # 未注释的 fetch，删除
                    fetch_indent = len(line) - len(line.lstrip())
                    in_fetch = True
                    file_removed += 1
                    i += 1
                    brace_count = 0
                    
                    while i < len(lines):
                        current = lines[i]
                        brace_count += current.count('{') - current.count('}')
                        
                        if '.catch(() => {});' in current and brace_count <= 0:
                            new_lines.append(' ' * fetch_indent + '// 调试日志已禁用以避免 CORS 错误\n')
                            in_fetch = False
                            i += 1
                            break
                        i += 1
                        if i >= len(lines):
                            break
                    continue
            
            if not in_fetch:
                new_lines.append(line)
            i += 1
        
        content = '\n'.join(new_lines)
        
        # 模式3: 删除所有包含 127.0.0.1:7242 的注释块（使用正则）
        # 匹配 /* ... */ 注释块中包含 fetch 的
        pattern = r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*fetch\([^}]*127\.0\.0\.1:7242[^}]*\*+(?:[^/*][^*]*\*+)*/'
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            file_removed += len(matches)
            content = re.sub(pattern, '/* 调试日志已删除 */', content, flags=re.DOTALL)
        
        if content != original_content:
            # 备份
            backup_path = file_path + '.backup3'
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
        import traceback
        traceback.print_exc()

print(f'\n完成！共移除 {total_removed} 处调试代码')
