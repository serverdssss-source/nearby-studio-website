const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('"use client"') || content.includes("'use client'")) {
                content = content.replace(/^["']use client["'];?\s*\n?/m, '');
                fs.writeFileSync(fullPath, content);
                console.log('Removed use client from:', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'src', 'components'));
processDir(path.join(process.cwd(), 'src', 'pages'));
processDir(path.join(process.cwd(), 'src', 'lib'));
console.log('Done stripping use client directives.');
