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

// 相对识别：用本魔方自己的 6 个中心块作"锚色"，其余块按最近锚色归类。
// 全程相对（对比 anchors，而非绝对阈值）→ 自适应光照/不同配色魔方。
// anchors: [{color:'W'|'Y'|..., r,g,b}]（6 个中心采样色）。返回颜色字母。
// 距离：色度(去亮度)欧氏 + 轻度亮度项，兼顾色相区分与"白=高亮低饱和"。
function colorDist(a, b) {
  const sa = a.r + a.g + a.b + 1, sb = b.r + b.g + b.b + 1;
  // 色度（亮度归一）——抗明暗变化
  const dr = a.r / sa - b.r / sb, dg = a.g / sa - b.g / sb, db = a.b / sa - b.b / sb;
  const chroma = dr * dr + dg * dg + db * db;
  // 亮度差（帮助分白/黄等同色相不同亮度）——权重小
  const dl = (sa - sb) / 765;
  return chroma + 0.06 * dl * dl;
}
export function classifyByAnchors(rgb, anchors) {
  let best = anchors[0] && anchors[0].color, bd = Infinity;
  for (const a of anchors) {
    const d = colorDist(rgb, a);
    if (d < bd) { bd = d; best = a.color; }
  }
  return best;
}

// 圆周色相相对分类（推荐）：白用相对饱和度门限，彩色按"圆周色相距离"找最近锚。
// 比 classifyByAnchors(色度欧氏)更稳——正确处理红/橙跨 360/0 边界(红≈358°、橙≈10°)。
// anchors: [{color,r,g,b}]（6 个面中心）。真机 6 张实拍验证 54/54。
export function classifyByAnchorsHue(rgb, anchors) {
  if (!anchors || !anchors.length) return classifyColor(rgb.r, rgb.g, rgb.b);
  const ah = anchors.map((a) => rgbToHsv(a.r, a.g, a.b));
  let whiteIdx = 0, whiteS = Infinity, minColoredS = Infinity;
  for (let i = 0; i < ah.length; i++) if (ah[i].s < whiteS) { whiteS = ah[i].s; whiteIdx = i; }
  for (let i = 0; i < ah.length; i++) if (i !== whiteIdx && ah[i].s < minColoredS) minColoredS = ah[i].s;
  const satGate = (whiteS + (isFinite(minColoredS) ? minColoredS : whiteS + 0.5)) / 2;
  const { h, s } = rgbToHsv(rgb.r, rgb.g, rgb.b);
  if (s < satGate) return anchors[whiteIdx].color; // 低饱和 → 白
  let best = anchors[0].color, bd = Infinity;
  for (let i = 0; i < ah.length; i++) {
    if (i === whiteIdx) continue;
    let dh = Math.abs(h - ah[i].h); if (dh > 180) dh = 360 - dh;
    if (dh < bd) { bd = dh; best = anchors[i].color; }
  }
  return best;
}

// 把 rgba 帧降采样为 n×n 色块（每块取源区域均值），用于复核缩略图。
// region 可选 {x0,y0,sw,sh} 只采该子区域（默认整帧）——传入中央正方形即与预览/采样区对齐。
// 每块内最多约 5×5 次采样以控速（rquickjs 友好）。返回 { n, cells:[{r,g,b}×n*n] }（行优先）。
export function downsample(rgba, width, height, n, region) {
  const rx0 = region ? region.x0 : 0, ry0 = region ? region.y0 : 0;
  const rw = region ? region.sw : width, rh = region ? region.sh : height;
  const cells = [];
  for (let by = 0; by < n; by++) {
    for (let bx = 0; bx < n; bx++) {
      const x0 = Math.floor(rx0 + (bx * rw) / n), x1 = Math.floor(rx0 + ((bx + 1) * rw) / n);
      const y0 = Math.floor(ry0 + (by * rh) / n), y1 = Math.floor(ry0 + ((by + 1) * rh) / n);
      const stepX = Math.max(1, Math.floor((x1 - x0) / 5));
      const stepY = Math.max(1, Math.floor((y1 - y0) / 5));
      let sr = 0, sg = 0, sb = 0, cnt = 0;
      for (let y = y0; y < y1; y += stepY) {
        if (y < 0 || y >= height) continue;
        for (let x = x0; x < x1; x += stepX) {
          if (x < 0 || x >= width) continue;
          const i = (y * width + x) * 4;
          sr += rgba[i]; sg += rgba[i + 1]; sb += rgba[i + 2]; cnt++;
        }
      }
      cells.push(cnt ? { r: Math.round(sr / cnt), g: Math.round(sg / cnt), b: Math.round(sb / cnt) } : { r: 0, g: 0, b: 0 });
    }
  }
  return { n, cells };
}

