// T1.3a 烟雾/正确性测试：验证 vendored min2phase 能被 ESM import(同 App 模块方式)且求解正确。
// 跑：node --test tests/min2phase.smoke.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import min2phase from '../lib/vendor/min2phase.js';

const SOLVED = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
const SUF = ['', "'", '2'];
const moveCount = (s) => (s && s.trim() ? s.trim().split(/\s+/).length : 0);

function randScramble(n) {
  const out = [];
  let prev = -1;
  for (let i = 0; i < n; i++) {
    let f;
    do { f = Math.floor(Math.random() * 6); } while (f === prev);
    prev = f;
    out.push(FACES[f] + SUF[Math.floor(Math.random() * 3)]);
  }
  return out.join(' ');
}

test('已还原态求解返回 0 步', () => {
  const sol = min2phase.solve(SOLVED);
  assert.equal(moveCount(sol), 0, `应为 0 步，实际 "${sol}"`);
});

test('往返自检：打乱 + 解 = 还原（50 例，步数≤25）', () => {
  for (let i = 0; i < 50; i++) {
    const scr = randScramble(25);
    const F = min2phase.fromScramble(scr);
    const sol = min2phase.solve(F);
    assert.ok(moveCount(sol) <= 25, `解过长(${moveCount(sol)})：${sol}`);
    const back = min2phase.fromScramble(`${scr} ${sol}`);
    assert.equal(back, SOLVED, `未还原。scr=${scr} sol=${sol} back=${back}`);
  }
});
