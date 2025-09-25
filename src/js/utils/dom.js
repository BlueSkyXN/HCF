/**
 * DOM操作工具函数
 */

/**
 * 简化的querySelector
 * @param {string} selector CSS选择器
 * @returns {Element|null}
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * 简化的querySelectorAll
 * @param {string} selector CSS选择器
 * @returns {NodeList}
 */
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * 添加检测步骤到页面
 * @param {Object} options 配置选项
 * @param {boolean} options.ok 是否触发
 * @param {string} options.title 步骤标题
 * @param {string} options.detail 详细信息
 * @param {number} options.weight 权重
 * @param {Array<string>} options.targets 目标平台列表
 */
export function addStep({ok, title, detail, weight, targets = []}) {
  const li = document.createElement('li');
  li.className = 'step-item';
  li.innerHTML = `
    <div class="step-badges" style="margin-bottom:6px">
      <span class="step-badge ${ok ? 'success' : 'error'}">${ok ? '✅ 触发' : '✖ 未触发'}</span>
      ${weight ? `<span class="step-badge warning">权重 ${weight}</span>` : ''}
      ${targets.length ? `<span class="step-badge neutral">${targets.join(' · ')}</span>` : ''}
    </div>
    <div class="step-title">${title}</div>
    ${detail ? `<div class="step-detail">${detail}</div>` : ''}
  `;
  $('#steps').appendChild(li);
}

/**
 * 更新置信度显示
 * @param {string} os 操作系统名称
 * @param {number} confidence 置信度百分比
 */
export function updateConfidence(os, confidence) {
  const statusEl = $('#summary');
  const barEl = $('#confBar');

  if (statusEl) {
    statusEl.innerHTML = `<span class="status-text">检测完成：<strong>${os}</strong> (${confidence}% 置信度)</span>`;
  }

  if (barEl) {
    barEl.style.width = `${confidence}%`;
    barEl.setAttribute('aria-valuenow', confidence);
  }
}

/**
 * 更新评分面板
 * @param {Object} scores 各操作系统评分
 */
export function updateScoreBoard(scores) {
  const scoreBoard = $('#scoreBoard');
  if (!scoreBoard) return;

  const maxScore = Math.max(...Object.values(scores));
  const rows = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([os, score]) => {
      const width = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return `
        <div class="score-row">
          <div class="score-label">${os}</div>
          <div class="score-bar"><span style="width:${width}%"></span></div>
          <div class="mono-text" style="width:40px;text-align:right">${score}</div>
        </div>
      `;
    })
    .join('');

  scoreBoard.innerHTML = `<div>${rows}</div>`;
}