// 魔方颜色模型 / RCS 映射 / 校验（纯逻辑，无重计算）
// 标准西方配色：白顶 黄底 绿前 蓝后 橙左 红右
// 求解器 rubiks-cube-solver 默认朝向(front=绿, up=白, right=红) 与本配色一致。

// 网格里存的颜色字母
export const COLORS = ['W', 'Y', 'R', 'O', 'G', 'B'];

// 颜色字母 -> 面字母（U/R/F/D/L/B）
export const COLOR_TO_FACE = { W: 'U', Y: 'D', R: 'R', O: 'L', G: 'F', B: 'B' };
export const FACE_TO_COLOR = { U: 'W', D: 'Y', R: 'R', L: 'O', F: 'G', B: 'B' };

// 面字母 -> 中文名
export const FACE_NAME_CN = { U: '顶面', D: '底面', F: '前面', B: '后面', L: '左面', R: '右面' };
// 颜色字母 -> 中文色名
export const COLOR_NAME_CN = { W: '白', Y: '黄', R: '红', O: '橙', G: '绿', B: '蓝' };

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

// 已还原态网格：每面 9 格 = 该面中心色
export function solvedGrid() {
  const grid = {};
  for (const f of FACE_ORDER) grid[f] = new Array(9).fill(FACE_TO_COLOR[f]);
  return grid;
}

// 颜色网格 -> rubiks-cube-solver 输入串（旧 CFOP 求解器用，保留兼容）
// faces 顺序 front,right,up,down,left,back；每面行优先；字符=小写面字母
export function gridToRcs(grid) {
  return ['F', 'R', 'U', 'D', 'L', 'B']
    .map((f) => grid[f].map((c) => (COLOR_TO_FACE[c] || '?').toLowerCase()).join(''))
    .join('');
}

// 颜色网格 -> min2phase facelet 串：顺序 U R F D L B，每面行优先(0..8)，字符=面字母(大写)
// 已还原态 -> "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
export function gridToFacelet(grid) {
  return ['U', 'R', 'F', 'D', 'L', 'B']
    .map((f) => grid[f].map((c) => COLOR_TO_FACE[c] || '?').join(''))
    .join('');
}

// min2phase facelet 串 -> 颜色网格（gridToFacelet 的逆；用于测试/导入）
export function faceletToGrid(s) {
  const grid = {};
  ['U', 'R', 'F', 'D', 'L', 'B'].forEach((f, k) => {
    grid[f] = s.slice(k * 9, k * 9 + 9).split('').map((ch) => FACE_TO_COLOR[ch] || '');
  });
  return grid;
}

// 下一个颜色（点击循环切色）
export function nextColor(c) {
  const i = COLORS.indexOf(c);
  return COLORS[(i + 1 + COLORS.length) % COLORS.length] || COLORS[0];
}

// 合法性校验：返回错误信息数组（空=合法）
export function validate(grid) {
  const errs = [];
  for (const f of FACE_ORDER) {
    if (grid[f][4] !== FACE_TO_COLOR[f]) {
      errs.push(`${FACE_NAME_CN[f]}中心应为${COLOR_NAME_CN[FACE_TO_COLOR[f]]}`);
    }
  }
  for (const f of FACE_ORDER) {
    if (grid[f].some((c) => !c)) errs.push(`${FACE_NAME_CN[f]}有未填格`);
  }
  const cnt = {};
  COLORS.forEach((c) => (cnt[c] = 0));
  for (const f of FACE_ORDER) grid[f].forEach((c) => { if (c) cnt[c]++; });
  COLORS.forEach((c) => {
    if (cnt[c] !== 9) errs.push(`${COLOR_NAME_CN[c]}色有 ${cnt[c]} 个(应为9)`);
  });
  return errs;
}

