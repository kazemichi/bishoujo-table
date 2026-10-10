'use strict';

// 常量
const CONSTANTS = Object.freeze({
    SAVE_FORMAT: 'webp',
    SAVE_FILENAME: 'bishoujo-table',
    SNAP_SCALE: 1.5
});

/**
 * 导出截图
*/
import { snapdom } from 'https://unpkg.com/@zumer/snapdom@latest/dist/snapdom.mjs';

// DOM 缓存
const captureContent = document.querySelector('div.container');
const exportBtn = document.querySelector('span.export-screenshot');

if (captureContent && exportBtn) {
    exportBtn.addEventListener('click', async () => {
        try {
            const result = await snapdom(container, {
                scale: CONSTANTS.SNAP_SCALE,
                reconcile: true
            });
            // 直接下载图片
            await result.download({
                format: CONSTANTS.SAVE_FORMAT,
                filename: `${CONSTANTS.SAVE_FILENAME}.${CONSTANTS.SAVE_FORMAT}`
            });
        } catch (error) {
            console.error('导出失败:', error);
            alert('图片导出失败，请重试。');
        }
    });
}

/**
 * 读取 JSON 数据并生成表格
*/
const TableManager = (() => {
    /** @type {{tableFrame:null|object, characterHS:null|object, currentLang:'jp'|'cn'}} */
    const state = {
        tableFrame: null,
        characterHS: null,
        currentLang: 'jp'
    };

    // 缓存 DOM 元素
    const elements = {
        table: document.querySelector('table.bishoujo-table'),
        langSwitch: document.querySelector('span.lang-switch')
    };

    /**
     * 加载 JSON 数据
     * @param {string} url
     */
    async function loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`加载失败: ${url}`);
        return response.json();
    }

    /**
     * 初始化表格
     */
    async function init() {
        try {
            const [frameData, hsData] = await Promise.all([
                loadJSON('table_frame.json'),
                loadJSON('character_hs.json')
            ]);

            Object.assign(state, {
                tableFrame: frameData,
                characterHS: hsData
            });

            renderTable();
            setupEventListeners();
        } catch (error) {
            console.error('初始化失败:', error);
            elements.table.innerHTML = `<tr><td colspan="100">数据加载失败，请刷新页面</td></tr>`;
        }
    }

    /**
     * 渲染表格
     */
    function renderTable() {
        const { row_characters: rows, col_types: columns } = state.tableFrame;
        const { characterHS, currentLang } = state;

        let tableHTML = `
            <tr>
                <td></td>
                ${rows.map(char => char.tachie 
                    ? `<td><img class="tachie-box" src="assets/tachie/${char.tachie}" alt="${char.jp}" decoding="async"></td>` 
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

            if (jpKey && characterHS[jpKey]) {
                const colData = characterHS[jpKey];
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

    /**
     * 切换语言
     */
    function switchLanguage() {
        state.currentLang = state.currentLang === 'jp' ? 'cn' : 'jp';
        renderTable();
        updateSwitchText();
    }

    /**
     * 更新切换按钮文本
     */
    function updateSwitchText() {
        const isCN = state.currentLang === 'cn';
        elements.langSwitch.classList.toggle('cn', isCN);
        elements.langSwitch.innerHTML = `
            <img class="svg-icon" src="assets/icons/lang-switch.svg" alt="语言切换">
            ${isCN ? '切换日文' : '切换中文'}
        `;
    }

    /**
     * 绑定监听事件
     */
    function setupEventListeners() {
        elements.langSwitch.addEventListener('click', switchLanguage);
    }

    return { init };
})();

// 启动初始化
TableManager.init();
