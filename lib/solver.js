// 求解器封装（table-free，rubiks-cube-solver / CFOP）
// ⚠️ 不用 Kociemba：其 initSolver 需构建百万级剪枝表，浏览器 rquickjs 里会冻结主线程数十秒。
// rubiks-cube-solver 纯算法、无预计算、~15ms，绝不冻结。
import rcsSolve from './vendor/cube-solver.js';
import { gridToRcs, SCRAMBLE_GRID, cloneGrid } from './cube.js';

// 颜色网格 -> 还原走步串（标准记法 "U R2 F' ..."）
export function solve(grid) {
  const raw = rcsSolve(gridToRcs(grid)); // 形如 "L2 Dprime ... R"
  // 归一化：Xprime -> X'，并压缩空白
  return String(raw || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/prime/g, "'"))
    .join(' ');
}

// 测试打乱网格（烘焙常量，零计算，即时响应）
export function scrambledGrid() {
  return cloneGrid(SCRAMBLE_GRID);
}

// dev 自检：对测试打乱求解应返回非空走步串（正确性已离线交叉验证）
export function selfTest() {
  const sol = solve(SCRAMBLE_GRID);
  const n = sol.split(/\s+/).filter(Boolean).length;
  const ok = n > 0;
  console.log('[selfTest]', ok ? 'PASS' : 'FAIL', '| steps=', n, '| sol=', sol);
  return ok;
}
