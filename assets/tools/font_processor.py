# pip install fonttools brotli

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter
import os

def subset_and_convert_font(original_ttf, output_woff2, needed_chars):
    '''优化的字体处理函数，过滤不必要的字体表以消除警告'''
    try:
        # 验证输入文件
        if not os.path.exists(original_ttf):
            print(f'错误：原始字体文件不存在 - {original_ttf}')
            return False

        # 加载字体
        font = TTFont(original_ttf)

        # 定义需要保留的字体表（排除FFTM等不需要的表）
        # 只保留渲染所需的核心表，减少文件大小并消除警告
        keep_tables = {
            'GDEF', 'GPOS', 'GSUB', 'cmap', 'cvt ', 'fpgm', 'glyf', 'head', 
            'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post', 'prep', 'OS/2'
        }

        # 移除不需要的字体表
        for table in list(font.keys()):
            if table not in keep_tables:
                del font[table]

        # 创建子集器并设置需要保留的字符
        subsetter = Subsetter()
        subsetter.populate(text=needed_chars)
        subsetter.subset(font)

        # 保存为woff2格式
        font.flavor = 'woff2'
        font.save(output_woff2)

        # 计算文件大小变化
        original_size = os.path.getsize(original_ttf)
        new_size = os.path.getsize(output_woff2)
        reduction = (1 - new_size / original_size) * 100

        print(f'字体处理完成: {original_ttf} -> {output_woff2}')
        print(f'文件大小减少: {reduction:.2f}% ({original_size} -> {new_size} 字节)')

        return True

    except Exception as e:
        print(f'字体处理失败: {str(e)}')
        return False

def main():
    # 配置参数
    original_font_path = 'QiushuiShotai.ttf'  # 原始TTF字体路径
    output_font_path = 'QiushuiShotaiLite.woff2'  # 输出WOFF2字体路径

    with open('table_used_characters.txt', 'r', encoding='utf-8') as f:
        needed_chars = f.read()
    all_needed_chars = needed_chars + '●'

    # 处理字体
    success = subset_and_convert_font(original_font_path, output_font_path, all_needed_chars)

    if success:
        print('字体优化完成！')

if __name__ == '__main__':
    main()
