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

interface Step3Props {
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
          className="text-lg font-bold text-red-700 hover:bg-red-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-red-700 cursor-pointer"
        >
          1
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onValueChange("2")}
          className="text-lg font-bold text-orange-700 hover:bg-orange-50 py-2 text-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-white hover:bg-orange-700 cursor-pointer "
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

export default function Step3({ data, updateDataAction }: Step3Props) {
  // Calculate average score for Adaptability
  const calculateAverageScore = () => {
    const scores = [
      data.adaptabilityScore1,
      data.adaptabilityScore2,
      data.adaptabilityScore3,
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
      {/* III. ADAPTABILITY Section */}
      <Card className="bg-white border-gray-200">
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              III. ADAPTABILITY
            </h3>
            <p className="text-sm text-gray-600">
              Flexibility in handling change. Ability to work effectively in
              diverse situations. Resilience in the face of challenges.
            </p>
          </div>

          {/* Quality of Work Reset Button */}
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateDataAction({
                  adaptabilityScore1: 0,
                  adaptabilityScore2: 0,
                  adaptabilityScore3: 0,
                });
              }}
              className="text-xs px-3 py-1 h-7 bg-blue-500 text-white border-gray-300 hover:text-white hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200 "
            >
              Clear Adaptability Scores
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
                {/* Row 1: Openness to Change (attitude towards change) */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    "Openness to Change (attitude towards change)"
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates a positive attitude and openness to new ideas
                    and major changes at work
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Welcomes changes in work processes, procedures, or tools
                    without resistance. Maintains a cooperative attitude when
                    asked to adjust to new ways of working.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.adaptabilityScore1)}
                      onValueChange={(value) =>
                        updateDataAction({ adaptabilityScore1: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.adaptabilityScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.adaptabilityScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.adaptabilityScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.adaptabilityScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.adaptabilityScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.adaptabilityScore1 === 5
                        ? "Outstanding"
                        : data.adaptabilityScore1 === 4
                        ? "Exceeds Expectation"
                        : data.adaptabilityScore1 === 3
                        ? "Meets Expectations"
                        : data.adaptabilityScore1 === 2
                        ? "Needs Improvement"
                        : data.adaptabilityScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.adaptabilityComments1 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          adaptabilityComments1: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 2: Flexibility in Job Role (ability to adapt to changes) */}
                <tr>
                  <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    "Flexibility in Job Role (ability to adapt to changes)"
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Adapts to changes in job responsibilities and willingly
                    takes on new tasks
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Quickly adjusts to changes in job assignments, schedules, or
                    unexpected demands. Helps cover additional responsibilities
                    during staffing shortages or high workloads.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.adaptabilityScore2)}
                      onValueChange={(value) =>
                        updateDataAction({ adaptabilityScore2: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.adaptabilityScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.adaptabilityScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.adaptabilityScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.adaptabilityScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.adaptabilityScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.adaptabilityScore2 === 5
                        ? "Outstanding"
                        : data.adaptabilityScore2 === 4
                        ? "Exceeds Expectation"
                        : data.adaptabilityScore2 === 3
                        ? "Meets Expectations"
                        : data.adaptabilityScore2 === 2
                        ? "Needs Improvement"
                        : data.adaptabilityScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.adaptabilityComments2 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          adaptabilityComments2: e.target.value,
                        })
                      }
                      placeholder="Enter comments about this competency..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                    />
                  </td>
                </tr>

                {/* Row 3: Resilience in the Face of Challenges */}
                <tr>
                    <td className="border border-gray-300 font-bold px-4 py-3 text-sm text-black text-center">
                    "Resilience in the Face of Challenges"
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains a positive attitude and performance under
                    challenging or difficult conditions
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Remains focused and effective during periods of high stress
                    or uncertainty. Completes tasks or meets deadlines when
                    faced with unforeseen obstacles.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <ScoreDropdown
                      value={String(data.adaptabilityScore3)}
                      onValueChange={(value) =>
                        updateDataAction({ adaptabilityScore3: Number(value) })
                      }
                      placeholder="-- Select --"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-bold ${
                        data.adaptabilityScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.adaptabilityScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.adaptabilityScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.adaptabilityScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.adaptabilityScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.adaptabilityScore3 === 5
                        ? "Outstanding"
                        : data.adaptabilityScore3 === 4
                        ? "Exceeds Expectation"
                        : data.adaptabilityScore3 === 3
                        ? "Meets Expectations"
                        : data.adaptabilityScore3 === 2
                        ? "Needs Improvement"
                        : data.adaptabilityScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <textarea
                      value={data.adaptabilityComments3 || ""}
                      onChange={(e) =>
                        updateDataAction({
                          adaptabilityComments3: e.target.value,
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
              Adaptability - Average Score
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
                    Openness to Change:{" "}
                    <span className="font-semibold">
                      {data.adaptabilityScore1 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Flexibility in Job Role:{" "}
                    <span className="font-semibold">
                      {data.adaptabilityScore2 || "Not rated"}
                    </span>
                  </div>
                  <div>
                    Resilience in the Face of Challenges:{" "}
                    <span className="font-semibold">
                      {data.adaptabilityScore3 || "Not rated"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Average calculated from{" "}
              {
                [
                  data.adaptabilityScore1,
                  data.adaptabilityScore2,
                  data.adaptabilityScore3,
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
