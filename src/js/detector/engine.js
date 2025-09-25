/**
 * 设备检测引擎
 * 整合各种检测模块，执行设备识别逻辑
 */

import { getWebGLInfo, containsApple, isAngleMetal, getGPUVendor } from './webgl.js';
import { checkNFCCapabilities, hasNFCSupport, getNFCDetails } from './nfc.js';
import { checkMediaCapabilities, getSupportedAudioFormats, getSupportedVideoFormats } from './media.js';
import { addStep, updateConfidence, updateScoreBoard } from '../utils/dom.js';

/**
 * 操作系统评分系统
 */
class OSScoreSystem {
  constructor() {
    this.scores = {
      'macOS': 0,
      'Windows': 0,
      'Linux': 0,
      'iOS': 0,
      'iPadOS': 0,
      'Android': 0
    };
  }

  /**
   * 添加分数
   * @param {Array<string>} targets 目标操作系统列表
   * @param {number} weight 权重分数
   */
  addScore(targets, weight) {
    targets.forEach(target => {
      if (this.scores.hasOwnProperty(target)) {
        this.scores[target] += weight;
      }
    });
  }

  /**
   * 获取最高分操作系统
   * @returns {Object} 包含操作系统名称和置信度的对象
   */
  getTopOS() {
    const maxScore = Math.max(...Object.values(this.scores));
    const totalScore = Object.values(this.scores).reduce((a, b) => a + b, 0);

    if (maxScore === 0 || totalScore === 0) {
      return { os: '未知', confidence: 0 };
    }

    const topOS = Object.entries(this.scores)
      .find(([_, score]) => score === maxScore)[0];

    const confidence = Math.round((maxScore / totalScore) * 100);

    return { os: topOS, confidence };
  }

  /**
   * 获取所有评分
   * @returns {Object} 评分对象
   */
  getAllScores() {
    return { ...this.scores };
  }
}

/**
 * 主检测引擎
 */
export class DeviceDetectionEngine {
  constructor() {
    this.scoreSystem = new OSScoreSystem();
    this.signals = {
      basic: {},
      apple: {},
      android: {},
      desktop: {},
      display: {}
    };
  }

  /**
   * 开始检测流程
   */
  async startDetection() {
    console.log('开始设备检测...');

    // 收集基础信号
    await this.collectBasicSignals();

    // 收集Apple相关信号
    await this.collectAppleSignals();

    // 收集Android相关信号
    await this.collectAndroidSignals();

    // 收集桌面系统信号
    await this.collectDesktopSignals();

    // 收集显示相关信号
    await this.collectDisplaySignals();

    // 执行WebGL检测
    await this.performWebGLDetection();

    // 执行NFC检测
    await this.performNFCDetection();

    // 执行媒体能力检测
    await this.performMediaDetection();

    // 执行用户代理字符串分析
    this.performUserAgentAnalysis();

    // 计算最终结果
    const result = this.scoreSystem.getTopOS();
    updateConfidence(result.os, result.confidence);
    updateScoreBoard(this.scoreSystem.getAllScores());

    // 添加信号快照
    this.addSignalSnapshot();

    console.log('检测完成:', result);
    return result;
  }

  /**
   * 收集基础信号
   */
  async collectBasicSignals() {
    this.signals.basic = {
      touchPoints: navigator.maxTouchPoints || 0,
      coarse: matchMedia('(pointer: coarse)').matches,
      fine: matchMedia('(pointer: fine)').matches,
      hover: matchMedia('(hover: hover)').matches
    };

    // 触摸设备检测
    if (this.signals.basic.touchPoints > 0 || this.signals.basic.coarse) {
      this.scoreSystem.addScore(['iOS', 'iPadOS', 'Android'], 2);
      addStep({
        ok: true,
        title: '触摸设备特征',
        detail: `触摸点: ${this.signals.basic.touchPoints}, 粗略指针: ${this.signals.basic.coarse}`,
        weight: 2,
        targets: ['iOS', 'iPadOS', 'Android']
      });
    }
  }

