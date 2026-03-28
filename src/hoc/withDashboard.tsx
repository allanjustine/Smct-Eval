'use client';

import { ComponentType, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import DashboardShell, { SidebarItem } from '@/components/DashboardShell';
import { withAuth } from './withAuth';

interface WithDashboardOptions {
  requiredRole?: string | string[];
  fallbackPath?: string;
  title?: string;
  sidebarItems?: SidebarItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showShell?: boolean; // Option to disable shell wrapper
}

/**
 * Higher-Order Component for Dashboard pages
 * Wraps component with authentication + DashboardShell
 * 
 * Usage:
 * export default withDashboard(YourDashboard, {
 *   requiredRole: 'admin',
 *   title: 'Admin Dashboard',
 *   sidebarItems: [...]
 * });
 * 
 * @param Component - The dashboard content component
 * @param options - Dashboard configuration
 */
export function withDashboard<P extends object>(
  Component: ComponentType<P>,
  options: WithDashboardOptions = {}
) {
  const {
    requiredRole,
    fallbackPath = '/',
    title = 'Dashboard',
    sidebarItems = [],
    activeTab = 'overview',
    onTabChange,
    showShell = true
  } = options;

  return function WithDashboardComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useUser();
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState(activeTab);

    // Handle tab change
    const handleTabChange = (tabId: string) => {
      setCurrentTab(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    };

    // Render the component with or without shell
    const renderContent = () => {
      if (!showShell) {
        // No shell wrapper - just the component
        return <Component {...props} />;
      }

      // Wrap with DashboardShell
      return (
        <DashboardShell
          title={title}
          sidebarItems={sidebarItems}
          activeItemId={currentTab}
          onChangeActive={handleTabChange}
          topSummary={null}
        >
          <Component {...props} />
        </DashboardShell>
      );
    };

    // Wrap everything with authentication using withAuth HOC
    const content = renderContent();
    
    if (requiredRole) {
      const AuthenticatedComponent = withAuth(
        () => content,
        { requiredRole, fallbackPath }
      );
      return <AuthenticatedComponent />;
    }
    
    return content;
  };
}

/**
 * Simplified HOC for dashboards when backend handles auth
 * Just adds DashboardShell wrapper
 */
export function withSimpleDashboard<P extends object>(
  Component: ComponentType<P>,
  options: Omit<WithDashboardOptions, 'requiredRole' | 'fallbackPath'> = {}
) {
  const {
    title = 'Dashboard',
    sidebarItems = [],
    activeTab = 'overview',
    onTabChange,
    showShell = true
  } = options;

  return function WithSimpleDashboardComponent(props: P) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    const handleTabChange = (tabId: string) => {
      setCurrentTab(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    };

    if (!showShell) {
      return <Component {...props} />;
    }

    return (
      <DashboardShell
        title={title}
        sidebarItems={sidebarItems}
        activeItemId={currentTab}
        onChangeActive={handleTabChange}
        topSummary={null}
      >
        <Component {...props} />
      </DashboardShell>
    );
  };
}

