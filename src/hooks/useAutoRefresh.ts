import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/useToast';

interface UseAutoRefreshOptions {
  refreshFunction: () => Promise<void>;
  dashboardName: string;
  customMessage?: string;
  gifPath?: string;
  duration?: number;
}

interface UseAutoRefreshReturn {
  showRefreshModal: boolean;
  refreshModalMessage: string;
  handleRefreshModalComplete: () => void;
  refreshDashboardData: (showModal?: boolean, isAutoRefresh?: boolean) => Promise<void>;
  refreshModalProps: {
    isOpen: boolean;
    message: string;
    gifPath: string;
    duration: number;
    onComplete: () => void;
  };
}

export const useAutoRefresh = ({
  refreshFunction,
  dashboardName,
  customMessage,
  gifPath = "/search-file.gif",
  duration = 2000
}: UseAutoRefreshOptions): UseAutoRefreshReturn => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const { success } = useToast();
  const hasAutoRefreshed = useRef(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshModalMessage, setRefreshModalMessage] = useState('');

  // Handle refresh modal completion
  const handleRefreshModalComplete = () => {
    setShowRefreshModal(false);
    success(`${dashboardName} refreshed successfully!`);
  };

  // Comprehensive refresh function
  const refreshDashboardData = async (showModal = false, isAutoRefresh = false) => {
    try {
      if (showModal) {
        setShowRefreshModal(true);
      }
      
      // Call the provided refresh function
      await refreshFunction();
      
      if (isAutoRefresh) {
        // For auto-refresh, we'll let the modal handle the completion
        return;
      }
      
      if (showModal) {
        // For manual refresh, close modal after a delay
        setTimeout(() => {
          setShowRefreshModal(false);
          success(`${dashboardName} refreshed successfully!`);
        }, 1500);
      }
    } catch (error) {
      console.error(`Error refreshing ${dashboardName.toLowerCase()} data:`, error);
      setShowRefreshModal(false);
    }
  };

  // Auto-refresh when user logs in (only once per login)
  useEffect(() => {
    if (isAuthenticated && user && !authLoading && !hasAutoRefreshed.current) {
      hasAutoRefreshed.current = true;
      const autoRefresh = async () => {
        try {
          setRefreshModalMessage(customMessage || `Welcome back! Refreshing your ${dashboardName.toLowerCase()} data...`);
          setShowRefreshModal(true);
          await refreshDashboardData(false, true);
          setTimeout(() => {
            success(`Welcome back! ${dashboardName} refreshed successfully!`);
          }, 1500);
        } catch (error) {
          console.error('Error during auto-refresh:', error);
          setShowRefreshModal(false);
        }
      };
      const refreshTimer = setTimeout(autoRefresh, 500);
      return () => clearTimeout(refreshTimer);
    }
  }, [isAuthenticated, user, authLoading, customMessage, dashboardName, success]);

  // Reset auto-refresh flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasAutoRefreshed.current = false;
    }
  }, [isAuthenticated]);

  // Reset auto-refresh flag when component mounts (fresh login)
  useEffect(() => {
    // Reset the flag when component mounts to ensure fresh login triggers auto-refresh
    hasAutoRefreshed.current = false;
  }, []);

  // Refresh Modal Props
  const refreshModalProps = {
    isOpen: showRefreshModal,
    message: refreshModalMessage,
    gifPath: gifPath,
    duration: duration,
    onComplete: handleRefreshModalComplete
  };

  return {
    showRefreshModal,
    refreshModalMessage,
    handleRefreshModalComplete,
    refreshDashboardData,
    refreshModalProps
  };
};
