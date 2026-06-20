<script type="application/json" def>
{
  "navigationBarTitleText": "扫描魔方"
}
</script>

<script setup>
import wx from 'wx';
import { decodeWebP } from '../../lib/webp.js';
import { decodePng, isPng } from '../../lib/png.js';
import { decodeJpeg, isJpeg } from '../../lib/jpeg.js';
import { sampleFace, downsample, classifyByAnchorsHue, regionPx, locateFace } from '../../lib/colors.js';
import { FACE_TO_COLOR, FACE_NAME_CN, COLOR_NAME_CN, nextColor } from '../../lib/cube.js';
import { loadTestFrame } from '../../lib/testImages.js';

const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
const SLIDE_COOLDOWN = 250; // 真机滑动太灵敏：冷却时间内的重复滑动只算一次
const HOLD = {
  U: '白色面朝上，俯视拍',
  R: '红色面对镜头',
  F: '绿色面对镜头',
  D: '黄色面朝上，仰视拍',
  L: '橙色面对镜头',
  B: '蓝色面对镜头',
};

function emptyGuide() {
  return Array.from({ length: 9 }, (_, i) => ({ i, letter: '', foc: false }));
}
function magicHex(b) {
  return [b[0], b[1], b[2], b[3]].map((x) => (x || 0).toString(16).padStart(2, '0')).join(' ');
}
async function decodeFrame(photo) {
  const b = new Uint8Array(photo.data);
  const mt = String(photo.mimeType || '').toLowerCase();
  const isWebp = mt.includes('webp') || (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46);
  if (isWebp) return await decodeWebP(photo.data);
  if (isPng(b)) return decodePng(b);
  if (isJpeg(b)) return decodeJpeg(b);
  throw new Error('未知格式 mimeType=' + (mt || '?') + ' magic=' + magicHex(b));
}

