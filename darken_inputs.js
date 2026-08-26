const fs = require('fs');
const files = [
  'src/components/director/transfer/TransferTable.tsx',
  'src/components/hr/employees/EmployeeTransfers.tsx',
  'src/app/hr/employees/resignations/components/ResignationRequestForm.tsx',
  'src/components/hr/employees/TerminationRequestForm.tsx',
  'src/components/hr/employees/DeathRequestForm.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let count = 0;
  content = content.replace(/(<(?:input|textarea|select)[^>]+className=[\"'\`])([^\"]+?)([\"'\`])/g, (match, p1, p2, p3) => {
    let classes = p2;
    // Remove existing text color classes
    classes = classes.replace(/\btext-slate-[0-9]+\b/g, '');
    classes = classes.replace(/\bdark:text-slate-[0-9]+\b/g, '');
    classes = classes.replace(/\btext-gray-[0-9]+\b/g, '');
    classes = classes.replace(/\bdark:text-gray-[0-9]+\b/g, '');
    // Remove existing font weight
    classes = classes.replace(/\bfont-(semibold|bold|medium)\b/g, '');
    
    // Add new ones
    classes = classes.trim() + ' text-slate-900 font-bold dark:text-white';
    // Clean up double spaces
    classes = classes.replace(/\s+/g, ' ');
    count++;
    return p1 + classes + p3;
  });
  
  // also do this for ReadOnlyField, ReadOnlyTextarea custom components if any (in TransferTable.tsx)
  content = content.replace(/(<(?:ReadOnlyField|ReadOnlyTextarea)[^>]+className=[\"'\`])([^\"]+?)([\"'\`])/g, (match, p1, p2, p3) => {
    let classes = p2;
    classes = classes.replace(/\btext-slate-[0-9]+\b/g, '');
    classes = classes.replace(/\bdark:text-slate-[0-9]+\b/g, '');
    classes = classes.replace(/\btext-gray-[0-9]+\b/g, '');
    classes = classes.replace(/\bdark:text-gray-[0-9]+\b/g, '');
    classes = classes.replace(/\bfont-(semibold|bold|medium)\b/g, '');
    classes = classes.trim() + ' text-slate-900 font-bold dark:text-white';
    classes = classes.replace(/\s+/g, ' ');
    count++;
    return p1 + classes + p3;
  });
  
  fs.writeFileSync(f, content);
  console.log('Updated ' + count + ' items in ' + f);
});
