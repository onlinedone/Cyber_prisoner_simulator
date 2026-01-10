#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
角色书格式转换脚本
将旧格式的角色书转换为 Tavern 1.15.0 标准格式

使用方法:
    python convert_character_book.py input.json output.json
"""

import json
import sys
from typing import Dict, Any, List


def safe_input(prompt: str) -> None:
    """
    安全地调用 input()，在非交互式环境中不会报错

    Args:
        prompt: 提示信息
    """
    try:
        input(prompt)
    except (EOFError, KeyboardInterrupt):
        # 在非交互式环境中（如管道、重定向）会抛出 EOFError
        # 这种情况下直接忽略，不暂停
        pass


def convert_position_string_to_object(position_str: str, insertion_order: int) -> Dict[str, Any]:
    """
    将字符串格式的 position 转换为对象格式

    Args:
        position_str: 位置字符串，如 "after_char", "before_char" 等
        insertion_order: 插入顺序

    Returns:
        转换后的 position 对象
    """
    # 位置字符串到标准格式的映射
    position_mapping = {
        "after_char": "after_character_definition",
        "before_char": "before_character_definition",
        "after_example": "after_example_messages",
        "before_example": "before_example_messages",
        "after_author": "after_author_note",
        "before_author": "before_author_note",
    }

    # 转换位置类型
    position_type = position_mapping.get(position_str, "after_character_definition")

    # 构建 position 对象
    position_obj = {
        "type": position_type,
        "order": insertion_order
    }

    # 注意：只有当 type 为 "at_depth" 时才需要 role 和 depth
    # 根据世界书审核报告，如果 type 不是 "at_depth"，不应该包含 role 和 depth
    # 这里不添加 role 和 depth，除非明确需要

    return position_obj


def convert_entry(old_entry: Dict[str, Any], uid: int) -> Dict[str, Any]:
    """
    转换单个条目从旧格式到新格式

    Args:
        old_entry: 旧格式的条目
        uid: 条目的唯一ID

    Returns:
        新格式的条目
    """
    # 确定 strategy type
    is_constant = old_entry.get("constant", False)
    strategy_type = "constant" if is_constant else "selective"

    # 获取 keys（如果存在）
    keys = old_entry.get("keys", [])

    # 构建 strategy 对象
    strategy = {
        "type": strategy_type,
        "keys": keys if isinstance(keys, list) else [],
        "keys_secondary": {
            "logic": "and_any",
            "keys": []
        },
        "scan_depth": "same_as_global"
    }

    # 转换 position
    position_str = old_entry.get("position", "after_char")
    insertion_order = old_entry.get("insertion_order", 100)
    position = convert_position_string_to_object(position_str, insertion_order)

    # 转换 probability（从 priority 转换，如果没有则默认100）
    probability = old_entry.get("priority", 100)

    # 构建新条目
    new_entry = {
        "uid": uid,
        "name": old_entry.get("name", f"条目_{uid}"),
        "enabled": old_entry.get("enabled", True),
        "strategy": strategy,
        "position": position,
        "content": old_entry.get("content", ""),
        "probability": probability,
        "recursion": {
            "prevent_incoming": False,
            "prevent_outgoing": False,
            "delay_until": None
        },
        "effect": {
            "sticky": None,
            "cooldown": None,
            "delay": None
        }
    }

    # 保留 extra 字段（如果存在）
    if "extra" in old_entry:
        new_entry["extra"] = old_entry["extra"]

    return new_entry


def convert_character_book(old_data: Dict[str, Any], verbose: bool = False) -> Dict[str, Any]:
    """
    转换整个角色书

    Args:
        old_data: 旧格式的角色书数据
        verbose: 是否显示详细信息

    Returns:
        新格式的角色书数据
    """
    # 诊断：检查数据结构
    if verbose:
        print("\n[诊断信息]")
        print(f"  - 顶层键: {list(old_data.keys())}")

    # 检测角色卡格式（chara_card_v2 或旧格式）
    is_v2_format = "data" in old_data and "spec" in old_data
    character_book_source = None

    if is_v2_format:
        # chara_card_v2 格式：character_book 在 data 对象内
        if verbose:
            print(f"  - 检测到 chara_card_v2 格式")
            print(f"  - data 键: {list(old_data.get('data', {}).keys())}")

        data = old_data.get("data", {})
        if "character_book" not in data:
            raise ValueError(
                "错误: data 对象中没有找到 'character_book' 字段\n"
                f"  data 键: {list(data.keys())}\n"
                "  请确保角色卡包含 'character_book' 字段"
            )
        character_book = data.get("character_book", {})
        character_book_source = "data"
    else:
        # 旧格式：character_book 在顶层
        if "character_book" not in old_data:
            raise ValueError(
                "错误: 输入文件中没有找到 'character_book' 字段\n"
                f"  顶层键: {list(old_data.keys())}\n"
                "  提示: 如果是 chara_card_v2 格式，character_book 应该在 'data' 对象内\n"
                "  请确保输入文件是角色卡 JSON 格式，包含 'character_book' 字段"
            )
        character_book = old_data.get("character_book", {})
        character_book_source = "top_level"

    if verbose:
        print(f"  - character_book 键: {list(character_book.keys())}")

    # 保留顶层字段（name, description, scan_depth, token_budget, recursive_scanning, extensions）
    new_character_book = {
        "name": character_book.get("name", ""),
        "description": character_book.get("description", ""),
        "scan_depth": character_book.get("scan_depth", 50),
        "token_budget": character_book.get("token_budget", 40000),
        "recursive_scanning": character_book.get("recursive_scanning", False),
        "extensions": character_book.get("extensions", {})
    }

    # 转换 entries
    if "entries" not in character_book:
        raise ValueError(
            "错误: character_book 中没有找到 'entries' 字段\n"
            f"  character_book 键: {list(character_book.keys())}\n"
            "  请确保角色书包含 'entries' 数组"
        )

    old_entries = character_book.get("entries", [])

    if not isinstance(old_entries, list):
        raise ValueError(
            f"错误: 'entries' 不是数组类型\n"
            f"  当前类型: {type(old_entries)}\n"
            "  请确保 'entries' 是一个数组"
        )

    if len(old_entries) == 0:
        raise ValueError(
            "错误: 'entries' 数组为空\n"
            "  请确保角色书包含至少一个条目"
        )

    if verbose:
        print(f"  - 找到 {len(old_entries)} 个条目")
        if len(old_entries) > 0:
            print(f"  - 第一个条目的键: {list(old_entries[0].keys()) if isinstance(old_entries[0], dict) else '不是字典类型'}")

    new_entries = []
    skipped_count = 0

    for idx, old_entry in enumerate(old_entries):
        if not isinstance(old_entry, dict):
            print(f"警告: 条目 {idx} 不是字典类型（类型: {type(old_entry)}），跳过")
            skipped_count += 1
            continue

        if verbose and idx < 3:  # 只显示前3个条目的详细信息
            print(f"  - 转换条目 {idx}: {old_entry.get('name', '未命名')}")

        try:
            new_entry = convert_entry(old_entry, uid=idx)
            new_entries.append(new_entry)
        except Exception as e:
            print(f"警告: 转换条目 {idx} 时出错: {e}")
            skipped_count += 1
            continue

    if skipped_count > 0:
        print(f"\n警告: 跳过了 {skipped_count} 个无效条目")

    if len(new_entries) == 0:
        raise ValueError(
            "错误: 没有成功转换任何条目\n"
            f"  原始条目数: {len(old_entries)}\n"
            f"  跳过条目数: {skipped_count}\n"
            "  请检查条目格式是否正确"
        )

    new_character_book["entries"] = new_entries

    # 构建新的数据结构，保持原有格式
    if is_v2_format:
        # chara_card_v2 格式：保持 spec, spec_version, data 结构
        new_data = {}
        # 保留顶层字段
        for key in old_data:
            if key == "data":
                # 更新 data 对象，替换 character_book
                new_data_obj = old_data["data"].copy()
                new_data_obj["character_book"] = new_character_book
                new_data["data"] = new_data_obj
            else:
                new_data[key] = old_data[key]
    else:
        # 旧格式：character_book 在顶层
        new_data = {
            "character_book": new_character_book
        }
        # 保留其他顶层字段（如果存在）
        for key in old_data:
            if key != "character_book":
                new_data[key] = old_data[key]

    return new_data


def main():
    """主函数"""
    import os

    # 如果通过命令行参数传递，直接使用
    if len(sys.argv) >= 3:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
    elif len(sys.argv) >= 2:
        # 如果只提供了输入文件，自动生成输出文件名
        input_file = sys.argv[1]
        base_name = os.path.basename(input_file)
        name, ext = os.path.splitext(base_name)
        output_file = f"converted_{name}{ext}"
        print("=" * 60)
        print("角色书格式转换工具")
        print("=" * 60)
        print(f"输入文件: {input_file}")
        print(f"输出文件: {output_file} (自动生成)")
        print("=" * 60)
        print()
    else:
        # 交互式输入（仅在交互式环境中）
        print("=" * 60)
        print("角色书格式转换工具")
        print("=" * 60)
        print()

        try:
            input_file = input("请输入输入文件路径: ").strip()
            if not input_file:
                print("错误: 必须提供输入文件路径")
                sys.exit(1)

            output_file = input("请输入输出文件路径 (直接回车使用 'converted_' + 输入文件名): ").strip()
            if not output_file:
                # 自动生成输出文件名
                base_name = os.path.basename(input_file)
                name, ext = os.path.splitext(base_name)
                output_file = f"converted_{name}{ext}"

            print()
        except (EOFError, KeyboardInterrupt):
            print("\n\n操作已取消")
            sys.exit(0)

    try:
        # 读取输入文件
        print(f"正在读取文件: {input_file}")
        with open(input_file, 'r', encoding='utf-8') as f:
            old_data = json.load(f)

        # 快速检查文件结构
        if not isinstance(old_data, dict):
            raise ValueError(f"错误: 输入文件不是有效的 JSON 对象\n  文件类型: {type(old_data)}")

        # 检查是否有 character_book（支持两种格式）
        character_book_found = False
        entries_count = 0

        # 检查 chara_card_v2 格式（character_book 在 data 内）
        if "data" in old_data and isinstance(old_data["data"], dict):
            if "character_book" in old_data["data"]:
                cb = old_data["data"]["character_book"]
                if isinstance(cb, dict) and "entries" in cb:
                    entries = cb["entries"]
                    if isinstance(entries, list):
                        entries_count = len(entries)
                        character_book_found = True
                        print(f"[OK] 文件结构正确（chara_card_v2 格式），找到 {entries_count} 个条目")
                    else:
                        print(f"[警告] entries 不是数组类型（类型: {type(entries)}）")
                else:
                    print(f"[警告] data.character_book 结构异常")

        # 检查旧格式（character_book 在顶层）
        if not character_book_found and "character_book" in old_data:
            cb = old_data["character_book"]
            if isinstance(cb, dict) and "entries" in cb:
                entries = cb["entries"]
                if isinstance(entries, list):
                    entries_count = len(entries)
                    character_book_found = True
                    print(f"[OK] 文件结构正确（旧格式），找到 {entries_count} 个条目")
                else:
                    print(f"[警告] entries 不是数组类型（类型: {type(entries)}）")
            else:
                print(f"[警告] character_book 结构异常")

        if not character_book_found:
            print(f"[警告] 未找到 character_book 字段（已检查顶层和 data 对象）")

        # 转换格式
        print("正在转换格式...")
        new_data = convert_character_book(old_data, verbose=True)

        # 写入输出文件
        print(f"正在写入文件: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)

        # 统计信息
        # 根据格式获取条目数量
        if "data" in new_data and "character_book" in new_data["data"]:
            entry_count = len(new_data["data"]["character_book"]["entries"])
        elif "character_book" in new_data:
            entry_count = len(new_data["character_book"]["entries"])
        else:
            entry_count = 0

        print(f"\n{'=' * 60}")
        print("转换完成！")
        print(f"{'=' * 60}")
        print(f"  - 转换了 {entry_count} 个条目")
        print(f"  - 输出文件: {output_file}")
        print(f"{'=' * 60}")

        # 在Windows上暂停，避免窗口立即关闭
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")

    except FileNotFoundError:
        print(f"\n{'=' * 60}")
        print("错误: 找不到文件")
        print(f"{'=' * 60}")
        print(f"  文件路径: {input_file}")
        print("  请检查文件路径是否正确")
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"\n{'=' * 60}")
        print("错误: JSON 解析失败")
        print(f"{'=' * 60}")
        print(f"  详细信息: {e}")
        print("  请检查输入文件是否为有效的 JSON 格式")
        print("\n提示: 可以使用在线 JSON 验证工具检查文件格式")
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)
    except ValueError as e:
        print(f"\n{'=' * 60}")
        print("错误: 数据格式问题")
        print(f"{'=' * 60}")
        print(str(e))
        print("\n提示:")
        print("  1. 确保输入文件是角色卡 JSON 格式")
        print("  2. 确保包含 'character_book' 字段")
        print("  3. 确保 'character_book.entries' 是数组且不为空")
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)
    except Exception as e:
        print(f"\n{'=' * 60}")
        print("错误: 发生未知错误")
        print(f"{'=' * 60}")
        print(f"  错误信息: {e}")
        print("\n详细错误信息:")
        import traceback
        traceback.print_exc()
        if sys.platform == 'win32':
            safe_input("\n按回车键退出...")
        sys.exit(1)


if __name__ == "__main__":
    main()