export default {
  data: {
    faceIdx: 0,
    faceName: '',
    holdHint: '',
    statusText: '',
    debug: '',
    errorText: '',
    guideCells: emptyGuide(),
    actions: [],
    lastKey: '',
    inReview: false,
    camReady: false,
  },

  onLoad() {
    this.detectedCells = {}; // 每面 9 格的 {r,g,b,color,manual}，finalize 时按锚色统一识别
    this.lastCells = null;
    this.mode = 'aim';
    this.focusIndex = 0;
    this.refreshFace();
  },

  onReady() {
    // 最佳实践：相机视图就绪(onReady)后再创建 context；预览由 <camera> 元素自动渲染
    this.cam = wx.media.createCameraContext();
    this._camInitAt = 0;
  },

  onShow() {
    if (!this.cam) this.cam = wx.media.createCameraContext();
  },

  onHide() {
    this.cam = null;
    this.setData({ camReady: false });
  },

  // 相机初始化完成(bindinitdone)：标记就绪 + 记录时间(用于预热门控)
  onCamReady(e) {
    this._camInitAt = this._now();
    this.setData({ camReady: true, statusText: this.data.statusText });
  },
  onCamError(e) {
    this.setData({ camReady: false, errorText: '相机不可用(权限/初始化失败)' });
  },

  // 当前模式下可选项列表
  items() {
    if (this.mode === 'review') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 'accept', 'retake'];
    // aim
    return this.data.faceIdx > 0 ? ['capture', 'test', 'prev', 'exit'] : ['capture', 'test', 'exit'];
  },

  render() {
    const items = this.items();
    const inReview = this.mode === 'review';
    let guideCells;
    if (inReview && this.lastCells) {
      guideCells = this.lastCells.map((c, idx) => ({ i: c.i, letter: COLOR_NAME_CN[c.color] || c.color, foc: this.focusIndex === idx }));
    } else {
      guideCells = emptyGuide();
    }
    // 动作按钮
    let actions = [];
    if (inReview) {
      actions = [
        { id: 'accept', label: '接受本面', foc: items[this.focusIndex] === 'accept' },
        { id: 'retake', label: '重拍', foc: items[this.focusIndex] === 'retake' },
      ];
    } else {
      actions = items.map((id) => ({
        id,
        label: id === 'capture' ? '拍照' : id === 'test' ? '测试图片' : id === 'prev' ? '上一面' : '退出',
        foc: items[this.focusIndex] === id,
      }));
    }
    this.setData({ guideCells, actions, inReview });
  },

  // 复核：裁剪到「采样框 + 周围 25% 一圈」放大到 240×240。
  // 取 margin=0.25×框边 → 框正好落在画布中央 2/3（与 .guide 绿网格对齐）。
  drawReview() {
    if (!this.lastFrame) return;
    const ctx = wx.createCanvasContext('review');
    if (!ctx) return;
    const { rgba, width, height } = this.lastFrame;
    const box = this.lastLoc || regionPx(width, height);
    const m = Math.round(box.side * 0.25);
    let cs = box.side + 2 * m;
    let cx0 = box.x0 - m, cy0 = box.y0 - m;
    cs = Math.min(cs, width, height);
    cx0 = Math.max(0, Math.min(width - cs, cx0));
    cy0 = Math.max(0, Math.min(height - cs, cy0));
    const region = { x0: cx0, y0: cy0, sw: cs, sh: cs };
    const N = 72, B = 240 / N;
    const ds = downsample(rgba, width, height, N, region);
    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        const c = ds.cells[row * N + col];
        ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.fillRect(col * B, row * B, B + 1, B + 1);
      }
    }
    if (ctx.flush) ctx.flush();
  },

  refreshFace() {
    this.mode = 'aim';
    this.focusIndex = 0;
    this.lastCells = null;
    this.lastFrame = null;
    const f = FACES[this.data.faceIdx];
    this.setData({
      faceName: FACE_NAME_CN[f],
      holdHint: HOLD[f],
      statusText: `第 ${this.data.faceIdx + 1}/6 面：举魔方对镜头 →「拍照」`,
      debug: '',
      errorText: '',
    });
    this.render();
  },

  async doCapture(source, label) {
    if (this.mode !== 'aim') return;
    this.mode = 'busy';
    this.setData({ statusText: label + '识别中…（设备处理可能较慢，请稍候）', errorText: '' });
    try {
      const photo = await source();
      const { width, height, rgba } = await decodeFrame(photo);
      const loc = locateFace(rgba, width, height, { yMin: 0.40 }); // 自动检测魔方面(避开上方屏幕)
      const region = loc ? { x0: loc.x0, y0: loc.y0, side: loc.side } : regionPx(width, height);
      const { cells } = sampleFace(rgba, width, height, null, region);
      this.lastCells = cells;
      this.lastFrame = { rgba, width, height };
      this.lastRegion = region;
      this.lastLoc = loc;
      this.mode = 'review';
      this._reviewLockUntil = this._now() + 1500; // 复核锁：拍照后 1.5s 内忽略"接受/改色"，防单次确认连带跳过复核
      this.focusIndex = 9; // 默认焦点在「接受本面」
      const c = cells[4];
      console.log('[scan] loc=' + JSON.stringify(loc) + ' center=' + c.r + ',' + c.g + ',' + c.b);
      this.setData({
        debug: '',
        statusText: '看框有没有套住魔方',
        errorText: '',
      });
      this.render();
      setTimeout(() => this.drawReview(), 80); // 等画布渲染出来再画缩略图
    } catch (e) {
      this.mode = 'aim';
      console.error('[scan] capture failed:', e && (e.message || e));
      this.setData({ statusText: '对准引导框，单击「拍照」或「测试图片」', errorText: '失败：' + (e && (e.message || e)) });
      this.render();
    }
  },

  captureCam() {
    this.doCapture(async () => {
      if (!this.cam) this.cam = wx.media.createCameraContext();
      if (!this.cam) throw new Error('相机不可用');
      return this.cam.takePhoto({ quality: 'high' });
    }, '拍照');
  },

  captureTest() {
    this.doCapture(() => loadTestFrame(FACES[this.data.faceIdx]), '测试图片');
  },

  cycleCell(i) {
    if (!this.lastCells) return;
    this.lastCells[i].color = nextColor(this.lastCells[i].color);
    this.lastCells[i].manual = true; // 手动改过的格子，finalize 时不被锚色覆盖
    this.render();
  },

  acceptNext() {
    if (this.mode !== 'review' || !this.lastCells) return;
    const f = FACES[this.data.faceIdx];
    this.detectedCells[f] = this.lastCells.map((c) => ({ r: c.r, g: c.g, b: c.b, color: c.color, manual: !!c.manual }));
    if (this.data.faceIdx < 5) {
      this.setData({ faceIdx: this.data.faceIdx + 1 });
      this.refreshFace();
    } else {
      this.finalize();
    }
  },

  prevFace() {
    if (this.data.faceIdx > 0) {
      this.setData({ faceIdx: this.data.faceIdx - 1 });
      this.refreshFace();
    }
  },

  finalize() {
    // 相对识别：6 个中心块作锚色，非中心非手动格按最近锚色统一归类
    const anchors = [];
    for (const f of FACES) {
      const c = this.detectedCells[f] && this.detectedCells[f][4];
      if (c) anchors.push({ color: FACE_TO_COLOR[f], r: c.r, g: c.g, b: c.b });
    }
    const useAnchors = anchors.length === 6;
    const grid = {};
    for (const f of FACES) {
      const cells = this.detectedCells[f] || [];
      const arr = [];
      for (let i = 0; i < 9; i++) {
        if (i === 4) { arr.push(FACE_TO_COLOR[f]); continue; } // 中心强制身份色
        const c = cells[i];
        if (!c) { arr.push(''); continue; }
        arr.push(c.manual || !useAnchors ? c.color : classifyByAnchorsHue(c, anchors));
      }
      grid[f] = arr;
    }
    try {
      wx.setStorageSync('cube.scannedGrid', grid);
    } catch (e) {
      console.error('[scan] store failed:', e && (e.message || e));
    }
    console.log('[scan] finalize, navigating back');
    wx.navigateBack();
  },

  _now() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  },

  activate() {
    const item = this.items()[this.focusIndex];
    if (this.mode === 'review') {
      if (this._now() < (this._reviewLockUntil || 0)) return; // 复核锁未到期：忽略本次确认（防拍照同一确认连带接受）
      if (typeof item === 'number') this.cycleCell(item);
      else if (item === 'accept') this.acceptNext();
      else if (item === 'retake') this.refreshFace();
    } else if (this.mode === 'aim') {
      if (item === 'capture') this.captureCam();
      else if (item === 'test') this.captureTest();
      else if (item === 'prev') this.prevFace();
      else if (item === 'exit') wx.navigateBack();
    }
  },

  focusNext() {
    const n = this.items().length;
    this.focusIndex = Math.min(n - 1, this.focusIndex + 1);
    this.render();
  },
  focusPrev() {
    this.focusIndex = Math.max(0, this.focusIndex - 1);
    this.render();
  },

  onKeyDown(event) {
    const code = event && event.code;
    this.setData({ lastKey: code || '' });
    if (this.mode === 'busy') return;
    const isSlide = code === 'ArrowDown' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowLeft';
    if (isSlide && this.throttleSlide()) return; // 滑动节流：一次滑动只走一格
    if (code === 'ArrowDown' || code === 'ArrowRight') this.focusNext();
    else if (code === 'ArrowUp' || code === 'ArrowLeft') this.focusPrev();
    else if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') this.activate();
    else if (code === 'Backspace') wx.navigateBack();
  },

  throttleSlide() {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (now - (this._lastSlide || 0) < SLIDE_COOLDOWN) return true;
    this._lastSlide = now;
    return false;
  },

  onActionTap(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.items();
    const idx = items.indexOf(id) >= 0 ? items.indexOf(id) : items.indexOf(Number(id));
    if (idx >= 0) { this.focusIndex = idx; this.render(); this.activate(); }
  },
  onCellTap(e) {
    if (this.mode !== 'review') return;
    const i = Number(e.currentTarget.dataset.i);
    this.focusIndex = i; this.render(); this.activate();
  },
};
</script>

