/**
 * 媒体编解码能力检测模块
 * 检测设备对各种音视频格式的支持情况
 */

/**
 * 检查媒体编解码能力
 * @returns {Promise<Object>} 媒体能力检测结果
 */
export async function checkMediaCapabilities() {
  const result = {
    hevc: null,
    vp9: null,
    av1: null,
    hdr: null
  };

  try {
    // 检查MediaCapabilities API支持
    if ('mediaCapabilities' in navigator) {
      // 检查HEVC/H.265支持
      result.hevc = await checkHEVCSupport();

      // 检查VP9支持
      result.vp9 = await checkVP9Support();

      // 检查AV1支持
      result.av1 = await checkAV1Support();

      // 检查HDR支持
      result.hdr = await checkHDRSupport();
    }
  } catch (error) {
    console.warn('媒体能力检测失败:', error);
  }

  return result;
}

/**
 * 检查HEVC/H.265编解码支持
 * @returns {Promise<boolean|null>}
 */
async function checkHEVCSupport() {
  try {
    if (!('mediaCapabilities' in navigator)) return null;

    const config = {
      type: 'media-source',
      video: {
        contentType: 'video/mp4; codecs="hev1.1.6.L93.B0"',
        width: 1920,
        height: 1080,
        bitrate: 2000000,
        framerate: 30
      }
    };

    const info = await navigator.mediaCapabilities.decodingInfo(config);
    return info.supported;
  } catch (e) {
    return false;
  }
}

/**
 * 检查VP9编解码支持
 * @returns {Promise<boolean|null>}
 */
async function checkVP9Support() {
  try {
    if (!('mediaCapabilities' in navigator)) return null;

    const config = {
      type: 'media-source',
      video: {
        contentType: 'video/webm; codecs="vp9"',
        width: 1920,
        height: 1080,
        bitrate: 2000000,
        framerate: 30
      }
    };

    const info = await navigator.mediaCapabilities.decodingInfo(config);
    return info.supported;
  } catch (e) {
    return false;
  }
}

/**
 * 检查AV1编解码支持
 * @returns {Promise<boolean|null>}
 */
async function checkAV1Support() {
  try {
    if (!('mediaCapabilities' in navigator)) return null;

    const config = {
      type: 'media-source',
      video: {
        contentType: 'video/mp4; codecs="av01.0.04M.08"',
        width: 1920,
        height: 1080,
        bitrate: 2000000,
        framerate: 30
      }
    };

    const info = await navigator.mediaCapabilities.decodingInfo(config);
    return info.supported;
  } catch (e) {
    return false;
  }
}

/**
 * 检查HDR支持
 * @returns {Promise<boolean|null>}
 */
async function checkHDRSupport() {
  try {
    if (!('mediaCapabilities' in navigator)) return null;

    // 检查HDR10支持
    const hdr10Config = {
      type: 'media-source',
      video: {
        contentType: 'video/mp4; codecs="hev1.2.4.L153.B0"',
        width: 3840,
        height: 2160,
        bitrate: 10000000,
        framerate: 60,
        colorGamut: 'rec2020',
        transferFunction: 'pq'
      }
    };

    const info = await navigator.mediaCapabilities.decodingInfo(hdr10Config);
    return info.supported;
  } catch (e) {
    return false;
  }
}

/**
 * 获取支持的音频格式列表
 * @returns {Array<string>} 支持的音频格式
 */
export function getSupportedAudioFormats() {
  const audio = document.createElement('audio');
  const formats = [];

  const testFormats = [
    { name: 'MP3', type: 'audio/mpeg' },
    { name: 'AAC', type: 'audio/mp4; codecs="mp4a.40.2"' },
    { name: 'OGG Vorbis', type: 'audio/ogg; codecs="vorbis"' },
    { name: 'FLAC', type: 'audio/flac' },
    { name: 'WebM Opus', type: 'audio/webm; codecs="opus"' }
  ];

  testFormats.forEach(format => {
    const support = audio.canPlayType(format.type);
    if (support === 'probably' || support === 'maybe') {
      formats.push(format.name);
    }
  });

  return formats;
}

/**
 * 获取支持的视频格式列表
 * @returns {Array<string>} 支持的视频格式
 */
export function getSupportedVideoFormats() {
  const video = document.createElement('video');
  const formats = [];

  const testFormats = [
    { name: 'H.264', type: 'video/mp4; codecs="avc1.42E01E"' },
    { name: 'H.265/HEVC', type: 'video/mp4; codecs="hev1.1.6.L93.B0"' },
    { name: 'VP8', type: 'video/webm; codecs="vp8"' },
    { name: 'VP9', type: 'video/webm; codecs="vp9"' },
    { name: 'AV1', type: 'video/mp4; codecs="av01.0.04M.08"' }
  ];

  testFormats.forEach(format => {
    const support = video.canPlayType(format.type);
    if (support === 'probably' || support === 'maybe') {
      formats.push(format.name);
    }
  });

  return formats;
}