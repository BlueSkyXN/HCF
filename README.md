# HCF设备检测工具

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![CSS](https://img.shields.io/badge/css-3-blue.svg)

**Hardware Capability Fingerprinting Device Detector**

一个先进的设备检测工具，通过多重信号分析技术准确识别用户的操作系统和设备特征。

[在线演示](https://hcf2023.top/) · [功能特性](#功能特性) · [快速开始](#快速开始) · [API文档](#api文档)

</div>

## 🌟 功能特性

### 🎯 高精度检测
- **98%+ 置信度**：通过多重信号分析实现高准确率设备识别
- **实时分析**：毫秒级响应，用户体验流畅
- **智能评分**：基于权重的评分系统，科学评估检测结果

### 🔍 全面的检测能力
- **操作系统识别**：支持 macOS、Windows、Linux、iOS、iPadOS、Android
- **WebGL分析**：显卡厂商、渲染器信息检测
- **硬件能力**：NFC、媒体编解码、桌面API等功能检测
- **显示特征**：分辨率、像素比、色深等参数分析

### 🎨 现代化设计
- **iOS风格**：基于Apple Human Interface Guidelines
- **响应式布局**：完美适配桌面和移动设备
- **深色模式**：自动适应用户系统偏好
- **无障碍友好**：符合WCAG 2.1 AA标准

### 🛡️ 隐私安全
- **纯前端实现**：数据不离开用户设备
- **开源透明**：所有代码公开可审计
- **零追踪**：不收集用户隐私信息

## 📦 快速开始

### 直接使用

1. **克隆仓库**
   ```bash
   git clone https://github.com/hcf-team/device-detector.git
   cd device-detector
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000

   # 或使用Node.js
   npx serve .

   # 或使用PHP
   php -S localhost:8000
   ```

3. **访问应用**

   打开浏览器访问 `http://localhost:8000`

### 集成到项目

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="./src/css/main.css">

<!-- 引入脚本 -->
<script type="module" src="./src/js/main.js"></script>
```

## 🔧 项目结构

```
device-detector/
├── README.md                 # 项目说明文档
├── LICENSE                   # MIT许可证
├── package.json              # 项目配置文件
├── index.html                # 主页面
├── src/                      # 源码目录
│   ├── js/                   # JavaScript模块
│   │   ├── main.js          # 主入口文件
│   │   ├── detector/        # 检测引擎
│   │   │   ├── engine.js    # 检测引擎核心
│   │   │   ├── webgl.js     # WebGL检测模块
│   │   │   ├── nfc.js       # NFC检测模块
│   │   │   └── media.js     # 媒体能力检测
│   │   └── utils/           # 工具函数
│   │       └── dom.js       # DOM操作工具
│   ├── css/                 # 样式文件
│   │   ├── main.css         # 主样式文件
│   │   ├── variables.css    # CSS变量定义
│   │   └── components/      # 组件样式
│   │       ├── cards.css    # 卡片组件
│   │       └── progress.css # 进度条组件
│   └── assets/              # 静态资源
├── docs/                    # 文档目录
├── examples/                # 示例代码
└── tests/                   # 测试文件
```

## 🛠️ API文档

### 核心类

#### `DeviceDetectionEngine`

检测引擎的主要类，负责整合各种检测模块。

```javascript
import { DeviceDetectionEngine } from './src/js/detector/engine.js';

const engine = new DeviceDetectionEngine();
const result = await engine.startDetection();

console.log(result);
// { os: 'macOS', confidence: 98 }
```

#### 主要方法

- **`startDetection()`**: 开始检测流程
- **`getAllScores()`**: 获取所有操作系统评分
- **`getTopOS()`**: 获取最高分操作系统

### 检测模块

#### WebGL检测

```javascript
import { getWebGLInfo, containsApple, isAngleMetal } from './src/js/detector/webgl.js';

const webglInfo = getWebGLInfo();
const hasApple = containsApple(webglInfo);
const isAngle = isAngleMetal(webglInfo);
```

#### NFC检测

```javascript
import { checkNFCCapabilities, hasNFCSupport } from './src/js/detector/nfc.js';

const nfcResult = await checkNFCCapabilities();
const nfcSupport = hasNFCSupport();
```

#### 媒体能力检测

```javascript
import { checkMediaCapabilities, getSupportedVideoFormats } from './src/js/detector/media.js';

const mediaCapabilities = await checkMediaCapabilities();
const videoFormats = getSupportedVideoFormats();
```

### 全局API

应用会在 `window.HCFDetector` 下暴露全局API：

```javascript
// 重新开始检测
window.HCFDetector.restart();

// 导出检测数据
const data = window.HCFDetector.export();

// 获取版本信息
console.log(window.HCFDetector.version); // "1.0.0"
```

## 🔍 检测原理

### 信号收集

1. **基础信号**
   - 触摸点数量
   - 指针类型（粗略/精细）
   - 悬停支持

2. **Apple生态信号**
   - Apple Pay支持
   - WebKit特有CSS属性
   - Safari推送通知API

3. **Android信号**
   - Web NFC API
   - Related Apps API
   - Android特有功能

4. **桌面系统信号**
   - Web Serial/HID/USB API
   - 桌面专用功能

### 评分算法

使用加权评分系统，每个信号根据其可靠性赋予不同权重：

- **高可靠性信号**（权重8-10）：User-Agent明确标识
- **中可靠性信号**（权重4-7）：Apple Pay、WebGL渲染器
- **低可靠性信号**（权重1-3）：CSS特性、API支持

最终通过贝叶斯推理计算各操作系统的置信度。

## 🎨 设计规范

项目遵循 [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)：

- **颜色系统**：使用iOS系统颜色
- **排版**：San Francisco字体栈
- **布局**：卡片式设计，清晰的信息层级
- **交互**：流畅的过渡动画
- **无障碍**：全面的ARIA支持

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 说明 |
|--------|----------|------|
| Chrome | 60+ | 完全支持 |
| Firefox | 55+ | 完全支持 |
| Safari | 11+ | 完全支持，macOS检测最准确 |
| Edge | 79+ | 完全支持 |
| Mobile Safari | iOS 11+ | 移动端优化 |
| Chrome Mobile | 60+ | Android检测优化 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier
- 遵循 [JavaScript Standard Style](https://standardjs.com/)
- 组件和函数需要完整的JSDoc注释

## 📄 许可证

本项目基于 [MIT License](LICENSE) 许可证开源。

## 🙏 致谢

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - 设计灵感
- [MDN Web Docs](https://developer.mozilla.org/) - API参考文档
- [Can I Use](https://caniuse.com/) - 浏览器兼容性数据

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/hcf-team/device-detector/issues)
- **项目主页**: [https://hcf2023.top/](https://hcf2023.top/)

---

<div align="center">
  <sub>Built with ❤️ by HCF Team</sub>
</div>