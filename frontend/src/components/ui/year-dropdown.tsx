"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Search } from "lucide-react";

interface YearDropdownProps {
  value: number | "";
  onChange: (year: number | "") => void;
  error?: string;
}

export function YearDropdown({ value, onChange, error }: YearDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
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
        setIsFocused(false);
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
      const item = scrollRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setIsFocused(true);
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
        setIsFocused(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setIsFocused(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleContainerFocus = () => {
    setIsFocused(true);
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  return (
    <div 
      className="relative w-full" 
      ref={containerRef}
      onFocus={handleContainerFocus}
      onBlur={handleContainerBlur}
    >
      <style>{`
        .custom-year-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-year-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-year-scroll::-webkit-scrollbar-thumb {
          background: #5E6AFF;
          border-radius: 999px;
        }
        .custom-year-scroll {
          scrollbar-width: thin;
          scrollbar-color: #5E6AFF transparent;
        }
        input.custom-year-search-input,
        input.custom-year-search-input:not(.oauth-btn) {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          border-radius: 0px !important;
          outline: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          color: #F8FAFC !important;
          width: 100% !important;
          height: 100% !important;
        }
        .custom-year-search-input::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }
      `}</style>
      
      {/* input closed state */}
      <div 
        className={`flex items-center justify-between w-full h-[56px] rounded-[16px] px-[16px] cursor-pointer transition-all duration-200 outline-none hover:border-[#6D5CFF]`}
        style={{ 
          background: '#121827', 
          borderStyle: 'solid', 
          borderWidth: '1px',
          borderColor: (isFocused || isOpen) ? '#6D5CFF' : 'rgba(255,255,255,0.08)',
          boxShadow: (isFocused || isOpen) ? '0 0 0 4px rgba(109,92,255,0.18)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <span className={`text-[15px] font-medium ${value ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'}`}>
          {value || "Select graduation year..."}
        </span>
        <div className="flex items-center gap-[12px] text-[#94A3B8]">
          <Calendar className="w-[18px] h-[18px] text-[#94A3B8]" />
          <svg 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 text-[#94A3B8] ${isOpen ? '' : 'rotate-180'}`}
          >
            <path d="M5 0L10 6H0L5 0Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-2 overflow-hidden"
            style={{
              background: '#121827',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.45)',
              maxHeight: '320px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* search bar sticky at top */}
            <div className="p-[8px] border-b border-[rgba(255,255,255,0.04)] shrink-0">
              <div 
                className="flex items-center px-[14px] h-[44px] rounded-[14px]"
                style={{ background: '#1A2236' }}
              >
                <Search className="w-4 h-4 text-[rgba(255,255,255,0.45)] mr-[10px] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className="custom-year-search-input"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* scrollable year list */}
            <div 
              className="custom-year-scroll overflow-y-auto p-[8px] flex flex-col gap-[4px] grow"
              ref={scrollRef}
            >
              {filteredYears.length === 0 ? (
                <div className="py-[24px] text-center text-[rgba(255,255,255,0.45)] text-[14px] font-medium">
                  No matching year found
                </div>
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
                        setIsFocused(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className="year-item flex items-center justify-between h-[44px] shrink-0 px-[16px] rounded-[12px] cursor-pointer transition-all duration-150 text-[15px] font-medium"
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(90deg, #6D5CFF 0%, #8A6EFF 100%)' 
                          : (isHighlighted ? 'rgba(124,92,255,0.15)' : 'transparent'),
                        color: isSelected ? '#FFFFFF' : '#E8ECF8'
                      }}
                    >
                      <span>{year}</span>
                      {isSelected && (
                        <Check className="w-[16px] h-[16px] text-white stroke-[2.5]" />
                      )}
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