// 烘焙的测试打乱网格（离线用 Kociemba 生成的合法可解状态，已交叉验证）
export const SCRAMBLE_GRID = {
  U: ['G', 'W', 'W', 'W', 'W', 'G', 'B', 'R', 'R'],
  R: ['B', 'W', 'R', 'R', 'R', 'O', 'R', 'R', 'O'],
  F: ['W', 'Y', 'Y', 'G', 'G', 'G', 'G', 'G', 'G'],
  D: ['Y', 'Y', 'Y', 'Y', 'Y', 'B', 'Y', 'Y', 'G'],
  L: ['W', 'B', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  B: ['B', 'R', 'R', 'W', 'B', 'B', 'W', 'B', 'B'],
};

// 多个测试打乱态（由 min2phase 生成的合法可解状态，由易到难）；「载入测试打乱」循环切换以测多种情形。
// 注释为该态最优解步数。生成脚本 tools/gen-scrambles.mjs。
export const SCRAMBLE_GRIDS = [
  { U: ['O', 'W', 'O', 'B', 'W', 'G', 'B', 'W', 'G'], R: ['R', 'R', 'B', 'R', 'R', 'B', 'R', 'R', 'G'], F: ['W', 'G', 'Y', 'W', 'G', 'Y', 'W', 'R', 'Y'], D: ['G', 'W', 'B', 'G', 'Y', 'B', 'R', 'Y', 'R'], L: ['G', 'O', 'O', 'G', 'O', 'O', 'B', 'O', 'O'], B: ['Y', 'B', 'Y', 'Y', 'B', 'Y', 'W', 'O', 'W'] }, // 4 步
  { U: ['Y', 'Y', 'Y', 'W', 'W', 'Y', 'G', 'G', 'R'], R: ['W', 'O', 'B', 'R', 'R', 'R', 'G', 'G', 'B'], F: ['O', 'O', 'B', 'W', 'G', 'B', 'Y', 'G', 'R'], D: ['O', 'Y', 'W', 'B', 'Y', 'W', 'B', 'Y', 'Y'], L: ['G', 'R', 'W', 'O', 'O', 'B', 'O', 'O', 'G'], B: ['R', 'R', 'R', 'G', 'B', 'W', 'O', 'B', 'W'] }, // 5 步
  { U: ['O', 'O', 'G', 'Y', 'W', 'Y', 'B', 'G', 'G'], R: ['Y', 'B', 'Y', 'R', 'R', 'W', 'B', 'O', 'Y'], F: ['O', 'R', 'O', 'B', 'G', 'W', 'W', 'G', 'O'], D: ['R', 'W', 'W', 'W', 'Y', 'B', 'W', 'O', 'B'], L: ['W', 'G', 'Y', 'Y', 'O', 'R', 'R', 'O', 'G'], B: ['R', 'G', 'G', 'B', 'B', 'R', 'R', 'Y', 'B'] }, // 20 步
  { U: ['W', 'R', 'Y', 'B', 'W', 'G', 'O', 'O', 'W'], R: ['O', 'W', 'G', 'B', 'R', 'G', 'Y', 'Y', 'R'], F: ['Y', 'G', 'B', 'B', 'G', 'Y', 'G', 'W', 'R'], D: ['W', 'O', 'G', 'W', 'Y', 'O', 'B', 'B', 'B'], L: ['G', 'R', 'B', 'Y', 'O', 'W', 'R', 'R', 'R'], B: ['O', 'Y', 'O', 'R', 'B', 'G', 'W', 'O', 'Y'] }, // 21 步
  { U: ['R', 'O', 'O', 'O', 'W', 'R', 'O', 'G', 'Y'], R: ['G', 'W', 'B', 'Y', 'R', 'Y', 'G', 'G', 'B'], F: ['W', 'R', 'R', 'O', 'G', 'O', 'B', 'B', 'R'], D: ['Y', 'R', 'W', 'Y', 'Y', 'Y', 'G', 'W', 'O'], L: ['W', 'W', 'G', 'W', 'O', 'G', 'O', 'B', 'R'], B: ['Y', 'B', 'B', 'R', 'B', 'G', 'W', 'B', 'Y'] }, // 21 步
  { U: ['G', 'Y', 'O', 'B', 'W', 'B', 'B', 'R', 'B'], R: ['O', 'W', 'Y', 'B', 'R', 'R', 'R', 'R', 'Y'], F: ['W', 'Y', 'Y', 'Y', 'G', 'Y', 'O', 'G', 'W'], D: ['W', 'W', 'G', 'G', 'Y', 'W', 'W', 'O', 'B'], L: ['R', 'O', 'O', 'W', 'O', 'O', 'R', 'R', 'G'], B: ['G', 'G', 'Y', 'B', 'B', 'O', 'R', 'G', 'B'] }, // 21 步
];

// 深拷贝（避免引用共享被原地修改）
export function cloneGrid(grid) {
  const g = {};
  for (const f of FACE_ORDER) g[f] = grid[f].slice();
  return g;
}
