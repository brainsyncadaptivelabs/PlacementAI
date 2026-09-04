import { create } from 'zustand';

export type AppNotification = {
  id: string;
  title: string;
  category: string;
  read: boolean;
  time: string;
};

interface NotificationStore {
  notifications: AppNotification[];
  setNotifications: (notifications: AppNotification[]) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  hasUnread: () => boolean;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    { id: "1", title: "Daily Placement Mission ready: STAR Resume updates!", category: "Missions", read: false, time: "2h ago" },
    { id: "2", title: "New interview mock feedback compiled from compiler exception.", category: "Interviews", read: false, time: "5h ago" },
    { id: "3", title: "Java roadmap updated with Spring Security reference widgets.", category: "Roadmaps", read: true, time: "1d ago" }
  ],
  setNotifications: (notifications) => set({ notifications }),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  deleteNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  hasUnread: () => get().notifications.some(n => !n.read)
}));
