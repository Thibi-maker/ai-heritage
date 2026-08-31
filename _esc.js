const fs = require('fs');
let s = fs.readFileSync('E:/nn/_patch.js', 'utf8');
// Escape all ${ occurrences inside the template literals (so they stay literal in output)
s = s.replace(/\$\{/g, '\\${');
fs.writeFileSync('E:/nn/_patch.js', s);
console.log('escaped all ${ in _patch.js');
