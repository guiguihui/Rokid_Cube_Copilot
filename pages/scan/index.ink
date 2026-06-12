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
import { sampleFace } from '../../lib/colors.js';
import { FACE_TO_COLOR, FACE_NAME_CN, nextColor } from '../../lib/cube.js';
import { loadTestFrame } from '../../lib/testImages.js';

const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
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
  },

  onLoad() {
    this.detected = {};
    this.lastCells = null;
    this.mode = 'aim';
    this.focusIndex = 0;
    this.refreshFace();
  },

  onShow() {
    this.cam = wx.media.createCameraContext();
  },

  onHide() {
    this.cam = null;
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
      guideCells = this.lastCells.map((c, idx) => ({ i: c.i, letter: c.color, foc: this.focusIndex === idx }));
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
    this.setData({ guideCells, actions });
  },

  refreshFace() {
    this.mode = 'aim';
    this.focusIndex = 0;
    this.lastCells = null;
    const f = FACES[this.data.faceIdx];
    this.setData({
      faceName: FACE_NAME_CN[f],
      holdHint: HOLD[f],
      statusText: `第 ${this.data.faceIdx + 1}/6 面：把这一面对齐填满九宫格 →「拍照」(或「测试图片」)`,
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
      const { cells } = sampleFace(rgba, width, height);
      this.lastCells = cells;
      this.mode = 'review';
      this.focusIndex = 9; // 默认焦点在「接受本面」
      const c = cells[4];
      this.setData({
        debug: `${photo.mimeType || 'img'} ${width}x${height} · 中心RGB(${c.r},${c.g},${c.b})`,
        statusText: '向前/向后选格，单击改色；选「接受本面」进入下一面',
        errorText: '',
      });
      this.render();
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
    this.render();
  },

  acceptNext() {
    if (this.mode !== 'review' || !this.lastCells) return;
    const f = FACES[this.data.faceIdx];
    this.detected[f] = this.lastCells.map((c) => c.color);
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
    const grid = {};
    for (const f of FACES) {
      const arr = (this.detected[f] || []).slice();
      while (arr.length < 9) arr.push('');
      arr[4] = FACE_TO_COLOR[f];
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

  activate() {
    const item = this.items()[this.focusIndex];
    if (this.mode === 'review') {
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
    if (code === 'ArrowDown' || code === 'ArrowRight') this.focusNext();
    else if (code === 'ArrowUp' || code === 'ArrowLeft') this.focusPrev();
    else if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') this.activate();
    else if (code === 'Backspace') wx.navigateBack();
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
      <camera class="cam"></camera>
      <view class="guide">
        <view class="gcell {{item.foc?'foc':''}}" ink:for="{{guideCells}}" ink:key="i" data-i="{{item.i}}" bindtap="onCellTap"><text>{{ item.letter }}</text></view>
      </view>
    </view>

    <view class="acts">
      <view class="act {{item.foc?'foc':''}}" ink:for="{{actions}}" ink:key="id" data-id="{{item.id}}" bindtap="onActionTap">{{ item.label }}</view>
    </view>

    <text class="debug" ink:if="{{ debug }}">{{ debug }}</text>
    <text class="err" ink:if="{{ errorText }}">{{ errorText }}</text>
    <text class="dbg">上次按键: {{ lastKey }}</text>
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
.status { font-size: 10px; color: rgba(64, 255, 94, 0.6); text-align: center; }
/* 预览正方形(摄像头按 cover 居中裁剪)，九宫格=中央 66%，正好对齐采样区 */
.wrap { position: relative; width: 240px; height: 240px; background-color: transparent; }
.cam {
  width: 240px; height: 240px;
  border-radius: 8px; overflow: hidden;
  background-color: transparent; /* 不要盖住原生相机层 */
}
.guide {
  position: absolute; top: 41px; left: 41px; width: 158px; height: 158px;
  border: 2px solid #40ff5e;
  display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr;
}
.gcell {
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(64, 255, 94, 0.9);
  font-size: 22px; font-weight: bold; color: #40ff5e;
}
.gcell.foc { background-color: rgba(64, 255, 94, 0.85); color: #000; border: 2px solid #40ff5e; }
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
