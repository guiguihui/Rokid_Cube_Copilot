// T1.4a TDD：颜色网格 → min2phase facelet → 求解 的接线正确性。
// 跑：node --test tests/solver.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { solvedGrid, SCRAMBLE_GRID, SCRAMBLE_GRIDS, gridToFacelet, faceletToGrid, validate } from '../lib/cube.js';
import { solve, warmup, isWarmed } from '../lib/solver.js';
import min2phase from '../lib/vendor/min2phase.js';

const SOLVED = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
const FACES = ['U', 'R', 'F', 'D', 'L', 'B'], SUF = ['', "'", '2'];
const moveCount = (s) => (s && s.trim() ? s.trim().split(/\s+/).length : 0);
function randScramble(n) { const o = []; let p = -1; for (let i = 0; i < n; i++) { let f; do { f = Math.floor(Math.random() * 6); } while (f === p); p = f; o.push(FACES[f] + SUF[Math.floor(Math.random() * 3)]); } return o.join(' '); }
function gridEq(a, b) { return FACES.every((f) => a[f].length === b[f].length && a[f].every((c, i) => c === b[f][i])); }

test('① gridToFacelet(solvedGrid()) === 标准已还原 facelet', () => {
  assert.equal(gridToFacelet(solvedGrid()), SOLVED);
});

test('② faceletToGrid(SOLVED) 深等于 solvedGrid()', () => {
  assert.ok(gridEq(faceletToGrid(SOLVED), solvedGrid()));
});

test('③ grid↔facelet 互逆 + solve(grid)==min2phase.solve(facelet)（50 随机态，≤25 步）', () => {
  for (let i = 0; i < 50; i++) {
    const F = min2phase.fromScramble(randScramble(25));
    const grid = faceletToGrid(F);
    assert.equal(gridToFacelet(grid), F, 'grid↔facelet 不互逆（朝向/行序错）');
    const sol = solve(grid);
    const direct = String(min2phase.solve(F)).trim().replace(/\s+/g, ' ');
    assert.equal(sol, direct, '接线后的解与直接 min2phase 不一致');
    assert.ok(moveCount(sol) <= 25, `解过长(${moveCount(sol)})：${sol}`);
  }
});

test('④ solve(solvedGrid()) = 0 步', () => {
  assert.equal(moveCount(solve(solvedGrid())), 0);
});

test('⑤ solve(SCRAMBLE_GRID) 合法可解、1..25 步', () => {
  const sol = solve(SCRAMBLE_GRID);
  assert.ok(!/error/i.test(sol), `SCRAMBLE_GRID 不可解：${sol}`);
  assert.ok(moveCount(sol) >= 1 && moveCount(sol) <= 25, `步数异常：${moveCount(sol)}`);
});

test('⑥ 输出只含 [UDLRFB] + 可选 \'/2，无 "prime"、无多余空白', () => {
  const sol = solve(SCRAMBLE_GRID);
  assert.ok(!/prime/i.test(sol), '不应出现 prime');
  for (const tok of sol.split(/\s+/).filter(Boolean)) assert.match(tok, /^[UDLRFB](['2])?$/, `非法记号：${tok}`);
});

test('⑧ warmup 幂等 + 预热后求解仍正确', () => {
  assert.equal(isWarmed(), false, '初始未预热');
  assert.equal(warmup(), true, '首次预热应返回 true');
  assert.equal(warmup(), false, '已预热应返回 false（幂等）');
  assert.equal(isWarmed(), true);
  assert.equal(moveCount(solve(solvedGrid())), 0, '预热后求解仍正确');
});

test('⑦ SCRAMBLE_GRIDS 每个都合法且可解（1..25 步）', () => {
  assert.ok(SCRAMBLE_GRIDS.length >= 6, '测试打乱态应有多个');
  SCRAMBLE_GRIDS.forEach((g, i) => {
    assert.deepEqual(validate(g), [], `第 ${i} 个态不合法：${validate(g).join('；')}`);
    const sol = solve(g);
    assert.ok(!/error/i.test(sol), `第 ${i} 个态不可解`);
    assert.ok(moveCount(sol) >= 1 && moveCount(sol) <= 25, `第 ${i} 个态步数异常：${moveCount(sol)}`);
  });
});
