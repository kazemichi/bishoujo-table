'use strict';

/**
 * *将表格导出为图片*
*/

import { domToWebp } from 'https://unpkg.com/modern-screenshot'

$('span.export-screenshot').click(() => {
    domToWebp(document.querySelector('div.container'), {
        scale: 1.5 // 放大倍数
    }).then(dataUrl => {
        const link = document.createElement('a');
        link.download = 'bishoujo-table.webp'; // 导出文件名
        link.href = dataUrl;
        link.click();
    })
})


/**
 * *加载JSON数据并生成表格*
*/

// 使用Promise封装AJAX请求
function loadJSON(path) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: path,
            dataType: 'json',
            success: resolve,
            error: reject
        });
    });
}

// 初始化数据
let table_frame, character_hs;
let row, column, characters_num, column_num;

// 使用Promise.all同时加载多个JSON
Promise.all([
    loadJSON('table_frame.json'),
    loadJSON('character_hs.json')
]).then(([frameData, hsData]) => {
    table_frame = frameData;
    character_hs = hsData;
    
    row = table_frame.row_characters;
    column = table_frame.col_types;
    characters_num = row.length;
    column_num = column.length;
    
    // 默认加载日语
    loadData('jp');
    
    // 绑定语言切换事件
    const switcher = document.querySelector('.lang-switch');
    switcher.addEventListener('click', handleLangSwitch);
}).catch(console.error);

// 创建文档片段优化DOM操作
function createTableFragment(lang) {
    const fragment = document.createDocumentFragment();
    
    // 创建表头行
    const headerRow1 = document.createElement('tr');
    const headerRow2 = document.createElement('tr');
    
    // 添加空单元格
    headerRow1.innerHTML = '<td></td>';
    headerRow2.innerHTML = '<td></td>';
    
    // 添加角色头像和名称
    row.forEach(item => {
        const avatarCell = item.tachie 
            ? `<td><img class="tachie-box" src="assets/tachie/${item.tachie}" alt=""/></td>`
            : '<td></td>';
        
        headerRow1.innerHTML += avatarCell;
        headerRow2.innerHTML += `<td>${item[lang]}</td>`;
    });
    
    fragment.appendChild(headerRow1);
    fragment.appendChild(headerRow2);
    
    // 添加数据行
    column.forEach(colItem => {
        const dataRow = document.createElement('tr');
        dataRow.classList.add('td-spacing');
        
        const typeName = colItem[lang];
        const jpKey = colItem['jp'];
        
        // 添加类型名称
        dataRow.innerHTML = `<td>${typeName}</td>`;
        
        if (jpKey) {
            row.forEach(charItem => {
                const jpName = charItem.jp;
                const cellContent = character_hs[jpKey]?.[jpName] === 1 
                    ? '<td class="dot">●</td>' 
                    : '<td></td>';
                
                dataRow.innerHTML += cellContent;
            });
        } else {
            dataRow.innerHTML += `<td class="blank"></td>`;
        }
        
        fragment.appendChild(dataRow);
    });
    
    return fragment;
}

function loadData(lang) {
    const table = document.querySelector('table.bishoujo-table');
    
    // 清空表格
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    
    // 添加新内容
    table.appendChild(createTableFragment(lang));
}

function handleLangSwitch() {
    const switcher = document.querySelector('.lang-switch');
    const isCN = switcher.classList.contains('cn');
    
    // 切换语言
    if (isCN) {
        switcher.classList.remove('cn');
        switcher.innerHTML = '<img class="svg-icon" src="assets/icon/lang-switch.svg" alt=""/>切换中文';
        loadData('jp');
    } else {
        switcher.classList.add('cn');
        switcher.innerHTML = '<img class="svg-icon" src="assets/icon/lang-switch.svg" alt=""/>切换日文';
        loadData('cn');
    }
}