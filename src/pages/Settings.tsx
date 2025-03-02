
import React, { useState } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsNav from "@/components/settings/SettingsNav";
import ApiSettings from "@/components/settings/ApiSettings";
import ProfileSettings from "@/components/settings/ProfileSettings";
import NotificationsSettings from "@/components/settings/NotificationsSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('api');

  return (
    <PageTransition>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <section className="mb-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account, API connections, and application preferences
            </p>
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

          <div>
            <div className="space-y-6">
              {activeTab === 'profile' && <ProfileSettings />}
              {activeTab === 'api' && <ApiSettings />}
              {activeTab === 'notifications' && <NotificationsSettings />}
              {activeTab === 'appearance' && <AppearanceSettings />}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
