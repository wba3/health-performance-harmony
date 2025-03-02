
import React, { useState, useEffect } from "react";
import { Laptop, Sun, Moon, MonitorSmartphone, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const AppearanceSettings: React.FC = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Layout preferences
  const [dashboardLayout, setDashboardLayout] = useState<string>(
    localStorage.getItem('dashboardLayout') || 'compact'
  );
  
  // Font size preference
  const [fontSize, setFontSize] = useState<string>(
    localStorage.getItem('fontSize') || 'medium'
  );
  
  // Only run on the client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleSaveAppearance = () => {
    try {
      // Save to localStorage
      localStorage.setItem('dashboardLayout', dashboardLayout);
      localStorage.setItem('fontSize', fontSize);
      
      toast({
        title: "Appearance Settings Saved",
        description: "Your appearance preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your appearance preferences.",
        variant: "destructive",
      });
    }
  };
  
  // Avoid rendering with server-side theme
  if (!mounted) {
    return null;
  }
  
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Laptop className="w-5 h-5 mr-2" />
          Appearance Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Customize the look and feel of your health &amp; performance dashboard
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Theme</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div 
                className={`rounded-lg p-4 border-2 cursor-pointer flex flex-col items-center ${
                  theme === 'light' ? 'border-primary bg-accent/50' : 'border-border'
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-10 h-10 mb-3" />
                <span className="font-medium">Light</span>
              </div>
              
              <div 
                className={`rounded-lg p-4 border-2 cursor-pointer flex flex-col items-center ${
                  theme === 'dark' ? 'border-primary bg-accent/50' : 'border-border'
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-10 h-10 mb-3" />
                <span className="font-medium">Dark</span>
              </div>
              
              <div 
                className={`rounded-lg p-4 border-2 cursor-pointer flex flex-col items-center ${
                  theme === 'system' ? 'border-primary bg-accent/50' : 'border-border'
                }`}
                onClick={() => setTheme('system')}
              >
                <MonitorSmartphone className="w-10 h-10 mb-3" />
                <span className="font-medium">System</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Dashboard Layout</h3>
            
            <Tabs defaultValue={dashboardLayout} onValueChange={setDashboardLayout}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compact">Compact</TabsTrigger>
                <TabsTrigger value="expanded">Expanded</TabsTrigger>
              </TabsList>
              <TabsContent value="compact" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="border rounded-lg p-4 flex space-x-2">
                      <div className="w-1/2 space-y-2">
                        <div className="h-20 bg-muted rounded-lg"></div>
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                      <div className="w-1/2 space-y-2">
                        <div className="h-20 bg-muted rounded-lg"></div>
                        <div className="h-20 bg-muted rounded-lg"></div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compact layout shows more data at once with smaller cards.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="expanded" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="h-24 bg-muted rounded-lg"></div>
                      <div className="h-24 bg-muted rounded-lg"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Expanded layout provides larger cards with more detailed information.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <Separator />
          
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Font Size</h3>
            
            <RadioGroup defaultValue={fontSize} onValueChange={setFontSize} className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="font-small" />
                <Label htmlFor="font-small" className="text-sm">Small</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="font-medium" />
                <Label htmlFor="font-medium" className="text-base">Medium</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large" className="text-lg">Large</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="p-6 flex justify-end">
            <Button onClick={handleSaveAppearance}>
              Save Appearance Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
