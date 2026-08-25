const fs = require('fs');
const file = 'src/app/employee/welfare-request/page.tsx';
let content = fs.readFileSync(file, 'utf8');

let newContent = content.replace(
    '<div className="max-w-[1400px] w-full mx-auto grid grid-cols-12 gap-8">',
    '<div className="max-w-[1400px] w-full mx-auto space-y-8">\n            <div className="grid grid-cols-12 gap-8">'
);

const newTableStart = newContent.indexOf('                {/* Status Table */}');
const newSidebarStart = newContent.indexOf('            {/* Right Sidebar / Policies */}');
const newModalStart = newContent.indexOf('            {/* View Welfare Request Modal */}');

if (newTableStart > -1 && newSidebarStart > -1 && newModalStart > -1) {
    const part1 = newContent.substring(0, newTableStart); // ends right after form
    const table = newContent.substring(newTableStart, newSidebarStart); // includes Status Table
    let sidebar = newContent.substring(newSidebarStart, newModalStart); // includes Sidebar
    const part3 = newContent.substring(newModalStart); // includes Modal and end
    
    // Close col-span-9 after form
    const part1Fixed = part1 + '            </div>\n\n';
    
    // Close grid after sidebar
    sidebar = sidebar + '            </div>\n\n';
    
    // Build final: part1 (form) -> sidebar -> table -> modal
    const finalContent = part1Fixed + sidebar + table + part3;
    
    fs.writeFileSync(file, finalContent);
    console.log('Success');
} else {
    console.log('Failed to find markers');
}
