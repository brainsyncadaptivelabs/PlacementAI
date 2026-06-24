"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";

const notes = [
  { id: 1, title: "Two Pointers Technique", domain: "Data Structures & Algorithms", time: "10 min read", category: "DSA" },
  { id: 2, title: "Normalization in DBMS", domain: "Database Management System", time: "8 min read", category: "DBMS" },
  { id: 3, title: "Process vs Thread", domain: "Operating System", time: "12 min read", category: "OS" },
  { id: 4, title: "Array vs Linked List", domain: "Data Structures & Algorithms", time: "9 min read", category: "DSA" },
  { id: 5, title: "React Lifecycle Methods", domain: "Web Development", time: "15 min read", category: "Web Dev" },
  { id: 6, title: "Profit and Loss Formulas", domain: "Aptitude", time: "5 min read", category: "Aptitude" },
];

const categories = ["All", "DSA", "DBMS", "OS", "Web Dev", "Aptitude", "HR"];

export default function NotesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<number[]>([1, 4]);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const filteredNotes = selectedCategory === "All" 
    ? notes 
    : notes.filter(n => n.category === selectedCategory);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">Notes & Study Material</h1>
          <p className="text-muted-foreground">Hand-picked resources to help you master placement topics.</p>
        </div>
        <div className="relative w-full max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
           <Input placeholder="Search notes..." className="pl-10 bg-card border-border" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
         {categories.map(cat => (
            <Badge 
              key={cat} 
              variant={selectedCategory === cat ? "default" : "secondary"}
              className={`px-4 py-1.5 cursor-pointer text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
              onClick={() => setSelectedCategory(cat)}
            >
               {cat}
            </Badge>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
         {filteredNotes.map(note => (
            <Card key={note.id} className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-pointer overflow-hidden bg-card">
               <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                     <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h3>
                     <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">{note.domain}</p>
                     <div className="flex items-center gap-4 pt-2 text-muted-foreground/70 text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                           <Clock className="w-3.5 h-3.5" /> {note.time}
                        </span>
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(note.id); }}
                    className={`p-2 rounded-full transition-colors ${bookmarked.includes(note.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground/50 hover:bg-muted'}`}
                  >
                     {bookmarked.includes(note.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
               </CardContent>
            </Card>
         ))}
      </div>
    </div>
  );
}
