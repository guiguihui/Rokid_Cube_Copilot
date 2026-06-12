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

// 颜色网格 -> rubiks-cube-solver 输入串
// faces 顺序 front,right,up,down,left,back；每面行优先；字符=小写面字母
export function gridToRcs(grid) {
  return ['F', 'R', 'U', 'D', 'L', 'B']
    .map((f) => grid[f].map((c) => (COLOR_TO_FACE[c] || '?').toLowerCase()).join(''))
    .join('');
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

// 深拷贝（避免引用共享被原地修改）
export function cloneGrid(grid) {
  const g = {};
  for (const f of FACE_ORDER) g[f] = grid[f].slice();
  return g;
}
