'use client';

import { ComponentType } from 'react';
import DashboardShell, { SidebarItem } from '@/components/DashboardShell';
import PageTransition from '@/components/PageTransition';
import { withAuth } from './withAuth';

export interface WithPageOptions {
  // Authentication
  requireAuth?: boolean;
  requiredRole?: string | string[];
  fallbackPath?: string;
  
  // Dashboard Shell
  useDashboardShell?: boolean;
  dashboardTitle?: string;
  sidebarItems?: SidebarItem[];
  
  // Page Effects
  usePageTransition?: boolean;
  
  // Custom wrapper
  customWrapper?: ComponentType<{ children: React.ReactNode }>;
}

/**
 * Universal HOC for all page types
 * Combines authentication, dashboard shell, transitions, etc.
 * 
 * Usage Examples:
 * 
 * // Simple authenticated page
 * export default withPage(MyPage, { requireAuth: true });
 * 
 * // Dashboard with role check
 * export default withPage(AdminDashboard, {
 *   requireAuth: true,
 *   requiredRole: 'admin',
 *   useDashboardShell: true,
 *   dashboardTitle: 'Admin Dashboard',
 *   sidebarItems: [...]
 * });
 * 
 * // Public page with transitions
 * export default withPage(LandingPage, {
 *   usePageTransition: true
 * });
 */
export function withPage<P extends object>(
  Component: ComponentType<P>,
  options: WithPageOptions = {}
) {
  const {
    requireAuth = false,
    requiredRole,
    fallbackPath = '/',
    useDashboardShell = false,
    dashboardTitle = 'Dashboard',
    sidebarItems = [],
    usePageTransition = false,
    customWrapper: CustomWrapper
  } = options;

  return function WithPageComponent(props: P) {
    let content = <Component {...props} />;

    // Apply custom wrapper if provided
    if (CustomWrapper) {
      content = <CustomWrapper>{content}</CustomWrapper>;
    }

    // Wrap with DashboardShell if needed
    if (useDashboardShell) {
      // Note: This is a simplified wrapper. For full dashboard functionality,
      // use withDashboard or implement DashboardShell directly in your component
      content = (
        <DashboardShell
          title={dashboardTitle}
          sidebarItems={sidebarItems}
          activeItemId={sidebarItems[0]?.id || 'overview'}
          onChangeActive={() => {}}
          topSummary={null}
        >
          {content}
        </DashboardShell>
      );
    }

    // Wrap with PageTransition if needed
    if (usePageTransition) {
      content = <PageTransition>{content}</PageTransition>;
    }

    // If auth is required, wrap the entire component with withAuth
    if (requireAuth) {
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
 * Preset HOCs for common use cases
 */

// Dashboard pages (authenticated with shell)
export function withDashboardPage<P extends object>(
  Component: ComponentType<P>,
  options: {
    requiredRole?: string | string[];
    title?: string;
    sidebarItems?: SidebarItem[];
  } = {}
) {
  return withPage(Component, {
    requireAuth: true,
    requiredRole: options.requiredRole,
    useDashboardShell: true,
    dashboardTitle: options.title || 'Dashboard',
    sidebarItems: options.sidebarItems || []
  });
}

// Authenticated pages (no shell)
export function withAuthPage<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string | string[]
) {
  return withPage(Component, {
    requireAuth: true,
    requiredRole
  });
}

// Public pages with transition
export function withPublicPage<P extends object>(
  Component: ComponentType<P>,
  options: { redirectIfAuthenticated?: boolean } = {}
) {
  const { redirectIfAuthenticated = false } = options;
  
  return function WithPublicPageComponent(props: P) {
    // If should redirect authenticated users, wrap with redirect logic
    if (redirectIfAuthenticated) {
      // Create a stable wrapper component outside the render function
      const RedirectWrapper = ({ children }: { children: React.ReactNode }) => {
        const { isAuthenticated, user, isLoading } = require('@/contexts/UserContext').useUser();
        const router = require('next/navigation').useRouter();
        const hasRedirected = require('react').useRef(false);
        const hasChecked = require('react').useRef(false);
        
        // Only check once when component mounts or when isLoading changes from true to false
        require('react').useEffect(() => {
          // Only check once after initial load completes
          if (!isLoading && !hasChecked.current) {
            hasChecked.current = true;
            
            // Only redirect once and only when loading is complete
            if (!hasRedirected.current && isAuthenticated && user && user.role && !user.roleSelectionPending) {
              hasRedirected.current = true;
              // User is authenticated, has a role selected, and role selection is complete
              // Redirect them to their dashboard
              const roleDashboards: Record<string, string> = {
                'admin': '/admin',
                'hr': '/hr-dashboard',
                'evaluator': '/evaluator',
                'employee': '/employee-dashboard',
                'manager': '/evaluator'
              };
              
              const dashboardPath = roleDashboards[user.role];
              if (dashboardPath) {
                console.log('🔄 withPublicPage: User already logged in with role', user.role, '- redirecting to', dashboardPath);
                router.push(dashboardPath);
              } else {
                console.warn('⚠️ withPublicPage: No dashboard path found for role', user.role, '- staying on current page');
              }
            }
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isLoading]); // Only depend on isLoading to prevent infinite loops
        
        // Show loading while checking (only once)
        if (isLoading && !hasChecked.current) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          );
        }
        
        // Don't render page if authenticated and has a role (will redirect)
        if (hasRedirected.current || (isAuthenticated && user?.role && !user?.roleSelectionPending)) {
          return null;
        }
        
        return <>{children}</>;
      };
      
      return withPage(Component, {
        usePageTransition: true,
        customWrapper: RedirectWrapper
      })(props);
    }
    
    // No redirect - just public page with transition
    return withPage(Component, {
      usePageTransition: true
    })(props);
  };
}

