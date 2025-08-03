'use strict';

/**
 * *将表格导出为图片*
*/

import { domToWebp } from 'https://unpkg.com/modern-screenshot'

document.querySelector('span.export-screenshot').addEventListener('click', async () => {
    try {
        const container = document.querySelector('div.container');
        const dataUrl = await domToWebp(container, { scale: 1.5 });

        const link = document.createElement('a');
        link.download = 'bishoujo-table.webp';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('导出失败:', error);
        alert('图片导出失败，请重试');
    }
});

/**
 * *加载JSON数据并生成表格*
*/
const TableManager = (() => {
    const state = {
        table_frame: null,
        character_hs: null,
        currentLang: 'jp'
    };

    // 缓存DOM元素
    const elements = {
        table: document.querySelector('table.bishoujo-table'),
        langSwitch: document.querySelector('.lang-switch')
    };

    // 加载JSON数据
    async function loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`加载失败: ${url}`);
        return response.json();
    }

    // 初始化表格
    async function init() {
        try {
            const [frameData, hsData] = await Promise.all([
                loadJSON('table_frame.json'),
                loadJSON('character_hs.json')
            ]);

            Object.assign(state, {
                table_frame: frameData,
                character_hs: hsData
            });

            renderTable();
            setupEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
            elements.table.innerHTML = `<tr><td colspan="100">数据加载失败，请刷新页面</td></tr>`;
        }
    }

    // 渲染表格
    function renderTable() {
        const { row_characters: rows, col_types: columns } = state.table_frame;
        const { character_hs, currentLang } = state;

        let tableHTML = `
            <tr>
                <td></td>
                ${rows.map(char => char.tachie 
                    ? `<td><img class="tachie-box" src="assets/tachie/${char.tachie}" alt="${char.jp}"></td>` 
                    : '<td></td>'
                ).join('')}
            </tr>
            <tr>
                <td></td>
                ${rows.map(char => `<td>${char[currentLang]}</td>`).join('')}
            </tr>
        `;

        columns.forEach(col => {
            const jpKey = col.jp;
            tableHTML += `
                <tr class="td-spacing">
                    <td>${col[currentLang]}</td>
            `;

            if (jpKey && character_hs[jpKey]) {
                const colData = character_hs[jpKey];
                tableHTML += rows.map(char => 
                    colData[char.jp] === 1 
                        ? '<td class="dot">●</td>' 
                        : '<td></td>'
                ).join('');
            } else {
                tableHTML += rows.map(() => '<td></td>').join('');
            }

            tableHTML += '</tr>';
        });

        elements.table.innerHTML = tableHTML;
    }

    // 切换语言
    function switchLanguage() {
        state.currentLang = state.currentLang === 'jp' ? 'cn' : 'jp';
        renderTable();
        updateSwitchText();
    }

    // 更新切换按钮文本
    function updateSwitchText() {
        const isCN = state.currentLang === 'cn';
        elements.langSwitch.classList.toggle('cn', isCN);
        elements.langSwitch.innerHTML = `
            <img class="svg-icon" src="assets/icons/lang-switch.svg" alt="语言切换">
            ${isCN ? '切换日文' : '切换中文'}
        `;
    }

    // 事件监听
    function setupEventListeners() {
        elements.langSwitch.addEventListener('click', switchLanguage);
    }

    return { init };
})();

// 初始化表格管理器
TableManager.init();