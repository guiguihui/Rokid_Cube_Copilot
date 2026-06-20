// 测试图片：绕过摄像头（本机 webcam 颜色不准 / 暂无真机时用）。
// 用法二选一：
//  A) 把 6 张「单面」照片上传到 assets/test/，命名 U.jpg R.jpg F.jpg D.jpg L.jpg B.jpg
//     —— 扫描页选「测试图片」即走 fetch 读取，无需改代码。（推荐）
//  B) 若 Craft 里 fetch 读不到资源，把 base64(或 data:URI) 填进 TEST_DATA 对应面
//     —— 可把图片放到 assets/test/ 后让我帮你烘焙成 base64。

export const TEST_PATHS = {
  U: '/assets/test/U.jpg',
  R: '/assets/test/R.jpg',
  F: '/assets/test/F.jpg',
  D: '/assets/test/D.jpg',
  L: '/assets/test/L.jpg',
  B: '/assets/test/B.jpg',
};

// 内嵌 base64 优先(真机 fetch 不通)；testData.js 由 tools/bake-testdata.mjs 从 testImg/*.png 生成
import { TEST_DATA } from './testData.js';
export { TEST_DATA };

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToBytes(input) {
  const s = String(input).replace(/^data:[^,]*,/, '').replace(/\s/g, '');
  const lookup = new Uint8Array(256);
  for (let i = 0; i < B64.length; i++) lookup[B64.charCodeAt(i)] = i;
  const pad = s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0;
  const out = new Uint8Array(((s.length * 3) >> 2) - pad);
  let p = 0;
  for (let i = 0; i < s.length; i += 4) {
    const n =
      (lookup[s.charCodeAt(i)] << 18) |
      (lookup[s.charCodeAt(i + 1)] << 12) |
      (lookup[s.charCodeAt(i + 2)] << 6) |
      lookup[s.charCodeAt(i + 3)];
    if (p < out.length) out[p++] = (n >> 16) & 255;
    if (p < out.length) out[p++] = (n >> 8) & 255;
    if (p < out.length) out[p++] = n & 255;
  }
  return out;
}

// 返回 {data, mimeType}（与 takePhoto 同形，喂给扫描页 decodeFrame）
export async function loadTestFrame(face) {
  const data = TEST_DATA[face];
  if (data) return { data: base64ToBytes(data), mimeType: '' };
  const path = TEST_PATHS[face];
  if (!path) throw new Error('未配置测试图片: ' + face);
  const res = await fetch(path);
  if (!res || (res.ok === false)) throw new Error('读取失败 ' + path + ' (' + (res && res.status) + ')');
  const buf = await res.arrayBuffer();
  return { data: new Uint8Array(buf), mimeType: '' };
}
