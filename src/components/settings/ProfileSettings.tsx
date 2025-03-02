
import React, { useState } from "react";
import { User2, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileSettings: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile state
  const [firstName, setFirstName] = useState<string>(localStorage.getItem('userFirstName') || '');
  const [lastName, setLastName] = useState<string>(localStorage.getItem('userLastName') || '');
  const [email, setEmail] = useState<string>(localStorage.getItem('userEmail') || '');
  const [bio, setBio] = useState<string>(localStorage.getItem('userBio') || '');
  const [location, setLocation] = useState<string>(localStorage.getItem('userLocation') || '');
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to update your profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName,
          last_name: lastName,
          bio: bio,
          location: location
        }
      });
      
      if (error) throw error;
      
      // Save to localStorage for demo purposes
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userBio', bio);
      localStorage.setItem('userLocation', location);
      
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User2 className="w-5 h-5 mr-2" />
          Profile Settings
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your personal information and profile settings
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="rounded-lg border shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{firstName} {lastName}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </Button>
          </div>
          <Separator />
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true}
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your email address cannot be changed
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Your location (e.g., City, Country)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
              
              {isEditing && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleUpdateProfile}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
