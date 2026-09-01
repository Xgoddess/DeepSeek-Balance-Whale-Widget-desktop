const fs=require('node:fs');
let s=fs.readFileSync('D:/Wideget/dist/widget.step1.js','utf8');
function db(a,b,l){let i=s.indexOf(a);if(i<0){console.log('FAIL-start',l);return}let j=s.indexOf(b,i+a.length);if(j<0){console.log('FAIL-end',l);return}s=s.slice(0,i)+s.slice(j+b.length);console.log('OK',l)}
function dl(a,l){let i=s.indexOf(a);if(i<0){console.log('FAIL',l);return}s=s.slice(0,i)+s.slice(i+a.length);console.log('OK',l)}
function rp(a,b,l){let i=s.indexOf(a);if(i<0){console.log('FAIL',l);return}s=s.slice(0,i)+b+s.slice(i+a.length);console.log('OK',l)}

// 删除函数块
db("// —— 每轮对话消耗金额泡泡 ——","costBubbleActive = false\n  hideBubble()\n}","showCostBubble+hideCostBubble");
db("function setTurnCostOn(v) {","turnCostCloseInput.value = String(n)\n  saveConfig()\n}","setTurnCostOn+setTurnCostClose");
db("function setScrollGapOn(v) {","scrollGapInput.value = String(n)\n  saveConfig()\n  settle()\n}","setScrollGapOn+setScrollGapPx");

// rightGap 无害化（保留签名，恒 0）
rp("function rightGap() {\n  // 开关关闭：贴边（不避让滚动条）\n  if (!scrollGapOn) return 0\n  // 开启：用用户填写的像素；填 0 也贴边\n  return scrollGapPx > 0 ? scrollGapPx : 0\n}","function rightGap() {\n  return 0\n}","rightGap");

// costBubbleActive 引用清理
dl("  if (costBubbleActive) {\n    // 消耗金额泡泡：点击关闭（确认）\n    hideCostBubble()\n    return\n  }\n","costBubble-click");
dl("  // 消耗金额泡泡显示期间，余额变动不再弹出普通泡泡\n  if (costBubbleActive) return\n","costBubble-showBubble");
dl("  // 消耗金额泡泡显示期间，余额数字滚动不触碰金额行\n  if (costBubbleActive) return\n","costBubble-animateAmount");
dl("    // 帧级保护：成本泡泡出现后立即停止滚动，避免后续帧把余额写进金额行\n    if (costBubbleActive) {\n      animId = null\n      return\n    }\n","costBubble-step");
dl("  // 消耗金额泡泡显示期间，余额渲染不覆盖其内容（金额行/标题行/提示行）\n  if (costBubbleActive) return\n","costBubble-render");
rp("  saveConfig()\n  // 必须走 hideCostBubble：残留的 costBubbleActive 会让 render()/showBubble() 永久早退\n  if (!bubbleOn) hideCostBubble()\n}","  saveConfig()\n  if (!bubbleOn) hideBubble()\n}","setBubbleOn-hideCostBubble");

// 变量声明清理
dl("var turnCostOn = true\nvar turnCostCloseMs = 5000\n","vars-turnCost");
dl("var costBubbleActive = false\n","vars-costBubbleActive");

// 配置加载里的 turnCost / scrollGap 处理块删除
db("    if (d && typeof d.turnCostOn === 'boolean') {","turnCostCloseInput.value = String(Math.round(turnCostCloseMs / 1000))\n    }","cfg-turnCost");
db("    if (d && typeof d.scrollGapOn === 'boolean') {","scrollGapInput.value = String(scrollGapPx)\n    }","cfg-scrollGap");

fs.writeFileSync('D:/Wideget/dist/widget.step2.js',s,'utf8');
console.log('len',s.length);
