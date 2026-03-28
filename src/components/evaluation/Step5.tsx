"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { EvaluationPayload } from "./types";
import { User } from "@/contexts/UserContext";

interface Step5Props {
  data: EvaluationPayload;
  updateDataAction: (updates: Partial<EvaluationPayload>) => void;
  employee?: User | null;
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

export default function Step5({ data, updateDataAction }: Step5Props) {
  // Calculate average score for Reliability
  const calculateAverageScore = () => {
    const scores = [
      data.reliabilityScore1,
      data.reliabilityScore2,
      data.reliabilityScore3,
      data.reliabilityScore4,
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
      {/* V. RELIABILITY Section */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              V. RELIABILITY
            </h3>
            <p className="text-sm text-gray-600">
              Consistency in attendance and punctuality. Meeting commitments and
              fulfilling responsibilities.
            </p>
          </div>

{/* Reliability Reset Button */}
<div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateDataAction({
                  reliabilityScore1: 0,
                  reliabilityScore2: 0,
                  reliabilityScore3: 0,
                  reliabilityScore4: 0,
                });
              }}
              className="text-xs px-3 py-1 h-7 bg-blue-500 text-white border-gray-300 hover:text-white hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200 "
            >
              Clear Reliability Scores
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
                {/* Row 1: Consistent Attendance */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    Consistent Attendance
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates regular attendance by being present at work as
                    scheduled
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Has not taken any unplanned absences and follows the
                    company's attendance policy.
                    <br />
                    <br />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.reliabilityScore1)}
                      onValueChange={(value) =>
                        updateDataAction({ reliabilityScore1: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.reliabilityScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.reliabilityScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.reliabilityScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.reliabilityScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.reliabilityScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.reliabilityScore1 === 5
                        ? "Outstanding"
                        : data.reliabilityScore1 === 4
                        ? "Exceeds Expectation"
                        : data.reliabilityScore1 === 3
                        ? "Meets Expectations"
                        : data.reliabilityScore1 === 2
                        ? "Needs Improvement"
                        : data.reliabilityScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.reliabilityComments1 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          reliabilityComments1: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </td>
                </tr>

                {/* Row 2: Punctuality */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    Punctuality
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Arrives at work and meetings on time or before the scheduled
                    time
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistently arrives at work on time, ready to begin work
                    promptly.
                    <br />
                    <br />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.reliabilityScore2)}
                      onValueChange={(value) =>
                        updateDataAction({ reliabilityScore2: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.reliabilityScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.reliabilityScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.reliabilityScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.reliabilityScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.reliabilityScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.reliabilityScore2 === 5
                        ? "Outstanding"
                        : data.reliabilityScore2 === 4
                        ? "Exceeds Expectation"
                        : data.reliabilityScore2 === 3
                        ? "Meets Expectations"
                        : data.reliabilityScore2 === 2
                        ? "Needs Improvement"
                        : data.reliabilityScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.reliabilityComments2 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          reliabilityComments2: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </td>
                </tr>

                {/* Row 3: Follows Through on Commitments */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    Follows Through on Commitments
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Follows through on assignments from and commitments made to
                    coworkers or superiors
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Delivers on commitments, ensuring that expectations are met
                    or exceeded.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.reliabilityScore3)}
                      onValueChange={(value) =>
                        updateDataAction({ reliabilityScore3: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.reliabilityScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.reliabilityScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.reliabilityScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.reliabilityScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.reliabilityScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.reliabilityScore3 === 5
                        ? "Outstanding"
                        : data.reliabilityScore3 === 4
                        ? "Exceeds Expectation"
                        : data.reliabilityScore3 === 3
                        ? "Meets Expectations"
                        : data.reliabilityScore3 === 2
                        ? "Needs Improvement"
                        : data.reliabilityScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.reliabilityComments3 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          reliabilityComments3: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </td>
                </tr>

                {/* Row 4: Reliable Handling of Routine Tasks */}
                <tr>
                    <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    Reliable Handling of Routine Tasks
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates reliability in completing routine tasks without
                    oversight
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistently manages day-to-day responsibilities without
                    requiring constant supervision. Ensures regular tasks are
                    handled on schedule with no reminders needed.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.reliabilityScore4)}
                      onValueChange={(value) =>
                        updateDataAction({ reliabilityScore4: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.reliabilityScore4 === 5
                          ? "bg-green-100 text-green-800"
                          : data.reliabilityScore4 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.reliabilityScore4 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.reliabilityScore4 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.reliabilityScore4 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.reliabilityScore4 === 5
                        ? "Outstanding"
                        : data.reliabilityScore4 === 4
                        ? "Exceeds Expectation"
                        : data.reliabilityScore4 === 3
                        ? "Meets Expectations"
                        : data.reliabilityScore4 === 2
                        ? "Needs Improvement"
                        : data.reliabilityScore4 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.reliabilityComments4 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          reliabilityComments4: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
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
              Reliability - Average Score
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
                    Consistent Attendance:{" "}
                    <span className="font-semibold">
                      {data.reliabilityScore1 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Punctuality:{" "}
                    <span className="font-semibold">
                      {data.reliabilityScore2 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Follows Through on Commitments:{" "}
                    <span className="font-semibold">
                      {data.reliabilityScore3 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Reliable Handling of Routine Tasks:{" "}
                    <span className="font-semibold">
                      {data.reliabilityScore4 || "Not rated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Average calculated from{" "}
              {
                [
                  data.reliabilityScore1,
                  data.reliabilityScore2,
                  data.reliabilityScore3,
                  data.reliabilityScore4,
                ].filter((score) => score && score !== 0).length
              }{" "}
              of 4 criteria
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
