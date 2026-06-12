// 走步串解析 -> 新手可懂的步骤数组
import { FACE_NAME_CN } from './cube.js';

// 单步：{ face, name, dir:'CW'|'CCW'|'180', dirText, deg, raw }
export function parseMoves(str) {
  if (!str) return [];
  return String(str)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const face = tok[0];
      const mod = tok.slice(1);
      const dir = mod === "'" ? 'CCW' : mod === '2' ? '180' : 'CW';
      const dirText = dir === 'CW' ? '顺时针' : dir === 'CCW' ? '逆时针' : '转180°';
      return {
        face,
        name: FACE_NAME_CN[face] || face,
        dir,
        dirText,
        deg: dir === '180' ? 180 : 90,
        raw: tok,
      };
    });
}

// 单步播报/显示文案，例：「右面 顺时针」/「上面 转180°」
export function stepText(s) {
  if (!s) return '';
  return s.dir === '180' ? `${s.name} 转180°` : `${s.name} ${s.dirText}`;
}