<page>
  <view class="root">
    <view class="head">
      <text class="title">扫描：{{ faceName }}（{{ holdHint }}）</text>
      <text class="status">{{ statusText }}</text>
    </view>

    <view class="wrap">
      <camera class="cam" mode="normal" resolution="high" ink:if="{{ !inReview }}" bindinitdone="onCamReady" binderror="onCamError" bindstop="onCamError"></camera>
      <canvas id="review" class="cam" width="240" height="240" ink:if="{{ inReview }}"></canvas>
      <view class="guide">
        <view class="gcell {{item.foc?'foc':''}}" ink:for="{{guideCells}}" ink:key="i" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.letter }}</text></view>
      </view>
    </view>
    <text class="camhint" ink:if="{{ !inReview }}">拍照后这里显示「框+周围」放大图，核对框有没有套住魔方</text>

    <view class="acts">
      <view class="act {{item.foc?'foc':''}}" ink:for="{{actions}}" ink:key="id" data-id="{{item.id}}" bindtap="onActionTap">{{ item.label }}</view>
    </view>

    <text class="debug" ink:if="{{ debug }}">{{ debug }}</text>
    <text class="err" ink:if="{{ errorText }}">{{ errorText }}</text>
  </view>
</page>

<style>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 480px;
  padding: 6px 10px;
  box-sizing: border-box;
  background-color: #000;
  color: #40ff5e;
  gap: 4px;
}
.head { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.title { font-size: 14px; font-weight: bold; }
.status { font-size: 16px; font-weight: bold; color: #40ff5e; text-align: center; }
/* 复核时画布裁到「框+25%一圈」，框正好=画布中央 2/3，与下面绿网格对齐 */
.wrap { position: relative; width: 240px; height: 240px; background-color: transparent; }
.cam {
  width: 240px; height: 240px;
  border-radius: 8px; overflow: hidden;
  background-color: transparent; /* 不要盖住原生相机层 */
}
.guide {
  position: absolute; top: 40px; left: 40px; width: 160px; height: 160px;
  border: 2px solid #40ff5e;
  display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr;
}
.gcell {
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(64, 255, 94, 0.9);
  font-size: 22px; font-weight: bold; color: #40ff5e;
}
.gcell.foc { background-color: rgba(64, 255, 94, 0.85); color: #000; border: 2px solid #40ff5e; }
.camhint { font-size: 10px; color: rgba(64, 255, 94, 0.7); text-align: center; }
.acts { display: flex; flex-direction: row; flex-wrap: wrap; gap: 6px; justify-content: center; }
.act {
  padding: 5px 10px; border: 2px solid #40ff5e; border-radius: 10px;
  color: #40ff5e; font-size: 12px;
}
.act.foc { background-color: #40ff5e; color: #000; font-weight: bold; }
.debug { font-size: 10px; color: rgba(64, 255, 94, 0.7); text-align: center; }
.err { font-size: 11px; color: #ffd6e7; text-align: center; }
.dbg { font-size: 10px; color: rgba(64, 255, 94, 0.45); }
</style>
