// 唤醒词触发的语音命令（适配本设备：端侧 ASR 交互门控+一次性，"乐奇"助手常驻占麦，
// 纯常驻连续听不可行）。模型：页面 onVoiceWakeup(说"乐奇") → voice.listen() 开一段识别听一条命令。
// 用法：onShow: voice.use(commands, onState)；onVoiceWakeup: voice.listen()；onHide: voice.pause()。
// commands: [{ phrases:[字符串…], run:()=>void }]；onState(state, text?): 'listening'|'heard'|'idle'。
class VoiceControl {
  constructor() { this.commands = []; this.onState = null; this.rec = null; this.gen = 0; }

  use(commands, onState) { this.commands = commands || []; this.onState = onState || null; }

  pause() {
    this.gen++;
    if (this.rec) { try { this.rec.abort(); } catch (e) {} this.rec = null; }
    this._state('idle');
  }

  // 唤醒后调用：开一段识别，听一条命令（onVoiceWakeup 是新交互上下文，能拿到一次授麦）
  listen() {
    if (typeof SpeechRecognition === 'undefined') { console.log('[voice] SpeechRecognition 不可用'); return; }
    this.gen++; const g = this.gen;
    if (this.rec) { try { this.rec.abort(); } catch (e) {} this.rec = null; }
    let r;
    try { r = new SpeechRecognition(); r.lang = 'zh-CN'; r.continuous = false; r.interimResults = false; }
    catch (e) { console.error('[voice] new', e && (e.message || e)); return; }
    r.onresult = (e) => {
      if (g !== this.gen) return;
      try {
        const a = e.results || []; const last = a[a.length - 1] || a[0];
        const t = ((last && last[0] && last[0].transcript) || '').replace(/\s+/g, '');
        if (t) { console.log('[voice] 听到: ' + t); this._state('heard', t); this._match(t); }
      } catch (err) {}
    };
    r.onerror = (e) => { if (g === this.gen) console.log('[voice] err: ' + (e && e.error)); };
    r.onend = () => { if (g === this.gen) { this.rec = null; this._state('idle'); } };
    try { r.start(); this.rec = r; console.log('[voice] 唤醒→监听一条命令'); this._state('listening'); }
    catch (e) { console.log('[voice] start failed: ' + (e && (e.message || e))); this.rec = null; this._state('idle'); }
  }

  _state(s, t) { if (this.onState) { try { this.onState(s, t); } catch (e) {} } }

  _match(t) {
    for (const c of this.commands) {
      for (const p of c.phrases) {
        if (t.indexOf(p) >= 0) { console.log('[voice] 命中: ' + p); try { c.run(); } catch (e) { console.error('[voice] run', e && (e.message || e)); } return; }
      }
    }
  }
}

const voice = new VoiceControl();
export default voice;