  /**
   * 收集Apple相关信号
   */
  async collectAppleSignals() {
    this.signals.apple = {
      webkitTouchCallout: 'webkitTouchCallout' in document.documentElement.style,
      webkitOverflowScrolling: 'webkitOverflowScrolling' in document.documentElement.style,
      applePay: 'ApplePaySession' in window,
      safariPush: 'safari' in window && 'pushNotification' in window.safari,
      iOSPermissionShape: CSS.supports('shape-outside', 'circle()'),
      pwaStandalone: matchMedia('(display-mode: standalone)').matches ||
                    window.navigator.standalone === true
    };

    // Apple Pay检测
    if (this.signals.apple.applePay) {
      this.scoreSystem.addScore(['iOS', 'iPadOS', 'macOS'], 8);
      addStep({
        ok: true,
        title: 'Apple Pay 支持',
        detail: 'ApplePaySession API 可用',
        weight: 8,
        targets: ['iOS', 'iPadOS', 'macOS']
      });
    }

    // Webkit特有CSS属性
    if (this.signals.apple.webkitTouchCallout || this.signals.apple.webkitOverflowScrolling) {
      this.scoreSystem.addScore(['iOS', 'iPadOS'], 4);
      addStep({
        ok: true,
        title: 'WebKit CSS 特性',
        detail: 'webkitTouchCallout或webkitOverflowScrolling支持',
        weight: 4,
        targets: ['iOS', 'iPadOS']
      });
    }

    // Safari推送通知
    if (this.signals.apple.safariPush) {
      this.scoreSystem.addScore(['macOS'], 6);
      addStep({
        ok: true,
        title: 'Safari 推送通知',
        detail: 'safari.pushNotification API 可用',
        weight: 6,
        targets: ['macOS']
      });
    }
  }

  /**
   * 收集Android相关信号
   */
  async collectAndroidSignals() {
    this.signals.android = {
      webNFC: 'NDEFReader' in window,
      nfcDetails: getNFCDetails(),
      relatedApps: 'getInstalledRelatedApps' in navigator
    };

    // Related Apps API (主要用于Android PWA)
    if (this.signals.android.relatedApps) {
      this.scoreSystem.addScore(['Android'], 5);
      addStep({
        ok: true,
        title: 'Related Apps API',
        detail: 'getInstalledRelatedApps API 可用',
        weight: 5,
        targets: ['Android']
      });
    }
  }

  /**
   * 收集桌面系统信号
   */
  async collectDesktopSignals() {
    this.signals.desktop = {
      webSerial: 'serial' in navigator,
      webHID: 'hid' in navigator,
      webUSB: 'usb' in navigator
    };

    // 桌面专用API
    const desktopAPIs = Object.values(this.signals.desktop).filter(Boolean).length;
    if (desktopAPIs > 0) {
      this.scoreSystem.addScore(['Windows', 'macOS', 'Linux'], desktopAPIs * 2);
      addStep({
        ok: true,
        title: '桌面系统API',
        detail: `支持 ${desktopAPIs} 个桌面专用API (Serial/HID/USB)`,
        weight: desktopAPIs * 2,
        targets: ['Windows', 'macOS', 'Linux']
      });
    }
  }

  /**
   * 收集显示相关信号
   */
  async collectDisplaySignals() {
    this.signals.display = {
      dpr: window.devicePixelRatio || 1,
      screen: [screen.width, screen.height],
      availScreen: [screen.availWidth, screen.availHeight],
      colorDepth: screen.colorDepth,
      orientation: screen.orientation ? screen.orientation.angle : null
    };

    // 高DPR检测（通常用于Retina显示屏）
    if (this.signals.display.dpr >= 2) {
      this.scoreSystem.addScore(['macOS', 'iOS', 'iPadOS'], 3);
      addStep({
        ok: true,
        title: 'Retina显示屏',
        detail: `设备像素比: ${this.signals.display.dpr}`,
        weight: 3,
        targets: ['macOS', 'iOS', 'iPadOS']
      });
    }
  }

  /**
   * 执行WebGL检测
   */
  async performWebGLDetection() {
    const webglInfo = getWebGLInfo();

    if (webglInfo) {
      // Apple GPU检测
      if (containsApple(webglInfo)) {
        this.scoreSystem.addScore(['macOS', 'iOS', 'iPadOS'], 6);
        addStep({
          ok: true,
          title: 'WebGL 渲染器含 Apple',
          detail: `vendor="${webglInfo.vendor}" · renderer="${webglInfo.renderer}"`,
          weight: 6,
          targets: ['macOS', 'iOS', 'iPadOS']
        });
      }

      // ANGLE Metal检测
      if (isAngleMetal(webglInfo)) {
        this.scoreSystem.addScore(['macOS'], 4);
        addStep({
          ok: true,
          title: 'ANGLE(Metal) 迹象',
          detail: `vendor="${webglInfo.vendor}" · renderer="${webglInfo.renderer}"`,
          weight: 4,
          targets: ['macOS']
        });
      }

      // GPU厂商检测
      const gpuVendor = getGPUVendor(webglInfo);
      switch (gpuVendor) {
        case 'apple':
          this.scoreSystem.addScore(['macOS', 'iOS', 'iPadOS'], 5);
          break;
        case 'intel':
          this.scoreSystem.addScore(['Windows', 'macOS', 'Linux'], 3);
          break;
        case 'nvidia':
          this.scoreSystem.addScore(['Windows', 'Linux'], 4);
          break;
        case 'amd':
          this.scoreSystem.addScore(['Windows', 'Linux'], 3);
          break;
      }

      if (gpuVendor !== 'unknown') {
        addStep({
          ok: true,
          title: `${gpuVendor.toUpperCase()} GPU检测`,
          detail: `检测到${gpuVendor}显卡`,
          weight: gpuVendor === 'apple' ? 5 : 3,
          targets: gpuVendor === 'apple' ? ['macOS', 'iOS', 'iPadOS'] :
                  gpuVendor === 'nvidia' || gpuVendor === 'amd' ? ['Windows', 'Linux'] :
                  ['Windows', 'macOS', 'Linux']
        });
      }
    }
  }

