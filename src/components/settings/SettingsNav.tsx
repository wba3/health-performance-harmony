
import React from "react";
import { Button } from "@/components/ui/button";
import { User2, Key, Bell, Laptop, Lock } from "lucide-react";

interface SettingsNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsNav: React.FC<SettingsNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="space-y-1 hidden md:block">
      <Button 
        variant="ghost" 
        className={`w-full justify-start ${activeTab === 'profile' ? 'bg-muted' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User2 className="w-4 h-4 mr-2" />
        Profile
      </Button>
      <Button 
        variant="ghost" 
        className={`w-full justify-start ${activeTab === 'api' ? 'bg-muted' : ''}`}
        onClick={() => onTabChange('api')}
      >
        <Key className="w-4 h-4 mr-2" />
        API Connections
      </Button>
      <Button 
        variant="ghost" 
        className={`w-full justify-start ${activeTab === 'notifications' ? 'bg-muted' : ''}`}
        onClick={() => onTabChange('notifications')}
      >
        <Bell className="w-4 h-4 mr-2" />
        Notifications
      </Button>
      <Button 
        variant="ghost" 
        className={`w-full justify-start ${activeTab === 'appearance' ? 'bg-muted' : ''}`}
        onClick={() => onTabChange('appearance')}
      >
        <Laptop className="w-4 h-4 mr-2" />
        Appearance
      </Button>
      <Button 
        variant="ghost" 
        className={`w-full justify-start ${activeTab === 'security' ? 'bg-muted' : ''}`}
        onClick={() => onTabChange('security')}
      >
        <Lock className="w-4 h-4 mr-2" />
        Security
      </Button>
    </nav>
  );
};

export default SettingsNav;
