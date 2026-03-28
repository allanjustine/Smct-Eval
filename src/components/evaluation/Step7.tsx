"use client";

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { EvaluationPayload } from "./types";
import { User, useAuth } from "@/contexts/UserContext";

interface Step7Props {  
  data: EvaluationPayload;
  updateDataAction: (updates: Partial<EvaluationPayload>) => void;
  employee?: User | null;
  onNextAction?: () => void;
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
            disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer hover:scale-110 transition-transform duration-200 ${getScoreColor(
          value
        )}`}
      >
        {value || ""}
        <ChevronDownIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 min-w-[128px] bg-white border-2 border-yellow-400">
        <DropdownMenuItem
          onClick={() => onValueChange("1")}
          className="text-lg font-bold text-red-700 hover:bg-red-50 py-2 text-center justify-center"
        >
          1
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("2")}
          className="text-lg font-bold text-orange-700 hover:bg-orange-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-orange-700 cursor-pointer"
        >
          2
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("3")}
          className="text-lg font-bold text-yellow-700 hover:bg-yellow-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-yellow-700 cursor-pointer"
        >
          3
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("4")}
          className="text-lg font-bold text-blue-700 hover:bg-blue-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-blue-700 cursor-pointer"
        >
          4
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("5")}
          className="text-lg font-bold text-green-700 hover:bg-green-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-green-700 cursor-pointer"
        >
          5
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ratingLabels = {
  "5": "Outstanding",
  "4": "Exceeds Expectations",
  "3": "Meets Expectations",
  "2": "Needs Improvement",
  "1": "Unsatisfactory",
};

const getScoreColor = (score: string) => {
  const numScore = parseInt(score);
  if (numScore >= 4.5) return "text-green-600 bg-green-100";
  if (numScore >= 4.0) return "text-blue-600 bg-blue-100";
  if (numScore >= 3.5) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const getAverageScoreColor = (average: number) => {
  if (average >= 4.5) return "text-green-600 bg-green-100";
  if (average >= 4.0) return "text-blue-600 bg-blue-100";
  if (average >= 3.5) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const getAverageScoreLabel = (average: number) => {
  if (average >= 4.5) return "Outstanding";
  if (average >= 4.0) return "Exceeds Expectations";
  if (average >= 3.5) return "Meets Expectations";
  if (average >= 2.5) return "Needs Improvement";
  return "Unsatisfactory";
};

const calculateAverageScore = (scores: string[]) => {
  const validScores = scores
    .filter((score) => score !== "" && score !== null && score !== undefined)
    .map((score) => parseInt(score));
  if (validScores.length === 0) return 0;
  const average =
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

export default function Step7({
  data,
  updateDataAction,
  onNextAction,
}: Step7Props) {
  const { user } = useAuth();
  
  // Check if evaluator's branch is HO (Head Office)
  const isEvaluatorHO = () => {
    if (!user?.branches) return false;
    
    // Handle branches as array
    if (Array.isArray(user.branches)) {
      const branch = user.branches[0];
      if (branch) {
        const branchName = branch.branch_name?.toUpperCase() || "";
        const branchCode = branch.branch_code?.toUpperCase() || "";
        return branchName === "HO" || branchCode === "HO" || branchName.includes("HEAD OFFICE");
      }
    }
    
    // Handle branches as object
    if (typeof user.branches === 'object') {
      const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
      const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
      return branchName === "HO" || branchCode === "HO" || branchName.includes("HEAD OFFICE");
    }
    
    return false;
  };

  const isHO = isEvaluatorHO();
  
  // If evaluator is HO, show a message that this step is not applicable
  if (isHO) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                VII. CUSTOMER SERVICE
              </h3>
              <p className="text-gray-600">
                This evaluation step is not applicable for Head Office evaluators.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const calculateAverageScore = () => {
    const scores = [
      data.customerServiceScore1,
      data.customerServiceScore2,
      data.customerServiceScore3,
      data.customerServiceScore4,
      data.customerServiceScore5,
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          VII. CUSTOMER SERVICE
        </h3>
        <p className="text-gray-600 mb-6">
          Customer satisfaction. Responsiveness to customer needs. Professional
          and positive interactions with customers.
        </p>
      </div>

{/* Customer Service Reset Button */}
<div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateDataAction({
                  customerServiceScore1: 0,
                  customerServiceScore2: 0,
                  customerServiceScore3: 0,
                  customerServiceScore4: 0,
                  customerServiceScore5: 0,
                });
              }}
              className="text-xs px-3 py-1 h-7 bg-blue-500 text-white border-gray-300 hover:text-white hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200 "
            >
              Clear Customer Service Scores
            </Button>
          </div>

      {/* Customer Service Evaluation Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-16"></th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/4">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 w-1/3">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    SCORE
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-1/4">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Listening & Understanding */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Listening & Understanding
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Listens to customers and displays understanding of customer
                    needs and concerns
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Repeats or summarizes customer concerns to ensure complete
                    understanding before responding. Expresses genuine concern
                    and seeks to understand the customer's perspective.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.customerServiceScore1)}
                      onValueChange={(value) =>
                        updateDataAction({
                          customerServiceScore1: Number(value),
                        })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.customerServiceScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.customerServiceScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.customerServiceScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.customerServiceScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.customerServiceScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.customerServiceScore1 === 5
                        ? "Outstanding"
                        : data.customerServiceScore1 === 4
                        ? "Exceeds Expectations"
                        : data.customerServiceScore1 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore1 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.customerServiceExplanation1 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          customerServiceExplanation1: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 2: Problem-Solving for Customer Satisfaction */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Problem-Solving for Customer Satisfaction
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Proactively identifies and solves customer problems to
                    ensure satisfaction
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Takes initiative to resolve issues and prevent future
                    challenges for the customer. Offers alternative solutions
                    when standard resolutions are not enough.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.customerServiceScore2)}
                      onValueChange={(value) =>
                        updateDataAction({
                          customerServiceScore2: Number(value),
                        })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.customerServiceScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.customerServiceScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.customerServiceScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.customerServiceScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.customerServiceScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.customerServiceScore2 === 5
                        ? "Outstanding"
                        : data.customerServiceScore2 === 4
                        ? "Exceeds Expectations"
                        : data.customerServiceScore2 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore2 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.customerServiceExplanation2 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          customerServiceExplanation2: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 3: Product Knowledge for Customer Support */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Product Knowledge for Customer Support (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Possesses comprehensive product knowledge to assist
                    customers effectively (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates a deep understanding of products and/or
                    services, enabling accurate and helpful guidance. Suggests
                    the most suitable product or service based on customer
                    requirements.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.customerServiceScore3)}
                      onValueChange={(value) =>
                        updateDataAction({
                          customerServiceScore3: Number(value),
                        })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.customerServiceScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.customerServiceScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.customerServiceScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.customerServiceScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.customerServiceScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.customerServiceScore3 === 5
                        ? "Outstanding"
                        : data.customerServiceScore3 === 4
                        ? "Exceeds Expectations"
                        : data.customerServiceScore3 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore3 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.customerServiceExplanation3 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          customerServiceExplanation3: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 4: Positive and Professional Attitude */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Positive and Professional Attitude (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains a positive and professional demeanor, particularly
                    during customer interactions (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Represents the organization positively. Remains courteous
                    and patient, even with challenging customers or in stressful
                    situations.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.customerServiceScore4)}
                      onValueChange={(value) =>
                        updateDataAction({
                          customerServiceScore4: Number(value),
                        })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.customerServiceScore4 === 5
                          ? "bg-green-100 text-green-800"
                          : data.customerServiceScore4 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.customerServiceScore4 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.customerServiceScore4 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.customerServiceScore4 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.customerServiceScore4 === 5
                        ? "Outstanding"
                        : data.customerServiceScore4 === 4
                        ? "Exceeds Expectations"
                        : data.customerServiceScore4 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore4 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore4 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.customerServiceExplanation4 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          customerServiceExplanation4: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 5: Timely Resolution of Customer Issues */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Timely Resolution of Customer Issues (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Resolves customer issues promptly and efficiently
                    (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Addresses and resolves customer complaints or concerns
                    within established timeframes. Ensures follow-ups are
                    conducted for unresolved issues until completion.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.customerServiceScore5)}
                      onValueChange={(value) =>
                        updateDataAction({
                          customerServiceScore5: Number(value),
                        })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.customerServiceScore5 === 5
                          ? "bg-green-100 text-green-800"
                          : data.customerServiceScore5 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.customerServiceScore5 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.customerServiceScore5 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.customerServiceScore5 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.customerServiceScore5 === 5
                        ? "Outstanding"
                        : data.customerServiceScore5 === 4
                        ? "Exceeds Expectations"
                        : data.customerServiceScore5 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore5 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore5 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.customerServiceExplanation5 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          customerServiceExplanation5: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
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
              Customer Service - Average Score
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
                    Listening & Understanding:{" "}
                    <span className="font-semibold">
                      {data.customerServiceScore1 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Problem-Solving:{" "}
                    <span className="font-semibold">
                      {data.customerServiceScore2 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Product Knowledge (L.E.A.D.E.R.):{" "}
                    <span className="font-semibold">
                      {data.customerServiceScore3 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Professional Attitude (L.E.A.D.E.R.):{" "}
                    <span className="font-semibold">
                      {data.customerServiceScore4 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Timely Resolution (L.E.A.D.E.R.):{" "}
                    <span className="font-semibold">
                      {data.customerServiceScore5 || "Not rated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Average calculated from{" "}
              {
                [
                  data.customerServiceScore1,
                  data.customerServiceScore2,
                  data.customerServiceScore3,
                  data.customerServiceScore4,
                  data.customerServiceScore5,
                ].filter((score) => score && score !== 0).length
              }{" "}
              of 5 criteria
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
