import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import api from '../api/axios';

export default function NotificationDropdown({ onNotificationClick }) {
    const [notifications, setNotifications] = useState([]);
    
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check for new notifications every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleItemClick = async (notification) => {
        // 1. Immediately open the chat window by calling the function from the parent dashboard
        if (notification.type === 'NEW_MESSAGE' && onNotificationClick) {
            onNotificationClick(notification.sender);
        }

        // 2. Delete the notification from the backend
        try {
            await api.delete(`/notifications/${notification._id}`);
            // 3. Instantly remove the notification from the UI without a full refresh
            setNotifications(prevNotifications => 
                prevNotifications.filter(n => n._id !== notification._id)
            );
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const unreadCount = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 mr-4">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>You're all caught up!</DropdownMenuItem>
                ) : (
                    notifications.map(n => (
                        <DropdownMenuItem key={n._id} onClick={() => handleItemClick(n)} className="flex items-start space-x-2 cursor-pointer">
                            <MessageSquare className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0"/>
                            <div>
                                <p className="text-sm font-medium">{n.message}</p>
                                <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}