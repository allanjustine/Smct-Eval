"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getQuarterColor } from "@/lib/quarterUtils";
import apiService from "@/lib/apiService";
import { EvaluationPayload } from "@/components/evaluation/types";
import ViewResultsModal from "@/components/evaluation/ViewResultsModal";
import EvaluationsPagination from "@/components/paginationComponent";

export default function OverviewTab() {
  //data
  const [submissions, setSubmissions] = useState<EvaluationPayload[]>([]);
  const [newEval, setNewEval] = useState<any | null>(null);
  const [pendingEval, setPendingEval] = useState<any | null>(null);
  const [completedEval, setCompletedEval] = useState<any | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<any | null>(null);
  //filters
  const [overviewSearchTerm, setOverviewSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(overviewSearchTerm);

  //pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);
  //view
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  //modal
  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);
  //refresh state
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const res = await apiService.getSubmissions(
          overviewSearchTerm,
          currentPage,
          itemsPerPage
        );
        setSubmissions(res.data);
        setOverviewTotal(res.total);
        setTotalPages(res.last_page);
        setPerPage(res.per_page);

        const dashboard = await apiService.hrDashboard();
        setNewEval(dashboard.new_eval);
        setPendingEval(dashboard.pending_eval);
        setCompletedEval(dashboard.completed_eval);
        setTotalEmployees(dashboard.total_users);
      } catch (error) {
        console.log(error);
        setIsRefreshing(false);
      } finally {
        setIsRefreshing(false);
      }
    };
    loadSubmissions();
  }, [isRefreshing, debouncedSearchTerm, currentPage]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchTerm(overviewSearchTerm);
      // Reset to page 1 when search term changes (if there's a value)
      if (overviewSearchTerm.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [overviewSearchTerm]);

  // Helper function to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-800";
    if (rating >= 4.0) return "bg-blue-100 text-blue-800";
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleRefresh = async () => {
    // await onRefresh();
  };

  const handleViewEvaluation = async (submission: any) => {
    try {
      const fullSubmission = await apiService.getSubmissionById(submission.id);

      if (fullSubmission) {
        setSelectedSubmission(fullSubmission);
        setIsViewResultsModalOpen(true);
      } else {
        console.error("Submission not found for ID:", submission.id);
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
    }
  };

  return (
    <>
      <div className="flex gap-3 mb-3">
        {/* New Submissions (Last 24 hours) */}
        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              🆕 New Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {newEval || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ⏳ Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pendingEval || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Needs review</p>
          </CardContent>
        </Card>

        {/* Approved Evaluations */}
        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ✅ Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completedEval || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Completed reviews</p>
          </CardContent>
        </Card>

        {/* Total Employees */}
        <Card className="w-1/4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              👥 Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalEmployees || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              All registered employees
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="relative space-y-6 pr-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recent Evaluation Records
              {(() => {
                const now = new Date();
                const newCount = 0;
                submissions.filter((sub) => {
                  const hoursDiff =
                    (now.getTime() - new Date(sub.created_at).getTime()) /
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
            </CardTitle>
            <CardDescription>
              Latest performance evaluations and reviews (most recent at the
              top)
            </CardDescription>
            {/* Search Bar and Refresh Button */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search by employee, department, position, evaluator, or status..."
                  value={overviewSearchTerm}
                  onChange={(e) => setOverviewSearchTerm(e.target.value)}
                  className="pr-10"
                />
                {overviewSearchTerm && (
                  <button
                    onClick={() => setOverviewSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors hover:scale-120 transition-transform duration-200"
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
                onClick={() => setIsRefreshing(true)}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform duration-200"
                title="Refresh evaluation records"
              >
                {isRefreshing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 cursor-pointer ">
                    <span>🔄</span>
                    <span>Refresh</span>
                  </div>
                )}
              </Button>
            </div>
            {/* Indicator Legend */}
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                <span className="font-medium text-gray-700 mr-2">
                  Indicators:
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-100 border-l-2 border-l-yellow-500 rounded"></div>
                  <Badge className="bg-yellow-200 text-yellow-800 text-xs md:text-sm px-1.5 md:px-2 py-0.5">
                    New
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-50 border-l-2 border-l-blue-500 rounded"></div>
                  <Badge className="bg-blue-300 text-blue-800 text-xs md:text-sm px-1.5 md:px-2 py-0.5">
                    Recent
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-50 border-l-2 border-l-green-500 rounded"></div>
                  <Badge className="bg-green-500 text-white text-xs md:text-sm px-1.5 md:px-2 py-0.5">
                    Approved
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className=" h-64 overflow-x-auto w-full">
              {isRefreshing && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="flex flex-col items-center gap-3 bg-white/95 px-6 md:px-8 py-4 md:py-6 rounded-lg shadow-lg">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-4 border-blue-500 border-t-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src="/smct.png"
                          alt="SMCT Logo"
                          className="h-8 md:h-10 w-8 md:w-10 object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 font-medium">
                      Loading evaluation records...
                    </p>
                  </div>
                </div>
              )}

              <Table className="min-w-full w-full">
                <TableHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <TableRow>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 min-w-[140px] md:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Employee Name
                      </span>
                    </TableHead>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 text-left pl-0 min-w-[100px] md:min-w-[120px] lg:min-w-[140px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Rating
                      </span>
                    </TableHead>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 min-w-[80px] md:min-w-[90px] lg:min-w-[100px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Quarter
                      </span>
                    </TableHead>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 min-w-[90px] md:min-w-[100px] lg:min-w-[110px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Date
                      </span>
                    </TableHead>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 min-w-[110px] md:min-w-[130px] lg:min-w-[150px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Approval Status
                      </span>
                    </TableHead>
                    <TableHead className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 min-w-[120px] md:min-w-[140px] lg:min-w-[160px]">
                      <span className="text-xs md:text-sm lg:text-base">
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {isRefreshing ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className="px-6 py-3">
                          <div className="space-y-1">
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-2.5 w-24 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left pl-0">
                          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !submissions || submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
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
                            {overviewSearchTerm ? (
                              <>
                                <p className="text-base font-medium mb-1">
                                  No results found for "{overviewSearchTerm}"
                                </p>
                                <p className="text-sm text-gray-400">
                                  Try adjusting your search term
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
                    submissions.map((submission: any) => {
                      // Calculate time difference for indicators
                      const submittedDate = new Date(submission.created_at);
                      const now = new Date();
                      const hoursDiff =
                        (now.getTime() - submittedDate.getTime()) /
                        (1000 * 60 * 60);
                      const isNew = hoursDiff <= 24;
                      const isRecent = hoursDiff > 24 && hoursDiff <= 168; // 7 days

                      return (
                        <TableRow
                          key={submission.id}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">
                                  {submission.employee?.fname && submission.employee?.lname
                                    ? `${submission.employee.fname} ${submission.employee.lname}`
                                    : "Unknown Employee"}
                                </span>
                                {isNew && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 md:px-2 py-0.5 font-semibold">
                                    ⚡ NEW
                                  </Badge>
                                )}
                                {!isNew && isRecent && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 md:px-2 py-0.5 font-semibold">
                                    🕐 RECENT
                                  </Badge>
                                )}
                                {submission.status === "completed" && (
                                  <Badge className="bg-green-100 text-green-800 text-xs px-1.5 md:px-2 py-0.5 font-semibold">
                                    ✓ APPROVED
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">
                                {submission.employee?.email || ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 text-left pl-0">
                            {submission.rating && (
                              <Badge
                                className={`text-xs md:text-sm font-semibold ${getRatingColor(
                                  submission.rating
                                )}`}
                              >
                                {submission.rating > 0
                                  ? `${submission.rating}/5`
                                  : "N/A"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3">
                            <Badge
                              className={`${getQuarterColor(
                                submission.reviewTypeProbationary ||
                                  submission.reviewTypeRegular
                              )} text-xs md:text-sm`}
                            >
                              {submission.reviewTypeRegular ||
                                "M" + submission.reviewTypeProbationary}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3 text-xs md:text-sm text-gray-600">
                            {new Date(
                              submission.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3">
                            <Badge
                              className={`text-xs md:text-sm ${
                                submission.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : submission.status === "pending"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {submission.status === "completed"
                                ? "✓ Fully Approved"
                                : submission.status === "pending"
                                ? "⏳ Pending"
                                : ""}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2 md:px-4 md:py-2.5 lg:px-6 lg:py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEvaluation(submission)}
                              className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 bg-green-600 hover:bg-green-500 text-white hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
                            >
                              ☰ View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {overviewTotal > itemsPerPage && (
              <EvaluationsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={overviewTotal}
                perPage={perPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setIsRefreshing(true);
                }}
              />
            )}
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
