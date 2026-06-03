import React, { useEffect } from 'react';
import { useStore } from '../store';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useStore();

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-sm">
      {notifications.map((notification) => {
        const iconMap = {
          success: { icon: CheckCircle, color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' },
          error: { icon: AlertCircle, color: 'bg-red-500/10 border-red-500/50 text-red-400' },
          info: { icon: Info, color: 'bg-blue-500/10 border-blue-500/50 text-blue-400' },
        };

        const config = iconMap[notification.type] || iconMap.info;
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={`${config.color} border rounded-lg p-4 flex items-start gap-3 animate-slide-in`}
          >
            <Icon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {notification.title && (
                <p className="font-semibold text-sm">{notification.title}</p>
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;