// ★ 识别框的「兜底大小/位置」★（仅当 locateFace 没检测到魔方时才用这个固定框）
//   cx/cy/side = 占帧的比例：cx 横向中心、cy 纵向中心、side 边长(占帧宽)。
//   正常情况识别框大小是 locateFace 自动算的(见下方 locateFace 的 Lmin/Lmax)；这里只是后备。
export const SAMPLE_REGION = { cx: 0.45, cy: 0.55, side: 0.30 };
export function regionPx(width, height, R) {
  const r = R || SAMPLE_REGION;
  const side = Math.round(r.side * width);
  const x0 = Math.max(0, Math.min(width - side, Math.round(r.cx * width - side / 2)));
  const y0 = Math.max(0, Math.min(height - side, Math.round(r.cy * height - side / 2)));
  return { x0, y0, side };
}

// 在帧中定位魔方面：找"高饱和 + 多色相最密集的方形窗口"。
// 思路：魔方面贴纸高饱和，且广角下常露多色相(多面/相邻面)；肤色=单一色相、低多样性，被排除。
// 工作分辨率 W(默认 120) 下做积分图，粗步长搜方窗，回全帧像素框。测不到返回 null（调用方退回固定框）。
const LB_NB = 8; // 色相分箱数
export function locateFace(rgba, width, height, opt) {
  const o = opt || {};
  const W = o.W || 120;
  const H = Math.max(1, Math.round((height / width) * W));
  const sMin = o.sMin != null ? o.sMin : 0.28;
  const vMin = o.vMin != null ? o.vMin : 0.20;
  const N = W * H;
  const mask = new Uint8Array(N);
  const hbin = new Int8Array(N);
  for (let y = 0; y < H; y++) {
    const sy = Math.min(height - 1, Math.floor((y / H) * height));
    for (let x = 0; x < W; x++) {
      const sx = Math.min(width - 1, Math.floor((x / W) * width));
      const i = (sy * width + sx) * 4;
      const hsv = rgbToHsv(rgba[i], rgba[i + 1], rgba[i + 2]);
      const k = y * W + x;
      if (hsv.s > sMin && hsv.v > vMin) { mask[k] = 1; hbin[k] = Math.floor(hsv.h / (360 / LB_NB)) % LB_NB; }
      else hbin[k] = -1;
    }
  }
  const P = W + 1;
  const ii = new Int32Array(P * (H + 1));
  const bii = [];
  for (let b = 0; b < LB_NB; b++) bii.push(new Int32Array(P * (H + 1)));
  for (let y = 1; y <= H; y++) {
    for (let x = 1; x <= W; x++) {
      const k = (y - 1) * W + (x - 1);
      ii[y * P + x] = mask[k] + ii[(y - 1) * P + x] + ii[y * P + x - 1] - ii[(y - 1) * P + x - 1];
      const hb = hbin[k];
      for (let b = 0; b < LB_NB; b++) {
        const add = hb === b ? 1 : 0;
        bii[b][y * P + x] = add + bii[b][(y - 1) * P + x] + bii[b][y * P + x - 1] - bii[b][(y - 1) * P + x - 1];
      }
    }
  }
  const sum = (t, x0, y0, x1, y1) => t[y1 * P + x1] - t[y0 * P + x1] - t[y1 * P + x0] + t[y0 * P + x0];
  let best = null;
  // 只在画面中下部搜：左偏广角下手持魔方落在中下部，上方常是背景/屏幕(干扰)。
  const yMin = Math.floor(H * (o.yMin != null ? o.yMin : 0.28));
  const yMax = Math.floor(H * (o.yMax != null ? o.yMax : 0.97));
  // 位置先验：手持魔方大致落在 (priorX, priorY)
  const priorX = o.priorX != null ? o.priorX : 0.5, priorY = o.priorY != null ? o.priorY : 0.62;
  // ★ 识别框「自动大小」的范围就在这里 ★：只在 0.18W~0.45W 之间搜方框，
  //   挑色相最多、最密集的那个当识别框。改这两个值 = 改自动识别框能取的最小/最大尺寸。
  const Lmin = Math.round(W * (o.Lmin != null ? o.Lmin : 0.18));
  const Lmax = Math.round(W * (o.Lmax != null ? o.Lmax : 0.45));
  const step = 3;
  for (let L = Lmin; L <= Lmax; L += 4) {
    const minBin = L * L * 0.02;
    for (let y = yMin; y + L <= H && y + L <= yMax; y += step) {
      for (let x = 0; x + L <= W; x += step) {
        const fill = sum(ii, x, y, x + L, y + L) / (L * L);
        if (fill < 0.40) continue;
        let bins = 0;
        for (let b = 0; b < LB_NB; b++) if (sum(bii[b], x, y, x + L, y + L) > minBin) bins++;
        if (bins < 4) continue;
        // 评分=色相多样×充满度(不含尺寸奖励→紧贴魔方) × 位置先验
        const cxN = (x + L / 2) / W, cyN = (y + L / 2) / H;
        const dpos = Math.sqrt((cxN - priorX) * (cxN - priorX) + (cyN - priorY) * (cyN - priorY));
        const posW = 1 / (1 + 1.6 * dpos);
        const score = bins * fill * posW;
        if (!best || score > best.score) best = { x, y, L, fill, bins, score };
      }
    }
  }
  if (!best) return null;
  const sx = width / W, sy = height / H, s = (sx + sy) / 2;
  return {
    x0: Math.round(best.x * sx), y0: Math.round(best.y * sy), side: Math.round(best.L * s),
    bins: best.bins, fill: +best.fill.toFixed(2), score: +best.score.toFixed(1),
  };
}

