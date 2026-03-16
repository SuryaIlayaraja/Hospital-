const fs = require('fs');
const file = 'c:\\\\Users\\\\surya\\\\Desktop\\\\vikram\\\\vikramEnt--main\\\\src\\\\components\\\\AdminPanel.tsx';
let content = fs.readFileSync(file, 'utf8');
// Replace literal \n with actual newline
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(file, content, 'utf8');
console.log('Restored actual newlines');
