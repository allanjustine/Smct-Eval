"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
  Trash2,
  ChevronDown,
  HelpCircle,
  ChevronUp,
  Clock,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileCard, { UserProfile } from "./ProfileCard";
import ProfileModal from "./ProfileModal";
import ContactDevsModal from "./ContactDevsModal";
import { HRDashboardGuideModal } from "./HRDashboardGuideModal";
import { EmployeeDashboardGuideModal } from "./EmployeeDashboardGuideModal";
import { EvaluatorDashboardGuideModal } from "./EvaluatorDashboardGuideModal";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/lib/types";
import { apiService } from "@/lib/apiService";
import { useRouter } from "next/navigation";
import { toastMessages } from "@/lib/toastMessages";
import echo from "@/utils/echo";

export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};

type DashboardShellProps = {
  title: string;
  currentPeriod?: string;
  sidebarItems: SidebarItem[];
  activeItemId: string;
  onChangeActive: (id: string) => void;
  children: React.ReactNode;
  profile?: UserProfile | null;
  onSaveProfile?: (updatedProfile: UserProfile) => void;
  topSummary?: React.ReactNode;
  dashboardType?: "hr" | "admin" | "employee" | "evaluator";
};

export default function DashboardShell(props: DashboardShellProps) {
  const {
    title,
    currentPeriod,
    sidebarItems,
    activeItemId,
    onChangeActive,
    children,
    profile,
    onSaveProfile,
    topSummary,
    dashboardType: dashboardTypeProp,
  } = props;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isNotificationPanelClosing, setIsNotificationPanelClosing] = useState(false);
  const [isContactDevsModalOpen, setIsContactDevsModalOpen] = useState(false);
  const [isNotificationDetailOpen, setIsNotificationDetailOpen] =
    useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Collapsible states for sidebar groups
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isLeadershipOpen, setIsLeadershipOpen] = useState(false);

  // Toggle state for help buttons (Contact Devs & Dashboard Guide)
  const [isHelpButtonsVisible, setIsHelpButtonsVisible] = useState(true);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDeletingNotification, setIsDeletingNotification] = useState(false);
  const { user, logout, setIsRefreshing } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockVisible, setIsClockVisible] = useState(true);

  const notificationCount = user?.notification_counts ?? 0;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const setupEcho = async () => {
      echo
        .private(`App.Models.User.${user?.id}`)
        .notification((notification: any) => {
          console.log("New notification received:", notification);
          setIsRefreshing(true);
        });
    };
    setupEcho();
  }, []);

  // Memoize dashboard type detection to avoid dependency issues
  const dashboardType = useMemo(() => {
    if (dashboardTypeProp) return dashboardTypeProp;
    const hasFeedback = sidebarItems.some((item) => item.id === "feedback");
    const hasEvaluationRecords = sidebarItems.some(
      (item) => item.id === "evaluation-records"
    );
    const hasDashboards = sidebarItems.some((item) => item.id === "dashboards");
    const hasUsers = sidebarItems.some((item) => item.id === "users");
    const hasEvaluatedReviews = sidebarItems.some(
      (item) => item.id === "evaluated-reviews"
    );

    // Detect admin dashboard (has unique items like 'dashboards', 'users', 'evaluated-reviews')
    if (hasDashboards || hasUsers || hasEvaluatedReviews) {
      return "admin";
    }

    if (!hasFeedback && !hasEvaluationRecords) {
      return "employee";
    } else if (hasFeedback) {
      return "evaluator";
    } else {
      return "hr";
    }
  }, [dashboardTypeProp, sidebarItems]);

  // Memoize boolean flags to ensure stable references
  const isEmployeeDashboard = useMemo(
    () => dashboardType === "employee",
    [dashboardType]
  );
  const isEvaluatorDashboard = useMemo(
    () => dashboardType === "evaluator",
    [dashboardType]
  );
  const isAdminDashboard = useMemo(
    () => dashboardType === "admin",
    [dashboardType]
  );
  const isHRDashboard = useMemo(() => dashboardType === "hr", [dashboardType]);

  // Auto-open collapsible groups when their items are active
  useEffect(() => {
    // For admin dashboard, handle management group (departments, branches) and leadership group (branch-heads, area-managers)
    if (isAdminDashboard) {
      if (
        ["departments", "branches"].includes(activeItemId) &&
        !isManagementOpen
      ) {
        setIsManagementOpen(true);
      }
      if (
        ["branch-heads", "area-managers"].includes(activeItemId) &&
        !isLeadershipOpen
      ) {
        setIsLeadershipOpen(true);
      }
      return;
    }

    if (isHRDashboard) {
      if (
        ["departments", "branches", "branch-heads", "area-managers"].includes(
          activeItemId
        ) &&
        !isManagementOpen
      ) {
        setIsManagementOpen(true);
      }
      return;
    }

    if (
      ["departments", "branches"].includes(activeItemId) &&
      !isManagementOpen
    ) {
      setIsManagementOpen(true);
    }

    // For employee and evaluator dashboards, only 'history' should open Analytics
    // For HR dashboard, 'reviews' and 'history' should open Analytics
    const analyticsItems =
      isEmployeeDashboard || isEvaluatorDashboard
        ? ["history"]
        : ["reviews", "history"];

    if (analyticsItems.includes(activeItemId) && !isAnalyticsOpen) {
      setIsAnalyticsOpen(true);
    }
  }, [
    activeItemId,
    isManagementOpen,
    isAnalyticsOpen,
    isLeadershipOpen,
    isEmployeeDashboard,
    isEvaluatorDashboard,
    isAdminDashboard,
  ]);

  const handleEditProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: UserProfile | null) => {
    try {
      // Call parent callback if provided
      if (!updatedProfile) {
        console.error("No profile to save");
        return;
      }

      if (onSaveProfile) {
        await onSaveProfile(updatedProfile);
      }

      // Refresh user data from server to get updated profile
      setIsRefreshing(true);

      setIsProfileModalOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (notification) {
      try {
        await apiService.markNotificationAsRead(notification.id);
      } catch (error: any) {
        toastMessages.generic.error(
          "isRead Failed : ",
          error?.response?.data?.message || error?.message || "Unknown error"
        );
      }
    }

    // Close the notification panel
    setIsNotificationPanelOpen(true);

    // If no actionUrl, show the notification details modal as fallback
    setSelectedNotification(notification);
    setIsNotificationDetailOpen(true);
  };

  const handleMarkAllAsRead = async () => {
    // Mark as read
    try {
      await apiService.markAllNotificationsAsRead();
      setIsRefreshing(true);
    } catch (error: any) {
      alert("test");
      toastMessages.generic.error(
        "Mark All asRead Failed : ",
        error?.response?.data?.message || error?.message || "Unknown error"
      );
    }

    // Close the notification panel
    setIsNotificationPanelOpen(true);
  };

  const handleDeleteNotification = async (
    notification: Notification,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering the notification click

    // Set deleting state to show skeleton on all notifications
    setIsDeletingNotification(true);

    try {
      // Wait 2 seconds to show skeleton animation on all notifications
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Actually delete the notification
      await apiService.deleteNotification(notification.id);
      setIsRefreshing(true);

      // Reset deleting state after a short delay to allow refresh to complete
      setTimeout(() => {
        setIsDeletingNotification(false);
      }, 300);
    } catch (error: any) {
      // Remove deleting state on error
      setIsDeletingNotification(false);
      toastMessages.generic.error(
        "Delete Failed : ",
        error?.response?.data?.message || error?.message || "Unknown error"
      );
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: 'url(/smct.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Faded overlay for better content readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 to-indigo-100/95 pointer-events-none"></div>
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <img
              src="/smct.png"
              alt="SMCT Group of Companies"
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">
                Performance & Ratings Overview
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Clock Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsClockVisible(!isClockVisible)}
                  className={`p-2 cursor-pointer ${isClockVisible ? "bg-gray-100 hover:bg-gray-200" : " hover:bg-blue-200 hover:scale-110 transition-transform duration-200www"}`}
                >
                  <Clock className={`h-5 w-5 ${isClockVisible ? "text-gray-500" : "text-blue-600"}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isClockVisible ? "Hide Clock" : "Show Clock"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isNotificationPanelOpen) {
                    // Start closing animation
                    setIsNotificationPanelClosing(true);
                    // Close after animation completes
                    setTimeout(() => {
                      setIsNotificationPanelOpen(false);
                      setIsNotificationPanelClosing(false);
                    }, 300);
                  } else {
                    setIsNotificationPanelOpen(true);
                    setIsNotificationPanelClosing(false);
                  }
                }}
                className="relative p-2 hover:bg-blue-300 hover:text-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 10 ? "10+" : notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Notification Panel */}
              {(isNotificationPanelOpen || isNotificationPanelClosing) && (
                <div 
                  className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-[60]"
                  style={{
                    animation: isNotificationPanelClosing 
                      ? 'slideUpFade 0.3s ease-out forwards'
                      : 'slideDownFade 0.3s ease-out',
                  }}
                >
                  <style jsx>{`
                    @keyframes slideDownFade {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    @keyframes slideUpFade {
                      from {
                        opacity: 1;
                        transform: translateY(0);
                      }
                      to {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                    }
                  `}</style>
                  <div 
                    className="p-4 border-b bg-blue-600 rounded-t-lg relative overflow-hidden"
                    style={{
                      backgroundImage: 'url(/smct.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Fade overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-blue-600/90"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <h3 className="font-semibold text-white">
                        Notifications
                      </h3>
                      <div className="flex items-center space-x-2">
                        {user?.notification_counts !== 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-white hover:text-blue-100 hover:bg-blue-700/50 cursor-pointer"
                          >
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsNotificationPanelClosing(true);
                            setTimeout(() => {
                              setIsNotificationPanelOpen(false);
                              setIsNotificationPanelClosing(false);
                            }, 300);
                          }}
                          className="p-1 text-white hover:bg-blue-700/50 hover:text-white cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="h-[270px] overflow-y-auto">
                    {!user?.notifications || user?.notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="mb-4">
                          <img
                            src="/alarm.gif"
                            alt="No notifications"
                            className="w-25 h-25 object-contain"
                            draggable="false"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }}
                            onDragStart={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }}
                            onDrag={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }}
                            onDragEnd={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              return false;
                            }}
                            onMouseDown={(e) => {
                              if (e.button === 0) {
                                e.preventDefault();
                              }
                            }}
                            style={{
                              imageRendering: "auto",
                              willChange: "auto",
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            } as React.CSSProperties}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-medium text-gray-700 mb-1">
                            No notifications yet
                          </p>
                          <p className="text-sm text-gray-500">
                            Wait for any notifications to appear here
                          </p>
                        </div>
                      </div>
                    ) : (
                      user?.notifications.map((notification: any) => {
                        // Show skeleton animation on all notifications when any deletion is in progress
                        if (isDeletingNotification) {
                          return (
                            <div
                              key={notification.id}
                              className="p-4 border-b bg-gray-50"
                            >
                              <div className="flex items-start space-x-3">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <div className="flex-1 min-w-0 space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-3 w-2/3" />
                                </div>
                                <Skeleton className="h-6 w-6 rounded" />
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 ${
                              notification.read_at === "" ||
                              notification.read_at === null
                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-sm opacity-50">
                                {notification.read_at === "" ||
                                notification.read_at === null
                                  ? "✅"
                                  : ""}{" "}
                              </span>
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                              >
                                <p className="text-sm text-gray-900">
                                  {notification.data.message.length > 50
                                    ? notification.data.message.slice(0, 50) +
                                      "  . . ."
                                    : notification.data.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {notification.read_at === "" ||
                                  (notification.read_at === null && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) =>
                                    handleDeleteNotification(notification, e)
                                  }
                                  className="p-1 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed"
                                  title="Delete notification"
                                  disabled={isDeletingNotification}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <ProfileCard
              profile={user}
              variant="header"
              showLogout={true}
              showSettings={false}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Clock Display - Fixed below navbar, right edge */}
      {isClockVisible && (
        <div 
          className="fixed top-20 right-6 mt-2 z-40 bg-blue-600 border border-blue-700 rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => setIsClockVisible(false)}
        >
          <div className="flex flex-col items-end">
            <div className="text-base font-semibold text-white">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="text-xs text-blue-100 mt-0.5">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div className="flex overflow-hidden mt-20">
        {/* Sidebar */}
        <div
          className={`relative overflow-hidden bg-blue-600 transition-all duration-400  ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <aside className="bg-blue-600 text-blue-50 min-h-[calc(100vh-5rem)] w-64 rounded-bl-lg">
            <div
              className={`p-6 transition-opacity duration-400 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsSidebarOpen(false)}
                className="w-1/3 mb-4 bg-white/10 text-white hover:bg-white/20 border-white/30 cursor-pointer"
              >
                <div className="flex items-center">
                  <ChevronLeft className="w-10 h-10 mr-[-6px]" />
                  <ChevronLeft className="w-10 h-10" />
                </div>
              </Button>

              <h2 className="text-lg font-bold text-white mb-6">Navigation</h2>
              <nav className="space-y-2">
                {(() => {
                  // Use the memoized dashboard type values

                  // Define which items should be visible (main items)
                  // For employee dashboard: overview, reviews
                  // For evaluator dashboard: overview, employees, feedback, reviews
                  // For HR dashboard: overview, evaluation-records, employees (management items go in collapsible group)
                  // For admin dashboard: all items except departments, branches, branch-heads, and area-managers (they go in collapsible groups)
                  const visibleItems = isAdminDashboard
                    ? sidebarItems
                        .map((item) => item.id)
                        .filter(
                          (id) =>
                            ![
                              "departments",
                              "branches",
                              "branch-heads",
                              "area-managers",
                            ].includes(id)
                        )
                    : isHRDashboard
                    ? sidebarItems
                        .map((item) => item.id)
                        .filter(
                          (id) =>
                            ![
                              "departments",
                              "branches",
                              "branch-heads",
                              "area-managers",
                            ].includes(id)
                        )
                    : isEmployeeDashboard
                    ? ["overview", "reviews", "history"]
                    : isEvaluatorDashboard
                    ? [
                        "overview",
                        "employees",
                        "feedback",
                        "reviews",
                        "history",
                      ]
                    : ["overview", "evaluation-records", "employees"];

                  // Define collapsible groups
                  // For HR dashboard, management includes departments, branches, branch-heads, and area-managers
                  // For admin dashboard, management includes departments and branches, leadership includes branch-heads and area-managers
                  const managementItems = isHRDashboard
                    ? [
                        "departments",
                        "branches",
                        "branch-heads",
                        "area-managers",
                      ]
                    : ["departments", "branches"];
                  const leadershipItems = ["branch-heads", "area-managers"];
                  // Analytics items vary by dashboard type - exclude items that are already visible
                  const analyticsItems = isEmployeeDashboard
                    ? [] // No analytics items for employee dashboard - history is now visible
                    : isEvaluatorDashboard
                    ? [] // No analytics items for evaluator dashboard - history is now visible
                    : ["reviews", "history"]; // For HR, 'reviews' goes in Analytics

                  return sidebarItems.map((item) => {
                    const isVisible = visibleItems.includes(item.id);
                    const isManagementItem = managementItems.includes(item.id);
                    const isLeadershipItem = leadershipItems.includes(item.id);
                    const isAnalyticsItem = analyticsItems.includes(item.id);

                    // For admin and HR dashboards, handle management items in collapsible group
                    if (
                      (isAdminDashboard || isHRDashboard) &&
                      isManagementItem &&
                      item.id === "departments"
                    ) {
                      return (
                        <Collapsible
                          key="management"
                          open={isManagementOpen}
                          onOpenChange={setIsManagementOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                managementItems.includes(activeItemId)
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "text-blue-100 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">⚙️</span>
                                <span className="font-medium">Management</span>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isManagementOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 mt-2 space-y-1">
                            {sidebarItems
                              .filter((i) => managementItems.includes(i.id))
                              .map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => onChangeActive(subItem.id)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                    activeItemId === subItem.id
                                      ? "bg-white/20 text-white border border-white/30"
                                      : "text-blue-100 hover:bg-white/10"
                                  }`}
                                >
                                  <span className="text-lg">
                                    {subItem.icon}
                                  </span>
                                  <span className="font-medium text-sm">
                                    {subItem.label}
                                  </span>
                                </button>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    // For admin dashboard only, handle leadership items in collapsible group (HR uses management group)
                    if (
                      isAdminDashboard &&
                      isLeadershipItem &&
                      item.id === "branch-heads"
                    ) {
                      return (
                        <Collapsible
                          key="leadership"
                          open={isLeadershipOpen}
                          onOpenChange={setIsLeadershipOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 ${
                                leadershipItems.includes(activeItemId)
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "text-blue-100 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">👥</span>
                                <span className="font-medium">Leadership</span>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isLeadershipOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 mt-2 space-y-1">
                            {sidebarItems
                              .filter((i) => leadershipItems.includes(i.id))
                              .map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => onChangeActive(subItem.id)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                    activeItemId === subItem.id
                                      ? "bg-white/20 text-white border border-white/30"
                                      : "text-blue-100 hover:bg-white/10"
                                  }`}
                                >
                                  <span className="text-lg">
                                    {subItem.icon}
                                  </span>
                                  <span className="font-medium text-sm">
                                    {subItem.label}
                                  </span>
                                </button>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    // For admin dashboard, skip management and leadership items (already handled above)
                    if (
                      isAdminDashboard &&
                      (isManagementItem || isLeadershipItem)
                    ) {
                      return null;
                    }

                    // For admin dashboard, render other items as regular buttons
                    if (isAdminDashboard) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => onChangeActive(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                            activeItemId === item.id
                              ? "bg-white/20 text-white border border-white/30"
                              : "text-blue-100 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    }

                    // Render visible items as regular buttons
                    if (isVisible) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => onChangeActive(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                            activeItemId === item.id
                              ? "bg-white/20 text-white border border-white/30"
                              : "text-blue-100 hover:bg-white/10"
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    }

                    // Render Management collapsible group
                    if (item.id === "departments") {
                      return (
                        <Collapsible
                          key="management"
                          open={isManagementOpen}
                          onOpenChange={setIsManagementOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                managementItems.includes(activeItemId)
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "text-blue-100 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">⚙️</span>
                                <span className="font-medium">Management</span>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isManagementOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 mt-2 space-y-1">
                            {sidebarItems
                              .filter((i) => managementItems.includes(i.id))
                              .map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => onChangeActive(subItem.id)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                    activeItemId === subItem.id
                                      ? "bg-white/20 text-white border border-white/30"
                                      : "text-blue-100 hover:bg-white/10"
                                  }`}
                                >
                                  <span className="text-lg">
                                    {subItem.icon}
                                  </span>
                                  <span className="font-medium text-sm">
                                    {subItem.label}
                                  </span>
                                </button>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    // Render Analytics collapsible group
                    // For employee and evaluator dashboards, skip Analytics (history is now visible)
                    // For HR dashboard, trigger on 'reviews'
                    const analyticsTriggerId =
                      isEmployeeDashboard || isEvaluatorDashboard
                        ? null
                        : "reviews";
                    if (analyticsTriggerId && item.id === analyticsTriggerId) {
                      return (
                        <Collapsible
                          key="analytics"
                          open={isAnalyticsOpen}
                          onOpenChange={setIsAnalyticsOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 ${
                                analyticsItems.includes(activeItemId)
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "text-blue-100 hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">📊</span>
                                <span className="font-medium">Analytics</span>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isAnalyticsOpen ? "transform rotate-180" : ""
                                }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 mt-2 space-y-1">
                            {sidebarItems
                              .filter((i) => analyticsItems.includes(i.id))
                              .map((subItem) => (
                                <button
                                  key={subItem.id}
                                  onClick={() => onChangeActive(subItem.id)}
                                  className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer ${
                                    activeItemId === subItem.id
                                      ? "bg-white/20 text-white border border-white/30"
                                      : "text-blue-100 hover:bg-white/10"
                                  }`}
                                >
                                  <span className="text-lg">
                                    {subItem.icon}
                                  </span>
                                  <span className="font-medium text-sm">
                                    {subItem.label}
                                  </span>
                                </button>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }

                    // Skip other items (they're already handled in collapsible groups)
                    return null;
                  });
                })()}
              </nav>
            </div>
          </aside>
        </div>

        {!isSidebarOpen && (
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="bg-blue-700 text-white hover:bg-blue-300  hover:text-blue-700 border-blue-700 cursor-pointer"
            >
              <div className="flex items-center">
                <ChevronRight className="w-10 h-10 mr-[-6px]" />
                <ChevronRight className="w-10 h-10" />
              </div>
            </Button>
          </div>
        )}
        <main className="flex-1 pt-5 px-5 pb-20 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {topSummary && activeItemId === "overview" && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topSummary}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Footer - Sticky */}
      <footer className="fixed bottom-0  left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
              <img
                src="/smct.png"
                alt="SMCT Group of Companies"
                className="h-8 w-auto"
              />
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} SMCT Group of Companies. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Performance & Ratings System</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Version 1.0</span>
              </div>
              {/* Toggle Button for Help Buttons - In Footer */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsHelpButtonsVisible(!isHelpButtonsVisible)}
                    className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 p-0 cursor-pointer"
                  >
                    <img
                      src="/question.png"
                      alt="Toggle Help"
                      className="h-8 w-8 object-contain"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="bg-blue-700 text-white border-red-500"
                >
                  <p className="font-medium">
                    {isHelpButtonsVisible ? "Hide Help Buttons" : "Show Help Buttons"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={user}
        onSave={handleSaveProfile}
      />

      {/* Contact Developers Modal */}
      <ContactDevsModal
        isOpen={isContactDevsModalOpen}
        onCloseAction={() => setIsContactDevsModalOpen(false)}
      />

      {/* Notification Detail Modal */}
      <Dialog
        open={isNotificationDetailOpen}
        onOpenChangeAction={setIsNotificationDetailOpen}
      >
        <DialogContent
          className="max-w-2xl w-full mx-4 p-0 overflow-hidden"
          style={{
            animation: "modalPopup 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <style jsx>{`
            @keyframes modalPopup {
              0% {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
          
          {selectedNotification && (
            <>
              {/* Header with gradient background and faded image */}
              <div 
                className="relative px-2 py-5 overflow-hidden"
                style={{
                  backgroundImage: 'url(/smct.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Faded overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-[1px]"></div>
                
                {/* Content with relative positioning */}
                <div className="relative z-10">
                  <DialogHeader className="pb-0">
                    <DialogTitle className="flex items-center gap-3 text-xl text-white drop-shadow-md">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <span>Notification Details</span>
                    </DialogTitle>
                  </DialogHeader>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Message Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Message
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedNotification.data.message}
                    </p>
                  </div>
                </div>

                {/* Timestamp Section */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                      Received At
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(selectedNotification.created_at).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <Button
                    onClick={async () => {
                      setIsNotificationDetailOpen(false);
                      setIsRefreshing(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Help Buttons - Toggleable (Fixed to viewport) */}
      {/* Dashboard Guide Button */}
      <Button
        variant="ghost"
        size="lg"
        onClick={isHelpButtonsVisible ? () => setIsGuideModalOpen(true) : undefined}
        disabled={!isHelpButtonsVisible}
        className={`fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-blue-100 hover:bg-blue-400 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out hover:scale-110 hover:rotate-12 active:scale-95 p-0 ${
          isHelpButtonsVisible
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto delay-0 cursor-pointer"
            : "opacity-0 translate-y-4 scale-0 pointer-events-none delay-0 cursor-default"
        }`}
        title="Dashboard Guide"
        tabIndex={isHelpButtonsVisible ? 0 : -1}
        aria-hidden={!isHelpButtonsVisible}
        style={{ 
          pointerEvents: isHelpButtonsVisible ? "auto" : "none",
          cursor: isHelpButtonsVisible ? "pointer" : "default"
        }}
      >
        <img
          src="/faq.png"
          alt="Help"
          className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-110"
        />
      </Button>

      {/* Contact Developers Button */}
      <Button
        variant="ghost"
        size="lg"
        onClick={isHelpButtonsVisible ? () => setIsContactDevsModalOpen(true) : undefined}
        disabled={!isHelpButtonsVisible}
        className={`fixed bottom-40 right-6 z-50 h-14 w-14 rounded-full bg-blue-100 hover:bg-blue-400 shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out hover:scale-110 hover:rotate-12 active:scale-95 p-0 ${
          isHelpButtonsVisible
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto delay-100 cursor-pointer"
            : "opacity-0 translate-y-4 scale-0 pointer-events-none delay-0 cursor-default"
        }`}
        title="Contact Developers"
        tabIndex={isHelpButtonsVisible ? 0 : -1}
        aria-hidden={!isHelpButtonsVisible}
        style={{ 
          pointerEvents: isHelpButtonsVisible ? "auto" : "none",
          cursor: isHelpButtonsVisible ? "pointer" : "default"
        }}
      >
        <img
          src="/code.png"
          alt="Contact Developers"
          className="h-10 w-10 object-contain transition-transform duration-300 hover:scale-110"
        />
      </Button>

      {/* Dashboard Guide Modal - Conditionally rendered based on dashboard type */}
      {isGuideModalOpen && dashboardType === "hr" && (
        <HRDashboardGuideModal
          isOpen={isGuideModalOpen}
          onCloseAction={() => setIsGuideModalOpen(false)}
        />
      )}
      {isGuideModalOpen && dashboardType === "employee" && (
        <EmployeeDashboardGuideModal
          isOpen={isGuideModalOpen}
          onCloseAction={() => setIsGuideModalOpen(false)}
        />
      )}
      {isGuideModalOpen && dashboardType === "evaluator" && (
        <EvaluatorDashboardGuideModal
          isOpen={isGuideModalOpen}
          onCloseAction={() => setIsGuideModalOpen(false)}
        />
      )}
      </div>
    </div>
  );
}