// 稳健格采样：中位数 + 丢弃"又暗又灰"像素(黑色网格线/阴影)，保留暗但高饱和的(蓝)。
const _med = (a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; };
function samplePatch(rgba, width, height, cx, cy, rad) {
  const rs = [], gs = [], bs = [];
  for (let dy = -rad; dy <= rad; dy++) {
    for (let dx = -rad; dx <= rad; dx++) {
      const px = cx + dx, py = cy + dy;
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const i = (py * width + px) * 4;
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      if ((r + g + b) < 120 && (Math.max(r, g, b) - Math.min(r, g, b)) < 25) continue; // 暗且灰=网格线/缝
      rs.push(r); gs.push(g); bs.push(b);
    }
  }
  if (!rs.length) { // 全被滤掉(整格暗)：退回不过滤中位
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const px = cx + dx, py = cy + dy; if (px < 0 || py < 0 || px >= width || py >= height) continue; const i = (py * width + px) * 4; rs.push(rgba[i]); gs.push(rgba[i + 1]); bs.push(rgba[i + 2]); }
  }
  return { r: _med(rs), g: _med(gs), b: _med(bs) };
}

// 九宫格采样点内缩 [0.20,0.50,0.80]：避开斜面角格漂到边缘
const SAMPLE_POS = [0.20, 0.50, 0.80];
export function sampleFace(rgba, width, height, cfg, region) {
  const C = { ...CONFIG, ...(cfg || {}) };
  const { x0, y0, side } = region || regionPx(width, height);
  const rad = Math.max(3, Math.round(side * 0.05));
  const cells = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = Math.round(x0 + side * SAMPLE_POS[col]);
      const cy = Math.round(y0 + side * SAMPLE_POS[row]);
      const { r, g, b } = samplePatch(rgba, width, height, cx, cy, rad);
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
