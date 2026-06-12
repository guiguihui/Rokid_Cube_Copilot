// 摄像头帧 -> 9 格颜色识别（RGB -> HSV -> 6 色）
// 阈值是经验初值，光照不同可能要校准；集中在 CONFIG 便于调。

export const CONFIG = {
  regionFrac: 0.66, // 取景中央正方形占短边比例（魔方一面应填满引导框）
  patch: 4,         // 每格采样小块半径(像素)，取均值抗噪
  whiteSatMax: 0.22, // 低于此饱和度且足够亮 -> 判白
  whiteValMin: 0.45,
  // 色相分界(度)：红/橙/黄/绿/蓝
  hue: { redHi: 18, orange: 45, yellow: 72, green: 170, blue: 255 },
};

// RGB(0-255) -> {h(0-360), s(0-1), v(0-1)}
export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

// 单点颜色 -> 颜色字母 W/Y/R/O/G/B
export function classifyColor(r, g, b) {
  const { h, s, v } = rgbToHsv(r, g, b);
  if (s < CONFIG.whiteSatMax && v > CONFIG.whiteValMin) return 'W';
  const H = CONFIG.hue;
  if (h < H.redHi || h >= 330) return 'R';
  if (h < H.orange) return 'O';
  if (h < H.yellow) return 'Y';
  if (h < H.green) return 'G';
  if (h < H.blue) return 'B';
  return 'R';
}

// 在 rgba 帧的中央引导区采样 3x3，返回每格 {i,r,g,b,color,h,s,v}
export function sampleFace(rgba, width, height, cfg) {
  const C = { ...CONFIG, ...(cfg || {}) };
  const side = Math.min(width, height) * C.regionFrac;
  const x0 = (width - side) / 2;
  const y0 = (height - side) / 2;
  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = Math.round(x0 + (side * (col + 0.5)) / 3);
      const cy = Math.round(y0 + (side * (row + 0.5)) / 3);
      let sr = 0, sg = 0, sb = 0, n = 0;
      for (let dy = -C.patch; dy <= C.patch; dy++) {
        for (let dx = -C.patch; dx <= C.patch; dx++) {
          const px = cx + dx, py = cy + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const idx = (py * width + px) * 4;
          sr += rgba[idx]; sg += rgba[idx + 1]; sb += rgba[idx + 2]; n++;
        }
      }
      const r = Math.round(sr / n), g = Math.round(sg / n), b = Math.round(sb / n);
      const hsv = rgbToHsv(r, g, b);
      cells.push({
        i: row * 3 + col,
        r, g, b,
        color: classifyColor(r, g, b),
        h: Math.round(hsv.h), s: +hsv.s.toFixed(2), v: +hsv.v.toFixed(2),
      });
    }
  }
  return { cells, region: { x0, y0, side } };
}
