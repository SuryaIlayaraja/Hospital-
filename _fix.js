const fs = require('fs');
const filePath = 'src/components/Dashboard.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('Total lines:', lines.length);
console.log('Line 370:', JSON.stringify(lines[369]));

// Search for key patterns after line 370
for (let i = 370; i < Math.min(lines.length, 870); i++) {
  const t = lines[i].trim();
  if (t.startsWith('if (show') || t.startsWith('// If show') || t === 'return (') {
    console.log('FOUND at line', i + 1, ':', lines[i].substring(0, 100));
  }
}

// Check showDoctors
let found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('showDoctors')) {
    console.log('showDoctors at line', i + 1, ':', lines[i].substring(0, 80));
    found = true;
  }
}
if (!found) console.log('WARNING: showDoctors NOT found!');

// Check export
for (let i = lines.length - 10; i < lines.length; i++) {
  if (i >= 0 && lines[i].includes('export')) {
    console.log('export at line', i + 1, ':', lines[i].substring(0, 80));
  }
}
