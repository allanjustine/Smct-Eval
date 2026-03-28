"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { EvaluationPayload } from "./types";
import {
  getQuarterlyReviewStatus,
  getCurrentYear,
} from "@/lib/quarterlyReviewUtils";
import { User, useAuth } from "@/contexts/UserContext";
import { Item } from "@radix-ui/react-select";
import apiService from "@/lib/apiService";

interface Step1Props {
  data: EvaluationPayload;
  updateDataAction: (updates: Partial<EvaluationPayload>) => void;
  employee?: User | null;
  evaluationType?: 'rankNfile' | 'basic' | 'default';
}

// Score Dropdown Component
function ScoreDropdown({
  value,
  onValueChange,
  placeholder = "Select Score",
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  const getScoreColor = (score: string) => {
    switch (score) {
      case "5":
        return "text-green-700 bg-green-100";
      case "4":
        return "text-blue-700 bg-blue-100";
      case "3":
        return "text-yellow-700 bg-yellow-100";
      case "2":
        return "text-orange-700 bg-orange-100";
      case "1":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`w-15 px-1 py-2 text-lg font-bold border-2 border-yellow-400 rounded-md bg-yellow-100 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm min-h-[40px] 
          justify-between inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none
           disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer hover:scale-110 transition-transform duration-200  ${getScoreColor(
          value
        )}`}
      >
        {value || ""}
        <ChevronDownIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 min-w-[128px] bg-white border-2 border-yellow-400">
        <DropdownMenuItem
          onClick={() => onValueChange("1")}
          className="text-lg font-bold text-red-700 hover:bg-red-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          1
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("2")}
          className="text-lg font-bold text-orange-700 hover:bg-orange-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200" 
        >
          2
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("3")}
          className="text-lg font-bold text-yellow-700 hover:bg-yellow-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          3
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("4")}
          className="text-lg font-bold text-blue-700 hover:bg-blue-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          4
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("5")}
          className="text-lg font-bold text-green-700 hover:bg-green-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
        >
          5
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Step1({
  data,
  updateDataAction,
  employee,
  evaluationType = 'default',
}: Step1Props) {
  const [probitionary3, setProbitionary3] = useState(false);
  const [probitionary5, setProbitionary5] = useState(false);
  const [regular1, setRegular1] = useState(false);
  const [regular2, setRegular2] = useState(false);
  const [regular3, setRegular3] = useState(false);
  const [regular4, setRegular4] = useState(false);
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(false);
  const [coverageError, setCoverageError] = useState("");
  const { user } = useAuth();

  // Check if any "others" review is selected
  const isOthersSelected = () => {
    return (
      data.reviewTypeOthersImprovement ||
      (data.reviewTypeOthersCustom &&
        data.reviewTypeOthersCustom.trim() !== "") ||
      false
    );
  };

  // Auto-populate Date Hired from employee data
  useEffect(() => {
    if (employee && !data.hireDate) {
      const dateHired = (employee as any).date_hired || (employee as any).dateHired || (employee as any).hireDate;
      if (dateHired) {
        try {
          // Convert to YYYY-MM-DD format for date input
          const date = new Date(dateHired);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split("T")[0];
            updateDataAction({ hireDate: formattedDate });
          }
        } catch (error) {
          console.error("Error parsing date_hired:", error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  // Check for existing quarterly reviews when employee changes
  useEffect(() => {
    const checkQuarterlyReviews = async () => {
      if (!employee?.id) return;
      setIsLoadingQuarters(true);
      try {
        const status = await apiService.getQuarters(Number(employee.id));
        // Check if status and status.data exist before processing
        const dataToProcess = status?.data || status;
        if (dataToProcess && typeof dataToProcess === 'object') {
          Object.values(dataToProcess).forEach((item: any) => {
            if (item?.reviewTypeProbationary === 3) {
              setProbitionary3(true);
            }
            if (item?.reviewTypeProbationary === 5) {
              setProbitionary5(true);
            }
            if (item?.reviewTypeRegular === "Q1") {
              setRegular1(true);
            }
            if (item?.reviewTypeRegular === "Q2") {
              setRegular2(true);
            }
            if (item?.reviewTypeRegular === "Q3") {
              setRegular3(true);
            }
            if (item?.reviewTypeRegular === "Q4") {
              setRegular4(true);
            }
          });
        }
      } catch (error) {
        console.error("Error checking quarterly reviews:", error);
      } finally {
        setIsLoadingQuarters(false);
      }
    };
    checkQuarterlyReviews();
  }, [employee?.id]);

  // Validate coverage dates whenever they change
  useEffect(() => {
    if (data.coverageFrom && data.coverageTo) {
      const fromDate = new Date(data.coverageFrom);
      const toDate = new Date(data.coverageTo);

      // Check if coverageFrom is before coverageTo
      if (fromDate >= toDate) {
        setCoverageError("Start date must be earlier than end date");
        return;
      }

      // Check if coverageFrom is before date hired
      if (data.hireDate) {
        const hireDate = new Date(data.hireDate);
        if (!isNaN(hireDate.getTime()) && fromDate < hireDate) {
          setCoverageError("Performance Coverage cannot start before Date Hired");
          return;
        }
      }

      setCoverageError("");
    } else {
      setCoverageError("");
    }
  }, [data.coverageFrom, data.coverageTo, data.hireDate]);

  // Calculate average score for Job Knowledge
  const calculateAverageScore = () => {
    const scores = [
      data.jobKnowledgeScore1,
      data.jobKnowledgeScore2,
      data.jobKnowledgeScore3,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseInt(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const averageScore = calculateAverageScore();
  const averageScoreNumber = parseFloat(averageScore);

  const getAverageScoreColor = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 3.5) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 2.5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (score >= 1.5) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getAverageScoreLabel = (score: number) => {
    if (score >= 4.5) return "Outstanding";
    if (score >= 3.5) return "Exceeds Expectation";
    if (score >= 2.5) return "Meets Expectations";
    if (score >= 1.5) return "Needs Improvement";
    return "Unsatisfactory";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Performance Review Form
        </h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          {evaluationType === 'basic' ? 'Basic Evaluation' : 'Rank and File I & II'}
        </h3>
      </div>

      {/* Review Type Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Review Type</h4>
            <div className="flex items-center gap-3">
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                ℹ️ Only one option per category can be selected
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  updateDataAction({
                    reviewTypeProbationary: "",
                    reviewTypeRegular: "",
                    reviewTypeOthersImprovement: false,
                    reviewTypeOthersCustom: "",
                  });
                }}
                className="text-xs px-3 py-1 h-7 bg-blue-500 text-white border-gray-300 hover:text-white hover:bg-red-400 cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                Clear All
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Probationary */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">For Probationary</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="prob3"
                    name="probationaryReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeProbationary === 3}
                    disabled={
                      probitionary3 ||
                      data.reviewTypeRegular !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear regular and others when selecting probationary
                        updateDataAction({
                          reviewTypeProbationary: 3,
                          reviewTypeRegular: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="prob3"
                    className={`text-sm ${
                      probitionary3 ? "line-through" : ""
                    } ${
                      probitionary3 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    3 months
                    {probitionary3 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="prob5"
                    name="probationaryReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeProbationary === 5}
                    disabled={
                      probitionary5 ||
                      data.reviewTypeRegular !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear regular and others when selecting probationary
                        updateDataAction({
                          reviewTypeProbationary: 5,
                          reviewTypeRegular: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="prob5"
                    className={`text-sm ${
                      probitionary5 ? "line-through" : ""
                    } ${
                      probitionary5 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    5 months
                    {probitionary5 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* For Regular */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">For Regular</h5>
              {isLoadingQuarters && (
                <div className="text-sm text-gray-500 italic">
                  Checking existing reviews...
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="q1"
                    name="regularReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeRegular === "Q1"}
                    disabled={
                      regular1 ||
                      data.reviewTypeProbationary !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear probationary and others when selecting regular
                        updateDataAction({
                          reviewTypeRegular: "Q1",
                          reviewTypeProbationary: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="q1"
                    className={`text-sm ${regular1 ? "line-through" : ""} ${
                      regular1 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    Q1 review
                    {regular1 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="q2"
                    name="regularReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeRegular === "Q2"}
                    disabled={
                      regular2 ||
                      data.reviewTypeProbationary !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear probationary and others when selecting regular
                        updateDataAction({
                          reviewTypeRegular: "Q2",
                          reviewTypeProbationary: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="q2"
                    className={`text-sm ${regular2 ? "line-through" : ""} ${
                      regular2 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    Q2 review
                    {regular2 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="q3"
                    name="regularReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeRegular === "Q3"}
                    disabled={
                      regular3 ||
                      data.reviewTypeProbationary !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear probationary and others when selecting regular
                        updateDataAction({
                          reviewTypeRegular: "Q3",
                          reviewTypeProbationary: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="q3"
                    className={`text-sm ${regular3 ? "line-through" : ""} ${
                      regular3 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    Q3 review
                    {regular3 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="q4"
                    name="regularReview"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeRegular === "Q4"}
                    disabled={
                      regular4 ||
                      data.reviewTypeProbationary !== "" ||
                      isOthersSelected()
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear probationary and others when selecting regular
                        updateDataAction({
                          reviewTypeRegular: "Q4",
                          reviewTypeProbationary: "",
                          reviewTypeOthersImprovement: false,
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="q4"
                    className={`text-sm ${regular4 ? "line-through" : ""} ${
                      regular4 ||
                      isOthersSelected() ||
                      data.reviewTypeRegular !== ""
                        ? "text-gray-400 "
                        : "text-gray-700"
                    }`}
                  >
                    Q4 review
                    {regular4 && (
                      <span className="ml-2 text-xs text-red-500 font-medium">
                        (Already exists for {getCurrentYear()})
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Others */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">Others</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="improvement"
                    className="rounded cursor-pointer hover:scale-110 transition-transform duration-200"
                    checked={data.reviewTypeOthersImprovement}
                    disabled={
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== "" ||
                      data.reviewTypeOthersCustom !== ""
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Clear probationary and regular when selecting others
                        updateDataAction({
                          reviewTypeProbationary: "",
                          reviewTypeRegular: "",
                          reviewTypeOthersImprovement: true,
                          reviewTypeOthersCustom: "",
                        });
                      } else {
                        updateDataAction({
                          reviewTypeOthersImprovement: false,
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="improvement"
                    className={`text-sm ${
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== "" ||
                      data.reviewTypeOthersCustom !== ""
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    Performance Improvement
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className={`text-sm ${
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== "" ||
                      data.reviewTypeOthersCustom !== ""
                        ? "text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    Others:
                  </label>
                  <input
                    type="text"
                    value={data.reviewTypeOthersCustom || ""}
                    disabled={
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== "" ||
                      data.reviewTypeOthersImprovement === true
                    }
                    onChange={(e) => {
                      if (e.target.value.trim() !== "") {
                        // Clear probationary and regular when entering custom others
                        updateDataAction({
                          reviewTypeOthersCustom: e.target.value,
                          reviewTypeOthersImprovement: false,
                          reviewTypeProbationary: "",
                          reviewTypeRegular: "",
                        });
                      } else {
                        updateDataAction({
                          reviewTypeOthersCustom: "",
                        });
                      }
                    }}
                    className={`flex-1 px-2 py-1 text-sm border border-gray-300 rounded ${
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== ""
                        ? "bg-gray-100 text-gray-400"
                        : ""
                    }`}
                    placeholder={
                      data.reviewTypeProbationary !== "" ||
                      data.reviewTypeRegular !== ""
                        ? "Disabled - other review type selected"
                        : "Enter custom review type"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="employeeName"
              className="text-base font-medium text-gray-900"
            >
              Employee Name:
            </Label>
            <Input
              id="employeeName"
              value={employee?.fname || ""}
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="employeeId"
              className="text-base font-medium text-gray-900"
            >
              Employee ID:
            </Label>
            <Input
              id="employeeId"
              value={
                employee?.emp_id
                  ? (() => {
                      const idString = employee.emp_id.toString();
                      if (idString.length > 4) {
                        return `${idString.slice(0, 4)}-${idString.slice(4)}`;
                      }
                      return idString;
                    })()
                  : ""
              }
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="position"
              className="text-base font-medium text-gray-900"
            >
              Position:
            </Label>
            <Input
              id="position"
              value={employee?.positions?.label || (employee as any)?.position || ""}
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-base font-medium text-gray-900"
            >
              Department:
            </Label>
            <Input
              id="department"
              value={employee?.departments?.department_name || (employee as any)?.department || ""}
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="branch"
              className="text-base font-medium text-gray-900"
            >
              Branch:
            </Label>
            <Input
              id="branch"
              value={employee?.branches?.branch_name || employee?.branches?.[0]?.branch_name || (employee as any)?.branch || ""}
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="hireDate"
              className="text-base font-medium text-gray-900"
            >
              Date Hired:
            </Label>
            <Input
              id="hireDate"
              type="date"
              value={data.hireDate || ""}
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="supervisor"
              className="text-base font-medium text-gray-900"
            >
              Immediate Supervisor:
            </Label>
            <Input
              id="supervisor"
              value={
                user?.fname && user?.lname
                  ? `${user.fname} ${user.lname}`
                  : user?.fname || user?.lname || ""
              }
              readOnly
              className="bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="coverage"
              className="text-base font-medium text-gray-900"
            >
              Performance Coverage:
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* From Date */}
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">From:</Label>
                <Input
                  type="date"
                  value={
                    data.coverageFrom
                      ? typeof data.coverageFrom === "string"
                        ? data.coverageFrom
                        : new Date(data.coverageFrom).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const fromDate = e.target.value;
                    const toDate = data.coverageTo
                      ? typeof data.coverageTo === "string"
                        ? data.coverageTo
                        : new Date(data.coverageTo).toISOString().split("T")[0]
                      : null;

                    // Always update the form data so parent validation can catch it
                    updateDataAction({
                      coverageFrom: fromDate,
                    });

                    // Validate: From date should be earlier than To date
                    if (toDate && fromDate && fromDate >= toDate) {
                      setCoverageError(
                        "Start date must be earlier than end date"
                      );
                      return;
                    }

                    // Validate: From date should not be before Date Hired
                    if (data.hireDate && fromDate) {
                      const hireDateStr = typeof data.hireDate === "string"
                        ? data.hireDate
                        : new Date(data.hireDate).toISOString().split("T")[0];
                      if (fromDate < hireDateStr) {
                        setCoverageError(
                          "Performance Coverage cannot start before Date Hired"
                        );
                        return;
                      }
                    }

                    setCoverageError("");
                  }}
                  min={
                    data.hireDate
                      ? typeof data.hireDate === "string"
                        ? data.hireDate
                        : new Date(data.hireDate).toISOString().split("T")[0]
                      : undefined
                  }
                  max={
                    data.coverageTo
                      ? typeof data.coverageTo === "string"
                        ? data.coverageTo
                        : new Date(data.coverageTo).toISOString().split("T")[0]
                      : undefined
                  }
                  className={`w-full bg-yellow-100 border-yellow-300 hover:bg-yellow-200 cursor-pointer hover:scale-110 transition-transform duration-200 ${
                    coverageError && !data.coverageFrom
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">To:</Label>
                <Input
                  type="date"
                  value={
                    data.coverageTo
                      ? typeof data.coverageTo === "string"
                        ? data.coverageTo
                        : new Date(data.coverageTo).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const toDate = e.target.value;
                    const fromDate = data.coverageFrom
                      ? typeof data.coverageFrom === "string"
                        ? data.coverageFrom
                        : new Date(data.coverageFrom).toISOString().split("T")[0]
                      : null;

                    // Always update the form data so parent validation can catch it
                    updateDataAction({
                      coverageTo: toDate,
                    });

                    // Validate: To date should be later than From date
                    if (fromDate && toDate && toDate <= fromDate) {
                      setCoverageError(
                        "End date must be later than start date"
                      );
                      return;
                    }

                    setCoverageError("");
                  }}
                  min={
                    data.coverageFrom
                      ? typeof data.coverageFrom === "string"
                        ? data.coverageFrom
                        : new Date(data.coverageFrom).toISOString().split("T")[0]
                      : undefined
                  }
                  className={`w-full bg-yellow-100 border-yellow-300 hover:bg-yellow-200 cursor-pointer hover:scale-110 transition-transform duration-200 ${
                    coverageError && !data.coverageTo ? "border-red-500" : ""
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {coverageError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <span className="text-sm text-red-800 font-medium">
                  {coverageError}
                </span>
              </div>
            )}

            {/* Display the selected range */}
            {data.coverageFrom && data.coverageTo && !coverageError && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-blue-800 font-medium">
                  Performance Period:{" "}
                  {format(new Date(data.coverageFrom), "MMM dd, yyyy")} -{" "}
                  {format(new Date(data.coverageTo), "MMM dd, yyyy")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="font-bold text-gray-900 min-w-[80px]">PURPOSE</div>
            <div className="text-sm text-gray-700">
              Each employee is subject to a performance review based on actual
              responsibilities and behaviors exhibited. These are essential in
              the achievement of goals and for alignment with company values and
              policies. The results of this review will be the basis for changes
              in employment status, promotions, salary adjustments, and/or
              computations of yearly bonus (among other rewards).
              <strong>
                NOTE: For probationary employees, a minimum score of 55% is
                required for regularization.
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="font-bold text-gray-900 min-w-[80px]">
              INSTRUCTIONS
            </div>
            <div className="text-sm text-gray-700">
              Only put answers in the{" "}
              <span className="bg-yellow-200 px-1 rounded">
                YELLOW HIGHLIGHTED CELLS
              </span>
              .
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Scale Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="font-bold text-gray-900 min-w-[80px]">
              RATING SCALE
            </div>
            <div className="text-sm text-gray-700">
              Ratings will be made on a scale of 1-5. Choose your rating from
              the drop down option. Make use of the guide below when rating each
              employee.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
            {/* Rating 1 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-bold text-red-800 text-center mb-2">
                1 Unsatisfactory
              </h5>
              <ul className="text-xs text-red-700 space-y-1">
                <li>
                  • Performance falls below expectations: Fails to meet the
                  minimum standards
                </li>
                <li>
                  • Immediate improvement needed, Requires urgent attention
                </li>
                <li>• Basic aspects of the role are not met</li>
              </ul>
            </div>

            {/* Rating 2 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h5 className="font-bold text-orange-800 text-center mb-2">
                2 Needs Improvement
              </h5>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>
                  • Basic competence present: Meets some expectations but fails
                  in many areas
                </li>
                <li>
                  • Performance is below the desired level in certain aspects
                </li>
                <li>• Does not yet consistently meet performance standards</li>
              </ul>
            </div>

            {/* Rating 3 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="font-bold text-yellow-800 text-center mb-2">
                3 Meets Expectations
              </h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>
                  • Basic competence achieved: Performance meets the
                  expectations for the role
                </li>
                <li>
                  • Adequate: Achieves the required standards and competencies
                </li>
                <li>• Consistently performs at an acceptable level</li>
              </ul>
            </div>

            {/* Rating 4 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-bold text-blue-800 text-center mb-2">
                4 Exceeds Expectation
              </h5>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • Consistently strong performance: Goes beyond the standard
                  expectations
                </li>
                <li>
                  • Highly competent: Demonstrates proficiency in role
                  requirements
                </li>
                <li>
                  • Makes positive contributions that exceed typical
                  expectations
                </li>
              </ul>
            </div>

            {/* Rating 5 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-bold text-green-800 text-center mb-2">
                5 Outstanding
              </h5>
              <ul className="text-xs text-green-700 space-y-1">
                <li>
                  • Exceptional performance: Consistently exceeds expectations
                </li>
                <li>
                  • Excellent: Demonstrates outstanding skills and leadership
                </li>
                <li>
                  • Significant positive impact and a positive influence on the
                  organization
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* I. JOB KNOWLEDGE Section */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              I. JOB KNOWLEDGE
            </h3>
            <p className="text-sm text-gray-600">
              Demonstrates understanding of job responsibilities. Applies
              knowledge to tasks and projects. Stays updated in relevant areas.
            </p>
          </div>

          {/* Job Knowledge Reset Button */}
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateDataAction({
                  jobKnowledgeScore1: 0,
                  jobKnowledgeScore2: 0,
                  jobKnowledgeScore3: 0,
                });
              }}
              className="text-xs px-3 py-1 h-7 bg-blue-500 text-white border-gray-300 hover:text-white hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200 "
            >
              Clear Job Knowledge Scores
            </Button>
          </div>

          {/* Evaluation Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-16"></th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/4">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/5">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold text-gray-900 w-32 bg-yellow-200">
                    SCORE
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/4">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Mastery in Core Competencies */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    "Mastery in Core Competencies and Job Understanding
                    (L.E.A.D.E.R.)"
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Exhibits mastery in essential skills and competencies
                    required for the role. Displays a deep understanding of job
                    responsibilities and requirements
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistently performs tasks accurately and with precision,
                    showing a deep understanding of core job functions.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                    
                      value={String(data.jobKnowledgeScore1)}
                      onValueChange={(value) =>
                        updateDataAction({ jobKnowledgeScore1: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.jobKnowledgeScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.jobKnowledgeScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.jobKnowledgeScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.jobKnowledgeScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.jobKnowledgeScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.jobKnowledgeScore1 === 5
                        ? "Outstanding"
                        : data.jobKnowledgeScore1 === 4
                        ? "Exceeds Expectation"
                        : data.jobKnowledgeScore1 === 3
                        ? "Meets Expectations"
                        : data.jobKnowledgeScore1 === 2
                        ? "Needs Improvement"
                        : data.jobKnowledgeScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.jobKnowledgeComments1 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          jobKnowledgeComments1: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </td>
                </tr>

                {/* Row 2: Keeps Documentation Updated */}
                <tr>
                  <td className="border border-gray-300 font-bold text-center px-4 py-3 text-sm text-black">
                    Keeps Documentation Updated
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains accurate and up-to-date documentation related to
                    job functions
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Ensures that procedures, guidelines, and documentation are
                    current; contributing to organizational efficiency.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.jobKnowledgeScore2)}
                      onValueChange={(value) =>
                        updateDataAction({ jobKnowledgeScore2: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.jobKnowledgeScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.jobKnowledgeScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.jobKnowledgeScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.jobKnowledgeScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.jobKnowledgeScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.jobKnowledgeScore2 === 5
                        ? "Outstanding"
                        : data.jobKnowledgeScore2 === 4
                        ? "Exceeds Expectation"
                        : data.jobKnowledgeScore2 === 3
                        ? "Meets Expectations"
                        : data.jobKnowledgeScore2 === 2
                        ? "Needs Improvement"
                        : data.jobKnowledgeScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.jobKnowledgeComments2 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          jobKnowledgeComments2: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </td>
                </tr>

                {/* Row 3: Problem Solving */}
                <tr>
                  <td className="border border-gray-300 font-bold text-center px-4 py-3 text-sm text-black">
                    Problem Solving
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Applies critical thinking skills to solve problems
                    efficiently
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Identifies and resolves issues in advance, effectively
                    preventing potential disruptions.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.jobKnowledgeScore3)}
                      onValueChange={(value) =>
                        updateDataAction({ jobKnowledgeScore3: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.jobKnowledgeScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.jobKnowledgeScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.jobKnowledgeScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.jobKnowledgeScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.jobKnowledgeScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.jobKnowledgeScore3 === 5
                        ? "Outstanding"
                        : data.jobKnowledgeScore3 === 4
                        ? "Exceeds Expectation"
                        : data.jobKnowledgeScore3 === 3
                        ? "Meets Expectations"
                        : data.jobKnowledgeScore3 === 2
                        ? "Needs Improvement"
                        : data.jobKnowledgeScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.jobKnowledgeComments3 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          jobKnowledgeComments3: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Average Score Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Job Knowledge - Average Score
            </h3>
            <div className="flex justify-center items-center gap-6">
              <div
                className={`px-6 py-4 rounded-lg border-2 ${getAverageScoreColor(
                  averageScoreNumber
                )}`}
              >
                <div className="text-3xl font-bold">{averageScore}</div>
                <div className="text-sm font-medium mt-1">
                  {getAverageScoreLabel(averageScoreNumber)}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Score Breakdown:</strong>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    Mastery in Core Competencies:{" "}
                    <span className="font-semibold">
                      {data.jobKnowledgeScore1 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Documentation Management:{" "}
                    <span className="font-semibold">
                      {data.jobKnowledgeScore2 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Problem Solving Skills:{" "}
                    <span className="font-semibold">
                      {data.jobKnowledgeScore3 || "Not rated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Average calculated from{" "}
              {
                [
                  data.jobKnowledgeScore1,
                  data.jobKnowledgeScore2,
                  data.jobKnowledgeScore3,
                ].filter((score) => score && score !== 0).length
              }{" "}
              of 3 criteria
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
