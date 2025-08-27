import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/button';
import { Bot } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import NotificationDropdown from '../../components/NotificationDropdown';

const StudentTopbar = ({ onToggleChatbot, setActiveTab ,onNotificationClick}) => {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b flex items-center justify-end p-2 h-[60px] pr-6">
      <div className="flex items-center space-x-2">
        <NotificationDropdown onNotificationClick={onNotificationClick} />
        <Button variant="ghost" size="icon" onClick={onToggleChatbot} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
          <Bot className="h-5 w-5" />
        </Button>
        <ProfileMenu user={user} setActiveTab={setActiveTab} logout={logout} />
      </div>
    </div>
  );
};
export default StudentTopbar;