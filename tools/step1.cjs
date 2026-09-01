const fs=require('node:fs');
let s=fs.readFileSync('D:/Wideget/dist/widget.raw.js','utf8').replace(/\r\n/g,'\n');
function db(a,b,l){let i=s.indexOf(a);if(i<0){console.log('FAIL-start',l);return}let j=s.indexOf(b,i+a.length);if(j<0){console.log('FAIL-end',l);return}s=s.slice(0,i)+s.slice(j+b.length);console.log('OK',l)}
function dl(a,l){let i=s.indexOf(a);if(i<0){console.log('FAIL',l);return}s=s.slice(0,i)+s.slice(i+a.length);console.log('OK',l)}

db("var turnCostToggle = document.createElement('input')","turnCostCloseInput.addEventListener('change', function () { setTurnCostClose(turnCostCloseInput.value) })","turnCost-create");
db("var scrollGapToggle = document.createElement('input')","scrollGapInput.addEventListener('change', function () { setScrollGapPx(scrollGapInput.value) })","scrollGap-create");
db("var row7 = menuRow()","row7.appendChild(menuLabel('秒'))","row7");
db("var row9 = menuRow()","row9.appendChild(menuLabel('px'))","row9");
dl("menuBox.appendChild(row7)\n","append-row7");
dl("menuBox.appendChild(row9)\n","append-row9");
dl("var menuSep1 = document.createElement('div')\nmenuSep1.className = 'dshwv-menu-sep'\n","menuSep1-create");
dl("menuBox.appendChild(menuSep1)\n","append-menuSep1");

fs.writeFileSync('D:/Wideget/dist/widget.step1.js',s,'utf8');
console.log('len',s.length);
