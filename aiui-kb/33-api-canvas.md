# 33 · API · Canvas（2D，Web 标准）

源：`docs/aiui/3-api/canvas/index.md`

- 获取上下文：`const ctx = this.selectComponent('#myCanvas').getContext('2d')`（标准 Web Canvas，**非** `wx.createCanvasContext`/`ctx.draw()` 那套）。
- **CanvasRenderingContext2D** 提供完整标准 2D API：
  - 样式属性：`fillStyle`/`strokeStyle`(色/`CanvasGradient`/`CanvasPattern`)、`lineWidth`、`lineCap`(butt/round/square)、`lineJoin`(miter/round/bevel)、`lineDashOffset`、`shadowBlur/Color/OffsetX/OffsetY`、`globalAlpha`、`globalCompositeOperation`、`font`、`textAlign`、`textBaseline`。
  - 绘制：`fillRect`/`strokeRect`/`clearRect`、`fillText`/`strokeText`、`measureText`→`{width}`。
  - 路径：`beginPath`/`closePath`/`moveTo`/`lineTo`/`arc`/`arcTo`/`rect`/`ellipse`/`bezierCurveTo`/`quadraticCurveTo`/`fill`/`stroke`/`clip`。
  - 状态/变换：`save`/`restore`/`translate`/`rotate`(弧度)/`scale`。
  - 图像/像素：`drawImage`(3/5/9 参)、`createImageData`/`getImageData`/`putImageData`。
  - 渐变/图案：`createLinearGradient(x0,y0,x1,y1)`、`createRadialGradient(...)`、`createPattern(image, repetition)`。
- **ImageData**：`width`/`height`/`data`(Uint8ClampedArray RGBA)。
- **CanvasGradient**：`addColorStop(offset, color)`(0~1)。
- **CanvasPattern**：`setTransform(matrix)`。
```javascript
const ctx = this.selectComponent('#myCanvas').getContext('2d');
const g = ctx.createLinearGradient(0,0,300,0);
g.addColorStop(0,'red'); g.addColorStop(1,'green');
ctx.fillStyle = g; ctx.fillRect(10,150,300,50);
```
