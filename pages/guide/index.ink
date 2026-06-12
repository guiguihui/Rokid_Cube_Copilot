<script type="application/json" def>
{
  "navigationBarTitleText": "分步引导"
}
</script>

<script setup>
import wx from 'wx';
import { parseMoves, stepText } from '../../lib/moves.js';

const GREEN = '#40ff5e';
const DIM = 'rgba(64, 255, 94, 0.6)';

export default {
  data: {
    total: 0,
    idx: 0,
    done: false,
    stepLabel: '',   // 文字版指令（无障碍兜底）
    counter: '',
    lastKey: '',
  },

  onLoad() {
    let moves = '';
    try {
      moves = wx.getStorageSync('cube.moves') || '';
    } catch (e) {
      moves = '';
    }
    this.steps = parseMoves(Array.isArray(moves) ? moves.join(' ') : String(moves));
    this.setData({
      total: this.steps.length,
      idx: 0,
      done: this.steps.length === 0,
      counter: this.steps.length ? `1 / ${this.steps.length}` : '无步骤',
      stepLabel: this.steps.length ? stepText(this.steps[0]) : '没有可执行的步骤',
    });
  },

  // Ink 不支持 onReady；画布与语音在 onShow 里启动（canvas 样例同样在 onShow 绘制）
  onShow() {
    this.render();
    this.speak();
    if (!this._voiceStarted) { this._voiceStarted = true; this.startVoice(); }
  },

  onUnload() {
    if (this.rec) { try { this.rec.abort(); } catch (e) {} this.rec = null; }
  },

  // ---- 绘制 ----
  render() {
    const ctx = wx.createCanvasContext('hud');
    if (!ctx) return;
    ctx.clearRect(0, 0, 480, 210);
    ctx.textAlign = 'center';

    if (this.data.done) {
      ctx.fillStyle = GREEN;
      ctx.font = '28px Arial';
      ctx.fillText('完成！', 240, 90);
      ctx.font = '18px Arial';
      ctx.fillText(`共 ${this.data.total} 步`, 240, 125);
      ctx.font = '13px Arial';
      ctx.fillStyle = DIM;
      ctx.fillText('按返回键退出', 240, 160);
      if (ctx.flush) ctx.flush();
      return;
    }

    const s = this.steps[this.data.idx];
    const cx = 240, cy = 92;

    // 顶部步数
    ctx.fillStyle = GREEN;
    ctx.textBaseline = 'alphabetic';
    ctx.font = '20px Arial';
    ctx.fillText(`${this.data.idx + 1} / ${this.data.total}`, cx, 22);

    // 中央面方块
    ctx.lineWidth = 3;
    ctx.strokeStyle = GREEN;
    ctx.strokeRect(cx - 38, cy - 38, 76, 76);

    // 面字母
    ctx.font = '44px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.face, cx, cy + 2);
    ctx.textBaseline = 'alphabetic';

    // 旋转箭头
    this.drawArrow(ctx, cx, cy, 62, s.dir);

    // 180° 标注
    if (s.dir === '180') {
      ctx.font = '18px Arial';
      ctx.fillText('×2', cx + 76, cy + 6);
    }

    // 底部文字指令
    ctx.font = '18px Arial';
    ctx.fillText(stepText(s), cx, 200);

    if (ctx.flush) ctx.flush();
  },

  drawArrow(ctx, cx, cy, r, dir) {
    const cw = dir !== 'CCW';
    const start = -Math.PI / 2 + (cw ? 0.55 : -0.55);
    const sweep = Math.PI * 1.45;
    const end = cw ? start + sweep : start - sweep;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = GREEN;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end, !cw);
    ctx.stroke();
    // 箭头头部（在终点沿行进切线方向回折两条短线）
    const hx = cx + r * Math.cos(end);
    const hy = cy + r * Math.sin(end);
    const travel = end + (cw ? Math.PI / 2 : -Math.PI / 2);
    const len = 16;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - len * Math.cos(travel - 0.45), hy - len * Math.sin(travel - 0.45));
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - len * Math.cos(travel + 0.45), hy - len * Math.sin(travel + 0.45));
    ctx.stroke();
  },

  // ---- 语音播报 ----
  speak() {
    if (this.data.done) return;
    try {
      if (typeof SpeechSynthesisUtterance !== 'undefined' && typeof speechSynthesis !== 'undefined') {
        speechSynthesis.speak(new SpeechSynthesisUtterance(stepText(this.steps[this.data.idx])), 'immediate');
      }
    } catch (e) {}
  },

  // ---- 语音命令 ----
  startVoice() {
    try {
      if (typeof SpeechRecognition === 'undefined') return;
      this.rec = new SpeechRecognition();
      this.rec.onresult = (e) => {
        const t = (e && e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript) || '';
        this.handleVoice(t);
      };
      this.rec.onend = () => { if (this.rec && !this.data.done) { try { this.rec.start(); } catch (e) {} } };
      this.rec.onerror = () => {};
      this.rec.start();
    } catch (e) {}
  },

  handleVoice(t) {
    if (/下一?步|下个|继续|next/i.test(t)) this.next();
    else if (/上一?步|返回|back/i.test(t)) this.prev();
    else if (/重复|再说|repeat/i.test(t)) this.repeat();
  },

  // ---- 步进 ----
  syncText() {
    this.setData({
      counter: this.data.done ? '完成' : `${this.data.idx + 1} / ${this.data.total}`,
      stepLabel: this.data.done ? `完成！共 ${this.data.total} 步` : stepText(this.steps[this.data.idx]),
    });
  },

  next() {
    if (this.data.done) return;
    if (this.data.idx < this.data.total - 1) {
      this.setData({ idx: this.data.idx + 1 });
      this.syncText();
      this.render();
      this.speak();
    } else {
      this.finish();
    }
  },

  prev() {
    if (this.data.done || this.data.idx === 0) return;
    this.setData({ idx: this.data.idx - 1 });
    this.syncText();
    this.render();
    this.speak();
  },

  repeat() {
    this.render();
    this.speak();
  },

  finish() {
    this.setData({ done: true });
    this.syncText();
    this.render();
    try {
      if (typeof SpeechSynthesisUtterance !== 'undefined' && typeof speechSynthesis !== 'undefined') {
        speechSynthesis.speak(new SpeechSynthesisUtterance('完成！恭喜还原成功'), 'immediate');
      }
    } catch (e) {}
  },

  onKeyDown(event) {
    if (!event) return;
    const code = event.code;
    this.setData({ lastKey: code || '' });
    // 线性：向前/单击=下一步，向后=上一步
    if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter' || code === 'ArrowRight' || code === 'ArrowDown') this.next();
    else if (code === 'ArrowLeft' || code === 'ArrowUp') this.prev();
    else if (code === 'Backspace') wx.navigateBack();
  },
};
</script>

<page>
  <view class="root">
    <canvas id="hud" width="480" height="210" class="hud"></canvas>
    <text class="fallback">{{ counter }} · {{ stepLabel }}</text>
    <text class="tip">向前/单击 下一步 · 向后 上一步 · 返回退出 · 也可语音「下一步/上一步」</text>
    <text class="dbg">上次按键: {{ lastKey }}</text>
  </view>
</page>

<style>
.root {
  display: flex;
  flex-direction: column;
  width: 480px;
  padding: 6px 10px;
  box-sizing: border-box;
  background-color: #000;
  color: #40ff5e;
  gap: 4px;
  align-items: center;
}
.hud {
  width: 480px;
  height: 210px;
}
.fallback {
  font-size: 14px;
  color: #40ff5e;
}
.tip {
  font-size: 12px;
  color: rgba(64, 255, 94, 0.6);
}
.dbg {
  font-size: 11px;
  color: rgba(64, 255, 94, 0.45);
}
</style>
