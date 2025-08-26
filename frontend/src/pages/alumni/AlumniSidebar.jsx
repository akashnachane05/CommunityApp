// src/components/AlumniSidebar.jsx
import React from 'react';
import { Home, Users, Calendar, BookOpen, MessageCircle, Briefcase, Bot, ArrowRight, X, LogOut, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils'; // Assuming you have a utility function for conditional class names

const AlumniSidebar = ({ isCollapsed, onToggle, activeTab, onSetActiveTab, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, tab: 'dashboard' },
    { name: 'Mentorship', icon: Users, tab: 'mentorship' },
    { name: 'Events', icon: Calendar, tab: 'events' },
    { name: 'Community', icon: MessageCircle, tab: 'community' },
    { name: 'Resources', icon: BookOpen, tab: 'resources' },
    { name: 'Jobs', icon: Briefcase, tab: 'jobs' },
  ];

  return (
    <div className={cn(
      "h-screen bg-white/90 backdrop-blur-md border-r border-gray-200/50 sticky top-0 transition-all duration-300 ease-in-out z-40 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
       <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">VITAA</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="rounded-full"
        >
          {isCollapsed ? <ArrowRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 mt-4 space-y-2 px-2">
        {navItems.map((item) => (
          <Button
            key={item.tab}
            variant="ghost"
            size="lg"
            className={cn(
              "w-full justify-start h-12 rounded-lg",
              activeTab === item.tab
                ? "bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200"
                : "text-gray-700 hover:bg-gray-100",
              isCollapsed && "justify-center p-0 w-12 h-12"
            )}
            onClick={() => onSetActiveTab(item.tab)}
          >
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.name}
          </Button>
        ))}
      </nav>

      {/* --- Logout Button --- */}
      <div className="p-2 mt-auto border-t border-gray-200">
        <Button
          variant="ghost"
          size="lg"
          onClick={onLogout}
          className={cn(
            "w-full justify-start h-12 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700",
            isCollapsed && "justify-center p-0 w-12 h-12"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default AlumniSidebar;