/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Clean up broken card classes with double border or leftover slashes
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#0b0c20\]\/40 \/80/g, 'bg-white border border-slate-200 shadow-sm');
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#0b0c20\]\/30 border \/80/g, 'bg-white border border-slate-200 shadow-sm');
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#03040c\]\/40 \/80/g, 'bg-white border border-slate-200 shadow-sm');
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#03040c\]\/40 p-6 flex flex-col items-center text-center gap-4/g, 'bg-white border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center gap-4');
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#03040c\]\/40 p-6 space-y-3 text-xs font-bold text-slate-700/g, 'bg-white border border-slate-200 shadow-sm p-6 space-y-3 text-xs font-bold text-slate-700');
content = content.replace(/bg-white border border-slate-200 shadow-sm bg-\[#03040c\]\/40 p-6/g, 'bg-white border border-slate-200 shadow-sm p-6');
content = content.replace(/bg-\[#0b0c20\]\/40 border-indigo-950\/60\/80 shadow-md/g, 'bg-white border border-slate-200 shadow-sm');
content = content.replace(/border-indigo-950\/60\/80/g, 'border-slate-200');
content = content.replace(/border-indigo-950\/60\/60/g, 'border-slate-200');
content = content.replace(/border-indigo-950\/60\/40/g, 'border-slate-200');
content = content.replace(/border-indigo-950\/60/g, 'border-slate-200');
content = content.replace(/bg-\[#03040c\]\/30/g, 'bg-slate-50');
content = content.replace(/bg-\[#03040c\]\/20/g, 'bg-slate-100');
content = content.replace(/divide-indigo-950\/30/g, 'divide-slate-200');

// 2. Fix the remaining CardTitles text-white to text-slate-800
content = content.replace(/<CardTitle className="text-white">/g, '<CardTitle className="text-slate-850 font-bold">');
content = content.replace(/<CardTitle className="text-white shadow-md">/g, '<CardTitle className="text-slate-850 font-bold shadow-md">');
content = content.replace(/text-white mb-6/g, 'text-slate-800 mb-6');
content = content.replace(/text-white mb-4/g, 'text-slate-800 mb-4');

// 3. Fix metric values text-white to text-slate-900
content = content.replace(/text-4xl font-black text-white/g, 'text-4xl font-black text-slate-900');
content = content.replace(/text-2xl font-black text-white/g, 'text-2xl font-black text-slate-900');
content = content.replace(/text-3xl font-black text-white/g, 'text-3xl font-black text-slate-900');
content = content.replace(/text-white font-black/g, 'text-slate-900 font-black');
content = content.replace(/text-xs font-bold text-center text-white/g, 'text-xs font-bold text-center text-slate-700');
content = content.replace(/text-xs font-bold text-white/g, 'text-xs font-bold text-slate-700');
content = content.replace(/text-xs font-black text-white/g, 'text-xs font-black text-slate-800');
content = content.replace(/text-slate-500 font-black/g, 'text-slate-800 font-black');

// 4. Clean up mock interview metrics boxes
content = content.replace(/bg-\[#03040c\]\/30 border border-slate-200 rounded-2xl/g, 'bg-slate-50 border border-slate-200 p-4 rounded-2xl');
content = content.replace(/text-indigo-400\/50/g, 'text-slate-500');

// 5. Cloud services grid text colors
content = content.replace(/text-white mt-2/g, 'text-slate-800 mt-2');
content = content.replace(/text-emerald-400 border-emerald-500\/20/g, 'text-emerald-700 border-emerald-250');
content = content.replace(/text-red-400 border-red-500\/20/g, 'text-red-750 border-red-250');
content = content.replace(/bg-slate-800 border-indigo-900\/40 text-slate-800/g, 'bg-slate-100 border-slate-200 text-slate-700');

// 6. Sidebar logout button style
content = content.replace(/bg-\[#03040c\]\/20 text-white/g, 'bg-slate-800 text-white');

// 7. Modal detail panel overrides (light theme)
content = content.replace(/bg-\[#03040c\]\/80 backdrop-blur-sm/g, 'bg-slate-900/45 backdrop-blur-sm');
content = content.replace(/bg-\[#0b0c20\] border border-slate-200 rounded-3xl/g, 'bg-white border border-slate-200 shadow-2xl rounded-3xl');
content = content.replace(/bg-\[#03040c\]\/40/g, 'bg-slate-50');
content = content.replace(/text-white text-right max-w-\[120px\] truncate/g, 'text-slate-800 text-right max-w-[120px] truncate');
content = content.replace(/text-white text-right/g, 'text-slate-850 text-right');
content = content.replace(/text-white/g, 'text-slate-900'); // Safe replacement for modal inner properties

// Clean up color code checks in badges
content = content.replace(/text-slate-900 font-bold/g, 'text-white font-bold'); // Revert buttons back to white text
content = content.replace(/text-slate-900 font-medium/g, 'text-slate-750 font-medium');

// Double border and slash sweep
content = content.replace(/\s+/g, ' ').trim();

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final light theme color optimization executed!');
