"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, Check, Search } from "lucide-react";

interface YearDropdownProps {
  value: number | "";
  onChange: (year: number | "") => void;
  error?: string;
}

export function YearDropdown({ value, onChange, error }: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const minYear = 2000;
  const maxYear = currentYear + 4;
  
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const filteredYears = years.filter((y) => y.toString().includes(search));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      const index = filteredYears.findIndex(y => y === value);
      setHighlightedIndex(index !== -1 ? index : 0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, value]);

  useEffect(() => {
    if (isOpen && scrollRef.current && highlightedIndex >= 0) {
      const itemsContainer = scrollRef.current.children[1];
      if (itemsContainer) {
        const item = itemsContainer.children[highlightedIndex] as HTMLElement;
        if (item) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredYears.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredYears.length) {
        onChange(filteredYears[highlightedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <style>{`
        .year-dropdown-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .year-dropdown-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .year-dropdown-scrollbar::-webkit-scrollbar-thumb {
          background: #4F46E5;
          border-radius: 10px;
        }
      `}</style>
      
      <div 
        className={`flex items-center justify-between w-full h-[52px] rounded-[14px] px-4 cursor-pointer transition-all duration-150 outline-none
          ${isOpen ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30' : 'border-[rgba(255,255,255,0.08)] hover:border-[#6366F1]'}
        `}
        style={{ 
          background: '#111827', 
          borderStyle: 'solid', 
          borderWidth: '1px'
        }}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <span className={`text-[15px] font-medium ${value ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}`}>
          {value || "Select graduation year..."}
        </span>
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <Calendar className="w-[18px] h-[18px]" />
          <ChevronDown className={`w-[18px] h-[18px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-2 year-dropdown-scrollbar overflow-y-auto max-h-[220px] md:max-h-[280px]"
            style={{
              background: '#0F172A',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
              padding: '8px'
            }}
            ref={scrollRef}
          >
            <div className="sticky top-0 bg-[#0F172A] z-10 pb-2">
              <div 
                className="flex items-center px-3 h-[42px] rounded-[10px]"
                style={{ background: '#1E293B' }}
              >
                <Search className="w-4 h-4 text-[#94A3B8] mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search year..."
                  className="w-full bg-transparent border-none outline-none text-[#F8FAFC] text-[15px] font-medium placeholder-[#94A3B8]"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {filteredYears.length === 0 ? (
                <div className="p-3 text-center text-[#94A3B8] text-sm font-medium">No years found</div>
              ) : (
                filteredYears.map((year, index) => {
                  const isSelected = value === year;
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <div
                      key={year}
                      onClick={() => {
                        onChange(year);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between h-[40px] shrink-0 px-[14px] rounded-[10px] cursor-pointer transition-colors duration-150 text-[15px] font-medium
                        ${isSelected ? 'text-white' : (isHighlighted ? 'bg-[#312E81] text-white' : 'text-[#E2E8F0]')}
                      `}
                      style={{
                        background: isSelected ? 'linear-gradient(to right, #4F46E5, #7C3AED)' : ''
                      }}
                    >
                      <span>{year}</span>
                      {isSelected && <Check className="w-[18px] h-[18px] text-white" />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-1.5 text-[13px] text-red-500 font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
