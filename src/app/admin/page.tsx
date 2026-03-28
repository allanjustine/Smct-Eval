"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import clientDataService from "@/lib/apiService";
import ViewResultsModal from "@/components/evaluation/ViewResultsModal";
import EvaluationsPagination from "@/components/paginationComponent";

interface Review {
  id: number;
  employee: any;
  evaluator: any;
  reviewTypeProbationary: number | string;
  reviewTypeRegular: number | string;
  created_at: string;
  rating: number;
  status: string;
}

interface DashboardTotals {
  total_users: number;
  total_pending_users: number;
  total_active_users: number;
  total_evaluations: number;
  total_pending_evaluations: number;
  total_completed_evaluations: number;
  total_declined_users: number;
}

export default function OverviewTab() {
  const [evaluations, setEvaluations] = useState<Review[]>([]);
  const [dashboardTotals, setDashboardTotals] =
    useState<DashboardTotals | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);

  const loadEvaluations = async (searchValue: string) => {
    try {
      const response = await clientDataService.getSubmissions(
        searchValue,
        currentPage,
        itemsPerPage
      );
      
      // Add safety checks to prevent "Cannot read properties of undefined" error
      if (!response) {
        console.error("API response is undefined");
        setEvaluations([]);
        setOverviewTotal(0);
        setTotalPages(1);
        setPerPage(itemsPerPage);
        return;
      }

      setEvaluations(response.data || []);
      setOverviewTotal(response.total || 0);
      setTotalPages(response.last_page || 1);
      setPerPage(response.per_page || itemsPerPage);
    } catch (error) {
      console.error("Error loading evaluations:", error);
      // Set default values on error to prevent crashes
      setEvaluations([]);
      setOverviewTotal(0);
      setTotalPages(1);
      setPerPage(itemsPerPage);
    }
  };
  useEffect(() => {
    const mount = async () => {
      setRefreshing(true);
      try {
        await loadEvaluations(searchTerm);
      } catch (error) {
        console.log(error);
        setRefreshing(false);
      } finally {
        setRefreshing(false);
      }
    };
    mount();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchTerm === "" ? currentPage : setCurrentPage(1);
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search term changes (if there's a value)
      if (searchTerm.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Track when page change started
  const pageChangeStartTimeRef = useRef<number | null>(null);

  // Fetch API whenever debounced search term or page changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadEvaluations(debouncedSearchTerm);
        const getTotals = await clientDataService.adminDashboard();
        setDashboardTotals(getTotals);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // If this was a page change, ensure minimum display time (2 seconds)
        if (pageChangeStartTimeRef.current !== null) {
          const elapsed = Date.now() - pageChangeStartTimeRef.current;
          const minDisplayTime = 2000; // 2 seconds
          const remainingTime = Math.max(0, minDisplayTime - elapsed);

          setTimeout(() => {
            setIsPageLoading(false);
            pageChangeStartTimeRef.current = null;
          }, remainingTime);
        }
      }
    };

    fetchData();
  }, [debouncedSearchTerm, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await loadEvaluations(debouncedSearchTerm);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setIsPageLoading(true);
    pageChangeStartTimeRef.current = Date.now();
    setCurrentPage(page);
  };

  const getQuarterColor = (quarter: string): string => {
    if (quarter.includes("Q1")) return "bg-blue-100 text-blue-800";
    if (quarter.includes("Q2")) return "bg-green-100 text-green-800";
    if (quarter.includes("Q3")) return "bg-yellow-100 text-yellow-800";
    return "bg-purple-100 text-purple-800";
  };

  const handleViewEvaluation = async (review: Review) => {
    try {
      const submission = await clientDataService.getSubmissionById(review.id);

      if (submission) {
        setSelectedSubmission(submission);
        setIsViewResultsModalOpen(true);
      } else {
        console.error("Submission not found for review ID:", review.id);
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-4 mb-5">
        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboardTotals?.total_users}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {dashboardTotals?.total_active_users} active
            </p>
            <p className="text-xs text-orange-500 mt-1">
              {dashboardTotals?.total_pending_users} pending
            </p>
            <p className="text-xs text-red-500 mt-1">
              {dashboardTotals?.total_declined_users} rejected
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {dashboardTotals?.total_evaluations}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {dashboardTotals?.total_completed_evaluations} completed
            </p>
            <p className="text-sm text-orange-500 mt-1">
              {dashboardTotals?.total_pending_evaluations} pending
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        {/* Main Container Div (replacing Card) */}
        <div className="bg-white border rounded-lg p-6">
          {/* Table Header Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Evaluation Records
              </h2>
              {(() => {
                const now = new Date();
                const newCount = evaluations.filter((review) => {
                  const hoursDiff =
                    (now.getTime() - new Date(review.created_at).getTime()) /
                    (1000 * 60 * 60);
                  return hoursDiff <= 24;
                }).length;
                return newCount > 0 ? (
                  <Badge className="bg-yellow-500 text-white animate-pulse">
                    {newCount} NEW
                  </Badge>
                ) : null;
              })()}
              <Badge variant="outline" className="text-xs font-normal">
                📅 Sorted: Newest First
              </Badge>
            </div>
            {/* Search Bar and Refresh Button */}
            <div className="flex items-center w-1/4 gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <Input
                  placeholder="  Search by employee/evaluator"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:cursor-not-allowed"
                title="Refresh evaluation records"
              >
                {refreshing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>🔄</span>
                    <span>Refresh</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Indicator Legend */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Indicators:
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-100 border-l-2 border-l-yellow-500 rounded"></div>
                <Badge className="bg-yellow-200 text-yellow-800 text-xs">
                  New
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-50 border-l-2 border-l-blue-500 rounded"></div>
                <Badge className="bg-blue-300 text-blue-800 text-xs">
                  Recent
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-50 border-l-2 border-l-red-500 rounded"></div>
                <Badge className="bg-orange-300 text-orange-800 text-xs">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-50 border-l-2 border-l-green-500 rounded"></div>
                <Badge className="bg-green-500 text-white text-xs">
                  Completed
                </Badge>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="border rounded-lg overflow-hidden">
            <div
              className="relative max-h-[600px] overflow-y-auto overflow-x-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 #f1f5f9",
              }}
            >
              {refreshing && ( // Only show spinner for initial refresh
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-3 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src="/smct.png"
                          alt="SMCT Logo"
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Loading evaluation records...
                    </p>
                  </div>
                </div>
              )}
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <TableRow>
                    <TableHead className="px-6 py-3">Employee Name</TableHead>
                    <TableHead className="px-6 py-3">Position</TableHead>
                    <TableHead className="px-6 py-3">Evaluator</TableHead>
                    <TableHead className="px-6 py-3">Quarter</TableHead>
                    <TableHead className="px-6 py-3">Date</TableHead>
                    <TableHead className="px-6 py-3">Status</TableHead>
                    <TableHead className="px-6 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {refreshing || isPageLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-8 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : evaluations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <img
                            src="/not-found.gif"
                            alt="No data"
                            className="w-25 h-25 object-contain"
                            style={{
                              imageRendering: "auto",
                              willChange: "auto",
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                            }}
                          />
                          <div className="text-gray-500">
                            {searchTerm ? (
                              <>
                                <p className="text-base font-medium mb-1">
                                  No results found
                                </p>
                                <p className="text-sm text-gray-400">
                                  Try adjusting your search or filters
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-base font-medium mb-1">
                                  No evaluation records to display
                                </p>
                                <p className="text-sm text-gray-400">
                                  Records will appear here when evaluations are
                                  submitted
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    evaluations.map((review) => {
                      const submittedDate = new Date(review.created_at);
                      const now = new Date();
                      const hoursDiff =
                        (now.getTime() - submittedDate.getTime()) /
                        (1000 * 60 * 60);
                      const isNew = hoursDiff <= 24;
                      const isRecent = hoursDiff > 24 && hoursDiff <= 168; // 7 days
                      const isCompleted = review.status === "completed";
                      const isPending = review.status === "pending";

                      // Determine row background color
                      let rowClassName = "hover:bg-gray-100 transition-colors";
                      if (isCompleted) {
                        rowClassName =
                          "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500 transition-colors";
                      } else if (isNew) {
                        rowClassName =
                          "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500 transition-colors";
                      } else if (isRecent) {
                        rowClassName =
                          "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500 transition-colors";
                      } else if (isPending) {
                        rowClassName =
                          "bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-500 transition-colors";
                      }

                      return (
                        <TableRow key={review.id} className={rowClassName}>
                          <TableCell className="px-6 py-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {review.employee?.fname +
                                    " " +
                                    review.employee?.lname}
                                </span>
                                {isNew && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 font-semibold">
                                    ⚡ New
                                  </Badge>
                                )}
                                {!isNew && isRecent && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 font-semibold">
                                    🕐 Recent
                                  </Badge>
                                )}
                                {isPending && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 font-semibold">
                                    🕐 Pending
                                  </Badge>
                                )}

                                {isCompleted && (
                                  <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5 font-semibold">
                                    ✓ COMPLETED
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.employee?.positions.label}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <div className="font-medium text-gray-900">
                              {review.evaluator?.fname +
                                " " +
                                review.evaluator?.lname}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge
                              className={getQuarterColor(
                                String(
                                  review.reviewTypeRegular ||
                                    review.reviewTypeProbationary
                                )
                              )}
                            >
                              {review.reviewTypeRegular ||
                                (review.reviewTypeProbationary
                                  ? "M" + review.reviewTypeProbationary
                                  : "") ||
                                "Others"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {new Date(review.created_at).toLocaleString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge
                              className={
                                review.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : review.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {review.status === "completed"
                                ? `✓ ${review.status}`
                                : review.status === "pending"
                                ? `⏳ ${review.status}`
                                : review.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 hover:text-white text-white hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                              onClick={() => handleViewEvaluation(review)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          {overviewTotal > itemsPerPage && (
            <EvaluationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={overviewTotal}
              perPage={perPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* View Results Modal */}
        <ViewResultsModal
          isOpen={isViewResultsModalOpen}
          onCloseAction={() => {
            setIsViewResultsModalOpen(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          showApprovalButton={false}
        />
      </div>
    </div>
  );
}
