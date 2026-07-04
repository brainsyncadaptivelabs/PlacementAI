import React, { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";

export type AppNotification = {
  id: string;
  title: string;
  category: string;
  read: boolean;
  time: string;
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const list = [
      { id: "1", title: "Daily Placement Mission ready: STAR Resume updates!", category: "Missions", read: false, time: "2h ago" },
      { id: "2", title: "New interview mock feedback compiled from compiler exception.", category: "Interviews", read: false, time: "5h ago" },
      { id: "3", title: "Java roadmap updated with Spring Security reference widgets.", category: "Roadmaps", read: true, time: "1d ago" }
    ];
    setNotifications(list);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] z-50 select-none">
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">AI Notifications</span>
        </div>
        <button onClick={markAllRead} className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase cursor-pointer">Mark All Read</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">All caught up!</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex items-start justify-between p-3 rounded-xl transition-all ${
              n.read ? "bg-slate-900/30 border border-border/10 text-slate-400" : "bg-slate-850 border border-border/30 text-slate-200"
            }`}>
              <div className="flex-1 min-w-0 mr-2">
                <span className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider block mb-0.5">{n.category}</span>
                <p className="text-xs font-semibold leading-relaxed truncate">{n.title}</p>
                <span className="text-[9px] text-muted-foreground/60 mt-1 block">{n.time}</span>
              </div>
              <button onClick={() => deleteNotif(n.id)} className="text-muted-foreground hover:text-red-500 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
