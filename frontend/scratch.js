const fs = require('fs');
const path = 'c:/Users/likit/Desktop/PlacementAI/frontend/src/app/dashboard/resume-builder/editor/editor-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace standard input borders to larger size
content = content.replace(/className="rounded-xl border-border"/g, 'className="rounded-xl border-slate-200 h-11 px-4 text-sm"');
content = content.replace(/className="rounded-xl border-border h-9"/g, 'className="rounded-xl border-slate-200 h-11 px-4 text-sm"');

// Replace standard small labels
content = content.replace(/className="text-\[10px\]">/g, 'className="text-xs font-bold text-slate-700">');

// Replace explicit For labels
content = content.replace(/<Label htmlFor="([a-z]+)">/g, '<Label htmlFor="$1" className="text-xs font-bold text-slate-700">');

// Replace Textareas
content = content.replace(/className="rounded-xl border-border resize-none text-xs"/g, 'className="rounded-xl border-slate-200 resize-none text-sm p-4"');
content = content.replace(/className="rounded-xl border-border resize-none leading-relaxed"/g, 'className="rounded-xl border-slate-200 resize-none text-sm p-4 leading-relaxed"');

// Replace tabs wrapper
content = content.replace(/<div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">/g, '<div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">');
content = content.replace(/className="grid grid-cols-4 gap-1 bg-slate-200\/50 p-1 rounded-xl"/g, 'className="grid grid-cols-4 gap-1 bg-slate-200/50 p-1.5 rounded-xl"');

// Replace tabs
content = content.replace(/className={`py-1 text-\[8px\] font-black uppercase tracking-wider rounded-lg transition-all \${/g, 'className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${');

// Add degrees, add jobs, add projects buttons
content = content.replace(/className="rounded-xl bg-slate-900 text-white font-bold h-8 text-\[10px\]"/g, 'className="rounded-xl bg-slate-900 text-white font-bold h-9 px-4 text-xs shadow-sm hover:shadow"');

fs.writeFileSync(path, content);
console.log('Done');
