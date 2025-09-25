/**
 * NFC能力检测模块
 * 检测设备的Near Field Communication支持情况
 */

/**
 * 检测NFC能力
 * @returns {Promise<Object>} NFC检测结果
 */
export async function checkNFCCapabilities() {
  const result = {
    hasAPI: false,
    apiType: '',
    canScan: false,
    error: null
  };

  try {
    // 检查标准Web NFC API
    if ('NDEFReader' in window) {
      result.hasAPI = true;
      result.apiType = 'NDEFReader';

      // 尝试检测是否可以扫描（需要用户权限）
      try {
        const ndef = new NDEFReader();
        // 注意：实际扫描需要用户手势激活
        result.canScan = true;
      } catch (scanError) {
        result.error = `扫描权限检查失败: ${scanError.message}`;
      }
    }

    // 检查旧版或其他NFC API
    if (!result.hasAPI) {
      if ('nfc' in navigator) {
        result.hasAPI = true;
        result.apiType = 'navigator.nfc';
      }
    }

  } catch (error) {
    result.error = `NFC检测失败: ${error.message}`;
  }

  return result;
}

/**
 * 检测设备是否支持NFC
 * 基于用户代理和已知设备特征
 * @returns {boolean}
 */
export function hasNFCSupport() {
  const userAgent = navigator.userAgent.toLowerCase();

  // Android设备通常支持NFC
  if (userAgent.includes('android')) {
    return true;
  }

  // iOS设备（iPhone 7+）支持NFC读取
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    // 检查iOS版本（iOS 11+支持Core NFC）
    const iosMatch = userAgent.match(/os (\d+)_/);
    if (iosMatch) {
      const iosVersion = parseInt(iosMatch[1]);
      return iosVersion >= 11;
    }
  }

  // 其他平台检查
  if ('NDEFReader' in window || 'nfc' in navigator) {
    return true;
  }

  return false;
}

/**
 * 获取NFC功能详细信息
 * @returns {string} NFC功能描述
 */
export function getNFCDetails() {
  const capabilities = [];

  if ('NDEFReader' in window) {
    capabilities.push('NDEF读写');
  }

  if ('nfc' in navigator) {
    capabilities.push('传统NFC API');
  }

  // 基于平台推断功能
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) {
    capabilities.push('Android NFC');
  } else if (userAgent.includes('iphone')) {
    capabilities.push('Core NFC (读取)');
  }

  return capabilities.length > 0 ? capabilities.join(', ') : '无NFC支持';
}