// JPEG 解码 -> {width,height,rgba}（用于 Craft/浏览器 takePhoto 返回 JPEG 截图）
// 依赖自洽的 jpeg-js 解码核心；useTArray 避开 Node Buffer。
import decode from './vendor/jpeg-decoder.js';

export function isJpeg(b) {
  return b.length > 2 && b[0] === 0xff && b[1] === 0xd8;
}

export function decodeJpeg(buffer) {
  const img = decode(buffer, { useTArray: true, formatAsRGBA: true });
  return { width: img.width, height: img.height, rgba: img.data };
}
