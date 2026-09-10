const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /<span style={{ fontSize: '1\.25rem', fontWeight: 'bold', color: 'var\(--header-bg\)', minWidth: '24px' }}>\s*\{currentTotal\}\s*<\/span>/,
  "<span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--header-bg)' }}>{currentTotal} <span style={{ fontSize: '1rem', color: '#6b7280' }}>/ 10</span></span>"
);

code = code.replace(
  /filter: \(eligibleForSweets \|\| isPendingCashIn\) \? 'none' : 'grayscale\(100%\) opacity\(40%\)'/,
  "filter: 'none', opacity: (eligibleForSweets || isPendingCashIn) ? 1 : 0.8"
);

code = code.replace(
  /border: `2px solid \${isPendingCashIn \? 'var\(--positive\)' : \(eligibleForSweets \? 'var\(--accent\)' : 'transparent'\)}`/,
  "border: `3px solid ${isPendingCashIn ? 'var(--positive)' : (eligibleForSweets ? 'var(--accent)' : '#e2e8f0')}`, boxShadow: eligibleForSweets ? '0 0 10px rgba(250, 189, 65, 0.6)' : 'none'"
);

fs.writeFileSync('src/pages/Home.tsx', code);
