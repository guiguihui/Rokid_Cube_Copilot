// 求解器封装：Kociemba 两阶段近最优解（min2phase, cs0x7f/cstimer 源）。
// ~20 步、稳态 <1ms/次；剪枝表在首次 solve 时一次性建好（端侧约 1–4s，配「初始化中…」提示），
// 之后即时响应。已弃用 CFOP(rubiks-cube-solver, 50–130 步) 与 cubejs(运行时建表冻屏)。
import min2phase from './vendor/min2phase.js';
import { gridToFacelet, SCRAMBLE_GRID, SCRAMBLE_GRIDS, cloneGrid } from './cube.js';

// 颜色网格 -> 还原走步串（标准记法 "U R2 F' ..."）。非法/不可解状态抛错。
export function solve(grid) {
  const raw = min2phase.solve(gridToFacelet(grid));
  if (/error/i.test(raw)) throw new Error('状态不可解：' + String(raw).trim());
  return String(raw).trim().replace(/\s+/g, ' '); // min2phase 输出含多余空格，归一化
}

// 测试打乱网格：每次调用循环取下一个（共 SCRAMBLE_GRIDS.length 个，由易到难），便于测多种情形
let _scrIdx = 0;
export function scrambledGrid() {
  const g = SCRAMBLE_GRIDS[_scrIdx % SCRAMBLE_GRIDS.length];
  _scrIdx += 1;
  return cloneGrid(g);
}

// 预热：一次性建好 min2phase 剪枝表（~1–4s 同步），之后求解秒出。幂等（_warmed 防重）。
// 在首页首屏画完后延迟调用，把建表卡顿挪到用户看首页/扫描的空档。
const _SOLVED_FACELET = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
let _warmed = false;
export function warmup() {
  if (_warmed) return false;
  try {
    min2phase.solve(_SOLVED_FACELET);          // 建 move 表 + 部分剪枝表
    if (min2phase.initFull) min2phase.initFull(); // 建满剪枝表，消除求解中途的惰性建表卡顿
    _warmed = true;
    return true;
  } catch (e) {
    console.error('[solver] warmup failed:', e && (e.message || e));
    return false;
  }
}
export function isWarmed() { return _warmed; }

// dev 自检：测试打乱应得非空、≤25 步的合法解
export function selfTest() {
  const sol = solve(SCRAMBLE_GRID);
  const n = sol.split(/\s+/).filter(Boolean).length;
  const ok = n > 0 && n <= 25;
  console.log('[selfTest]', ok ? 'PASS' : 'FAIL', '| steps=', n, '| sol=', sol);
  return ok;
}
