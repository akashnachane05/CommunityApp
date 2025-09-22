import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import api from '../api/axios';

export default function NotificationDropdown({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Group notifications by senderId while keeping the original sender object (if available)
  const groupedNotifications = notifications.reduce((acc, n) => {
    // n.sender can either be a populated object or just an id string
    const senderObj = n.sender && typeof n.sender === 'object' ? n.sender : null;
    const senderId = senderObj
      ? (senderObj._id ? senderObj._id.toString() : String(senderObj))
      : (typeof n.sender === 'string' ? n.sender : 'unknown');

    if (!acc[senderId]) {
      acc[senderId] = {
        senderId,
        sender: senderObj || senderId, // keep object if available, otherwise id
        senderName: (senderObj && (senderObj.fullName || senderObj.name)) || 'Unknown Sender',
        count: 0,
        lastMessage: '',
        lastCreatedAt: null,
      };
    }

    acc[senderId].count += 1;
    acc[senderId].lastMessage = n.message || acc[senderId].lastMessage;
    acc[senderId].lastCreatedAt = n.createdAt || acc[senderId].lastCreatedAt;
    return acc;
  }, {});

  // When user clicks a grouped item, open chat (pass sender object when possible),
  // then delete all notifications for that sender and update state from backend response.
  const handleSenderClick = async (group) => {
    try {
      // Open chat. Pass the sender object if available (keeps ChatWindow contract same as before)
      if (onNotificationClick) {
        onNotificationClick(group.sender);
      }

      const res = await api.delete(`/notifications/sender/${group.senderId}`);
      // expecting { notifications: [...] } from backend as implemented earlier
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to delete notifications for sender', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await api.delete('/notifications/clear-all');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to clear all notifications', err);
    }
  };

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 mr-4">
        <div className="flex justify-between items-center px-2 py-1">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 flex items-center"
              onClick={handleClearAll}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>You're all caught up!</DropdownMenuItem>
        ) : (
          <>
            {Object.values(groupedNotifications).map((group) => (
              <DropdownMenuItem
                key={group.senderId}
                onClick={() => handleSenderClick(group)}
                className="flex items-start space-x-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{group.senderName}</p>
                  <p className="text-xs text-gray-500">
                    {group.count} new message{group.count > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last: {group.lastCreatedAt ? new Date(group.lastCreatedAt).toLocaleString() : '—'}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
