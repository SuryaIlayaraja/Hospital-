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

// 2. Replace the Navbar (the `<div className="sticky top-0 z-50 w-full">` block)
// It starts around:
//       {/* Sticky Top Header (Nav + Notice Bar) */}
//       <div className="sticky top-0 z-50 w-full">
let navStart = -1;
let navEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Sticky Top Header (Nav + Notice Bar)')) {
    navStart = i;
  }
  if (navStart !== -1 && i > navStart && lines[i].includes('Hero Section')) {
    // The previous line or empty space before Hero Section
    navEnd = i - 1;
    break;
  }
}

if (navStart !== -1 && navEnd !== -1) {
  const replacement = `      {/* New Modular Navbar */}
      <Navbar onNavigate={(tab) => {
        if (tab === 'about') {
          setShowAbout(true);
        } else if (tab === 'ticket') {
          onNavigateToTicket?.();
        } else {
          onNavigate?.(tab);
        }
      }} />`;
  // Remove navStart to navEnd inclusive
  lines.splice(navStart, navEnd - navStart + 1, replacement);
}

// 3. Inject Footer right before the final `</div>` of the main Dashboard page.
// The file ends roughly like:
//       </div>
//     </div>
//   );
// };
// Let's find the last `</div>` inside the component
let lastDivIndex = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</div>') {
    lastDivIndex = i;
    break;
  }
}

if (lastDivIndex !== -1) {
  lines.splice(lastDivIndex, 0, '      <Footer />');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Dashboard.tsx updated successfully.');
