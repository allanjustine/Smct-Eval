"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import RealLoadingScreen from "@/components/RealLoadingScreen";
import { toastMessages } from "@/lib/toastMessages";
import { apiService } from "@/lib/apiService";
import { useRouter } from "next/navigation";

export interface User {
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
  notifications: any;
  notification_counts: number;
  approvedSignatureReset: number;
  requestSignatureReset: number;
  created_at?: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export const useAuth = useUser;

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutLoading, setShowLogoutLoading] = useState(false);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoize refreshUser to prevent unnecessary re-renders
  const refreshUser = useCallback(async () => {
    try {
      const res = await apiService.authUser();
      const userData = res?.data || res;
      setUser(userData);
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      // If 401, user is not authenticated - clear user state
      // This is expected when no user is logged in, so we handle silently
      if (status === 401) {
        setUser(null);
        // Don't log 401 errors as they're expected when not authenticated
        return;
      }
      // Only log non-401 errors
      console.error("Error refreshing user:", error);
    }
  }, []); // Empty dependency array since apiService is stable

  // Load user auth on mount (only once)
  useEffect(() => {
    let isMounted = true;
    const loadUserAuth = async () => {
      try {
        const res = await apiService.authUser();
        if (isMounted) {
          const userData = res?.data || res;
          setUser(userData);
        }
      } catch (error: any) {
        if (!isMounted) return;
        const status = error?.status || error?.response?.status;
        // If 401, user is not authenticated - clear user state
        // This is expected when no user is logged in, so we handle silently
        if (status === 401) {
          setUser(null);
          // Don't log 401 errors as they're expected when not authenticated
        } else {
          // Only log non-401 errors
          console.error("Error during session restoration:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadUserAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Handle explicit refresh requests
  useEffect(() => {
    if (isRefreshing) {
      refreshUser().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [isRefreshing]); // Only run when isRefreshing changes

  // Poll for signature reset approval status (only when there's a pending request)
  // This runs globally once, not per component instance
  useEffect(() => {
    // Only poll if user is logged in and has a pending signature reset request
    if (user && user.requestSignatureReset !== 0) {
      // Poll every 15 seconds (reduced frequency to avoid excessive API calls)
      const intervalId = setInterval(() => {
        refreshUser();
      }, 15000); // Poll every 15 seconds instead of 5

      return () => clearInterval(intervalId);
    }
  }, [user?.requestSignatureReset, refreshUser]); // Include refreshUser in dependencies

  // ⬇ Login using Sanctum
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const res = await apiService.login(username, password);
      await refreshUser();
      return res;
    } catch (err: any) {
      return { error: err.response?.data?.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // ⬇ Logout using Sanctum
  const logout = async () => {
    toastMessages.generic.info("Logging out...", "See you soon!");
    setShowLogoutLoading(true);

    try {
      await apiService.logout();
      await refreshUser();
      router.push("/");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setShowLogoutLoading(false);
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    setIsRefreshing,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      {showLogoutLoading && (
        <RealLoadingScreen
          message="Logging out..."
          onComplete={() => setShowLogoutLoading(false)}
        />
      )}
    </UserContext.Provider>
  );
};
