import React, { useState, useEffect, useRef } from "react";
import { CommandRegistry, Command } from "./CommandRegistry";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (action: string) => void;
}

export function CommandPalette({ isOpen, onClose, onExecute }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = CommandRegistry.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onExecute(filtered[selectedIndex].action);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onExecute]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-[15vh] z-[9999] select-none">
      <div className="w-full max-w-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[450px]">
        {/* Search bar */}
        <div className="flex items-center px-4 border-b border-slate-800 py-3.5 bg-slate-950/40">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No commands found.</div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => { onExecute(cmd.action); onClose(); }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                    isSelected ? "bg-indigo-600 text-white" : "hover:bg-slate-850 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-indigo-500 text-white" : "bg-slate-850 text-muted-foreground"
                    }`}>{cmd.category}</span>
                    <span>{cmd.name}</span>
                  </div>
                  {cmd.shortcut && (
                    <span className="text-[10px] text-muted-foreground/80 font-bold">{cmd.shortcut}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
