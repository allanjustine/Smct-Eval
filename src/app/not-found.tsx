"use client";

import RealLoadingScreen from "@/components/RealLoadingScreen";
import { useAuth } from "@/contexts/UserContext";
import Link from "next/link";
import { getUserDashboardPath } from "@/lib/dashboardUtils";

export default function NotFound() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Get user's dashboard based on role, or return to landing page
  // Pass user as profile since it has roles array, and null as user param since user object doesn't have role property
  const dashboardPath = getUserDashboardPath(user as { roles?: { name: string }[] } | null, null, "/") || "/";

  if (isLoading) return <RealLoadingScreen />;
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center bg-white">
      <div className="max-w-md w-full rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Oops! Page Not Found?
            </h2>
            <p className="text-gray-600 mt-2">
              The page you're looking for doesn't exist or has been moved. Let's
              get you back on track.
            </p>
          </div>
          <div className="space-y-4">
            {isLoading ? null : isAuthenticated ? (
              <Link
                href={dashboardPath}
                className="block w-full px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-lg text-center transition duration-200"
              >
                Return to Dashboard
              </Link>
            ) : (
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-lg text-center transition duration-200"
              >
                Return to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
