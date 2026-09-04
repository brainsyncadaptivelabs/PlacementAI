import React from "react";
import { Bell, X } from "lucide-react";
import { useNotificationStore } from "@/store/notification-store";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markAllRead, deleteNotification } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 w-80 bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[400px] z-50 select-none">
      <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">AI Notifications</span>
        </div>
        <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase cursor-pointer">Mark All Read</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">All caught up!</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`flex items-start justify-between p-3 rounded-xl transition-all ${
              n.read ? "bg-muted/30 border border-transparent text-muted-foreground" : "bg-card border border-border shadow-sm text-card-foreground"
            }`}>
              <div className="flex-1 min-w-0 mr-2">
                <span className="text-[9px] uppercase font-bold text-primary tracking-wider block mb-0.5">{n.category}</span>
                <p className="text-xs font-semibold leading-relaxed truncate">{n.title}</p>
                <span className="text-[9px] text-muted-foreground/60 mt-1 block">{n.time}</span>
              </div>
              <button onClick={() => deleteNotification(n.id)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
