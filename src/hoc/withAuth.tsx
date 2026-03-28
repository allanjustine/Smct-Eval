"use client";

import { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/UserContext";

interface WithAuthOptions {
  requiredRole?: string | string[];
  fallbackPath?: string; // default redirect path if not authenticated
  redirectOnRoleMismatch?: boolean;
}

/**
 * HOC for authentication and optional role-based access
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requiredRole,
    fallbackPath = "/",
    redirectOnRoleMismatch = true,
  } = options;

  return function WithAuthComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated - only after loading is complete
    useEffect(() => {
      // Wait for loading to finish, then check authentication
      // This prevents premature redirects during hard refresh when session is being restored
      if (!isLoading && !isAuthenticated && !user) {
        // Check localStorage as a last resort before redirecting
        const stored = localStorage.getItem("authUser");
        if (!stored) {
          // No stored session, definitely not authenticated
          router.push(fallbackPath);
        }
        // If stored exists, wait a bit more for UserContext to restore it
        // This handles race conditions during hard refresh
      }
    }, [isAuthenticated, isLoading, user, router, fallbackPath]);

    // Redirect if role doesn't match
    useEffect(() => {
      if (
        !isLoading &&
        isAuthenticated &&
        requiredRole &&
        user &&
        redirectOnRoleMismatch
      ) {
        const userRole = user?.roles?.[0]?.name?.toLowerCase();
        const requiredRoles = Array.isArray(requiredRole)
          ? requiredRole.map((r) => r.toLowerCase())
          : [requiredRole.toLowerCase()];

        if (userRole && !requiredRoles.includes(userRole)) {
          // Optionally redirect based on role
          const roleDashboards: Record<string, string> = {
            admin: "/admin",
            hr: "/hr-dashboard",
            evaluator: "/evaluator",
            employee: "/employee-dashboard",
            manager: "/evaluator",
          };

          const redirectPath = roleDashboards[userRole] || "/";

          router.push(redirectPath);
        }
      }
    }, [
      isAuthenticated,
      isLoading,
      user,
      requiredRole,
      redirectOnRoleMismatch,
      router,
    ]);

    // Show loading screen while auth is resolving
    // Wait for loading to complete, but also check if there's a stored user
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    // After loading, check if we have a user (either from state or can restore from localStorage)
    if (!user && !isAuthenticated) {
      // Check localStorage one more time before giving up
      const stored = localStorage.getItem("authUser");
      if (stored) {
        // Stored session exists, wait a bit more for it to be restored
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Restoring session...</p>
            </div>
          </div>
        );
      }
      // No stored session, redirect (handled by useEffect above)
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Simpler HOC: only checks authentication, ignores roles
 */
export function withSimpleAuth<P extends object>(
  Component: ComponentType<P>,
  fallbackPath: string = "/login"
) {
  return function WithSimpleAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(fallbackPath);
      }
    }, [isAuthenticated, isLoading, router, fallbackPath]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) return null;

    return <Component {...props} />;
  };
}
