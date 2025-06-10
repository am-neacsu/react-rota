const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'departments.json');

try {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('✅ Loaded departments.json');

  const fixed = data.map(dep => ({ 
    ...dep, 
    subcategories: Array.isArray(dep.subcategories) ? dep.subcategories : [] 
  }));

  const ids = fixed.map(d => d.id);
  console.log('📂 Department IDs:', ids.join(', '));

  fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2));
  console.log('✅ Missing subcategories fixed (if any)');
} catch (err) {
  console.error('❌ Error reading or fixing departments.json:', err.message);
}