import json
import os

def extract_chars_from_values(obj, target_keys, chars_set):
    '''
    递归遍历JSON，提取指定键的值中的所有字符并添加到集合（自动去重）
    :param obj: 当前处理的JSON对象（字典或列表）
    :param target_keys: 需要提取值的目标键名列表
    :param chars_set: 用于存储字符的集合（自动去重）
    '''
    if isinstance(obj, dict):
        # 处理字典类型
        for key, value in obj.items():
            # 如果是目标键且值为字符串，提取字符
            if key in target_keys and isinstance(value, str):
                for char in value:
                    chars_set.add(char)
            # 递归处理子元素
            extract_chars_from_values(value, target_keys, chars_set)
    elif isinstance(obj, list):
        # 处理列表类型，递归处理每个元素
        for item in obj:
            extract_chars_from_values(item, target_keys, chars_set)

def process_json_chars(input_path, output_path, target_keys=['cn', 'jp']):
    '''
    处理JSON文件，提取指定键值中的字符并去重后保存
    :param input_path: 输入JSON文件路径
    :param output_path: 输出结果文件路径
    :param target_keys: 需要提取值的键名列表，默认为['cn', 'jp']
    '''
    try:
        # 检查输入文件
        if not os.path.exists(input_path):
            print(f'错误：输入文件不存在 - {input_path}')
            return False

        # 读取JSON文件
        with open(input_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f'JSON解析错误：{str(e)}')
                return False

        # 提取字符并去重（使用集合）
        unique_chars = set()
        extract_chars_from_values(data, target_keys, unique_chars)

        # 转换为列表并按Unicode排序
        sorted_chars = sorted(unique_chars)

        # 保存结果
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(''.join(sorted_chars))

        print(f'处理完成！')
        print(f'提取并去重后的字符总数：{len(sorted_chars)}')
        print(f'结果已保存至：{output_path}')
        return True

    except Exception as e:
        print(f'处理过程中发生错误：{str(e)}')
        return False

if __name__ == '__main__':
    # 配置文件路径
    input_json = 'table_frame.json' # 输入JSON文件路径
    output_txt = 'table_used_characters.txt' # 输出结果文件路径

    # 执行处理
    process_json_chars(input_json, output_txt)
