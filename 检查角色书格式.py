#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
角色书格式检查工具
检查角色书是否符合 SillyTavern 1.15.0 标准格式
"""

import json
import sys
from typing import Dict, Any, List, Tuple

def check_character_book_format(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    检查角色书格式
    
    Returns:
        (is_valid, errors): (是否有效, 错误列表)
    """
    errors = []
    
    # 1. 检查 character_book 是否存在
    character_book = None
    if "spec" in data and data.get("spec") == "chara_card_v2":
        # V2 格式：character_book 在 data 内
        if "data" not in data:
            errors.append("❌ 缺少 'data' 字段（chara_card_v2 格式）")
            return False, errors
        if "character_book" not in data["data"]:
            errors.append("❌ data 对象中缺少 'character_book' 字段")
            return False, errors
        character_book = data["data"]["character_book"]
    else:
        # 旧格式：character_book 在顶层
        if "character_book" not in data:
            errors.append("❌ 缺少 'character_book' 字段")
            return False, errors
        character_book = data["character_book"]
    
    # 2. 检查 character_book 基本结构
    if not isinstance(character_book, dict):
        errors.append("❌ 'character_book' 必须是对象类型")
        return False, errors
    
    # 3. 检查必需字段
    required_fields = ["name", "entries"]
    for field in required_fields:
        if field not in character_book:
            errors.append(f"❌ character_book 缺少必需字段: '{field}'")
    
    # 4. 检查 entries
    if "entries" not in character_book:
        return False, errors
    
    entries = character_book["entries"]
    if not isinstance(entries, list):
        errors.append("❌ 'entries' 必须是数组类型")
        return False, errors
    
    if len(entries) == 0:
        errors.append("⚠️  'entries' 数组为空（角色书没有条目）")
        return False, errors
    
    # 5. 检查每个条目
    for idx, entry in enumerate(entries):
        entry_errors = check_entry_format(entry, idx)
        errors.extend(entry_errors)
    
    is_valid = len([e for e in errors if e.startswith("❌")]) == 0
    return is_valid, errors

def check_entry_format(entry: Dict[str, Any], index: int) -> List[str]:
    """
    检查单个条目的格式
    """
    errors = []
    prefix = f"条目 {index}"
    
    # 必需字段
    required_fields = ["uid", "name", "enabled", "strategy", "position", "content", "probability", "recursion", "effect"]
    for field in required_fields:
        if field not in entry:
            errors.append(f"❌ {prefix}: 缺少必需字段 '{field}'")
    
    # 检查 uid
    if "uid" in entry:
        if not isinstance(entry["uid"], int):
            errors.append(f"❌ {prefix}: 'uid' 必须是整数类型")
        elif entry["uid"] != index:
            errors.append(f"⚠️  {prefix}: 'uid' ({entry['uid']}) 与索引 ({index}) 不一致（建议但不强制）")
    
    # 检查 name
    if "name" in entry:
        if not isinstance(entry["name"], str) or len(entry["name"]) == 0:
            errors.append(f"❌ {prefix}: 'name' 必须是非空字符串")
    
    # 检查 enabled
    if "enabled" in entry:
        if not isinstance(entry["enabled"], bool):
            errors.append(f"❌ {prefix}: 'enabled' 必须是布尔类型")
    
    # 检查 strategy
    if "strategy" in entry:
        strategy_errors = check_strategy_format(entry["strategy"], prefix)
        errors.extend(strategy_errors)
    
    # 检查 position
    if "position" in entry:
        position_errors = check_position_format(entry["position"], prefix)
        errors.extend(position_errors)
    
    # 检查 content
    if "content" in entry:
        if not isinstance(entry["content"], str):
            errors.append(f"❌ {prefix}: 'content' 必须是字符串类型")
    
    # 检查 probability
    if "probability" in entry:
        if not isinstance(entry["probability"], (int, float)):
            errors.append(f"❌ {prefix}: 'probability' 必须是数字类型")
        elif entry["probability"] < 0 or entry["probability"] > 100:
            errors.append(f"⚠️  {prefix}: 'probability' 应该在 0-100 之间（当前: {entry['probability']}）")
    
    # 检查 recursion
    if "recursion" in entry:
        recursion_errors = check_recursion_format(entry["recursion"], prefix)
        errors.extend(recursion_errors)
    
    # 检查 effect
    if "effect" in entry:
        effect_errors = check_effect_format(entry["effect"], prefix)
        errors.extend(effect_errors)
    
    return errors

