const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

// 1. Add imports
let importAdded = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('import AboutUs from "./AboutUs";')) {
    lines.splice(i + 1, 0, 'import Navbar from "./Navbar";\nimport Footer from "./Footer";');
    importAdded = true;
    break;
  }
}

let navStart = -1;
let navEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Sticky Top Header (Nav + Notice Bar)')) {
    navStart = i;
  }
  if (navStart !== -1 && i > navStart && lines[i].includes('Hero Section')) {
    navEnd = i - 1;
    break;
  }
}

if (navStart !== -1 && navEnd !== -1) {
  const replacement = `      {/* New Modular Navbar */}
      <Navbar onNavigate={(tab) => {
        if (tab === 'about') {
          // handled by onNavigate or setShowAbout in actual app, let's use the parent's setter if we had it. 
          // Wait, setShowAbout is defined in Dashboard!
          setShowAbout(true);
        } else if (tab === 'ticket') {
          onNavigateToTicket?.();
        } else {
          onNavigate?.(tab);
        }
      }} />`;
  lines.splice(navStart, navEnd - navStart + 1, replacement);
}

// Ensure Footer is added right before the last closing div of the Dashboard.
// We know Dashboard ends with:
//       </div>
//     </div>
//   );
// };
let lastReturnDiv = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</div>') {
    // Let's add it before `    </div>` which closes the main container.
    lastReturnDiv = i;
    break;
  }
}

if (lastReturnDiv !== -1) {
  lines.splice(lastReturnDiv, 0, '      <Footer />');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Dashboard.tsx updated successfully.');
