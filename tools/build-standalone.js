// Inlines styles.css and src/*.js into one self-contained HTML file: dist/hg-decision-copilot.html
const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${fs.readFileSync(path.join(root, 'styles.css'), 'utf8')}</style>`);
html = html.replace(/<script src="(src\/[a-z]+\.js)"><\/script>/g, (_, f) => `<script>\n${fs.readFileSync(path.join(root, f), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/hg-decision-copilot.html'), html);
console.log('wrote dist/hg-decision-copilot.html');
