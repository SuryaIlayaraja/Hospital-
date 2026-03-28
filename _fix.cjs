// Script to modify Dashboard.tsx:
// 1. Add import AboutUs after useLanguage import (line 36)
// 2. Replace lines 366-874 (the if(showAbout) block) with a clean 4-line block

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Dashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

console.log('Original line count:', lines.length);
console.log('Line 36:', lines[35]);
console.log('Line 366:', lines[365]);
console.log('Line 874:', lines[873]);
console.log('Line 875:', lines[874]);
console.log('Line 876:', lines[875]);

// Step 1: Insert import after line 36 (0-indexed: after index 35)
const importLine = 'import AboutUs from "./AboutUs";';
lines.splice(36, 0, importLine);

// After insertion, original line 366 is now at index 366 (shifted by 1)
// Original lines 366-874 are now lines 367-875 (0-indexed: 366-874)
// We need to replace lines 367(0-indexed 366) through 875(0-indexed 874)

const replacementLines = [
  '  // If showing about screen, render the About Us component',
  '  if (showAbout) {',
  '    return <AboutUs onBack={() => setShowAbout(false)} />;',
  '  }',
];

// Remove lines 367-875 (0-indexed: 366-874, inclusive)
// That's 875 - 367 + 1 = 509 lines to remove
lines.splice(366, 509, ...replacementLines);

const newContent = lines.join('\r\n');
fs.writeFileSync(filePath, newContent, 'utf8');

const finalLines = newContent.split(/\r?\n/);
console.log('New line count:', finalLines.length);
console.log('---');
console.log('Line 36:', finalLines[35]);
console.log('Line 37:', finalLines[36]);
console.log('Line 38:', finalLines[37]);
console.log('---');
console.log('Line 367:', finalLines[366]);
console.log('Line 368:', finalLines[367]);
console.log('Line 369:', finalLines[368]);
console.log('Line 370:', finalLines[369]);
console.log('Line 371:', finalLines[370]);
console.log('Line 372:', finalLines[371]);
console.log('Line 373:', finalLines[372]);