def check_strategy_format(strategy: Dict[str, Any], prefix: str) -> List[str]:
    """检查 strategy 对象格式"""
    errors = []
    
    if not isinstance(strategy, dict):
        errors.append(f"❌ {prefix}: 'strategy' 必须是对象类型")
        return errors
    
    # 检查 type
    if "type" not in strategy:
        errors.append(f"❌ {prefix}: strategy 缺少 'type' 字段")
    elif strategy["type"] not in ["constant", "selective"]:
        errors.append(f"❌ {prefix}: strategy.type 必须是 'constant' 或 'selective'（当前: {strategy['type']}）")
    
    # 检查 keys
    if "keys" not in strategy:
        errors.append(f"❌ {prefix}: strategy 缺少 'keys' 字段")
    elif not isinstance(strategy["keys"], list):
        errors.append(f"❌ {prefix}: strategy.keys 必须是数组类型")
    
    # 检查 keys_secondary
    if "keys_secondary" not in strategy:
        errors.append(f"❌ {prefix}: strategy 缺少 'keys_secondary' 字段")
    elif not isinstance(strategy["keys_secondary"], dict):
        errors.append(f"❌ {prefix}: strategy.keys_secondary 必须是对象类型")
    else:
        if "logic" not in strategy["keys_secondary"]:
            errors.append(f"❌ {prefix}: strategy.keys_secondary 缺少 'logic' 字段")
        elif strategy["keys_secondary"]["logic"] not in ["and", "or", "and_any", "or_any"]:
            errors.append(f"⚠️  {prefix}: strategy.keys_secondary.logic 应该是 'and', 'or', 'and_any', 'or_any' 之一")
        if "keys" not in strategy["keys_secondary"]:
            errors.append(f"❌ {prefix}: strategy.keys_secondary 缺少 'keys' 字段")
        elif not isinstance(strategy["keys_secondary"]["keys"], list):
            errors.append(f"❌ {prefix}: strategy.keys_secondary.keys 必须是数组类型")
    
    # 检查 scan_depth
    if "scan_depth" not in strategy:
        errors.append(f"❌ {prefix}: strategy 缺少 'scan_depth' 字段")
    elif strategy["scan_depth"] != "same_as_global" and not isinstance(strategy["scan_depth"], int):
        errors.append(f"❌ {prefix}: strategy.scan_depth 必须是 'same_as_global' 或整数")
    
    return errors

