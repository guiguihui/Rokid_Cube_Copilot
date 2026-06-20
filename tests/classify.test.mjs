// T(W2 识别)：相对锚色分类 vs 绝对阈值，模拟光照偏移下的准确率。跑：node --test tests/classify.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyByAnchors, classifyColor } from '../lib/colors.js';

// 6 个"真"立方体色（中性光下）
const TRUE = {
  W: [248, 248, 245], Y: [255, 210, 0], R: [200, 30, 30],
  O: [255, 120, 20], G: [0, 160, 70], B: [20, 60, 200],
};
const ORDER = ['W', 'Y', 'R', 'O', 'G', 'B'];
const clamp = (x) => Math.max(0, Math.min(255, Math.round(x)));

// 确定性伪随机（不依赖 Math.random，便于复现）
let _s = 12345;
const rnd = () => { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
const jit = (a) => (rnd() * 2 - 1) * a;

// 光照：每通道增益(白平衡) + 整体明暗 + 噪声
function light(rgb, gain, dim, noise) {
  return rgb.map((c, i) => clamp(c * gain[i] * dim + jit(noise)));
}

function trial() {
  const gain = [0.7 + rnd() * 0.6, 0.7 + rnd() * 0.6, 0.7 + rnd() * 0.6];
  const dim = 0.55 + rnd() * 0.55;
  const noise = 12;
  // 锚色 = 6 个中心块（该光照下采样，带少量噪声）
  const anchors = ORDER.map((color) => { const [r, g, b] = light(TRUE[color], gain, dim, noise); return { color, r, g, b }; });
  // 54 块：每色 9 个，同光照+噪声
  let okAnchor = 0, okAbs = 0, n = 0;
  for (const color of ORDER) for (let k = 0; k < 9; k++) {
    const [r, g, b] = light(TRUE[color], gain, dim, noise);
    if (classifyByAnchors({ r, g, b }, anchors) === color) okAnchor++;
    if (classifyColor(r, g, b) === color) okAbs++;
    n++;
  }
  return { anchor: okAnchor / n, abs: okAbs / n };
}

test('相对锚色：多光照下平均准确率高 且 显著优于绝对阈值', () => {
  let sa = 0, sb = 0; const N = 40;
  let worstAnchor = 1;
  for (let i = 0; i < N; i++) { const t = trial(); sa += t.anchor; sb += t.abs; worstAnchor = Math.min(worstAnchor, t.anchor); }
  const avgAnchor = sa / N, avgAbs = sb / N;
  console.log(`[classify] anchor avg=${avgAnchor.toFixed(3)} worst=${worstAnchor.toFixed(3)} | absolute avg=${avgAbs.toFixed(3)}`);
  assert.ok(avgAnchor >= 0.9, `锚色平均准确率应≥0.9，实际 ${avgAnchor.toFixed(3)}`);
  assert.ok(avgAnchor > avgAbs + 0.1, `锚色应明显优于绝对阈值（${avgAnchor.toFixed(3)} vs ${avgAbs.toFixed(3)}）`);
});
