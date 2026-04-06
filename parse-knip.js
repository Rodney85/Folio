const fs = require('fs');
const raw = fs.readFileSync('./knip-report.json', 'utf8');
let r;
try {
  r = JSON.parse(raw);
} catch(e) {
  console.log("Parse error:", e.message);
  console.log("First 500 chars:", raw.substring(0, 500));
  process.exit(1);
}

console.log("TOP KEYS:", Object.keys(r));

if (r.files && r.files.length) {
  console.log("\n=== UNUSED FILES (" + r.files.length + ") ===");
  r.files.forEach(f => console.log("  " + f));
}

if (r.exports && r.exports.length) {
  console.log("\n=== UNUSED EXPORTS (" + r.exports.length + ") ===");
  r.exports.forEach(e => {
    const syms = (e.symbols || []).map(s => s.symbol || s.name || JSON.stringify(s)).join(', ');
    console.log("  " + (e.file || e.name) + ": " + syms);
  });
}

if (r.types && r.types.length) {
  console.log("\n=== UNUSED TYPES (" + r.types.length + ") ===");
  r.types.forEach(t => {
    const syms = (t.symbols || []).map(s => s.symbol || s.name || JSON.stringify(s)).join(', ');
    console.log("  " + (t.file || t.name) + ": " + syms);
  });
}

if (r.dependencies && r.dependencies.length) {
  console.log("\n=== UNUSED DEPS (" + r.dependencies.length + ") ===");
  r.dependencies.forEach(d => {
    const syms = (d.symbols || []).join(', ');
    console.log("  " + (d.file || d.name) + ": " + syms);
  });
}

if (r.devDependencies && r.devDependencies.length) {
  console.log("\n=== UNUSED DEV DEPS (" + r.devDependencies.length + ") ===");
  r.devDependencies.forEach(d => {
    const syms = (d.symbols || []).join(', ');
    console.log("  " + (d.file || d.name) + ": " + syms);
  });
}
