/**
 * HCF设备检测工具 - 主入口文件
 * Hardware Capability Fingerprinting Device Detector
 *
 * 一个先进的设备检测工具，通过多重信号分析识别用户的操作系统和设备特征
 *
 * @author HCF Team
 * @version 1.0.0
 * @license MIT
 */

import { DeviceDetectionEngine } from './detector/engine.js';
import { $ } from './utils/dom.js';

/**
 * 应用程序主类
 */
class DeviceDetectorApp {
  constructor() {
    this.engine = new DeviceDetectionEngine();
    this.isDetecting = false;
  }

  /**
   * 初始化应用程序
   */
  async init() {
    console.log('HCF设备检测工具初始化...');

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // 显示加载状态
    this.showLoadingState();

    // 延迟一小段时间让用户看到加载效果
    await new Promise(resolve => setTimeout(resolve, 500));

    // 开始检测
    await this.startDetection();
  }

  /**
   * 显示加载状态
   */
  showLoadingState() {
    const statusEl = $('#summary');
    if (statusEl) {
      statusEl.innerHTML = '<span class="status-text">正在检测设备...</span>';
    }

    const barEl = $('#confBar');
    if (barEl) {
      barEl.style.width = '0%';
      barEl.classList.add('loading');
    }
  }

  /**
   * 开始设备检测
   */
  async startDetection() {
    if (this.isDetecting) {
      console.warn('检测已在进行中...');
      return;
    }

    this.isDetecting = true;

    try {
      // 清空之前的检测步骤
      const stepsContainer = $('#steps');
      if (stepsContainer) {
        stepsContainer.innerHTML = '';
      }

      // 执行检测
      const result = await this.engine.startDetection();

      // 移除加载状态
      const barEl = $('#confBar');
      if (barEl) {
        barEl.classList.remove('loading');
      }

      console.log('检测完成:', result);

      // 可选：保存检测结果到本地存储
      this.saveDetectionResult(result);

    } catch (error) {
      console.error('检测过程中发生错误:', error);
      this.showErrorState(error);
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * 保存检测结果到本地存储
   * @param {Object} result 检测结果
   */
  saveDetectionResult(result) {
    try {
      const detectionData = {
        timestamp: new Date().toISOString(),
        result: result,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      localStorage.setItem('hcf_detection_result', JSON.stringify(detectionData));
      console.log('检测结果已保存到本地存储');
    } catch (e) {
      console.warn('无法保存检测结果:', e);
    }
  }

  /**
   * 显示错误状态
   * @param {Error} error 错误对象
   */
  showErrorState(error) {
    const statusEl = $('#summary');
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-text error">检测失败: ${error.message}</span>`;
    }

    const barEl = $('#confBar');
    if (barEl) {
      barEl.style.width = '0%';
      barEl.classList.remove('loading');
      barEl.classList.add('error');
    }
  }

  /**
   * 重新开始检测
   */
  async restartDetection() {
    console.log('重新开始检测...');
    await this.startDetection();
  }

  /**
   * 导出检测数据
   * @returns {Object|null} 检测数据
   */
  exportDetectionData() {
    try {
      const saved = localStorage.getItem('hcf_detection_result');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('无法导出检测数据:', e);
      return null;
    }
  }
}

/**
 * 应用程序实例
 */
const app = new DeviceDetectorApp();

/**
 * 页面加载后自动开始检测
 */
app.init().catch(error => {
  console.error('应用程序初始化失败:', error);
});

/**
 * 暴露全局API（用于调试和扩展）
 */
window.HCFDetector = {
  app,
  restart: () => app.restartDetection(),
  export: () => app.exportDetectionData(),
  version: '1.0.0'
};

// 开发模式下的额外功能
if (process?.env?.NODE_ENV === 'development') {
  window.HCFDetector.engine = app.engine;
  window.HCFDetector.debug = true;
  console.log('HCF设备检测工具 - 开发模式');
}