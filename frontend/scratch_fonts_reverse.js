const fs = require('fs');
const path = 'c:/Users/likit/Desktop/PlacementAI/frontend/src/app/dashboard/resume-builder/editor/editor-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// Reverse the mass scaling down by 1 size tier
content = content.replace(/text-(base|sm)/g, (match, p1) => {
    switch (p1) {
        case 'base': return 'text-sm';
        case 'sm': return 'text-xs';
        default: return match;
    }
});

fs.writeFileSync(path, content);
console.log('Downscaled body text to be "somewhat small".');
