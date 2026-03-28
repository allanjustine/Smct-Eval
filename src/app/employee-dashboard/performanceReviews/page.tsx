"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Eye } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/useToast";
import {
  getQuarterFromEvaluationData,
  getQuarterColor,
} from "@/lib/quarterUtils";
import { apiService } from "@/lib/apiService";
import EvaluationsPagination from "@/components/paginationComponent";
import ViewResultsModal from "@/components/evaluation/ViewResultsModal";

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

export default function performanceReviews() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshingReviews, setIsRefreshingReviews] = useState(false);
  const [isPaginate, setIsPaginate] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(0);

  const [totalEvaluations, setTotalEvaluations] = useState<any>(0);
  const [average, setAverage] = useState<any>(0);
  const [recentEvaluation, setRecentEvaluation] = useState<any>([]);
  const [userEval, setUserEval] = useState<any>([]);

  const [isViewResultsModalOpen, setIsViewResultsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Load submissions data from API
  const loadSubmissions = async () => {
    try {
      setIsPaginate(true);
      // Use employee-specific endpoint
      const response = await apiService.getMyEvalAuthEmployee(
        "",
        currentPage,
        itemsPerPage
      );

      // Add safety checks to prevent "Cannot read properties of undefined" error
      if (!response || !response.myEval_as_Employee) {
        console.error(
          "API response is undefined or missing myEval_as_Employee"
        );
        setSubmissions([]);
        setOverviewTotal(0);
        setTotalPages(1);
        setPerPage(itemsPerPage);
        setIsPaginate(false);
        setLoading(false);
        return;
      }

      setSubmissions(response.myEval_as_Employee.data || []);
      setOverviewTotal(response.myEval_as_Employee.total || 0);
      setTotalPages(response.myEval_as_Employee.last_page || 1);
      setPerPage(response.myEval_as_Employee.per_page || itemsPerPage);
      setIsPaginate(false);
    } catch (error) {
      console.error("Error loading submissions:", error);
      // Set default values on error
      setSubmissions([]);
      setOverviewTotal(0);
      setTotalPages(1);
      setPerPage(itemsPerPage);
    } finally {
      setIsPaginate(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSubmissions();
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
        setUserEval(dashboard.user_eval || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Set default values on error
        setTotalEvaluations(0);
        setAverage(0);
        setRecentEvaluation([]);
        setUserEval([]);
      }
    };
    loadDashboard();
  }, [user]);

  useEffect(() => {
    loadSubmissions();
  }, [currentPage]);

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

  // Helper functions
  const getTimeAgo = (submittedAt: string) => {
    const submissionDate = new Date(submittedAt);
    const now = new Date();
    const diffInMs = now.getTime() - submissionDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(submittedAt).toLocaleDateString();
  };

  // Chart data

  const chartData = useMemo(() => {
    return userEval

      .map((submission: any, index: any) => ({
        review: `Review ${userEval.length - index}`,
        rating: submission.rating,
        date: new Date(submission.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: new Date(submission.created_at).toLocaleDateString(),
      }))
      .reverse();
  }, [userEval]);

  // Performance insights
  const insights = useMemo(() => {
    const insightsList: any[] = [];

    if (parseFloat(average) >= 4.5) {
      insightsList.push({
        type: "excellent",
        icon: "🏆",
        title: "Outstanding Performance",
        message:
          "You're performing exceptionally well! Consider mentoring others or taking on leadership opportunities.",
      });
    } else if (parseFloat(average) >= 4.0) {
      insightsList.push({
        type: "good",
        icon: "⭐",
        title: "Strong Performance",
        message:
          "You're exceeding expectations. Focus on maintaining this level and identifying areas for continued growth.",
      });
    } else if (parseFloat(average) >= 3.5) {
      insightsList.push({
        type: "average",
        icon: "📈",
        title: "Solid Performance",
        message:
          "You're meeting expectations. Consider setting specific goals to push beyond your current level.",
      });
    } else {
      insightsList.push({
        type: "improvement",
        icon: "🎯",
        title: "Growth Opportunity",
        message:
          "There's room for improvement. Focus on one key area at a time and seek feedback regularly.",
      });
    }

    if (submissions.length >= 3) {
      insightsList.push({
        type: "consistency",
        icon: "📊",
        title: "Consistent Reviews",
        message:
          "You have a solid review history. This shows reliability and commitment to performance.",
      });
    }

    return insightsList;
  }, [average, submissions]);

  const chartConfig = {
    rating: {
      label: "Rating",
      color: "hsl(var(--chart-1))",
    },
  };

  const getQuarterColor = (quarter: string) => {
    if (quarter === "Q1") return "bg-blue-100 text-blue-800";
    if (quarter === "Q2") return "bg-green-100 text-green-800";
    if (quarter === "Q3") return "bg-yellow-100 text-yellow-800";
    if (quarter === "Q4") return "bg-purple-100 text-purple-800";
    return "bg-purple-100 text-purple-800";
  };

  return (
    <div className="relative">
      {isRefreshingReviews || loading ? (
        <div className="relative space-y-6 min-h-[500px]">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <Card className="h-fit">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card className="h-fit">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Performance Analytics Section */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Performance Trend Chart */}
              <Card className="h-fit max-w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📈 Performance Trend
                  </CardTitle>
                  <CardDescription>
                    Your rating progression over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center">
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
                        <div className="text-gray-500 text-center">
                          <p className="text-base font-medium mb-1">
                            No data available
                          </p>
                          <p className="text-sm">
                            Complete your first evaluation to see trends
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full" style={{ height: '320px', minHeight: '320px', maxHeight: '320px', position: 'relative' }}>
                      <ChartContainer 
                        config={chartConfig}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                          >
                          <CartesianGrid
                            strokeDasharray="2 2"
                            stroke="#e5e7eb"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={16}
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            tickFormatter={(value) => value}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            domain={[0, 5]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            tickFormatter={(value) => `${value}.0`}
                            ticks={[0, 1, 2, 3, 4, 5]}
                          />
                          <ChartTooltip
                            cursor={{
                              stroke: "#3b82f6",
                              strokeWidth: 1,
                              strokeDasharray: "3 3",
                            }}
                            content={
                              <ChartTooltipContent
                                formatter={(value, name) => [
                                  `${value}/5.0`,
                                  "Rating",
                                ]}
                                labelFormatter={(label, payload) => {
                                  if (payload && payload[0]) {
                                    return payload[0].payload.review;
                                  }
                                  return label;
                                }}
                                className="bg-white border border-gray-200 shadow-lg rounded-lg"
                              />
                            }
                          />
                          <Line
                            dataKey="rating"
                            type="monotone"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{
                              fill: "#3b82f6",
                              stroke: "#ffffff",
                              strokeWidth: 2,
                              r: 5,
                            }}
                            activeDot={{
                              r: 7,
                              stroke: "#3b82f6",
                              strokeWidth: 2,
                              fill: "#ffffff",
                            }}
                          />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Chart Legend */}
                  <div className="mt-6 px-4 py-3 bg-gray-50 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Performance Rating Trend
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-md border">
                        <span className="font-medium">{totalEvaluations}</span>{" "}
                        evaluation
                        {Number(totalEvaluations) === 1 ? "s" : ""} tracked
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Performance Summary
                  </CardTitle>
                  <CardDescription>
                    Your overall performance insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{average}</span>
                      <span className="text-sm text-gray-500">/5.0</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Latest Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {recentEvaluation.rating}
                      </span>
                      <span className="text-sm text-gray-500">/5.0</span>
                      {Number(recentEvaluation.rating) !== 0 && (
                        <Badge
                          className={
                            Number(recentEvaluation.rating) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {Number(recentEvaluation.rating) > 0 ? "↗" : "↘"}{" "}
                          {Math.abs(Number(recentEvaluation.rating)).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Reviews</span>
                    <Badge variant="outline">{totalEvaluations}</Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">
                      Performance Level
                    </div>
                    <Badge
                      className={
                        parseFloat(average) >= 4.5
                          ? "bg-green-100 text-green-800"
                          : parseFloat(average) >= 4.0
                          ? "bg-blue-100 text-blue-800"
                          : parseFloat(average) >= 3.5
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {parseFloat(average) >= 4.5
                        ? "Outstanding"
                        : parseFloat(average) >= 4.0
                        ? "Exceeds Expectations"
                        : parseFloat(average) >= 3.5
                        ? "Meets Expectations"
                        : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Insights */}
          {submissions.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💡 Performance Insights
                </CardTitle>
                <CardDescription>
                  Actionable insights based on your performance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        insight.type === "excellent"
                          ? "bg-green-50 border-green-200"
                          : insight.type === "good"
                          ? "bg-blue-50 border-blue-200"
                          : insight.type === "average"
                          ? "bg-yellow-50 border-yellow-200"
                          : insight.type === "improvement"
                          ? "bg-red-50 border-red-200"
                          : insight.type === "consistency"
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{insight.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Performance Reviews Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>All Performance Reviews</CardTitle>
              <CardDescription>
                Complete history of your performance evaluations
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-red-700">Poor (&lt;2.5)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                    <span className="text-orange-700">Low (&lt;3.0)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span className="text-blue-700">Good (3.0-3.9)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-green-700">Excellent (≥4.0)</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {submissions.length > 0 ? (
                <>
                  <div className="max-h-[500px] overflow-y-auto overflow-x-hidden rounded-lg border mx-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {isPaginate ? (
                      <Table className="table-fixed w-full">
                        <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                          <TableRow>
                            <TableHead className="w-1/5 pl-4">
                              Immediate Supervisor
                            </TableHead>
                            <TableHead className="w-1/5 text-right pr-25">
                              Rating
                            </TableHead>
                            <TableHead className="w-1/5 text-center">
                              Date
                            </TableHead>
                            <TableHead className="w-1/5 px-4 pr-23 text-center">
                              Quarter
                            </TableHead>
                            <TableHead className="w-1/5 text-right pl-1 pr-4">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: itemsPerPage }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="w-1/5 pl-4">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                              </TableCell>
                              <TableCell className="w-1/5 text-right pr-25">
                                <Skeleton className="h-4 w-12" />
                              </TableCell>
                              <TableCell className="w-1/5 text-center">
                                <div className="flex flex-col gap-1">
                                  <Skeleton className="h-4 w-20" />
                                  <Skeleton className="h-3 w-16" />
                                </div>
                              </TableCell>
                              <TableCell className="w-1/5 px-4 pr-23 text-center">
                                <Skeleton className="h-5 w-16 rounded-full mx-auto" />
                              </TableCell>
                              <TableCell className="w-1/5 text-right pl-1 pr-4">
                                <Skeleton className="h-5 w-20 rounded-full mx-auto" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Table className="table-fixed w-full">
                        <TableHeader className="sticky top-0 bg-white z-10 border-b shadow-sm">
                          <TableRow>
                            <TableHead className="w-1/5 pl-4">
                              Immediate Supervisor
                            </TableHead>
                            <TableHead className="w-1/5 text-right pr-25">
                              Rating
                            </TableHead>
                            <TableHead className="w-1/5 text-center">
                              Date
                            </TableHead>
                            <TableHead className="w-1/5 px-4 pr-23 text-center">
                              Quarter
                            </TableHead>
                            <TableHead className="w-1/5 text-right pl-1 pr-4">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission: any) => {
                            const rating = submission.rating;
                            const isLowPerformance = rating < 3.0;
                            const isPoorPerformance = rating < 2.5;

                            return (
                              <TableRow
                                key={submission.id}
                                className={`${
                                  submission.status === "completed"
                                    ? "bg-green-50 border-l-4 border-l-green-500 hover:bg-green-100"
                                    : ""
                                } ${
                                  isPoorPerformance
                                    ? "bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100"
                                    : isLowPerformance
                                    ? "bg-orange-50 border-l-4 border-l-orange-400 hover:bg-orange-100"
                                    : ""
                                }`}
                              >
                                <TableCell className="w-1/5 font-medium pl-4">
                                  <div className="flex items-center gap-2">
                                    {submission.evaluator.fname +
                                      " " +
                                      submission.evaluator.lname}
                                    {submission.status && (
                                      <Badge
                                        variant="secondary"
                                        className={`${
                                          submission.status === "completed"
                                            ? "bg-green-200 text-green-800"
                                            : "bg-amber-100 text-orange-800"
                                        } text-xs`}
                                      >
                                        {submission.status === "completed"
                                          ? "approved"
                                          : "pending"}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="w-1/5 text-right font-semibold pr-25">
                                  <div
                                    className={`flex items-center justify-end gap-2 ${
                                      isPoorPerformance
                                        ? "text-red-700"
                                        : isLowPerformance
                                        ? "text-orange-600"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        isPoorPerformance
                                          ? "bg-red-100 text-red-800"
                                          : isLowPerformance
                                          ? "bg-orange-100 text-orange-800"
                                          : rating >= 4.0
                                          ? "bg-green-100 text-green-800"
                                          : rating >= 3.5
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {isPoorPerformance
                                        ? "POOR"
                                        : isLowPerformance
                                        ? "LOW"
                                        : rating >= 4.0
                                        ? "EXCELLENT"
                                        : rating >= 3.5
                                        ? "GOOD"
                                        : "FAIR"}
                                    </span>
                                    <span className="font-bold">
                                      {rating}/5
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="w-1/5">
                                  <div className="flex flex-col items-center">
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
                                <TableCell className="w-1/5 px-4 pr-23">
                                  <div className="flex justify-center">
                                    <Badge
                                      className={getQuarterColor(
                                        submission.reviewTypeRegular ||
                                          submission.reviewTypeProbationary
                                      )}
                                    >
                                      {submission.reviewTypeRegular ||
                                        (submission.reviewTypeProbationary
                                          ? "M" +
                                            submission.reviewTypeProbationary
                                          : "") ||
                                        "Others"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="w-1/5 text-right pl-1 pr-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleViewEvaluation(submission)
                                    }
                                    className="text-white bg-blue-500 hover:text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
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
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {userEval.length > itemsPerPage && (
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
                      setIsViewResultsModalOpen(false);
                      setSelectedSubmission(null);
                    }}
                    submission={selectedSubmission}
                    showApprovalButton={true}
                    onApprove={(id) => handleApprove(id)}
                  />
                </>
              ) : (
                <div className="text-center py-12 px-6">
                  <div className="text-gray-500 text-lg mb-2">
                    No performance reviews yet
                  </div>
                  <div className="text-gray-400 text-sm">
                    Your evaluation history will appear here once reviews are
                    completed.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
