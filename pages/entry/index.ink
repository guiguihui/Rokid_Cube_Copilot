<script type="application/json" def>
{
  "navigationBarTitleText": "开始前"
}
</script>

<script setup>
import wx from 'wx';
import { warmup, isWarmed } from '../../lib/solver.js';
import voice from '../../lib/voice.js';

// 启动页：教握法/拍摄总则 + 预热求解器(建剪枝表) + 单击确认进首页。
// 每次冷启动都过这页（剪枝表是内存里的、重启即失，本就需每次重建）→ 兼作"加载页"。
const ENTRY_VHINT = '🎤 说「乐奇」后：进入';

export default {
  data: {
    ready: false,
    loadText: '⏳ 正在加载求解器…（约 1–4 秒）',
    voiceHint: ENTRY_VHINT,
  },

  onLoad() {
    // 延迟一帧让"加载中"先画出来；warmup() 同步建表会冻屏 ~1–4s，
    // 期间握法文字停在屏上可读，返回后再开放"单击进入"。
    setTimeout(() => {
      try { if (!isWarmed()) warmup(); } catch (e) { console.error('[entry] warmup', e && (e.message || e)); }
      // 无论成败都放行：失败只是回退到首页首解再建表，不困住用户。
      this.setData({ ready: true, loadText: '✓ 准备就绪 · 单击进入' });
    }, 300);
  },

  onShow() {
    voice.use([
      { phrases: ['进入', '开始', '好了', '确认', '首页'], run: () => this.enter() },
    ], (s) => this.setData({ voiceHint: s === 'listening' ? '🎤 在听…请说命令' : ENTRY_VHINT }));
  },
  onVoiceWakeup() { voice.listen(); },
  onHide() { voice.pause(); },

  // 进首页：redirectTo 关掉进入页再开首页(不留返回栈，首页双击/返回→退出 app，与现状一致)。
  // 本运行时无 wx.reLaunch(实测"not a function")；redirectTo 为受支持 API，navigateTo 兜底。
  enter() {
    if (!this.data.ready) return; // 求解器没加载完，先不放行
    voice.pause();
    try {
      if (typeof wx.redirectTo === 'function') wx.redirectTo({ url: '/pages/input/index' });
      else wx.navigateTo({ url: '/pages/input/index' });
    } catch (e) {
      console.error('[entry] redirect', e && (e.message || e));
      try { wx.navigateTo({ url: '/pages/input/index' }); } catch (e2) {}
    }
  },

  onKeyDown(event) {
    const code = event && event.code;
    if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter') this.enter();
    // 不处理 Backspace：启动根页，双击返回由系统退栈
  },
};
</script>

<page>
  <view class="root">
    <text class="title">开始前 · 怎么拿、怎么拍</text>

    <!-- 魔方展开图（十字网）：白在上、橙绿红蓝中行、黄在下；单绿屏用中文色名 -->
    <view class="net">
      <view class="netrow"><view class="ncell off1"><text>白</text></view></view>
      <view class="netrow">
        <view class="ncell"><text>橙</text></view>
        <view class="ncell"><text>绿</text></view>
        <view class="ncell"><text>红</text></view>
        <view class="ncell"><text>蓝</text></view>
      </view>
      <view class="netrow"><view class="ncell off1"><text>黄</text></view></view>
    </view>

    <text class="grip">白朝上 · 绿朝前 → 红右 橙左 蓝后 黄底</text>
    <text class="rule">拍摄时全程白色在上、转动魔方对准镜头；顶 / 底两面按屏上提示对齐「朝上的边」。</text>
    <text class="note">（眼镜为单绿色屏，颜色用中文字标注）</text>

    <view class="enter {{ ready ? 'on' : '' }}" bindtap="enter">{{ loadText }}</view>
    <text class="vhint">{{ voiceHint }}</text>
  </view>
</page>

<style>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 480px;
  padding: 10px 14px;
  box-sizing: border-box;
  background-color: #000;
  color: #40ff5e;
  gap: 8px;
}
.title { font-size: 16px; font-weight: bold; text-align: center; }
/* 十字网：每格 44px、行内 gap 4px；白/黄用 off1(左移一格=48px)对齐到「绿」正上/下方 */
.net { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin: 2px 0; }
.netrow { display: flex; flex-direction: row; gap: 4px; }
.ncell {
  width: 44px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #40ff5e; border-radius: 4px;
  font-size: 18px; font-weight: bold; color: #40ff5e;
}
.off1 { margin-left: 48px; }
.grip { font-size: 14px; font-weight: bold; text-align: center; }
.rule { font-size: 12px; color: rgba(64, 255, 94, 0.85); text-align: center; line-height: 17px; }
.note { font-size: 10px; color: rgba(64, 255, 94, 0.55); text-align: center; }
.enter {
  margin-top: 4px;
  padding: 8px 18px;
  border: 2px solid rgba(64, 255, 94, 0.4);
  border-radius: 12px;
  color: rgba(64, 255, 94, 0.6);
  font-size: 15px; font-weight: bold; text-align: center;
}
/* 就绪后高亮可点 */
.enter.on { border-color: #40ff5e; background-color: rgba(64, 255, 94, 0.18); color: #40ff5e; }
.vhint { font-size: 12px; color: #7fd0ff; text-align: center; }
</style>
