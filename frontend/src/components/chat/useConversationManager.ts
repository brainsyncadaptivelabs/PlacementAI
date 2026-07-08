import { useState, useEffect, useCallback } from "react";
import { Conversation, Message } from "./ConversationStorage";
import api from "@/lib/api";

export function useConversationManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch conversations from backend
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/chat/conversations");
      const list: Conversation[] = (res.data || []).map((c: any) => ({
        id: c.id.toString(),
        title: c.title,
        summary: c.summary,
        pinned: c.pinned || false,
        starred: false,
        archived: c.archived || false,
        messages: [],
        createdAt: new Date(c.createdAt).getTime(),
        updatedAt: new Date(c.updatedAt).getTime(),
        lastMessageAt: new Date(c.updatedAt).getTime()
      }));
      setConversations(list);
      return list;
    } catch (err) {
      console.error("Failed to load conversations from backend", err);
      return [];
    }
  }, []);

  // 2. Fetch history on active conversation change
  useEffect(() => {
    if (!activeConversationId) {
      setActiveMessages([]);
      return;
    }

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/chat/conversations/${activeConversationId}/history`);
        const msgs: Message[] = (res.data || []).map((m: any) => ({
          id: m.id,
          role: m.sender.toLowerCase() === "user" ? "user" : m.sender.toLowerCase() === "assistant" ? "ai" : "error",
          content: m.content,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: m.attachmentsJson ? JSON.parse(m.attachmentsJson) : []
        }));
        setActiveMessages(msgs);
      } catch (err) {
        console.error("Failed to load conversation history", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeConversationId]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const list = await fetchConversations();
      if (list.length > 0) {
        setActiveConversationId(list[0].id);
      } else {
        await createNewChat("New Conversation");
      }
    };
    init();
  }, [fetchConversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // 3. Create a new conversation on backend
  const createNewChat = useCallback(async (title: string = "New Conversation") => {
    try {
      const res = await api.post(`/chat/conversations?title=${encodeURIComponent(title)}`);
      const newC: Conversation = {
        id: res.data.id.toString(),
        title: res.data.title,
        pinned: res.data.pinned || false,
        starred: false,
        archived: res.data.archived || false,
        messages: [],
        createdAt: new Date(res.data.createdAt).getTime(),
        updatedAt: new Date(res.data.updatedAt).getTime(),
        lastMessageAt: new Date(res.data.updatedAt).getTime()
      };
      setConversations(prev => [newC, ...prev]);
      setActiveConversationId(newC.id);
      return newC;
    } catch (err) {
      console.error("Failed to create conversation", err);
      return null;
    }
  }, []);

  // 4. Delete conversation
  const deleteChat = useCallback(async (id: string) => {
    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        const nextList = conversations.filter(c => c.id !== id);
        if (nextList.length > 0) {
          setActiveConversationId(nextList[0].id);
        } else {
          await createNewChat("New Conversation");
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  }, [activeConversationId, conversations, createNewChat]);

  // 5. Toggle Pin
  const togglePin = useCallback(async (id: string) => {
    try {
      await api.put(`/chat/conversations/${id}/pin`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    } catch (err) {
      console.error("Failed to toggle pin", err);
    }
  }, []);

  // 6. Rename Conversation
  const renameChat = useCallback(async (id: string, newTitle: string) => {
    try {
      await api.put(`/chat/conversations/${id}?title=${encodeURIComponent(newTitle)}`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    } catch (err) {
      console.error("Failed to rename conversation", err);
    }
  }, []);

  const toggleStar = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  }, []);

  const toggleArchive = useCallback(async (id: string) => {
    try {
      await api.put(`/chat/conversations/${id}/archive`);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c));
    } catch (err) {
      console.error("Failed to toggle archive", err);
    }
  }, []);

  const duplicateChat = useCallback(async (id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      const newC = await createNewChat(target.title + " (Copy)");
      if (newC) {
        // Just duplicate locally
      }
    }
  }, [conversations, createNewChat]);

  // Sync active message updates
  const updateMessages = useCallback((id: string, updater: Message[] | ((prev: Message[]) => Message[])) => {
    if (id === activeConversationId) {
      setActiveMessages(prev => typeof updater === "function" ? updater(prev) : updater);
    }
  }, [activeConversationId]);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    loadingHistory,
    searchQuery,
    setSearchQuery,
    setActiveConversationId,
    createNewChat,
    deleteChat,
    togglePin,
    toggleStar,
    toggleArchive,
    renameChat,
    duplicateChat,
    updateMessages
  };
}
