const fs = require('fs');
const path = require('path');

const lcovPath = path.join(__dirname, '..', 'coverage', 'gerenciadordeaulas-app', 'lcov.info');
if (!fs.existsSync(lcovPath)) {
  console.error(`Arquivo de cobertura não encontrado: ${lcovPath}`);
  process.exit(1);
}

const content = fs.readFileSync(lcovPath, 'utf8');
const records = content.split('end_of_record');

let totalLF = 0, totalLH = 0, totalBRF = 0, totalBRH = 0;
for (const rec of records) {
  const lf = rec.match(/^LF:(\d+)/m);
  const lh = rec.match(/^LH:(\d+)/m);
  const brf = rec.match(/^BRF:(\d+)/m);
  const brh = rec.match(/^BRH:(\d+)/m);
  if (lf && lh) { totalLF += +lf[1]; totalLH += +lh[1]; }
  if (brf && brh) { totalBRF += +brf[1]; totalBRH += +brh[1]; }
}

const linePct = totalLF ? totalLH / totalLF : 1;
const branchPct = totalBRF ? totalBRH / totalBRF : 1;

console.log(`Lines    : ${(linePct * 100).toFixed(2)}% (${totalLH}/${totalLF})`);
console.log(`Branches : ${(branchPct * 100).toFixed(2)}% (${totalBRH}/${totalBRF})`);

// Pisos atuais (baseline da Fase 0). Elevar a cada fase.
const thresholds = { lines: 0.45, branches: 0.25 };
let ok = true;
if (linePct < thresholds.lines) { console.error(`Lines abaixo do piso de ${thresholds.lines * 100}%`); ok = false; }
if (branchPct < thresholds.branches) { console.error(`Branches abaixo do piso de ${thresholds.branches * 100}%`); ok = false; }
process.exit(ok ? 0 : 1);
