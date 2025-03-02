
import React, { useState } from "react";
import { Lock, Key, Save, EyeOff, Eye, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  
  // Security preferences
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    localStorage.getItem('twoFactorEnabled') === 'true'
  );
  const [sessionTimeout, setSessionTimeout] = useState<boolean>(
    localStorage.getItem('sessionTimeout') === 'true'
  );
  const [dataEncryption, setDataEncryption] = useState<boolean>(
    localStorage.getItem('dataEncryption') !== 'false'
  );
  
  // Handle password update
  const handleUpdatePassword = async () => {
    // Validate inputs
    if (!currentPassword) {
      toast({
        title: "Missing Current Password",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle security settings update
  const handleUpdateSecuritySettings = () => {
    try {
      // Save to localStorage for demo purposes
      localStorage.setItem('twoFactorEnabled', twoFactorEnabled.toString());
      localStorage.setItem('sessionTimeout', sessionTimeout.toString());
      localStorage.setItem('dataEncryption', dataEncryption.toString());
      
      toast({
        title: "Security Settings Updated",
        description: "Your security preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your security settings.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Security Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your password and security preferences
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="h-6 text-xs"
                  >
                    {showPasswords ? (
                      <><EyeOff className="w-3 h-3 mr-1" /> Hide</>
                    ) : (
                      <><Eye className="w-3 h-3 mr-1" /> Show</>
                    )}
                  </Button>
                </div>
                <Input 
                  id="current-password" 
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleUpdatePassword} 
                className="mt-2"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor" className="text-base font-medium">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch 
                  id="two-factor"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="session-timeout" className="text-base font-medium">
                    Session Timeout
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after 30 minutes of inactivity
                  </p>
                </div>
                <Switch 
                  id="session-timeout"
                  checked={sessionTimeout}
                  onCheckedChange={setSessionTimeout}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-encryption" className="text-base font-medium">
                    Data Encryption
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable end-to-end encryption for sensitive health data
                  </p>
                </div>
                <Switch 
                  id="data-encryption"
                  checked={dataEncryption}
                  onCheckedChange={setDataEncryption}
                />
              </div>
              
              <Button 
                onClick={handleUpdateSecuritySettings}
                className="mt-2"
              >
                Save Security Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
