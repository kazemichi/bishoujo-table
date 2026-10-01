import sys
sys.path.append('libs')

import os

from fontTools.subset import Subsetter
from fontTools.ttLib import TTFont


def subset_and_convert_font(original_ttf, output_woff2, needed_chars):
    try:
        # 加载字体
        font = TTFont(original_ttf)

        # 修改字族名 nameID=1
        font['name'].setName('ScreenLite', nameID=1, platformID=3, platEncID=1, langID=0x409)
        # 修改全名 nameID=4
        font['name'].setName('ScreenLite Regular', nameID=4, platformID=3, platEncID=1, langID=0x409)
        # 修改 PostScript 名称 nameID=6
        font['name'].setName('ScreenLite-Regular', nameID=6, platformID=3, platEncID=1, langID=0x409)

        # 定义需要保留的字体表（排除FFTM等不需要的表）
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

    except Exception as e:
        print(f'字体处理失败: {str(e)}')
        return False

def main():
    # 配置参数
    original_font_path = 'QiushuiShotai.ttf'  # 原始 TTF 字体路径
    output_font_path = 'ScreenLite.woff2' # 输出 WOFF2 字体路径

    with open('table_used_characters.txt', 'r', encoding='utf-8') as f:
        needed_chars = f.read()
    all_needed_chars = needed_chars + '●'

    # 处理字体
    subset_and_convert_font(original_font_path, output_font_path, all_needed_chars)

if __name__ == '__main__':
    main()
