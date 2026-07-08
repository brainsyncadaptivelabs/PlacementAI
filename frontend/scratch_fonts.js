const fs = require('fs');
const path = 'c:/Users/likit/Desktop/PlacementAI/frontend/src/app/dashboard/resume-builder/editor/editor-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// The replacements must be done carefully so they don't overwrite each other.
// E.g., if we replace text-xs to text-sm, we shouldn't later replace text-sm to text-base.
// We will do a single regex replace with a replacer function.

content = content.replace(/text-(xs|sm|\[8px\]|\[9px\]|\[10px\]|\[11px\]|\[13px\])/g, (match, p1) => {
    switch (p1) {
        case '[8px]': return 'text-[11px]';
        case '[9px]': return 'text-xs';
        case '[10px]': return 'text-sm';
        case '[11px]': return 'text-sm';
        case 'xs': return 'text-sm';
        case '[13px]': return 'text-base';
        case 'sm': return 'text-base';
        default: return match;
    }
});

fs.writeFileSync(path, content);
console.log('Replaced all tiny fonts with much larger ones.');
