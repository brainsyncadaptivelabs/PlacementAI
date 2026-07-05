import React, { useState } from "react";
import { Conversation } from "./ConversationStorage";
import { Plus, Search, Pin, Star, Archive, Trash2, Edit3, Copy, Folder } from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onTogglePin,
  onToggleStar,
  onToggleArchive,
  onRename,
  onDuplicate
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
  );

  const groupConversations = (list: Conversation[]) => {
    const groups: Record<string, Conversation[]> = {
      Pinned: [],
      Today: [],
      Yesterday: [],
      "Last 7 Days": [],
      Older: []
    };

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    list.forEach(c => {
      if (c.archived) return;
      if (c.pinned) {
        groups.Pinned.push(c);
        return;
      }
      const diff = now - c.createdAt;
      if (diff < dayMs) {
        groups.Today.push(c);
      } else if (diff < 2 * dayMs) {
        groups.Yesterday.push(c);
      } else if (diff < 7 * dayMs) {
        groups["Last 7 Days"].push(c);
      } else {
        groups.Older.push(c);
      }
    });

    return groups;
  };

  const groups = groupConversations(filtered);

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-[300px] shrink-0 border-r border-border bg-card flex flex-col h-screen overflow-hidden text-card-foreground select-none">
      {/* Header with New Chat */}
      <div className="p-4 flex flex-col gap-3 border-b border-border/40">
        <button
          onClick={onCreate}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-secondary border border-border hover:bg-secondary/80 text-sm font-bold tracking-tight text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Input */}
        <div className="relative flex items-center bg-secondary/60 border border-border/50 rounded-xl px-3 py-1.5">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-xs text-slate-200 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Conversations Group List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(groups).map(([groupName, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={groupName} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-2.5 mb-1.5 flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-muted-foreground/40" />
                <span>{groupName}</span>
              </div>

              {list.map(c => {
                const isActive = c.id === activeId;
                const isEditing = c.id === editingId;

                return (
                  <div
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive ? "bg-secondary border border-border/40 text-foreground" : "hover:bg-secondary/40 text-slate-350"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveRename(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(c.id);
                          }}
                          autoFocus
                          className="w-full bg-transparent border-b border-indigo-500 outline-none text-xs text-foreground py-0.5"
                        />
                      ) : (
                        <div className="text-xs font-semibold truncate">{c.title}</div>
                      )}
                    </div>

                    {/* Quick Action Tools */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onTogglePin(c.id); }}
                          title={c.pinned ? "Unpin" : "Pin"}
                          className={`p-1 rounded hover:bg-secondary/80 hover:text-foreground transition-colors cursor-pointer ${c.pinned ? 'text-indigo-400' : 'text-muted-foreground/60'}`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleStar(c.id); }}
                          title={c.starred ? "Unstar" : "Star"}
                          className={`p-1 rounded hover:bg-secondary/80 hover:text-foreground transition-colors cursor-pointer ${c.starred ? 'text-amber-400' : 'text-muted-foreground/60'}`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleStartRename(c, e)}
                          title="Rename"
                          className="p-1 rounded hover:bg-secondary/80 hover:text-foreground transition-colors text-muted-foreground/60 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDuplicate(c.id); }}
                          title="Duplicate"
                          className="p-1 rounded hover:bg-secondary/80 hover:text-foreground transition-colors text-muted-foreground/60 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                          title="Delete"
                          className="p-1 rounded hover:bg-secondary/80 hover:text-red-500 transition-colors text-muted-foreground/60 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

