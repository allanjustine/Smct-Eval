"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Eye } from "lucide-react";
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
import {
  getQuarterFromEvaluationData,
  getQuarterColor,
} from "@/lib/quarterUtils";
import apiService from "@/lib/apiService";
import { Progress } from "@/components/ui/progress";
import EvaluationsPagination from "@/components/paginationComponent";
import ViewResultsModal from "@/components/evaluation/ViewResultsModal";
import { set } from "date-fns";

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
  //data
  const [data, setData] = useState<any | null>(null);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);

  //filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  //pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);

  //view data
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  //modal
  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);

  //refreshing state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPaginate(true);
        const response = await apiService.evaluatorDashboard(
          debouncedSearchTerm,
          currentPage,
          itemsPerPage
        );

        setData(response.myEval_as_Evaluator.data);
        setTotalEvaluations(response.total_evaluations);
        setTotalPending(response.total_pending);
        setTotalApproved(response.total_approved);

        setOverviewTotal(response.myEval_as_Evaluator.total);
        setTotalPages(response.myEval_as_Evaluator.last_page);
        setPerPage(response.myEval_as_Evaluator.per_page);
        setIsPaginate(false);
        setIsRefreshing(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, [isRefreshing, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search term changes (if there's a value)
      if (searchTerm.trim() !== "") {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

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

  const handleClose = async () => {
    try {
      let search =
        debouncedSearchTerm !== "" ? debouncedSearchTerm : searchTerm;
      setIsRefreshing(true);
      setIsViewResultsModalOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.log(error);
      setIsViewResultsModalOpen(false);
      setSelectedSubmission(null);
    }
  };

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

  // Filter submissions for overview table

  return (
    <div className="grid grid-cols-1 gap-6">
      <>
        {isRefreshing ? (
          // Skeleton cards for overview
          <div className="flex">
            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <Skeleton className="h-5 w-16 mt-2 rounded-full" />
              </CardContent>
            </Card>

            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-22" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-16 mt-1" />
                <Skeleton className="h-1.5 w-full mt-2" />
              </CardContent>
            </Card>

            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Actual cards with real data
          <div className="flex gap-5">
            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Evaluations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {totalEvaluations ? totalEvaluations : 0}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Conducted by you</p>
              </CardContent>
            </Card>

            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {totalPending ? totalPending : 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
                <Progress
                  value={
                    totalPending > 0
                      ? (totalPending / totalEvaluations) * 100
                      : 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="w-1/4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Fully Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {totalApproved ? totalApproved : 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">Completed & signed</p>
              </CardContent>
            </Card>
          </div>
        )}
      </>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Submissions
            {(() => {
              const newCount =
                data?.filter((sub: any) => {
                  const hoursDiff =
                    (Date.now() - new Date(sub.created_at).getTime()) /
                    (1000 * 60 * 60);
                  return hoursDiff <= 24;
                }).length ?? 0;

              return newCount > 0 ? (
                <Badge className="bg-yellow-500 text-white animate-pulse">
                  {newCount} NEW
                </Badge>
              ) : null;
            })()}
          </CardTitle>

          <CardDescription>
            Latest items awaiting evaluation ({totalEvaluations} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search and Filter Controls */}
          <div className="px-6 py-4 flex gap-2 w-1/2 border-b border-gray-200">
            <Input
              placeholder="Search submissions by employee name ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/2 bg-gray-100"
            />
            {searchTerm && (
              <Button
                size="sm"
                onClick={() => setSearchTerm("")}
                className="px-3 py-2 text-white hover:text-white bg-blue-400 hover:bg-blue-500"
              >
                 Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsRefreshing(true)}
              disabled={isRefreshing || isPaginate}
              className="px-3 py-2 text-white hover:text-white bg-blue-500 hover:bg-green-600 disabled:bg-gray-400 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              title="Refresh submissions data"
            >
              {isRefreshing || isPaginate ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 "></div>
                  Refreshing...
                </>
              ) : (
                <>
                  {" "}
                  Refresh{" "}
                  <span>
                    <RefreshCw className="h-3 w-3" />
                  </span>{" "}
                </>
              )}
            </Button>
          </div>
          {isRefreshing || isPaginate ? (
            <div className="relative max-h-[350px] md:max-h-[500px] lg:max-h-[700px] xl:max-h-[750px] overflow-y-auto overflow-x-auto scrollable-table overview-table">
              {/* Centered Loading Spinner */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
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
                    Loading submissions...
                  </p>
                </div>
              </div>

              {/* Simple Legend */}
              <div className="m-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                    <div className="w-2 h-2 bg-green-50 border-l-2 border-l-green-500 rounded"></div>
                    <Badge className="bg-green-500 text-white text-xs">
                      Approved
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Table structure visible in background */}
              <Table className="table-fixed w-full">
                <TableHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <TableRow key="overview-header">
                    <TableHead className="w-1/5 pl-4">Employee</TableHead>
                    <TableHead className="w-1/5 text-center pl-4">
                      Rating
                    </TableHead>
                    <TableHead className="w-1/5 text-center">Date</TableHead>
                    <TableHead className="w-1/5 text-right pr-6">
                      Quarter
                    </TableHead>
                    <TableHead className="w-1/5 text-right pl-1 pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="w-1/5 pl-4">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-1/5 pl-4">
                        <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell className="w-1/5">
                        <div className="flex flex-col items-center space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </TableCell>
                      <TableCell className="w-1/5 text-right pr-6">
                        <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                      </TableCell>
                      <TableCell className="w-1/5 text-right pl-1 pr-4">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              {/* Simple Legend */}
              <div className="m-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                    <div className="w-2 h-2 bg-green-50 border-l-2 border-l-green-500 rounded"></div>
                    <Badge className="bg-green-500 text-white text-xs">
                      Approved
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="max-h-[350px] md:max-h-[500px] lg:max-h-[700px] xl:max-h-[750px] overflow-y-auto overflow-x-auto scrollable-table overview-table">
                <Table className="table-fixed w-full">
                  <TableHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                    <TableRow key="overview-header">
                      <TableHead className="w-1/5 pl-4">Employee</TableHead>
                      <TableHead className="w-1/5 text-center pl-4">
                        Rating
                      </TableHead>
                      <TableHead className="w-1/5 text-center">Date</TableHead>
                      <TableHead className="w-1/5 text-right pr-6">
                        Quarter
                      </TableHead>
                      <TableHead className="w-1/5 text-right pl-1 pr-4">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Number(totalEvaluations) === 0 ||
                    !data ||
                    data.length === 0 ? (
                      <TableRow key="no-submissions">
                        <TableCell
                          colSpan={5}
                          className="px-6 py-12 text-center"
                        >
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
                              {searchTerm.trim() ? (
                                <>
                                  <p className="text-base font-medium mb-1">
                                    No submissions found
                                  </p>
                                  <p className="text-sm">
                                    Try adjusting your search criteria
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-base font-medium mb-1">
                                    No recent submissions
                                  </p>
                                  <p className="text-sm">
                                    Start evaluating employees to see
                                    submissions here
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.map((review: any) => {
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
                        let rowClassName =
                          "hover:bg-gray-100 transition-colors";
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
                        // console.log(review);
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
                            <TableCell className="w-1/5 pl-4">
                              <div className="flex justify-center">
                                <span className="font-semibold">
                                  {review.rating ? review.rating : "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="w-1/5">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {new Date(
                                    review.created_at
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(String(review.created_at))}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="w-1/5 text-right pr-6">
                              <Badge
                                className={getQuarterColor(
                                  String(
                                    review.reviewTypeProbationary ||
                                      review.reviewTypeRegular
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
                            <TableCell className="w-1/5 text-right pl-1 pr-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewEvaluation(review)}
                                className="bg-blue-500 hover:bg-blue-500 hover:text-white text-white  cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <Eye className="w-4 h-4" />
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

              {/* Pagination Controls */}
              {overviewTotal > itemsPerPage && (
                <EvaluationsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={overviewTotal}
                  perPage={perPage}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    setIsPaginate(true);
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
                showApprovalButton={false}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
