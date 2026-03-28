"use client";

import { Skeleton } from "@/components/ui/skeleton";
import clientDataService, { apiService } from "@/lib/apiService";
import EvaluationsPagination from "@/components/paginationComponent";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ViewResultsModal from "@/components/evaluation/ViewResultsModal";
import { setQuarter } from "date-fns";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";
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
  const [evaluations, setEvaluations] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  //filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [quarterFilter, setQuarterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  //debounce filters
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debouncedStatusFilter, setDebouncedStatusFilter] =
    useState(statusFilter);
  const [debouncedQuarterFilter, setDebouncedQuarterFilter] =
    useState(quarterFilter);
  const [debouncedYearFilter, setDebouncedYearFilter] = useState(yearFilter);

  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });
  const [years, setYears] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEvaluations = async (
    searchValue: string,
    status: string,
    quarter: string,
    year: string
  ) => {
    const response = await clientDataService.getSubmissions(
      searchValue,
      currentPage,
      itemsPerPage,
      status,
      quarter,
      year
    );
    setEvaluations(response.data);
    setOverviewTotal(response.total);
    setTotalPages(response.last_page);
    setPerPage(response.per_page);
  };

  useEffect(() => {
    const mount = async () => {
      setRefreshing(true);
      try {
        const years = await apiService.getAllYears();
        setYears(years);
        await loadEvaluations(
          searchTerm,
          statusFilter,
          quarterFilter,
          yearFilter
        );
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
      // Always reset to page 1 when any filter changes (search, status, quarter, or year)
      // This ensures global search behavior - always start from page 1 when filtering
      setCurrentPage(1);
      setDebouncedSearchTerm(searchTerm);
      setDebouncedStatusFilter(statusFilter);
      setDebouncedQuarterFilter(quarterFilter);
      setDebouncedYearFilter(yearFilter);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, quarterFilter, yearFilter]);

  // Track when page change started
  const pageChangeStartTimeRef = useRef<number | null>(null);

  // Fetch API whenever debounced search term changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadEvaluations(
          debouncedSearchTerm,
          debouncedStatusFilter,
          debouncedQuarterFilter,
          debouncedYearFilter
        );
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
  }, [
    debouncedSearchTerm,
    currentPage,
    debouncedStatusFilter,
    debouncedQuarterFilter,
    debouncedYearFilter,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await loadEvaluations(
        debouncedSearchTerm,
        debouncedStatusFilter,
        debouncedQuarterFilter,
        debouncedYearFilter
      );
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
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

  const handleDeleteClick = async (submission: any) => {
    try {
      await clientDataService.deleteSubmission(submission.id);
      await handleRefresh();
      toastMessages.evaluation.deleted(
        submission.employee?.fname + " " + submission.employee?.lname
      );
    } catch (error) {
      console.error("Error deleting submission:", error);
    } finally {
      setReviewToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const openDeleteModal = (review: Review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };
  


  return (
    <div className="relative ">
      <div className="relative  overflow-y-auto">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 w-100">
              All Evaluation Records
              <Badge variant="outline" className="text-xs font-normal">
                {overviewTotal} Total Records
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete evaluation history with advanced filtering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <Label htmlFor="records-search" className="text-sm font-medium">
                  Search
                </Label>
                <div className=" relative ">
                  <div className="relative ">
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
                      placeholder="Search by employee, evaluator"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 pl-10"
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
                </div>
              </div>

              {/* Approval Status Filter */}
              <div className="w-full md:w-48">
                <Label
                  htmlFor="records-approval-status"
                  className="text-sm font-medium"
                >
                  Approval Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-48 cursor-pointer">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Status</SelectItem>
                    <SelectItem value="pending">
                      Pending Verification
                    </SelectItem>
                    <SelectItem value="completed">
                      All parties approved
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quarter Filter */}
              <div className="w-full md:w-48">
                <Label
                  htmlFor="records-quarter"
                  className="text-sm font-medium"
                >
                  Quarter
                </Label>
                <Select
                  value={quarterFilter}
                  onValueChange={(value) => setQuarterFilter(value)}
                >
                  <SelectTrigger className="w-48 cursor-pointer">
                    <SelectValue placeholder="Filter by quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Quarter</SelectItem>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                    <SelectItem value="3">M3</SelectItem>
                    <SelectItem value="5">M5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="w-full md:w-48">
                <Label htmlFor="records-year" className="text-sm font-medium">
                  Year
                </Label>
                <Select
                  value={yearFilter}
                  onValueChange={(value) => setYearFilter(value)}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Select a year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Years</SelectItem>
                    {years.map((year: any) => (
                      <SelectItem key={year.year} value={year.year}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="w-full md:w-auto flex gap-2">
                <div className="w-full md:w-32">
                  <Label className="text-sm font-medium opacity-0">
                    Refresh
                  </Label>
                  {/* Refresh Button */}
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="mt-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:cursor-not-allowed"
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
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6 mt-2">
        {/* Main Container Div (replacing Card) */}
        <div className="bg-white border rounded-lg p-6">
          {/* Table Header Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {(() => {
                const now = new Date();
                const newCount = evaluations?.filter((review) => {
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
            </div>
            {/* Search Bar and Refresh Button */}
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
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-white/80">
                  <div className="flex flex-col items-center gap-3 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
                    <div className="relative">
                      {/* Spinning ring */}
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                      {/* Logo in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src="/smct.png"
                          alt="SMCT Logo"
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Refreshing...
                    </p>
                  </div>
                </div>
              )}
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <TableRow>
                    <TableHead className="px-6 py-3">Employee</TableHead>
                    <TableHead className="px-6 py-3">Evaluator</TableHead>
                    <TableHead className="px-6 py-3">Branch</TableHead>
                    <TableHead className="px-6 py-3">Quarter</TableHead>
                    <TableHead className="px-6 py-3">Date</TableHead>
                    <TableHead className="px-6 py-3">Rating</TableHead>
                    <TableHead className="px-6 py-3">Status</TableHead>
                    <TableHead className="px-6 py-3">Employee Sign</TableHead>
                    <TableHead className="px-6 py-3">Evaluator Sign</TableHead>
                    <TableHead className="px-6 py-3">HR Sign</TableHead>
                    <TableHead className="px-6 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {refreshing || isPageLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : evaluations?.length === 0 || !evaluations ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
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
                    evaluations?.map((review) => {
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
                      console.log("test", review);
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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <div className="font-medium text-gray-900">
                              {review.evaluator?.fname +
                                " " +
                                review.evaluator?.lname}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.employee?.branches[0]?.branch_name}
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
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.rating}
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
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.status === "completed" ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ Signed
                              </Badge>
                            ) : review.status === "pending" ? (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                ⏳ Pending
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.evaluator.roles[0].name === "evaluator" ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ Signed
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-sm text-gray-600">
                            {review.evaluator.roles[0].name === "hr" ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ Signed
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>

                          <TableCell className="px-6 py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewEvaluation(review)}
                                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
                              >
                                ☰ View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteModal(review)}
                                className="text-xs px-2 py-1 bg-red-300 hover:bg-red-500 text-gray-700 hover:text-white border-red-200 cursor-pointer hover:scale-110 transition-transform duration-200"
                                title="Delete this evaluation record"
                              >
                                ❌ Delete
                              </Button>
                            </div>
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
              onPageChange={(page) => {
                setIsPageLoading(true);
                pageChangeStartTimeRef.current = Date.now();
                setCurrentPage(page);
              }}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onOpenChangeAction={(open) => {
            setIsDeleteModalOpen(open);
            if (!open) {
              setReviewToDelete(null);
            }
          }}
        >
          <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
            <DialogHeader className="pb-4 bg-red-50 rounded-lg ">
              <DialogTitle className="text-red-800 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Delete Evaluation of{" "}
                {(reviewToDelete?.employee?.fname || "") +
                  " " +
                  (reviewToDelete?.employee?.lname || "") || 
                  reviewToDelete?.employee?.name || 
                  "Unknown Employee"}
              </DialogTitle>
              <DialogDescription className="text-red-700">
                This action cannot be undone. Are you sure you want to
                permanently delete this evaluation?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-2 mt-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-red-700">
                    <p className="font-medium">
                      Warning: This will permanently delete:
                    </p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>This evaluation record</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Evaluation Details:</p>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Employee Name:</span>{" "}
                      {(reviewToDelete?.employee?.fname || "") +
                        " " +
                        (reviewToDelete?.employee?.lname || "") || 
                        reviewToDelete?.employee?.name || 
                        "Unknown Employee"}
                    </p>
                    <p>
                      <span className="font-medium">Evaluator Name:</span>{" "}
                      {(reviewToDelete?.evaluator?.fname || "") +
                        " " +
                        (reviewToDelete?.evaluator?.lname || "") || 
                        reviewToDelete?.evaluator?.name || 
                        "Unknown Evaluator"}
                    </p>
                    <p>
                      <span className="font-medium">Branch:</span>{" "}
                      {reviewToDelete?.employee?.branch_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 px-2">
              <div className="flex justify-end space-x-4 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setReviewToDelete(null);
                  }}
                  className="text-white bg-red-600 hover:text-white hover:bg-red-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isDeleting}
                  className={`bg-blue-600 hover:bg-red-700 text-white cursor-pointer
    hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl
    ${isDeleting ? "opacity-70 cursor-not-allowed hover:scale-100" : ""}
  `}
                  onClick={async () => {
                    if (!reviewToDelete) return;

                    setIsDeleting(true);

                    try {
                      await handleDeleteClick(reviewToDelete);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>❌ Delete Permanently</>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
