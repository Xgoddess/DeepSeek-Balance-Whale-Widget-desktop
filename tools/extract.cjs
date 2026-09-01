
const fs = require('node:fs');
const BT = String.fromCharCode(96);
const src = fs.readFileSync('D:/Wideget/_repo_tmp/lib/index.js', 'utf8');
const startMarker = 'const WIDGET_JS = ' + BT;
const start = src.indexOf(startMarker) + startMarker.length;
const endMarker = '})()' + BT;
const end = src.indexOf(endMarker, start);
const raw = src.slice(start, end);

// 完整统计反斜杠序列
const seq = {};
for (let x = 0; x < raw.length; x++) {
  if (raw[x] === '\\') { const n = raw[x+1]; const k = '\\' + (n ? JSON.stringify(n) : '<eof>'); seq[k] = (seq[k]||0)+1; }
}
console.log('BACKSLASH_SEQ:', JSON.stringify(seq));

function unescapeTemplate(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') {
      const next = s[i+1];
      if (next === '\\') { out += '\\'; i++; }
      else if (next === BT) { out += BT; i++; }
      else if (next === 'n') { out += '\n'; i++; }
      else if (next === 'r') { out += '\r'; i++; }
      else if (next === 't') { out += '\t'; i++; }
      else if (next === 'x') { out += String.fromCharCode(parseInt(s.substr(i+2,2),16)); i+=3; }
      else if (next === 'u') {
        if (s[i+2] === '{') { const e = s.indexOf('}', i+3); out += String.fromCodePoint(parseInt(s.slice(i+3,e),16)); i=e; }
        else { out += String.fromCharCode(parseInt(s.substr(i+2,4),16)); i+=5; }
      }
      else { out += next; i++; }
    } else out += s[i];
  }
  return out;
}

const decoded = unescapeTemplate(raw);
fs.writeFileSync('D:/Wideget/dist/widget.raw.js', decoded, 'utf8');
console.log('raw len', raw.length, 'decoded len', decoded.length);
const ji = decoded.indexOf('].join(');
console.log('JOIN:', JSON.stringify(decoded.slice(ji, ji + 16)));
console.log('head:', JSON.stringify(decoded.slice(0, 40)));
console.log('tail:', JSON.stringify(decoded.slice(-40)));
// 检查是否还有双反斜杠残留
let dbl = 0; for (let x = 0; x < decoded.length; x++) if (decoded[x] === '\\' && decoded[x+1] === '\\') dbl++;
console.log('double-backslash remaining:', dbl);
