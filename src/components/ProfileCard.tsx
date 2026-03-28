import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";

export type UserProfile = {
  id?: string | number;
  fname: string;
  lname: string;
  username: string;
  contact: number;
  roles?: any;
  email?: string;
  avatar?: string;
  position_id: number;
  positions: any;
  department_id?: string;
  departments: any;
  branch_id?: string;
  branches: any;
  bio?: string;
  signature?: string;
  emp_id?: string;
  is_active: string;
};

interface ProfileCardProps {
  profile: UserProfile | null;
  variant?: "sidebar" | "header" | "compact";
  showLogout?: boolean;
  showSettings?: boolean;
  onLogout?: () => void;
  onSettings?: () => void;
  onEditProfile?: () => void;
  className?: string;
}

export default function ProfileCard({
  profile,
  variant = "sidebar",
  showLogout = true,
  showSettings = false,
  onLogout,
  onSettings,
  onEditProfile,
  className = "",
}: ProfileCardProps) {

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem("user");
      sessionStorage.clear();
      // window.location.href = "/";
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    }
  };

  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
          <img
            src="/user.png"
            alt={profile?.fname || "Profile"}
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {profile?.fname + " " + profile?.lname}
          </span>
          {profile?.roles && (
            <span className="text-xs text-gray-500">
              {profile.roles[0]?.name}
            </span>
          )}
        </div>
        {onEditProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditProfile}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 cursor-pointer hover:scale-110 transition-transform duration-200"
            title="Edit Profile"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 cursor-pointer hover:scale-110 transition-transform duration-200"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {showLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-3 text-white hover:bg-red-600 hover:text-white bg-red-500 text-xs cursor-pointer hover:scale-110 transition-transform duration-200"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200 ${className}`}
      >
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
          <img
            src="/user.png"
            alt={profile?.fname || "Profile"}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile?.fname + " " + profile?.lname}
          </p>
          {profile?.roles && (
            <p className="text-xs text-gray-500 truncate">
              {profile?.roles[0]?.name}
            </p>
          )}
          {profile?.department_id && (
            <p className="text-xs text-gray-400 truncate">
              {profile?.department_id}
            </p>
          )}
          {profile?.branch_id && (
            <p className="text-xs text-gray-400 truncate">
              {profile?.branch_id}
            </p>
          )}
        </div>
        <div className="flex space-x-1">
          {showSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettings}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {showLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default sidebar variant
  return (
    <div
      className={`p-4 rounded-lg bg-white/10 border border-white/20 ${className}`}
    >
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden mr-3">
          <img
            src="/user.png"
            alt={profile?.fname || "Profile"}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold truncate">
            {profile?.fname + " " + profile?.lname}
          </p>
          {profile?.roles && (
            <p className="text-blue-100 text-xs truncate">
              {profile?.roles[0]?.name}
            </p>
          )}
          {profile?.department_id && (
            <p className="text-blue-100 text-xs truncate">
              {profile?.department_id}
            </p>
          )}
          {profile?.branch_id && (
            <p className="text-blue-100 text-xs truncate">
              {profile?.branch_id}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex space-x-2">
        {showSettings && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSettings}
            className="flex-1 bg-white/10 text-white hover:bg-white/20 border-white/30 text-xs cursor-pointer"
          >
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        )}
        {showLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1 bg-red-500/20 text-red-200 hover:bg-red-500/30 border-red-400/30 text-xs cursor-pointer"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
