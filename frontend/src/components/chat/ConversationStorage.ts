export type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  time: string;
  attachments?: any[];
};

export type Conversation = {
  id: string;
  title: string;
  summary?: string;
  messages: Message[];
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
};

const STORAGE_KEY = "placementai_conversations_v5";

export const ConversationStorage = {
  getConversations(): Conversation[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse conversations from storage", e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to storage", e);
    }
  },

  createConversation(title: string = "New Conversation"): Conversation {
    const newConv: Conversation = {
      id: Math.random().toString(36).substring(7),
      title,
      messages: [],
      pinned: false,
      starred: false,
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessageAt: Date.now()
    };
    const current = this.getConversations();
    this.saveConversations([newConv, ...current]);
    return newConv;
  },

  deleteConversation(id: string): Conversation[] {
    const current = this.getConversations();
    const updated = current.filter(c => c.id !== id);
    this.saveConversations(updated);
    return updated;
  },

  updateConversation(id: string, updates: Partial<Conversation>): Conversation[] {
    const current = this.getConversations();
    const updated = current.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          updatedAt: Date.now()
        };
      }
      return c;
    });
    this.saveConversations(updated);
    return updated;
  }
};
