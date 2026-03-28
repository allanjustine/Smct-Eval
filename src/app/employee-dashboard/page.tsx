"use client";

import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
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
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/apiService";
import EvaluationsPagination from "@/components/paginationComponent";
import ViewResultsModal from "@/components/evaluation/ViewResultsModal";
import { useAuth } from "../../contexts/UserContext";
import { toast } from "sonner";
import { toastMessages } from "@/lib/toastMessages";

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

export default function OverviewTab() {
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);

  const [myEvaluations, setMyEvaluations] = useState<any>([]);
  const [totalEvaluations, setTotalEvaluations] = useState<any>(0);
  const [average, setAverage] = useState<any>(0);
  const [recentEvaluation, setRecentEvaluation] = useState<any>([]);

  const { user } = useAuth();

  // Load approved evaluations from API
  const loadApprovedEvaluations = async (searchValue: string) => {
    try {
      setIsPaginate(true);
      const response = await apiService.getMyEvalAuthEmployee(
        searchValue,
        currentPage,
        itemsPerPage
      );
      
      // Add safety checks to prevent "Cannot read properties of undefined" error
      if (!response || !response.myEval_as_Employee) {
        console.error("API response is undefined or missing myEval_as_Employee");
        setMyEvaluations([]);
        setOverviewTotal(0);
        setTotalPages(1);
        setPerPage(itemsPerPage);
        setIsPaginate(false);
        return;
      }

      setMyEvaluations(response.myEval_as_Employee.data || []);
      setOverviewTotal(response.myEval_as_Employee.total || 0);
      setTotalPages(response.myEval_as_Employee.last_page || 1);
      setPerPage(response.myEval_as_Employee.per_page || itemsPerPage);
      setIsPaginate(false);
    } catch (error) {
      console.error("Error loading approved evaluations:", error);
      // Set default values on error to prevent crashes
      setMyEvaluations([]);
      setOverviewTotal(0);
      setTotalPages(1);
      setPerPage(itemsPerPage);
      setIsPaginate(false);
    }
  };

  useEffect(() => {
    loadApprovedEvaluations(searchTerm);
    const loadDashboard = async () => {
      try {
        const dashboard = await apiService.employeeDashboard();
        
        // Add safety checks to prevent "Cannot read properties of undefined" error
        if (!dashboard) {
          console.error("Dashboard API response is undefined");
          setTotalEvaluations(0);
          setAverage(0);
          setRecentEvaluation([]);
          return;
        }

        setTotalEvaluations(dashboard.total_evaluations || 0);
        setAverage(dashboard.average || 0);
        setRecentEvaluation(dashboard.recent_evaluation || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Set default values on error
        setTotalEvaluations(0);
        setAverage(0);
        setRecentEvaluation([]);
      }
    };
    loadDashboard();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== "" && currentPage !== 1) {
        setCurrentPage(1);
      }

      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search term changes (if there's a value)
      if (searchTerm.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch API whenever debounced search term changes
  useEffect(() => {
    const debounceData = async () => {
      await loadApprovedEvaluations(debouncedSearchTerm);
    };
    debounceData();
  }, [debouncedSearchTerm, currentPage]);

  const refresh = async () => {
    setIsRefreshingOverview(true);
    try {
      // Add delay to show spinner
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadApprovedEvaluations(searchTerm);
    } catch (error) {
      console.error("Error refreshing on tab click:", error);
    } finally {
      setIsRefreshingOverview(false);
    }
  };

  const handleViewEvaluation = async (review: Review) => {
    try {
      const submission = await apiService.getSubmissionById(review.id);

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

  const handleApprove = async (id: number) => {
    try {
      if (user?.signature === null || user?.signature === undefined) {
        toastMessages.generic.warning(
          "No signature found",
          "Please set up your signature before approving evaluations."
        );
      }
      await apiService.approvedByEmployee(id);
      const submission = await apiService.getSubmissionById(id);

      if (submission) {
        setSelectedSubmission(submission);
        setIsViewResultsModalOpen(true);
      } else {
        console.error("Submission not found for ID:", id);
      }
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleClose = async () => {
    try {
      let search =
        debouncedSearchTerm !== "" ? debouncedSearchTerm : searchTerm;
      loadApprovedEvaluations(search);
      setIsViewResultsModalOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.log(error);
      setIsViewResultsModalOpen(false);
      setSelectedSubmission(null);
    }
  };

  // Helper functions
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const getTimeAgo = (submittedAt: string) => {
    const diffSeconds = Math.floor(
      (Date.now() - new Date(submittedAt).getTime()) / 1000
    );

    if (diffSeconds < 60) return rtf.format(-diffSeconds, "second");
    if (diffSeconds < 3600)
      return rtf.format(-Math.floor(diffSeconds / 60), "minute");
    if (diffSeconds < 86400)
      return rtf.format(-Math.floor(diffSeconds / 3600), "hour");
    if (diffSeconds < 604800)
      return rtf.format(-Math.floor(diffSeconds / 86400), "day");

    return;
  };

  const getQuarterColor = (quarter: string): string => {
    if (quarter.includes("Q1")) return "bg-blue-100 text-blue-800";
    if (quarter.includes("Q2")) return "bg-green-100 text-green-800";
    if (quarter.includes("Q3")) return "bg-yellow-100 text-yellow-800";
    if (quarter.includes("Q4")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <div className="flex flex-row gap-4 space-around mb-5">
        <Card className="w-1/4 h-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRefreshingOverview ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {average}
                  </span>
                  <span className="text-sm text-gray-500">/ 5.0</span>
                </div>
                <Badge
                  className={`mt-2 ${
                    Number(average) > 0
                      ? (() => {
                          const avgScore = Number(average);
                          if (avgScore >= 4.5)
                            return "text-green-600 bg-green-100";
                          if (avgScore >= 4.0)
                            return "text-blue-600 bg-blue-100";
                          if (avgScore >= 3.5)
                            return "text-yellow-600 bg-yellow-100";
                          return "text-red-600 bg-red-100";
                        })()
                      : "text-gray-600 bg-gray-100"
                  }`}
                >
                  {Number(average) > 0
                    ? (() => {
                        const avgScore = Number(average);
                        if (avgScore >= 4.5) return "Outstanding";
                        if (avgScore >= 4.0) return "Good";
                        if (avgScore >= 3.5) return "Average";
                        return "Needs Improvement";
                      })()
                    : "No Data"}
                </Badge>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-1/4 h-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reviews Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRefreshingOverview ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900">
                  {totalEvaluations}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Number(totalEvaluations) === 1 ? "Review" : "Reviews"} total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-1/4 h-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Evaluation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRefreshingOverview ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-600">
                  {recentEvaluation?.rating || 0}
                  /5.00
                </div>
                <p className="text-sm text-gray-500 mt-1">Latest evaluation</p>
                <div className="mt-2">
                  <Badge
                    className={`text-xs ${
                      Number(recentEvaluation?.rating) > 0
                        ? (() => {
                            const score = Number(recentEvaluation?.rating);
                            if (score >= 4.5)
                              return "bg-green-100 text-green-800";
                            if (score >= 4.0)
                              return "bg-blue-100 text-blue-800";
                            if (score >= 3.5)
                              return "bg-yellow-100 text-yellow-800";
                            return "bg-red-100 text-red-800";
                          })()
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {Number(recentEvaluation?.rating) > 0
                      ? (() => {
                          const score = Number(recentEvaluation?.rating);
                          if (score >= 4.5) return "Outstanding";
                          if (score >= 4.0) return "Exceeds Expectations";
                          if (score >= 3.5) return "Meets Expectations";
                          return "Needs Improvement";
                        })()
                      : "No Data"}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="w-1/4 h-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Performance Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRefreshingOverview ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20 ml-1" />
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-orange-600">
                  {average}
                  /5.0
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Average across all evaluations
                </p>
                <div className="mt-2 flex items-center space-x-1">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${(() => {
                          return Number(average) >= star
                            ? "text-yellow-400"
                            : "text-gray-300";
                        })()}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 ml-1">
                    {Number(totalEvaluations) > 0
                      ? `${totalEvaluations} review${
                          Number(totalEvaluations) !== 1 ? "s" : ""
                        }`
                      : "No reviews"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Recent Performance Reviews</CardTitle>
              <CardDescription>
                Your latest performance evaluations
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshingOverview}
              className="flex items-center space-x-2 bg-blue-500 text-white hover:bg-green-700 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15 "
                />
              </svg>
              <span>Refresh</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative w-1/5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search by supervisor/ evaluator"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 text-lg" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isRefreshingOverview || isPaginate ? (
            <div className="relative max-h-[350px] md:max-h-[500px] lg:max-h-[700px] xl:max-h-[750px] overflow-y-auto overflow-x-auto scrollable-table mx-4">
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
                    Loading performance reviews...
                  </p>
                </div>
              </div>
              <Table className="table-fixed w-full">
                <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                  <TableRow>
                    <TableHead className="w-1/6 pl-4">
                      Immediate Supervisor
                    </TableHead>
                    <TableHead className="w-1/6 text-right pr-25">
                      Rating
                    </TableHead>
                    <TableHead className="w-1/6 pl-6">Date</TableHead>
                    <TableHead className="w-1/6 px-4 pr-23 text-center">
                      Quarter
                    </TableHead>
                    <TableHead className="w-1/6 text-center">
                      Acknowledgement
                    </TableHead>
                    <TableHead className="w-1/6 text-right pl-1 pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="w-1/6 pl-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell className="w-1/6 text-right pr-25">
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell className="w-1/6 pl-6">
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="w-1/6 px-4 pr-23">
                        <Skeleton className="h-5 w-16 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell className="w-1/6 text-center">
                        <Skeleton className="h-5 w-20 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell className="w-1/6 text-right pl-1 pr-4">
                        <Skeleton className="h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : myEvaluations.length === 0 && searchTerm === "" ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">
                No performance reviews yet
              </div>
              <div className="text-gray-400 text-sm">
                Your evaluations will appear here once they are completed by
                your manager.
              </div>
            </div>
          ) : myEvaluations.length === 0 && searchTerm !== "" ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center gap-4 mb-4">
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
                  <p className="text-base font-medium mb-1">No results found</p>
                  <p className="text-sm">
                    No performance reviews match "{searchTerm}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {searchTerm && (
                <div className="mb-3 mx-4 text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-blue-600">
                    {myEvaluations.length}
                  </span>{" "}
                  result{myEvaluations.length !== 1 ? "s" : ""} for "
                  {searchTerm}"
                </div>
              )}

              <div className="mb-3 mx-4 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-50 border-l-2 border-l-green-500 rounded"></div>
                  <Badge className="bg-green-200 text-green-800 text-xs">
                    Approved
                  </Badge>
                </div>
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
                  <div className="w-2 h-2 bg-orange-100 border-l-2 border-l-orange-500 rounded"></div>
                  <Badge className="text-white bg-orange-500 text-xs">
                    Pending
                  </Badge>
                </div>
              </div>

              <div className="max-h-[350px] md:max-h-[500px] lg:max-h-[700px] xl:max-h-[750px] overflow-y-auto overflow-x-auto scrollable-table mx-4">
                <Table className="table-fixed w-full">
                  <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                    <TableRow>
                      <TableHead className="w-1/6 pl-4">
                        Immediate Supervisor
                      </TableHead>
                      <TableHead className="w-1/6 text-right pr-25">
                        Rating
                      </TableHead>
                      <TableHead className="w-1/6 pl-6">Date</TableHead>
                      <TableHead className="w-1/6 px-4 pr-23 text-center">
                        Quarter
                      </TableHead>
                      <TableHead className="w-1/6 text-center">
                        Acknowledgement
                      </TableHead>
                      <TableHead className="w-1/6 text-right pl-1 pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myEvaluations.map((submission: any) => {
                      const submittedDate = new Date(submission.created_at);
                      const now = new Date();
                      const hoursDiff =
                        (now.getTime() - submittedDate.getTime()) /
                        (1000 * 60 * 60);
                      const isNew = hoursDiff <= 24;
                      const isRecent = hoursDiff > 24 && hoursDiff <= 168; // 7 days
                      const isCompleted = submission.status === "completed";
                      const isPending = submission.status === "pending";

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
                        <TableRow key={submission.id} className={rowClassName}>
                          <TableCell className="w-1/6 font-medium pl-4">
                            <div className="flex items-center gap-2">
                              {submission.evaluator?.fname && submission.evaluator?.lname
                                ? submission.evaluator.fname + " " + submission.evaluator.lname
                                : "Not specified"}
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
                          </TableCell>
                          <TableCell className="w-1/6 text-right font-semibold pr-25">
                            {submission.rating}
                            /5
                          </TableCell>
                          <TableCell className="w-1/6 pl-6">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(
                                  submission.created_at
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(submission.created_at)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="w-1/6 px-4 pr-23">
                            <div className="flex justify-center">
                              <Badge
                                className={getQuarterColor(
                                  String(
                                    submission.reviewTypeProbationary ||
                                      submission.reviewTypeRegular
                                  )
                                )}
                              >
                                {submission.reviewTypeRegular ||
                                  (submission.reviewTypeProbationary
                                    ? "M" + submission.reviewTypeProbationary
                                    : "") ||
                                  "Others"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="w-1/6">
                            <div className="flex justify-center">
                              {submission.status === "completed" ? (
                                <Badge className="bg-green-100 text-green-800">
                                  ✓ Approved
                                </Badge>
                              ) : (
                                <Badge className="text-white bg-orange-500 border-orange-300">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-1/6 text-right pl-1 pr-4">
                            <Button
                              className="bg-blue-500 text-white hover:bg-green-700 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                              size="sm"
                              onClick={() => handleViewEvaluation(submission)}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {overviewTotal > itemsPerPage && (
                <EvaluationsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={overviewTotal}
                  perPage={perPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              )}

              {/* View Results Modal */}
              <ViewResultsModal
                isOpen={isViewResultsModalOpen}
                onCloseAction={() => {
                  handleClose();
                }}
                submission={selectedSubmission}
                showApprovalButton={true}
                onApprove={(id) => handleApprove(id)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
