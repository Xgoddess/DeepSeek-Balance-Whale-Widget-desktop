
var monitors = [
  { x: 0, y: 0, w: 2560, h: 1400 },   // 横屏
  { x: 2560, y: 0, w: 1440, h: 2520 } // 竖屏（更高）
];
function monitorAtX(cx) {
  var best = null, bd = Infinity;
  for (var m of monitors) {
    if (cx >= m.x && cx < m.x + m.w) return m;
    var dx = cx < m.x ? m.x - cx : cx - (m.x + m.w);
    if (dx < bd) { bd = dx; best = m; }
  }
  return best;
}
function monitorAtY(cy) {
  var best = null, bd = Infinity;
  for (var m of monitors) {
    if (cy >= m.y && cy < m.y + m.h) return m;
    var dy = cy < m.y ? m.y - cy : cy - (m.y + m.h);
    if (dy < bd) { bd = dy; best = m; }
  }
  return best;
}
function judge(cx, cy, vpw, vph) {
  var mX = monitorAtX(cx) || { x: 0, w: vpw };
  var mY = (mX && cy >= mX.y && cy < mX.y + mX.h) ? mX : (monitorAtY(cy) || { y: 0, h: vph });
  var h = (cx < mX.x + mX.w/4) ? 'left' : (cx > mX.x + mX.w*3/4 ? 'right' : 'free');
  var v = (cy < mY.y + mY.h/4) ? 'top' : (cy > mY.y + mY.h*3/4 ? 'bottom' : 'free');
  return { h: h, v: v };
}
var cases = [
  [1500, 2500, '横屏下方空白区→期望 free/bottom(竖屏底部)'],
  [1500, 700,  '横屏内部→期望 free/free'],
  [2500, 2000, '横屏右边+竖屏下部→期望 right(横屏右边)/bottom(竖屏底部)'],
  [3000, 2500, '竖屏底部→期望 free/bottom(竖屏底部)'],
  [3000, 700,  '竖屏上部→期望 free/free'],
  [200, 2500,   '横屏左下空白→期望 left/bottom'],
  [3800, 1300,  '竖屏右侧中部→期望 right(竖屏右边)/free'],
];
for (var c of cases) {
  var r = judge(c[0], c[1], 4000, 2560);
  console.log('(' + c[0] + ',' + c[1] + ') [' + c[2] + '] => h=' + r.h + ' v=' + r.v);
}
