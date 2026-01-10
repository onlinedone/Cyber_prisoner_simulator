#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
角色卡提示词格式化工具
将纯文本转换为可以直接贴入角色卡 system_prompt/post_history_prompt 字段的格式

使用方法:
    python format_prompt_text.py <输入文件> [输出文件] [--field system_prompt|post_history_prompt]
"""

import json
import sys
import os
import argparse
from typing import Optional

# 修复 Windows 控制台编码问题
if sys.platform == 'win32':
    try:
        # 尝试设置控制台编码为 UTF-8
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass


def format_text_for_json(text: str, escape_quotes: bool = True) -> str:
    """
    将文本格式化为 JSON 字符串格式
    
    Args:
        text: 原始文本
        escape_quotes: 是否转义引号（用于 JSON）
        
    Returns:
        格式化后的文本
    """
    if escape_quotes:
        # 转义引号（用于 JSON 字符串）
        text = text.replace('\\', '\\\\')  # 先转义反斜杠
        text = text.replace('"', '\\"')   # 转义双引号
        text = text.replace('\n', '\\n')  # 转义换行符
        text = text.replace('\r', '\\r')  # 转义回车符
        text = text.replace('\t', '\\t')  # 转义制表符
    else:
        # 仅转义换行符（用于直接粘贴）
        text = text.replace('\r\n', '\n')  # 统一换行符
        text = text.replace('\r', '\n')
    
    return text


def format_as_json_string(text: str) -> str:
    """
    将文本格式化为完整的 JSON 字符串（带引号）
    
    Args:
        text: 原始文本
        
    Returns:
        JSON 格式的字符串
    """
    # 使用 json.dumps 自动处理所有转义
    return json.dumps(text, ensure_ascii=False)


def format_as_field_assignment(text: str, field_name: str = "system_prompt") -> str:
    """
    将文本格式化为字段赋值格式
    
    Args:
        text: 原始文本
        field_name: 字段名称
        
    Returns:
        字段赋值格式的字符串
    """
    json_str = format_as_json_string(text)
    return f'"{field_name}": {json_str}'


def format_for_direct_paste(text: str) -> str:
    """
    将文本格式化为可以直接粘贴的格式（保持换行，转义引号）
    
    Args:
        text: 原始文本
        
    Returns:
        可直接粘贴的文本
    """
    # 转义反斜杠和引号，但保持换行符可见
    text = text.replace('\\', '\\\\')
    text = text.replace('"', '\\"')
    return text


def safe_input(prompt: str) -> str:
    """
    安全地调用 input()，在非交互式环境中不会报错
    
    Args:
        prompt: 提示信息
        
    Returns:
        用户输入或空字符串
    """
    try:
        return input(prompt)
    except (EOFError, KeyboardInterrupt):
        return ""


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="将纯文本转换为角色卡提示词格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 格式化 system_prompt
  python format_prompt_text.py input.txt output.json --field system_prompt
  
  # 格式化 post_history_prompt
  python format_prompt_text.py input.txt output.json --field post_history_prompt
  
  # 只提供输入文件，自动生成输出文件名
  python format_prompt_text.py input.txt
  
  # 交互式选择格式
  python format_prompt_text.py input.txt
        """
    )
    
    parser.add_argument('input_file', help='输入文本文件路径')
    parser.add_argument('output_file', nargs='?', help='输出文件路径（可选）')
    parser.add_argument(
        '--field',
        choices=['system_prompt', 'post_history_prompt'],
        default='system_prompt',
        help='目标字段名称（默认: system_prompt）'
    )
    parser.add_argument(
        '--format',
        choices=['json', 'field', 'paste', 'all'],
        default='all',
        help='输出格式（默认: all）'
    )
    parser.add_argument(
        '--encoding',
        default='utf-8',
        help='文件编码（默认: utf-8）'
    )
    
    args = parser.parse_args()
    
    # 确定输出文件
    if args.output_file:
        output_file = args.output_file
    else:
        # 自动生成输出文件名
        base_name = os.path.basename(args.input_file)
        name, ext = os.path.splitext(base_name)
        output_file = f"{name}_formatted{ext}"
    
    try:
        # 读取输入文件
        print(f"正在读取文件: {args.input_file}")
        with open(args.input_file, 'r', encoding=args.encoding) as f:
            text = f.read()
        
        if not text.strip():
            print("警告: 输入文件为空")
            return
        
        print(f"文件大小: {len(text)} 字符")
        print(f"行数: {text.count(chr(10)) + 1}")
        print()
        
        # 根据格式生成输出
        outputs = {}
        
        if args.format in ['json', 'all']:
            json_str = format_as_json_string(text)
            outputs['json'] = json_str
            print("=" * 60)
            print("格式 1: JSON 字符串（可直接用于 JSON 文件）")
            print("=" * 60)
            try:
                print(json_str)
            except UnicodeEncodeError:
                # 如果控制台无法显示，只显示提示
                print(f"[JSON 字符串已生成，共 {len(json_str)} 字符，请查看输出文件]")
            print()
        
        if args.format in ['field', 'all']:
            field_str = format_as_field_assignment(text, args.field)
            outputs['field'] = field_str
            print("=" * 60)
            print(f"格式 2: 字段赋值格式（{args.field}）")
            print("=" * 60)
            print(field_str)
            print()
        
        if args.format in ['paste', 'all']:
            paste_str = format_for_direct_paste(text)
            outputs['paste'] = paste_str
            print("=" * 60)
            print("格式 3: 直接粘贴格式（保持换行，转义引号）")
            print("=" * 60)
            try:
                print(paste_str)
            except UnicodeEncodeError:
                # 如果控制台无法显示，只显示提示
                print(f"[直接粘贴格式已生成，共 {len(paste_str)} 字符，请查看输出文件]")
            print()
        
        # 保存到文件
        if args.format == 'all':
            # 保存所有格式到文件
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write("=" * 60 + "\n")
                f.write("角色卡提示词格式化输出\n")
                f.write("=" * 60 + "\n\n")
                
                f.write("格式 1: JSON 字符串\n")
                f.write("-" * 60 + "\n")
                f.write(outputs['json'])
                f.write("\n\n")
                
                f.write(f"格式 2: 字段赋值格式（{args.field}）\n")
                f.write("-" * 60 + "\n")
                f.write(outputs['field'])
                f.write("\n\n")
                
                f.write("格式 3: 直接粘贴格式\n")
                f.write("-" * 60 + "\n")
                f.write(outputs['paste'])
                f.write("\n")
        else:
            # 只保存选定的格式
            with open(output_file, 'w', encoding='utf-8') as f:
                if args.format == 'json':
                    f.write(outputs['json'])
                elif args.format == 'field':
                    f.write(outputs['field'])
                elif args.format == 'paste':
                    f.write(outputs['paste'])
        
        print("=" * 60)
        print("转换完成！")
        print("=" * 60)
        print(f"  - 输出文件: {output_file}")
        print(f"  - 目标字段: {args.field}")
        print(f"  - 输出格式: {args.format}")
        print("=" * 60)
        
        # 使用提示
        print("\n使用提示:")
        print("1. JSON 字符串格式：可以直接复制到 JSON 文件中")
        print("2. 字段赋值格式：可以直接复制到角色卡 JSON 的对应字段")
        print("3. 直接粘贴格式：适合在编辑器中直接粘贴")
        print()
        
        # 在Windows上暂停
        if sys.platform == 'win32':
            safe_input("按回车键退出...")
        
    except FileNotFoundError:
        print(f"\n错误: 找不到文件 '{args.input_file}'")
        print("请检查文件路径是否正确")
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)
    except UnicodeDecodeError as e:
        print(f"\n错误: 文件编码问题")
        print(f"  详细信息: {e}")
        print(f"  尝试使用 --encoding 参数指定正确的编码")
        print(f"  例如: --encoding gbk 或 --encoding utf-8-sig")
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)


if __name__ == "__main__":
    main()
