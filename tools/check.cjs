
const fs = require('node:fs');
const src = fs.readFileSync('D:/Wideget/_repo_tmp/lib/index.js', 'utf8');
const i = src.indexOf("join(");
console.log('join idx', i);
console.log('JOIN_RAW', JSON.stringify(src.slice(i, i + 24)));
const j = src.indexOf('const WIDGET_JS');
console.log('WIDGET_JS idx', j);
console.log('HEAD', JSON.stringify(src.slice(j, j + 70)));
// 检查模板字符串内是否存在单反斜杠+n（字面转义）
const k = src.indexOf("var css");
console.log('CSS_RAW', JSON.stringify(src.slice(k, k + 120)));
