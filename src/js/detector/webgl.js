/**
 * WebGL检测模块
 * 用于获取显卡和渲染器信息
 */

/**
 * 获取WebGL信息
 * @returns {Object|null} 包含vendor和renderer信息的对象，失败时返回null
 */
export function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return null;

    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = dbg
      ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const renderer = dbg
      ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    return {
      vendor: String(vendor || ''),
      renderer: String(renderer || '')
    };
  } catch (e) {
    console.warn('WebGL检测失败:', e);
    return null;
  }
}

/**
 * 检测是否包含Apple相关信息
 * @param {Object} webglInfo WebGL信息对象
 * @returns {boolean}
 */
export function containsApple(webglInfo) {
  if (!webglInfo) return false;

  const { vendor, renderer } = webglInfo;
  const combined = `${vendor} ${renderer}`.toLowerCase();

  return combined.includes('apple') || combined.includes('metal');
}

/**
 * 检测是否为ANGLE(Metal)渲染器
 * @param {Object} webglInfo WebGL信息对象
 * @returns {boolean}
 */
export function isAngleMetal(webglInfo) {
  if (!webglInfo) return false;

  const { renderer } = webglInfo;
  return renderer.toLowerCase().includes('angle') &&
         renderer.toLowerCase().includes('metal');
}

/**
 * 检测显卡厂商类型
 * @param {Object} webglInfo WebGL信息对象
 * @returns {string} 厂商类型：'nvidia', 'amd', 'intel', 'apple', 'unknown'
 */
export function getGPUVendor(webglInfo) {
  if (!webglInfo) return 'unknown';

  const combined = `${webglInfo.vendor} ${webglInfo.renderer}`.toLowerCase();

  if (combined.includes('nvidia') || combined.includes('geforce')) return 'nvidia';
  if (combined.includes('amd') || combined.includes('radeon')) return 'amd';
  if (combined.includes('intel')) return 'intel';
  if (combined.includes('apple') || combined.includes('metal')) return 'apple';

  return 'unknown';
}