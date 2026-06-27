import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="group relative flex items-center bg-card/80 backdrop-blur-[16px] rounded-[18px] px-[18px] h-[54px] border border-border/50 shadow-sm hover:-translate-y-[1px] focus-within:scale-[1.015] focus-within:shadow-[0_8px_28px_rgba(0,0,0,0.05),0_0_0_4px_rgba(99,102,241,0.08)] transition-all duration-250 ease-in-out w-full max-w-full md:max-w-[380px] lg:max-w-[480px] shrink-0">
      <style>{`
        input.global-search-bar-input,
        input.global-search-bar-input:not(.oauth-btn) {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          border-radius: 0px !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 0 0 12px !important;
          margin: 0 !important;
          height: 100% !important;
          width: 100% !important;
          min-height: 0 !important;
        }
        input.global-search-bar-input:focus,
        input.global-search-bar-input:hover {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      
      <Search className="w-[18px] h-[18px] text-muted-foreground opacity-65 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 shrink-0" />
      <input 
        type="text" 
        placeholder="Search resumes, ATS, roadmap..." 
        className="global-search-bar-input flex-1 bg-transparent border-none focus:outline-none focus:ring-0 focus:border-transparent text-[15px] font-medium text-foreground placeholder-muted-foreground outline-none !outline-none !ring-0 !shadow-none"
        style={{ outline: 'none', boxShadow: 'none' }}
      />
      <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold text-muted-foreground/70 select-none font-sans whitespace-nowrap shrink-0">
        <span>Ctrl</span><span>K</span>
      </div>
    </div>
  );
}
