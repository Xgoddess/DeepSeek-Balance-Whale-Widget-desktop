const fs=require('node:fs');
const s=fs.readFileSync('D:/Wideget/dist/widget.js','utf8');
const checks=['turnCost','costBubble','scrollGapToggle','scrollGapInput','LAST_TURN_URL','pollLastTurn','BALANCE_URL','SIZE_URL','/dsh-whale/','showCostBubble','hideCostBubble','setTurnCost','setScrollGap','FETCH_TIMEOUT_MS','AbortController'];
for(const c of checks){const n=s.split(c).length-1;console.log(c+': '+n)}
console.log('---invoke---');
for(const c of ["invoke('get_balance')","invoke('get_config')","invoke('save_config'","assets/DSniang1.png","assets/rua.gif","assets/Ya1.mp3","assets/D1.mp3","})()"]){console.log(c+': '+s.split(c).length)}
