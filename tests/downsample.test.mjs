// T2.1 TDD：把拍到的帧降采样成 n×n 色块（缩略图用）。跑：node --test tests/downsample.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { downsample } from '../lib/colors.js';

function makeFrame(w, h, colorFn) {
  const a = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b] = colorFn(x, y, w, h); const i = (y * w + x) * 4;
    a[i] = r; a[i + 1] = g; a[i + 2] = b; a[i + 3] = 255;
  }
  return a;
}

test('① 尺寸 n×n，纯色帧每格≈该色', () => {
  const w = 64, h = 64;
  const f = makeFrame(w, h, () => [10, 20, 30]);
  const ds = downsample(f, w, h, 8);
  assert.equal(ds.n, 8);
  assert.equal(ds.cells.length, 64);
  for (const c of ds.cells) {
    assert.ok(Math.abs(c.r - 10) <= 1 && Math.abs(c.g - 20) <= 1 && Math.abs(c.b - 30) <= 1, `格色偏差大: ${JSON.stringify(c)}`);
  }
});

test('② 左红右蓝按区域均值', () => {
  const w = 64, h = 64;
  const f = makeFrame(w, h, (x) => (x < 32 ? [200, 0, 0] : [0, 0, 200]));
  const ds = downsample(f, w, h, 4); // 4×4
  const at = (r, c) => ds.cells[r * 4 + c];
  assert.ok(at(0, 0).r > 150 && at(0, 0).b < 50, '左上应红');
  assert.ok(at(0, 3).b > 150 && at(0, 3).r < 50, '右上应蓝');
  assert.ok(at(3, 0).r > 150 && at(3, 3).b > 150, '下行同理');
});
