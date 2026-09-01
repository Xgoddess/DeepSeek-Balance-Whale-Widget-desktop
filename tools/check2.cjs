
const fs = require('node:fs');
const src = fs.readFileSync('D:/Wideget/_repo_tmp/lib/index.js', 'utf8');
const i = src.indexOf("].join(");
console.log('].join idx', i);
console.log('JOIN_RAW', JSON.stringify(src.slice(i, i + 20)));
// 统计模板字符串（WIDGET_JS 内容）内所有反斜杠序列
const bt = src.indexOf('const WIDGET_JS = ');
const start = src.indexOf('`', bt);
const end = src.indexOf('\n})()`', start);
const raw = src.slice(start + 1, end + 6); // 近似 raw
const seq = {};
for (let x = 0; x < raw.length; x++) {
  if (raw[x] === '\\') {
    const n = raw[x+1];
    const key = '\\' + (n || '<eof>');
    seq[key] = (seq[key] || 0) + 1;
  }
}
console.log('BACKSLASH_SEQ', JSON.stringify(seq));
console.log('raw len', raw.length);
