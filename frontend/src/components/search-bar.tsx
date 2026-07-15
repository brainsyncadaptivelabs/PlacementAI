import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="group relative flex items-center bg-white dark:bg-slate-900 rounded-full px-4 h-12 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all w-full max-w-[380px] lg:max-w-[480px] shrink-0">
      <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors shrink-0" />
      <input 
        type="text" 
        placeholder="Search resumes, ATS, roadmap..." 
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-3 text-[15px] font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 w-full"
      />
      <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none shrink-0">
        <span>Ctrl</span><span>K</span>
      </div>
    </div>
  );
}
