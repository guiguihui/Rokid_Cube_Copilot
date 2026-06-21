<script type="application/json" def>
{
  "navigationBarTitleText": "魔方还原助手"
}
</script>

<script setup>
import wx from 'wx';
import { solvedGrid, validate, nextColor, COLOR_NAME_CN } from '../../lib/cube.js';
import { solve, scrambledGrid, warmup, isWarmed } from '../../lib/solver.js';

// 硬件只有：向前 / 向后 / 单击 / 双击 -> 单轴线性环形导航
// 焦点序列：0..3 = 4 个按钮；4..57 = 54 个色块(U R F D L B 各 9)
// 环形(到尾绕回头)保证每个按钮/色块都能逐个遍历到、不遗漏
const VERSION = '1.0.42';
const SLIDE_COOLDOWN = 250; // 真机滑动太灵敏：两次滑动间隔小于此(ms)视为同一次，避免一滑跳多格
const BTNS = ['scan', 'scramble', 'reset', 'solve'];
const BTN_LABEL = { scan: '扫描魔方', scramble: '载入测试打乱', reset: '重置', solve: '求解' };
const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B']; // 两行各三面：U R F / D L B
const CELL_BASE = 4;
const NAV_LEN = CELL_BASE + 54; // 58

export default {
  data: {
    focusIndex: 0,
    btns: [],
    cells: {},
    status: 'idle',
    errorText: '',
    hint: '向前/向后 选择，单击 确认/切换颜色（环形遍历，可改任意色块）。',
    lastKey: '',
    version: VERSION,
    warming: false,
  },

  onLoad() {
    this.grid = solvedGrid();
    this.focusIndex = 0;
    this.render();
    this.applyScannedGrid();
    // this.scheduleWarmup(); // 已关闭：进入首页不再预热求解器（用户要求）
  },

  // 首屏画完后延迟预热求解器：建表卡顿挪到用户看首页/扫描时，之后求解秒出
  scheduleWarmup() {
    if (this._warmScheduled || isWarmed()) return;
    this._warmScheduled = true;
    this.setData({ warming: true });
    setTimeout(() => {
      warmup();
      this.setData({ warming: false });
    }, 300);
  },

  onShow() {
    this.applyScannedGrid();
  },

  render() {
    const cells = {};
    for (const f of FACE_ORDER) {
      const fo = FACE_ORDER.indexOf(f);
      cells[f] = this.grid[f].map((color, i) => ({
        i,
        color,
        label: COLOR_NAME_CN[color] || color,
        locked: i === 4,
        foc: CELL_BASE + fo * 9 + i === this.focusIndex,
      }));
    }
    this.setData({
      focusIndex: this.focusIndex,
      cells,
      btns: BTNS.map((id, i) => ({ id, label: BTN_LABEL[id], foc: i === this.focusIndex, primary: id === 'solve' })),
    });
  },

  focusNext() { this.focusIndex = (this.focusIndex + 1) % NAV_LEN; this.render(); },
  focusPrev() { this.focusIndex = (this.focusIndex - 1 + NAV_LEN) % NAV_LEN; this.render(); },

  activate() {
    const idx = this.focusIndex;
    if (idx < CELL_BASE) {
      const id = BTNS[idx];
      if (id === 'scan') this.goScan();
      else if (id === 'scramble') this.loadScramble();
      else if (id === 'reset') this.resetCube();
      else if (id === 'solve') this.doSolve();
      return;
    }
    const k = idx - CELL_BASE;
    const face = FACE_ORDER[Math.floor(k / 9)];
    const i = k % 9;
    if (i === 4) return; // 中心锁定
    this.grid[face][i] = nextColor(this.grid[face][i]);
    this.setData({ status: 'idle', errorText: '' });
    this.render();
  },

  goScan() { wx.navigateTo({ url: '/pages/scan/index' }); },

  loadScramble() {
    this.grid = scrambledGrid();
    this.focusIndex = 3;
    this.setData({ status: 'idle', errorText: '', hint: '已载入测试打乱（再点「载入测试打乱」可换下一个，共 6 个），单击「求解」。' });
    this.render();
  },

  resetCube() {
    this.grid = solvedGrid();
    this.focusIndex = 2;
    this.setData({ status: 'idle', errorText: '', hint: '已重置为还原态。' });
    this.render();
  },

  doSolve() {
    const errs = validate(this.grid);
    if (errs.length) {
      this.setData({ status: 'error', errorText: '不合法：' + errs.join('；') });
      return;
    }
    this.setData({ status: 'solving', errorText: '' });
    // 推迟一帧再求解：让「求解中…」先画出来。min2phase 首次求解要建剪枝表(~1-4s 同步)，
    // 若直接同步调用，提示来不及刷新、看起来像卡死。
    setTimeout(() => {
      try {
        const moves = solve(this.grid);
        if (!moves || !moves.trim()) throw new Error('empty solution');
        wx.setStorageSync('cube.moves', moves);
        this.setData({ status: 'idle' });
        wx.navigateTo({ url: '/pages/guide/index' });
      } catch (err) {
        console.error('[input] solve failed:', err && (err.message || err));
        this.setData({ status: 'error', errorText: '六色数量各9，但此状态无法还原（多半是某些色块识别错位/朝向不符），请逐格核对修正后重试。' });
      }
    }, 60);
  },

  applyScannedGrid() {
    let scanned = null;
    try {
      const raw = wx.getStorageSync('cube.scannedGrid');
      if (raw) scanned = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) { scanned = null; }
    const valid = scanned && scanned.U && scanned.U.length === 9;
    console.log('[input] applyScannedGrid:', valid ? 'loaded' : 'none');
    if (!valid) return false;
    try { wx.removeStorageSync('cube.scannedGrid'); } catch (e) {
      try { wx.setStorageSync('cube.scannedGrid', ''); } catch (e2) {}
    }
    this.grid = scanned;
    this.focusIndex = 3;
    this.setData({ status: 'idle', errorText: '', hint: '已载入扫描结果，逐格核对修正后单击「求解」。' });
    this.render();
    return true;
  },

  onKeyDown(event) {
    const code = event && event.code;
    this.setData({ lastKey: code || '' });
    const isSlide = code === 'ArrowDown' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowLeft';
    if (isSlide && this.throttleSlide()) return; // 滑动节流：一次滑动只走一格
    if (code === 'ArrowDown' || code === 'ArrowRight') this.focusNext();
    else if (code === 'ArrowUp' || code === 'ArrowLeft') this.focusPrev();
    else if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') this.activate();
    else if (code === 'Backspace') wx.exitMiniProgram();
  },

  // 真机滑动灵敏度高，一次物理滑动会连发多个方向事件；用冷却时间把它收敛成一格
  throttleSlide() {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (now - (this._lastSlide || 0) < SLIDE_COOLDOWN) return true;
    this._lastSlide = now;
    return false;
  },

  onBtnTap(e) {
    const i = Number(e.currentTarget.dataset.i);
    if (!isNaN(i)) { this.focusIndex = i; this.render(); this.activate(); }
  },
  onCellTap(e) {
    const ds = e.currentTarget.dataset;
    const fo = FACE_ORDER.indexOf(ds.face);
    this.focusIndex = CELL_BASE + fo * 9 + Number(ds.i);
    this.render();
    this.activate();
  },
};
</script>

