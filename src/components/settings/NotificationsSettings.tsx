
import React, { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const NotificationsSettings: React.FC = () => {
  const { toast } = useToast();
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    localStorage.getItem('emailNotifications') === 'true'
  );
  const [sleepInsights, setSleepInsights] = useState<boolean>(
    localStorage.getItem('sleepInsights') !== 'false'
  );
  const [trainingReminders, setTrainingReminders] = useState<boolean>(
    localStorage.getItem('trainingReminders') !== 'false'
  );
  const [weeklyReports, setWeeklyReports] = useState<boolean>(
    localStorage.getItem('weeklyReports') === 'true'
  );
  const [coachMessages, setCoachMessages] = useState<boolean>(
    localStorage.getItem('coachMessages') !== 'false'
  );
  
  // Handle save notifications settings
  const handleSaveNotifications = () => {
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem('emailNotifications', emailNotifications.toString());
      localStorage.setItem('sleepInsights', sleepInsights.toString());
      localStorage.setItem('trainingReminders', trainingReminders.toString());
      localStorage.setItem('weeklyReports', weeklyReports.toString());
      localStorage.setItem('coachMessages', coachMessages.toString());
      
      toast({
        title: "Notification Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your notification preferences.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure how and when you receive notifications about your health and performance
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Enable Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="sleep-insights" className="cursor-pointer">
                      Sleep Insights
                    </Label>
                  </div>
                  <Switch 
                    id="sleep-insights"
                    checked={sleepInsights}
                    onCheckedChange={setSleepInsights}
                    disabled={!emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="training-reminders" className="cursor-pointer">
                      Training Reminders
                    </Label>
                  </div>
                  <Switch 
                    id="training-reminders"
                    checked={trainingReminders}
                    onCheckedChange={setTrainingReminders}
                    disabled={!emailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between pl-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="weekly-reports" className="cursor-pointer">
                      Weekly Performance Reports
                    </Label>
                  </div>
                  <Switch 
                    id="weekly-reports"
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">In-App Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="coach-messages" className="cursor-pointer">
                    AI Coach Messages
                  </Label>
                </div>
                <Switch 
                  id="coach-messages"
                  checked={coachMessages}
                  onCheckedChange={setCoachMessages}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="p-6 flex justify-end">
            <Button onClick={handleSaveNotifications}>
              Save Notification Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
