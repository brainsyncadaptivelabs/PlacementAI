import { useState, useEffect, useCallback } from "react";
import { Conversation, ConversationStorage, Message } from "./ConversationStorage";

export function useConversationManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load from storage initially
  useEffect(() => {
    const list = ConversationStorage.getConversations();
    setConversations(list);
    if (list.length > 0) {
      setActiveConversationId(list[0].id);
    } else {
      const newC = ConversationStorage.createConversation("New Conversation");
      setConversations([newC]);
      setActiveConversationId(newC.id);
    }
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createNewChat = useCallback((title: string = "New Conversation") => {
    const newC = ConversationStorage.createConversation(title);
    setConversations(ConversationStorage.getConversations());
    setActiveConversationId(newC.id);
    return newC;
  }, []);

  const deleteChat = useCallback((id: string) => {
    const updated = ConversationStorage.deleteConversation(id);
    setConversations(updated);
    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        const newC = ConversationStorage.createConversation("New Conversation");
        setConversations([newC]);
        setActiveConversationId(newC.id);
      }
    }
  }, [activeConversationId]);

  const togglePin = useCallback((id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      const updated = ConversationStorage.updateConversation(id, { pinned: !target.pinned });
      setConversations(updated);
    }
  }, [conversations]);

  const toggleStar = useCallback((id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      const updated = ConversationStorage.updateConversation(id, { starred: !target.starred });
      setConversations(updated);
    }
  }, [conversations]);

  const toggleArchive = useCallback((id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      const updated = ConversationStorage.updateConversation(id, { archived: !target.archived });
      setConversations(updated);
    }
  }, [conversations]);

  const renameChat = useCallback((id: string, newTitle: string) => {
    const updated = ConversationStorage.updateConversation(id, { title: newTitle });
    setConversations(updated);
  }, []);

  const duplicateChat = useCallback((id: string) => {
    const target = conversations.find(c => c.id === id);
    if (target) {
      const newC = ConversationStorage.createConversation(target.title + " (Copy)");
      ConversationStorage.updateConversation(newC.id, { messages: [...target.messages] });
      setConversations(ConversationStorage.getConversations());
      setActiveConversationId(newC.id);
    }
  }, [conversations]);

  const updateMessages = useCallback((id: string, messages: Message[]) => {
    const updated = ConversationStorage.updateConversation(id, {
      messages,
      lastMessageAt: Date.now(),
      updatedAt: Date.now()
    });
    setConversations(updated);
  }, []);

  // Keyboard Shortcuts Hook integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createNewChat]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    searchQuery,
    setSearchQuery,
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
