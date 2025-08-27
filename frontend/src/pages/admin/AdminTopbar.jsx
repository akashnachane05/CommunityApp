import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Avatar, AvatarFallback ,AvatarImage} from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Bell, Bot } from 'lucide-react';

const AdminTopbar = ({ onToggleChatbot }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b flex items-center justify-end p-2 h-[60px] pr-6">
      <div className="flex items-center space-x-4">
        {/* ✅ NEW: Notification and Chatbot buttons */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {/* Placeholder for notification count */}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleChatbot} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Bot className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 cursor-pointer">
        <Avatar className="ring-2 ring-blue-100">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
           {user?.fullName
            ? (() => {
                const parts = user.fullName.trim().split(/\s+/)
                const first = parts[0]?.charAt(0) || ""
                const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : ""
                return first + last
                })()
            : "U"}
          </AvatarFallback>
        </Avatar>

      </div>

        
         
      </div>
    </div>
  );
};

export default AdminTopbar;