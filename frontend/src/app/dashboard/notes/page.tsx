"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { notesData, Note } from "@/data/notesData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

const categories = ["All", "Saved", "DSA", "DBMS", "OS", "Web Dev", "Python", "Java", "C", "C++", "JavaScript", "Aptitude"];

export default function NotesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  // Filter notes based on both category and search query
  const filteredNotes = notesData.filter(note => {
    const matchesCategory = selectedCategory === "All"
      ? true
      : selectedCategory === "Saved"
        ? bookmarked.includes(note.id)
        : note.category === selectedCategory;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      note.title.toLowerCase().includes(searchLower) ||
      note.domain.toLowerCase().includes(searchLower) ||
      note.category.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">Notes & Study Material</h1>
          <p className="text-muted-foreground">Hand-picked resources from W3Schools and GeeksforGeeks to help you master placement topics.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <Input 
            placeholder="Search notes..." 
            className="pl-10 bg-card border-border text-sm" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const isSaved = cat === "Saved";
          return (
            <Badge 
              key={cat} 
              variant={selectedCategory === cat ? "default" : "secondary"}
              className={`px-4 py-1.5 cursor-pointer text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === cat 
                  ? isSaved 
                    ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-500"
                    : "bg-primary text-white hover:bg-primary/95" 
                  : isSaved
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {isSaved && <Bookmark className="w-3.5 h-3.5 fill-current" />}
              {cat}
            </Badge>
          );
        })}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-card animate-fade-in">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {selectedCategory === "Saved" ? "No saved notes yet" : "No notes found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">
            {selectedCategory === "Saved" 
              ? "Bookmark interesting notes to access them here instantly."
              : "Try adjusting your search query or switching categories."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map(note => (
            <Card 
              key={note.id} 
              className="border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer overflow-hidden bg-card"
              onClick={() => setSelectedNote(note)}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">{note.domain}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 px-1.5 border-border/70 text-muted-foreground bg-muted/30">
                      {note.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 pt-2 text-muted-foreground/70 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {note.time}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleBookmark(note.id); 
                  }}
                  className={`p-2 rounded-full transition-colors shrink-0 ${
                    bookmarked.includes(note.id) 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground/50 hover:bg-muted"
                  }`}
                >
                  {bookmarked.includes(note.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note Detailed Reader Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <DialogContent 
          className="fixed inset-0 z-50 bg-background w-screen h-screen !max-w-none sm:!max-w-none md:!max-w-none lg:!max-w-none max-h-none !translate-x-0 !translate-y-0 !left-0 !top-0 rounded-none border-none !ring-0 p-0 flex flex-col overflow-hidden"
          showCloseButton={false}
        >
          {selectedNote && (
            <div className="flex flex-col h-full w-full">
              {/* Sticky Top Header */}
              <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-6 py-4 shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedNote(null)}
                    className="p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 text-sm font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Notes</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{selectedNote.domain}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleBookmark(selectedNote.id)}
                    className={`p-2 rounded-xl border border-border/80 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      bookmarked.includes(selectedNote.id) 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {bookmarked.includes(selectedNote.id) ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                </div>
              </header>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12 bg-background scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {/* Reading Column */}
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Article Metadata */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold uppercase tracking-wider text-xs">
                        {selectedNote.domain}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground font-semibold">
                        {selectedNote.time}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                        {selectedNote.category}
                      </Badge>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-foreground tracking-tight leading-tight border-b border-border/60 pb-6">
                      {selectedNote.title}
                    </h1>
                  </div>

                  {/* Markdown Content Area */}
                  <div className="prose-container pb-20 text-foreground">
                    <ReactMarkdown
                      components={{
                        h1: ({ node: _node, ...props }) => (
                          <h1 className="text-2xl font-extrabold font-heading text-foreground mt-8 mb-4 border-b border-border/40 pb-2" {...props} />
                        ),
                        h2: ({ node: _node, ...props }) => (
                          <h2 className="text-xl font-bold font-heading text-foreground mt-6 mb-3" {...props} />
                        ),
                        h3: ({ node: _node, ...props }) => (
                          <h3 className="text-lg font-semibold font-heading text-foreground mt-5 mb-2" {...props} />
                        ),
                        p: ({ node: _node, ...props }) => (
                          <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed mb-5" {...props} />
                        ),
                        ul: ({ node: _node, ...props }) => (
                          <ul className="list-disc pl-6 mb-5 space-y-2 text-sm md:text-base text-muted-foreground/90" {...props} />
                        ),
                        ol: ({ node: _node, ...props }) => (
                          <ol className="list-decimal pl-6 mb-5 space-y-2 text-sm md:text-base text-muted-foreground/90" {...props} />
                        ),
                        li: ({ node: _node, ...props }) => (
                          <li className="leading-relaxed text-muted-foreground/95" {...props} />
                        ),
                        code: ({ node: _node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const inline = !match;
                          return inline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-primary font-mono font-medium" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="relative group/code my-5">
                              <pre className="bg-muted/65 border border-border/80 p-5 rounded-2xl overflow-x-auto text-xs md:text-sm font-mono text-foreground shadow-inner">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        },
                        table: ({ node: _node, ...props }) => (
                          <div className="overflow-x-auto my-6 border border-border/60 rounded-xl">
                            <table className="w-full text-sm border-collapse text-left" {...props} />
                          </div>
                        ),
                        thead: ({ node: _node, ...props }) => (
                          <thead className="bg-muted/70 text-foreground border-b border-border/80" {...props} />
                        ),
                        th: ({ node: _node, ...props }) => (
                          <th className="p-3 font-semibold text-xs uppercase tracking-wider" {...props} />
                        ),
                        td: ({ node: _node, ...props }) => (
                          <td className="p-3 border-b border-border/40 text-muted-foreground" {...props} />
                        ),
                        blockquote: ({ node: _node, ...props }) => (
                          <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-1 pr-2 rounded-r-lg my-5 italic text-muted-foreground" {...props} />
                        ),
                      }}
                    >
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
