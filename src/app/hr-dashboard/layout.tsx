"use client";

import DashboardShell, { SidebarItem } from "@/components/DashboardShell";
import { withAuth } from "@/hoc";
import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/UserContext";

function HRLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const sidebarItems: SidebarItem[] = useMemo(() => {
    return [
      { id: "overview", label: "Overview", icon: "📊", path: "/hr-dashboard" },
      {
        id: "evaluated-reviews",
        label: "Evaluation Records",
        icon: "🗂️",
        path: "/hr-dashboard/evaluatedReviews",
      },
      {
        id: "users",
        label: "Employees",
        icon: "👥",
        path: "/hr-dashboard/userManagement",
      },
      {
        id: "reviews",
        label: "Performance Reviews",
        icon: "📝",
        path: "/hr-dashboard/performanceReviews",
      },
      {
        id: "history",
        label: "Evaluation History",
        icon: "📈",
        path: "/hr-dashboard/evaluationHistory",
      },
      {
        id: "departments",
        label: "Departments",
        icon: "🏢",
        path: "/hr-dashboard/departments",
      },
      {
        id: "branches",
        label: "Branches",
        icon: "📍",
        path: "/hr-dashboard/branches",
      },
      {
        id: "branch-heads",
        label: "Branch Heads",
        icon: "👔",
        path: "/hr-dashboard/branchHeads",
      },
      {
        id: "area-managers",
        label: "Area Managers",
        icon: "🎯",
        path: "/hr-dashboard/areaManagers",
      },
      {
        id: "signature-reset",
        label: "Signature Reset Requests",
        icon: "✍️",
        path: "/hr-dashboard/signatureResetRequests",
      },
    ];
  }, [user?.position_id]);

  // Determine active item based on current URL
  const active =
    sidebarItems.find((item) => item.path === pathname)?.id ?? "overview";

  const setActiveWithRefresh = (id: string) => {
    const item = sidebarItems.find((item) => item.id === id);
    if (item) router.push(item.path);
  };

  return (
    <DashboardShell
      title="HR Dashboard"
      currentPeriod={new Date().toLocaleDateString()}
      sidebarItems={sidebarItems}
      activeItemId={active}
      onChangeActive={setActiveWithRefresh}
      dashboardType="hr"
    >
      {children}
    </DashboardShell>
  );
}

export default withAuth(HRLayout, { requiredRole: "hr" });
