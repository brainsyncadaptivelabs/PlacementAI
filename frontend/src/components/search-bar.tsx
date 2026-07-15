import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="group relative flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full px-4 h-11 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all w-full max-w-[380px] lg:max-w-[480px] shrink-0">
      <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0" />
      <input 
        type="text" 
        placeholder="Search resumes, ATS, roadmap..." 
        className="flex-1 !bg-transparent !border-none !outline-none !ring-0 !shadow-none px-3 text-[14px] font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
      />
      <div className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none shrink-0 border border-slate-200/50 dark:border-slate-700/50">
        <span>Ctrl</span><span>K</span>
      </div>
    </div>
  );
}
