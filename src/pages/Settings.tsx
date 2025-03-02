
import React from "react";
import PageTransition from "@/components/layout/PageTransition";
import { Settings as SettingsIcon, User2, Lock, Bell, ExternalLink, Laptop, Moon, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Settings: React.FC = () => {
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
          <nav className="space-y-1 hidden md:block">
            <Button variant="ghost" className="w-full justify-start">
              <User2 className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start bg-muted">
              <Key className="w-4 h-4 mr-2" />
              API Connections
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Laptop className="w-4 h-4 mr-2" />
              Appearance
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </Button>
          </nav>

          <div>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">API Connections</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Connect your sleep and training services to enable health and performance tracking
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                        <Moon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">Oura Ring</h3>
                        <p className="text-sm text-muted-foreground">Sleep and recovery data</p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>Connect</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="oura-api-key">API Key</Label>
                          <Input id="oura-api-key" type="password" placeholder="••••••••••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oura-client-id">Client ID</Label>
                          <Input id="oura-client-id" placeholder="Enter client ID" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="oura-auto-sync" />
                        <Label htmlFor="oura-auto-sync">Auto-sync sleep data daily</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#FC4C02] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.387 17.944V22L14.5 20.444L13.613 22V17.944H15.387ZM13.613 2V10.5L14.5 12.056L15.387 10.5V2H13.613Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Strava</h3>
                        <p className="text-sm text-muted-foreground">Training and workout data</p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>Connect</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="strava-client-id">Client ID</Label>
                          <Input id="strava-client-id" placeholder="Enter client ID" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="strava-client-secret">Client Secret</Label>
                          <Input id="strava-client-secret" type="password" placeholder="••••••••••••••••" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="strava-auto-import" />
                        <Label htmlFor="strava-auto-import">Auto-import new activities</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="strava-power-data" />
                        <Label htmlFor="strava-power-data">Include power data</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#74aa9c] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0097 6.0097 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-4.9107.5216 6.0462 6.0462 0 0 0-2.9001 6.5099 6.0097 6.0097 0 0 0 2.1713 11.2718c1.4884.6182 3.1953.6182 4.6837 0a6.0462 6.0462 0 0 0 6.5099-2.9001 6.0097 6.0097 0 0 0 11.2728-2.1713 5.9845 5.9845 0 0 0 .5157-4.9108Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">OpenAI</h3>
                        <p className="text-sm text-muted-foreground">AI-powered insights and coaching</p>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <span>Connect</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="openai-api-key">API Key</Label>
                        <Input id="openai-api-key" type="password" placeholder="sk-••••••••••••••••" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai-model">GPT Model</Label>
                        <select
                          id="openai-model"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option>gpt-4o</option>
                          <option>gpt-4</option>
                          <option>gpt-3.5-turbo</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="openai-daily-insights" />
                        <Label htmlFor="openai-daily-insights">Generate daily insights</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
