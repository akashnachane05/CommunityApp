// src/components/AlumniTopbar.jsx
import React from 'react';
import { Bell, Bot } from 'lucide-react';
import { Button } from '../../components/ui/button';
import ProfileMenu from './ProfileMenu'; // Assuming this component already exists
import { useAuth } from '../../auth/AuthContext';

// Accept the setActiveTab prop
const AlumniTopbar = ({ onToggleChatbot, setActiveTab }) => {
  const { user, logout, notifications, clearNotifications } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-end p-2 h-[60px] pr-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="relative" onClick={() => { alert(`You have ${notifications.length} new messages.`); clearNotifications(); }}>
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (<span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>)}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleChatbot} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Bot className="h-5 w-5" />
        </Button>
        {/* Pass the setActiveTab prop to ProfileMenu */}
        <ProfileMenu user={user} logout={logout} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default AlumniTopbar;