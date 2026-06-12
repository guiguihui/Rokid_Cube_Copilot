// 极简 PNG 解码（8-bit，非隔行；colorType 0/2/4/6）-> {width,height,rgba}
// 用于 Craft/浏览器 takePhoto 返回 PNG 截图的情形。依赖自洽的 tiny-inflate。
import inflate from './vendor/tiny-inflate.js';

function u32(b, o) {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}

export function isPng(b) {
  return b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
}

export function decodePng(buffer) {
  const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (!isPng(b)) throw new Error('不是 PNG');

  let off = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off + 8 <= b.length) {
    const len = u32(b, off);
    const type = String.fromCharCode(b[off + 4], b[off + 5], b[off + 6], b[off + 7]);
    const start = off + 8;
    if (type === 'IHDR') {
      width = u32(b, start);
      height = u32(b, start + 4);
      bitDepth = b[start + 8];
      colorType = b[start + 9];
      interlace = b[start + 12];
    } else if (type === 'IDAT') {
      idat.push(b.subarray(start, start + len));
    } else if (type === 'IEND') {
      break;
    }
    off = start + len + 4; // 跳过 4 字节 CRC
  }

  if (bitDepth !== 8) throw new Error('PNG 仅支持 8-bit，当前 ' + bitDepth);
  if (interlace !== 0) throw new Error('PNG 不支持隔行');
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : colorType === 4 ? 2 : 0;
  if (!channels) throw new Error('PNG colorType ' + colorType + ' 不支持');

  // 拼接 IDAT
  let total = 0;
  for (const c of idat) total += c.length;
  const z = new Uint8Array(total);
  let p = 0;
  for (const c of idat) { z.set(c, p); p += c.length; }

  const stride = width * channels;
  const raw = new Uint8Array(height * (stride + 1));
  inflate(z.subarray(2), raw); // 跳过 2 字节 zlib 头

  const rgba = new Uint8Array(width * height * 4);
  let prev = null;
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    const cur = new Uint8Array(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const up = prev ? prev[x] : 0;
      const ul = prev && x >= channels ? prev[x - channels] : 0;
      let val = raw[rowStart + 1 + x];
      if (filter === 1) val = (val + a) & 255;
      else if (filter === 2) val = (val + up) & 255;
      else if (filter === 3) val = (val + ((a + up) >> 1)) & 255;
      else if (filter === 4) {
        const pa = Math.abs(up - ul), pb = Math.abs(a - ul), pc = Math.abs(a + up - 2 * ul);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? up : ul;
        val = (val + pr) & 255;
      }
      cur[x] = val;
    }
    for (let x = 0; x < width; x++) {
      const si = x * channels, di = (y * width + x) * 4;
      if (channels === 4) { rgba[di] = cur[si]; rgba[di + 1] = cur[si + 1]; rgba[di + 2] = cur[si + 2]; rgba[di + 3] = cur[si + 3]; }
      else if (channels === 3) { rgba[di] = cur[si]; rgba[di + 1] = cur[si + 1]; rgba[di + 2] = cur[si + 2]; rgba[di + 3] = 255; }
      else if (channels === 1) { rgba[di] = rgba[di + 1] = rgba[di + 2] = cur[si]; rgba[di + 3] = 255; }
      else { rgba[di] = rgba[di + 1] = rgba[di + 2] = cur[si]; rgba[di + 3] = cur[si + 1]; }
    }
    prev = cur;
  }
  return { width, height, rgba };
}
