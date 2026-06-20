const fs = require('fs');
const content = fs.readFileSync('src/stores/game.ts', 'utf8');
let inTemplate = false;
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '`') {
      if (j > 0 && line[j-1] === '\\') continue;
      inTemplate = !inTemplate;
      if (inTemplate) {
        console.log(`模板字符串开始于第 ${i+1} 行，位置 ${j+1}: ${line.substring(j, j+50)}...`);
      } else {
        console.log(`模板字符串结束于第 ${i+1} 行，位置 ${j+1}`);
      }
    }
  }
}

if (inTemplate) {
  console.log('ERROR: 有未闭合的模板字符串！');
} else {
  console.log('所有模板字符串都已正确闭合');
}
