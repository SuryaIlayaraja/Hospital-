const fs = require('fs');

function fixAdminPanel() {
  const file = 'c:\\\\Users\\\\surya\\\\Desktop\\\\vikram\\\\vikramEnt--main\\\\src\\\\components\\\\AdminPanel.tsx';
  let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  
  // Fix tickets button syntax error
  for (let i = 0; i < lines.length - 2; i++) {
    if (lines[i].includes('className="h-5 w-5 inline-block mr-2" />') && lines[i+1].trim() === ')}') {
      // It's the tickets one
      lines.splice(i + 1, 0, '              View Tickets', '            </button>');
      break;
    }
  }

  // Fix doctors button syntax error - find where it says className=...mainView === "doctors"
  for (let i = 0; i < lines.length - 5; i++) {
    if (lines[i].includes('mainView === "doctors"')) {
      // Find the ending ')}'
      for (let j = i; j < i + 10; j++) {
        if (lines[j].trim() === ')}') {
          lines.splice(j, 0, '              <Stethoscope className="h-5 w-5 inline-block mr-2" />', '              Manage Doctors', '            </button>');
          break;
        }
      }
      break;
    }
  }

  let floorsStart = lines.findIndex(l => l.includes('Floors Section - Only show when mainView is "floors"'));
  let doctorsStart = lines.findIndex(l => l.includes('Doctors Section - Only show when mainView is "doctors"'));
  
  let deptsStart = lines.findIndex(l => l.includes('Departments Section - Only show when mainView is "departments"'));
  let roomsStart = lines.findIndex(l => l.includes('Rooms Section - Only show when mainView is "rooms"'));

  let resultLines = [];
  for (let i = 0; i < lines.length; i++) {
    let skip = false;
    
    if (floorsStart !== -1 && doctorsStart !== -1 && i >= floorsStart && i < doctorsStart) {
      skip = true;
    }
    
    if (deptsStart !== -1 && roomsStart !== -1 && i >= deptsStart && i < roomsStart) {
      skip = true;
    }
    
    if (!skip) {
      resultLines.push(lines[i]);
    }
  }
  
  fs.writeFileSync(file, resultLines.join('\\n'), 'utf8');
  console.log('Successfully updated AdminPanel.tsx');
}

fixAdminPanel();