  /**
   * 执行NFC检测
   */
  async performNFCDetection() {
    const nfcResult = await checkNFCCapabilities();

    if (nfcResult.hasAPI) {
      // NFC API可用，可能是Android
      this.scoreSystem.addScore(['Android'], 4);
      addStep({
        ok: true,
        title: 'NFC API 支持',
        detail: `API类型: ${nfcResult.apiType}`,
        weight: 4,
        targets: ['Android']
      });
    }

    // 基于设备推断NFC支持
    if (hasNFCSupport()) {
      if (navigator.userAgent.toLowerCase().includes('android')) {
        this.scoreSystem.addScore(['Android'], 2);
      } else if (navigator.userAgent.toLowerCase().includes('iphone')) {
        this.scoreSystem.addScore(['iOS'], 2);
      }
    }
  }

  /**
   * 执行媒体能力检测
   */
  async performMediaDetection() {
    const mediaCapabilities = await checkMediaCapabilities();

    // HEVC支持通常表明Apple设备
    if (mediaCapabilities.hevc === true) {
      this.scoreSystem.addScore(['macOS', 'iOS', 'iPadOS'], 4);
      addStep({
        ok: true,
        title: 'HEVC/H.265 支持',
        detail: '硬件编解码支持',
        weight: 4,
        targets: ['macOS', 'iOS', 'iPadOS']
      });
    }

    // VP9支持情况分析
    if (mediaCapabilities.vp9 === true) {
      this.scoreSystem.addScore(['Android', 'Windows', 'Linux'], 2);
      addStep({
        ok: true,
        title: 'VP9 编解码支持',
        detail: '支持VP9视频格式',
        weight: 2,
        targets: ['Android', 'Windows', 'Linux']
      });
    }
  }

  /**
   * 执行用户代理字符串分析
   */
  performUserAgentAnalysis() {
    const userAgent = navigator.userAgent.toLowerCase();

    // macOS检测
    if (userAgent.includes('mac os x') || userAgent.includes('macos')) {
      this.scoreSystem.addScore(['macOS'], 6);
      addStep({
        ok: true,
        title: 'macOS 用户代理',
        detail: 'User-Agent包含macOS标识',
        weight: 6,
        targets: ['macOS']
      });
    }

    // Windows检测
    if (userAgent.includes('windows nt')) {
      this.scoreSystem.addScore(['Windows'], 6);
      addStep({
        ok: true,
        title: 'Windows 用户代理',
        detail: 'User-Agent包含Windows NT标识',
        weight: 6,
        targets: ['Windows']
      });
    }

    // Linux检测
    if (userAgent.includes('linux') && !userAgent.includes('android')) {
      this.scoreSystem.addScore(['Linux'], 6);
      addStep({
        ok: true,
        title: 'Linux 用户代理',
        detail: 'User-Agent包含Linux标识',
        weight: 6,
        targets: ['Linux']
      });
    }

    // iOS检测
    if (userAgent.includes('iphone') || userAgent.includes('ipod')) {
      this.scoreSystem.addScore(['iOS'], 8);
      addStep({
        ok: true,
        title: 'iOS 设备标识',
        detail: 'User-Agent包含iPhone/iPod标识',
        weight: 8,
        targets: ['iOS']
      });
    }

    // iPadOS检测
    if (userAgent.includes('ipad')) {
      this.scoreSystem.addScore(['iPadOS'], 8);
      addStep({
        ok: true,
        title: 'iPadOS 设备标识',
        detail: 'User-Agent包含iPad标识',
        weight: 8,
        targets: ['iPadOS']
      });
    }

    // Android检测
    if (userAgent.includes('android')) {
      this.scoreSystem.addScore(['Android'], 8);
      addStep({
        ok: true,
        title: 'Android 系统标识',
        detail: 'User-Agent包含Android标识',
        weight: 8,
        targets: ['Android']
      });
    }
  }

  /**
   * 添加原始信号快照
   */
  addSignalSnapshot() {
    const snapshot = JSON.stringify(this.signals, null, 2);
    addStep({
      ok: true,
      title: '原始信号快照',
      detail: snapshot
    });
  }
}