<page>
  <view class="root">
    <view class="bar">
      <view class="btn {{item.primary?'primary':''}} {{item.foc?'foc':''}}" ink:for="{{btns}}" ink:key="id" data-i="{{index}}" bindtap="onBtnTap">{{ item.label }}</view>
      <text class="ver">v{{ version }}</text>
    </view>

    <text class="hint">{{ hint }}</text>
    <text class="err" ink:if="{{ status === 'error' }}">{{ errorText }}</text>
    <text class="solving" ink:if="{{ status === 'solving' }}">⏳ 求解中…（首次需初始化求解器，请稍候 1–4 秒）</text>
    <text class="warming" ink:if="{{ warming }}">⏳ 求解器初始化中，稍候即可秒解…</text>

    <view class="cube">
      <view class="face">
        <text class="flabel">顶面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.U}}" ink:key="i" data-face="U" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
      <view class="face">
        <text class="flabel">右面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.R}}" ink:key="i" data-face="R" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
      <view class="face">
        <text class="flabel">前面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.F}}" ink:key="i" data-face="F" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
      <view class="face">
        <text class="flabel">底面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.D}}" ink:key="i" data-face="D" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
      <view class="face">
        <text class="flabel">左面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.L}}" ink:key="i" data-face="L" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
      <view class="face">
        <text class="flabel">后面</text>
        <view class="g3"><view class="cell {{item.locked?'lock':''}} {{item.foc?'foc':''}}" ink:for="{{cells.B}}" ink:key="i" data-face="B" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.label }}</text></view></view>
      </view>
    </view>

    <text class="dbg">焦点 {{ focusIndex }}/57 · 上次按键 {{ lastKey }}</text>
  </view>
</page>

<style>
.root {
  display: flex;
  flex-direction: column;
  width: 480px;
  padding: 8px 12px;
  box-sizing: border-box;
  background-color: #000;
  color: #40ff5e;
  gap: 6px;
  align-items: center;
}
.bar { display: flex; flex-direction: row; align-items: center; gap: 6px; width: 100%; }
.ver { font-size: 12px; color: rgba(64, 255, 94, 0.75); white-space: nowrap; padding-left: 6px; }
.btn {
  flex: 1;
  text-align: center;
  padding: 7px 4px;
  border: 2px solid #40ff5e;
  border-radius: 12px;
  color: #40ff5e;
  font-size: 13px;
}
.btn.primary { background-color: rgba(64, 255, 94, 0.18); font-weight: bold; }
.btn.foc { background-color: #40ff5e; color: #000; font-weight: bold; }
.hint { font-size: 11px; color: rgba(64, 255, 94, 0.6); text-align: center; }
.err { font-size: 13px; color: #ffd6e7; text-align: center; }
.solving { font-size: 13px; color: #40ff5e; }
.warming { font-size: 11px; color: rgba(64, 255, 94, 0.7); text-align: center; }
.cube {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 272px;
  gap: 14px;
  justify-content: center;
}
.face { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.flabel { font-size: 11px; color: rgba(64, 255, 94, 0.6); }
.g3 {
  display: grid;
  grid-template-columns: 24px 24px 24px;
  grid-template-rows: 24px 24px 24px;
  gap: 2px;
}
.cell {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(64, 255, 94, 0.5);
  border-radius: 4px;
  font-size: 12px;
  color: #40ff5e;
}
.cell.lock { color: rgba(64, 255, 94, 0.55); border-color: rgba(64, 255, 94, 0.25); }
.cell.foc { background-color: #40ff5e; color: #000; border: 2px solid #40ff5e; }
.dbg { font-size: 10px; color: rgba(64, 255, 94, 0.45); }
</style>