def check_position_format(position: Dict[str, Any], prefix: str) -> List[str]:
    """检查 position 对象格式"""
    errors = []
    
    if not isinstance(position, dict):
        errors.append(f"❌ {prefix}: 'position' 必须是对象类型")
        return errors
    
    # 检查 type
    valid_types = [
        "before_character_definition",
        "after_character_definition",
        "before_example_messages",
        "after_example_messages",
        "before_author_note",
        "after_author_note",
        "at_depth"
    ]
    
    if "type" not in position:
        errors.append(f"❌ {prefix}: position 缺少 'type' 字段")
    elif position["type"] not in valid_types:
        errors.append(f"❌ {prefix}: position.type 必须是以下之一: {', '.join(valid_types)}（当前: {position['type']}）")
    
    # 检查 order
    if "order" not in position:
        errors.append(f"❌ {prefix}: position 缺少 'order' 字段")
    elif not isinstance(position["order"], int):
        errors.append(f"❌ {prefix}: position.order 必须是整数类型")
    
    # 如果 type 是 at_depth，需要 role 和 depth
    if position.get("type") == "at_depth":
        if "role" not in position:
            errors.append(f"❌ {prefix}: position.type 为 'at_depth' 时，必须包含 'role' 字段")
        elif position["role"] not in ["system", "assistant", "user"]:
            errors.append(f"❌ {prefix}: position.role 必须是 'system', 'assistant', 'user' 之一")
        if "depth" not in position:
            errors.append(f"❌ {prefix}: position.type 为 'at_depth' 时，必须包含 'depth' 字段")
        elif not isinstance(position["depth"], int):
            errors.append(f"❌ {prefix}: position.depth 必须是整数类型")
    else:
        # 如果 type 不是 at_depth，不应该有 role 和 depth
        if "role" in position:
            errors.append(f"⚠️  {prefix}: position.type 不是 'at_depth' 时，不应该包含 'role' 字段（可能导致解析错误）")
        if "depth" in position:
            errors.append(f"⚠️  {prefix}: position.type 不是 'at_depth' 时，不应该包含 'depth' 字段（可能导致解析错误）")
    
    return errors

def check_recursion_format(recursion: Dict[str, Any], prefix: str) -> List[str]:
    """检查 recursion 对象格式"""
    errors = []
    
    if not isinstance(recursion, dict):
        errors.append(f"❌ {prefix}: 'recursion' 必须是对象类型")
        return errors
    
    required_fields = ["prevent_incoming", "prevent_outgoing", "delay_until"]
    for field in required_fields:
        if field not in recursion:
            errors.append(f"❌ {prefix}: recursion 缺少字段 '{field}'")
        elif field == "delay_until":
            if recursion[field] is not None and not isinstance(recursion[field], int):
                errors.append(f"❌ {prefix}: recursion.delay_until 必须是 null 或整数")
        else:
            if not isinstance(recursion[field], bool):
                errors.append(f"❌ {prefix}: recursion.{field} 必须是布尔类型")
    
    return errors

def check_effect_format(effect: Dict[str, Any], prefix: str) -> List[str]:
    """检查 effect 对象格式"""
    errors = []
    
    if not isinstance(effect, dict):
        errors.append(f"❌ {prefix}: 'effect' 必须是对象类型")
        return errors
    
    required_fields = ["sticky", "cooldown", "delay"]
    for field in required_fields:
        if field not in effect:
            errors.append(f"❌ {prefix}: effect 缺少字段 '{field}'")
        elif effect[field] is not None and not isinstance(effect[field], int):
            errors.append(f"❌ {prefix}: effect.{field} 必须是 null 或整数")
    
    return errors

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python 检查角色书格式.py <角色卡JSON文件>")
        print("\n示例:")
        print("  python 检查角色书格式.py character_card.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ 错误: 文件不存在: {input_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ 错误: JSON 格式错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 错误: 读取文件失败: {e}")
        sys.exit(1)
    
    print(f"正在检查角色书格式: {input_file}\n")
    
    is_valid, errors = check_character_book_format(data)
    
    if is_valid:
        print("✅ 角色书格式检查通过！")
    else:
        print("❌ 角色书格式检查失败，发现以下问题：\n")
        for error in errors:
            print(f"  {error}")
    
    # 统计
    critical_errors = [e for e in errors if e.startswith("❌")]
    warnings = [e for e in errors if e.startswith("⚠️")]
    
    print(f"\n统计:")
    print(f"  - 严重错误: {len(critical_errors)} 个")
    print(f"  - 警告: {len(warnings)} 个")
    print(f"  - 总计: {len(errors)} 个问题")
    
    if len(critical_errors) > 0:
        print("\n⚠️  请修复所有严重错误后重试")
        sys.exit(1)
    elif len(warnings) > 0:
        print("\n💡 建议修复警告以提高兼容性")
    else:
        print("\n🎉 格式完全正确！")

if __name__ == "__main__":
    main()
