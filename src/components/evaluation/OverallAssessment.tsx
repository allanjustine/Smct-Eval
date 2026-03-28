"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Check,
  X,
  AlertTriangle,
  Printer,
  Edit,
  CheckCircle,
  AlertCircle,
  Send,
  User,
} from "lucide-react";
import { EvaluationPayload } from "./types";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";
import {
  getQuarterlyReviewStatus,
  getCurrentYear,
} from "@/lib/quarterlyReviewUtils";
import { useAuth, User as UserType } from "@/contexts/UserContext";
import { CONFIG } from "../../../config/config";

interface OverallAssessmentProps {
  data: EvaluationPayload;
  updateDataAction: (updates: Partial<EvaluationPayload>) => void;
  employee?: UserType | null;
  onSubmitAction?: () => void;
  onPreviousAction?: () => void;
  onCloseAction?: () => void;
}

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case "Outstanding":
    case "Exceeds Expectations":
      return <Check className="h-4 w-4 text-green-600" />;
    case "Needs Improvement":
    case "Unsatisfactory":
      return <X className="h-4 w-4 text-red-600" />;
    case "Meets Expectations":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return null;
  }
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "Outstanding":
    case "Exceeds Expectations":
      return "text-green-700 bg-green-100";
    case "Needs Improvement":
    case "Unsatisfactory":
      return "text-red-700 bg-red-100";
    case "Meets Expectations":
      return "text-yellow-700 bg-yellow-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

export default function OverallAssessment({
  data,
  updateDataAction,
  employee,
  onSubmitAction,
  onPreviousAction,
  onCloseAction,
}: OverallAssessmentProps) {
  const { error } = useToast();

  // Submission state management
  const [submissionError, setSubmissionError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    priorityAreas: false,
    remarks: false,
  });
  const { user } = useAuth();

  // Quarterly review status
  const [quarterlyStatus, setQuarterlyStatus] = useState({
    q1: false,
    q2: false,
    q3: false,
    q4: false,
  });
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

  useEffect(() => {
    const load = async () => {
      updateDataAction({ rating: overallWeightedScore });
    };
    load();
  }, []);
  const handleSubmitEvaluation = async () => {
    // Validate evaluator has a signature
    if (!user?.signature) {
      error(
        "Please add your signature to your profile before submitting the evaluation."
      );
      setSubmissionError(
        "Please add your signature to your profile before submitting the evaluation."
      );
      return;
    }

    // Clear any previous errors
    setSubmissionError("");
    setValidationErrors({ priorityAreas: false, remarks: false });

    if (onSubmitAction) {
      onSubmitAction();
    } else {
      console.log("❌ onSubmitAction not provided");
    }
  };

  const handlePrint = () => {
    const printContent = document.createElement("div");
    printContent.innerHTML = `
            <style>
                @media print {
                    body { margin: 0; padding: 10px; font-family: Arial, sans-serif; font-size: 10px; }
                    .print-header { text-align: center; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px; }
                    .print-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                    .print-subtitle { font-size: 12px; color: #666; }
                    .print-section { margin-bottom: 12px; page-break-inside: avoid; }
                    .print-section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
                    .print-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-bottom: 8px; }
                    .print-field { margin-bottom: 5px; }
                    .print-label { font-weight: bold; color: #666; font-size: 9px; }
                    .print-value { font-size: 10px; margin-top: 1px; }
                    .print-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; page-break-inside: avoid; }
                    .print-table th, .print-table td { border: 1px solid #000; padding: 4px 6px; text-align: left; font-size: 9px; }
                    .print-table th { background-color: #f0f0f0; font-weight: bold; }
                    .print-results { text-align: center; margin: 8px 0; }
                    .print-percentage { font-size: 20px; font-weight: bold; }
                    .print-status { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; font-size: 12px; }
                    .print-status.pass { background-color: #16a34a; }
                    .print-status.fail { background-color: #dc2626; }
                    .print-priority { background-color: #fefce8; border: 1px solid #e5e7eb; padding: 5px; margin-bottom: 5px; border-radius: 3px; font-size: 9px; }
                    .print-remarks { background-color: #fefce8; border: 1px solid #e5e7eb; padding: 8px; border-radius: 3px; font-size: 9px; }
                    .print-signature { background-color: #fefce8; border: 1px solid #e5e7eb; padding: 5px; margin-bottom: 5px; border-radius: 3px; min-height: 25px; font-size: 9px; }
                    .print-signature-label { text-align: center; font-size: 8px; color: #666; margin-top: 2px; }
                    .print-signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .print-checkbox { margin-right: 4px; }
                    .print-step { page-break-before: auto; margin-bottom: 8px; }
                    .print-step:first-child { page-break-before: auto; }
                    .print-description { font-size: 9px; margin-bottom: 8px; color: #666; }
                    .print-compact-table { font-size: 8px; }
                    .print-compact-table th, .print-compact-table td { padding: 2px 4px; }
                    .print-summary { margin-top: 10px; }
                    .no-print { display: none !important; }
                }
            </style>
            
            <div class="print-header">
                <div class="print-title">COMPLETE PERFORMANCE EVALUATION REPORT</div>
                <div class="print-subtitle">Employee Performance Evaluation - All Steps (1-7)</div>
            </div>

            <!-- STEP 1 & 2: Review Type & Employee Information -->
            <div class="print-section">
                <div class="print-section-title">STEP 1: REVIEW TYPE & STEP 2: EMPLOYEE INFORMATION</div>
                <div class="print-grid">
                    <div class="print-field">
                        <div class="print-label">Review Type:</div>
                        <div class="print-value">
                            ${
                              data.reviewTypeProbationary === 3
                                ? "✓ 3m"
                                : "☐ 3m"
                            } | ${
      data.reviewTypeProbationary === 5 ? "✓ 5m" : "☐ 5m"
    } | 
                            ${
                              data.reviewTypeRegular === "Q1" ? "✓ Q1" : "☐ Q1"
                            } | ${
      data.reviewTypeRegular === "Q2" ? "✓ Q2" : "☐ Q2"
    } | 
                            ${
                              data.reviewTypeRegular === "Q3" ? "✓ Q3" : "☐ Q3"
                            } | ${
      data.reviewTypeRegular === "Q4" ? "✓ Q4" : "☐ Q4"
    }
                            ${data.reviewTypeOthersImprovement ? " | ✓ PI" : ""}
                            ${
                              data.reviewTypeOthersCustom
                                ? ` | ${data.reviewTypeOthersCustom}`
                                : ""
                            }
                        </div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Employee:</div>
                        <div class="print-value">${
                          employee?.fname + " " + employee?.lname ||
                          "Not specified"
                        } (${employee?.emp_id || "ID: N/A"})</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Position:</div>
                        <div class="print-value">${
                          employee?.positions.label || "Not specified"
                        } - ${
      employee?.departments?.department_name || "Dept: N/A"
    }</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Branch & Supervisor:</div>
                        <div class="print-value">${
                          employee?.branches[0]?.branch_name || "Branch: N/A"
                        } | ${
      user?.fname + " " + user?.lname || "Sup: N/A"
    }</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Hire Date & Coverage:</div>
                        <div class="print-value">${
                          data.hireDate || "Hire: N/A"
                        } | ${
      data.coverageFrom && data.coverageTo
        ? `${format(new Date(data.coverageFrom), "MMM dd, yyyy")} - ${format(
            new Date(data.coverageTo),
            "MMM dd, yyyy"
          )}`
        : "Coverage: N/A"
    }</div>
                    </div>
                </div>
            </div>

            <!-- COMPACT EVALUATION SUMMARY -->
            <div class="print-section print-summary">
                <div class="print-section-title">EVALUATION SUMMARY</div>
                <div class="print-grid">
                    <div class="print-field">
                        <div class="print-label">Job Knowledge:</div>
                        <div class="print-value">${jobKnowledgeScore.toFixed(
                          2
                        )} (${getRatingLabel(jobKnowledgeScore)}) - 20%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Quality of Work:</div>
                        <div class="print-value">${qualityOfWorkScore.toFixed(
                          2
                        )} (${getRatingLabel(qualityOfWorkScore)}) - 20%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Adaptability:</div>
                        <div class="print-value">${adaptabilityScore.toFixed(
                          2
                        )} (${getRatingLabel(adaptabilityScore)}) - 10%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Teamwork:</div>
                        <div class="print-value">${teamworkScore.toFixed(
                          2
                        )} (${getRatingLabel(teamworkScore)}) - 10%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Reliability:</div>
                        <div class="print-value">${reliabilityScore.toFixed(
                          2
                        )} (${getRatingLabel(reliabilityScore)}) - 5%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Ethical Behavior:</div>
                        <div class="print-value">${ethicalScore.toFixed(
                          2
                        )} (${getRatingLabel(ethicalScore)}) - 5%</div>
                    </div>
                    <div class="print-field">
                        <div class="print-label">Customer Service:</div>
                        <div class="print-value">${customerServiceScore.toFixed(
                          2
                        )} (${getRatingLabel(customerServiceScore)}) - 30%</div>
                    </div>
                </div>
                
                <div class="print-results">
                    <div class="print-percentage">${overallPercentage}%</div>
                    <div style="margin-bottom: 8px;">Performance Score</div>
                    <div class="print-status ${isPass ? "pass" : "fail"}">${
      isPass ? "PASS" : "FAIL"
    }</div>
                </div>
            </div>

            <!-- FINAL SECTIONS -->
            <div class="print-section">
                <div class="print-section-title">PRIORITY AREAS, REMARKS & ACKNOWLEDGEMENT</div>
                
                ${
                  data.priorityArea1 || data.priorityArea2 || data.priorityArea3
                    ? `
                <div style="margin-bottom: 8px;">
                    <strong>Priority Areas:</strong><br>
                    ${data.priorityArea1 ? `1. ${data.priorityArea1}<br>` : ""}
                    ${data.priorityArea2 ? `2. ${data.priorityArea2}<br>` : ""}
                    ${data.priorityArea3 ? `3. ${data.priorityArea3}` : ""}
                </div>
                `
                    : ""
                }
                
                ${
                  data.remarks
                    ? `
                <div style="margin-bottom: 8px;">
                    <strong>Remarks:</strong> ${data.remarks}
                </div>
                `
                    : ""
                }
                
                <div style="margin-bottom: 8px;">
                    <strong>Acknowledgement:</strong> I hereby acknowledge that the Evaluator has explained to me, to the best of their ability, 
                    and in a manner I fully understand, my performance and respective rating on this performance evaluation.
                </div>
                
                <div class="print-signature-grid">
                    <div>
                        <div class="print-signature">${
                          employee?.signature ||
                          "Employee signature not provided"
                        }</div>
                        <div class="print-signature-label">Employee's Name & Signature</div>
                        <div style="margin-top: 5px; font-size: 8px;">
                            <strong>Date:</strong> Not Approved Yet
                        </div>
                    </div>
                    <div>
                        <div class="print-signature">${
                          user?.signature || "Evaluator signature not provided"
                        }</div>
                        <div class="print-signature-label">Evaluator's Name & Signature</div>
                        <div style="margin-top: 5px; font-size: 8px;">
                            <strong>Date:</strong> ${
                              new Date().toISOString().split("T")[0]
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      alert("Please allow popups to print the evaluation.");
    }
  };

  const handlePrevious = () => {
    if (onPreviousAction) {
      onPreviousAction();
    }
  };

  // Calculate scores from individual evaluations
  const calculateJobKnowledgeScore = () => {
    const scores = [
      data.jobKnowledgeScore1,
      data.jobKnowledgeScore2,
      data.jobKnowledgeScore3,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateQualityOfWorkScore = () => {
    const scores = [
      data.qualityOfWorkScore1,
      data.qualityOfWorkScore2,
      data.qualityOfWorkScore3,
      data.qualityOfWorkScore4,
      data.qualityOfWorkScore5,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateAdaptabilityScore = () => {
    const scores = [
      data.adaptabilityScore1,
      data.adaptabilityScore2,
      data.adaptabilityScore3,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateTeamworkScore = () => {
    const scores = [
      data.teamworkScore1,
      data.teamworkScore2,
      data.teamworkScore3,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateReliabilityScore = () => {
    const scores = [
      data.reliabilityScore1,
      data.reliabilityScore2,
      data.reliabilityScore3,
      data.reliabilityScore4,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateEthicalScore = () => {
    const scores = [
      data.ethicalScore1,
      data.ethicalScore2,
      data.ethicalScore3,
      data.ethicalScore4,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const calculateCustomerServiceScore = () => {
    const scores = [
      data.customerServiceScore1,
      data.customerServiceScore2,
      data.customerServiceScore3,
      data.customerServiceScore4,
      data.customerServiceScore5,
    ]
      .filter((score) => score && score !== 0)
      .map((score) => parseFloat(String(score)));

    if (scores.length === 0) return "0.00";
    return (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);
  };

  const getRatingLabel = (score: number) => {
    if (score >= 4.5) return "Outstanding";
    if (score >= 4.0) return "Exceeds Expectations";
    if (score >= 3.5) return "Meets Expectations";
    if (score >= 2.5) return "Needs Improvement";
    return "Unsatisfactory";
  };

  const jobKnowledgeScore = parseFloat(calculateJobKnowledgeScore());
  const qualityOfWorkScore = parseFloat(calculateQualityOfWorkScore());
  const adaptabilityScore = parseFloat(calculateAdaptabilityScore());
  const teamworkScore = parseFloat(calculateTeamworkScore());
  const reliabilityScore = parseFloat(calculateReliabilityScore());
  const ethicalScore = parseFloat(calculateEthicalScore());
  const customerServiceScore = parseFloat(calculateCustomerServiceScore());

  // Calculate weighted scores
  const jobKnowledgeWeighted = (jobKnowledgeScore * 0.2).toFixed(2);
  const qualityOfWorkWeighted = (qualityOfWorkScore * 0.2).toFixed(2);
  const adaptabilityWeighted = (adaptabilityScore * 0.1).toFixed(2);
  const teamworkWeighted = (teamworkScore * 0.1).toFixed(2);
  const reliabilityWeighted = (reliabilityScore * 0.05).toFixed(2);
  const ethicalWeighted = (ethicalScore * 0.05).toFixed(2);
  const customerServiceWeighted = (customerServiceScore * 0.3).toFixed(2);

  // Calculate overall weighted score
  const overallWeightedScore = (
    parseFloat(jobKnowledgeWeighted) +
    parseFloat(qualityOfWorkWeighted) +
    parseFloat(adaptabilityWeighted) +
    parseFloat(teamworkWeighted) +
    parseFloat(reliabilityWeighted) +
    parseFloat(ethicalWeighted) +
    parseFloat(customerServiceWeighted)
  ).toFixed(2);

  const overallPercentage = (
    (parseFloat(overallWeightedScore) / 5) *
    100
  ).toFixed(2);
  const isPass = parseFloat(overallWeightedScore) >= 3.0;

  // Calculate completion status - no validation required for step 8
  const isComplete = true;

  // Auto-save function with indicator
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] =
    React.useState(false);

  // const autoSave = () => {
  //   try {
  //     const evaluationData = {
  //       ...data,
  //       lastSaved: new Date().toISOString(),
  //       employeeName: data.employeeName || "Unknown Employee",
  //     };

  //     localStorage.setItem(
  //       "evaluation_autosave",
  //       JSON.stringify(evaluationData)
  //     );
  //     console.log("Auto-saved evaluation data");

  //     // Show auto-save indicator
  //     setShowAutoSaveIndicator(true);
  //     setTimeout(() => setShowAutoSaveIndicator(false), 2000);
  //   } catch (error) {
  //     console.error("Auto-save failed:", error);
  //   }
  // };

  // Auto-save every 30 seconds (but don't load auto-saved data on mount)
  // useEffect(() => {
  //   const interval = setInterval(autoSave, 30000);
  //   return () => clearInterval(interval);
  // }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          OVERALL PERFORMANCE ASSESSMENT
        </h3>
      </div>

      {/* Review Type Section */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">Review Type</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Probationary */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800">For Probationary</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prob3"
                    className="rounded"
                    checked={data.reviewTypeProbationary === 3}
                    disabled
                    readOnly
                  />
                  <label htmlFor="prob3" className="text-sm text-gray-700">
                    3 months
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prob5"
                    className="rounded"
                    checked={data.reviewTypeProbationary === 5}
                    disabled
                    readOnly
                  />
                  <label htmlFor="prob5" className="text-sm text-gray-700">
                    5 months
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
                    className="rounded"
                    checked={data.reviewTypeRegular === "Q1"}
                    disabled
                    readOnly
                  />
                  <label
                    htmlFor="q1"
                    className={`text-sm ${
                      quarterlyStatus.q1
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    Q1 review
                    {quarterlyStatus.q1 && (
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
                    className="rounded"
                    checked={data.reviewTypeRegular === "Q2"}
                    disabled
                    readOnly
                  />
                  <label
                    htmlFor="q2"
                    className={`text-sm ${
                      quarterlyStatus.q2
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    Q2 review
                    {quarterlyStatus.q2 && (
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
                    className="rounded"
                    checked={data.reviewTypeRegular === "Q3"}
                    disabled
                    readOnly
                  />
                  <label
                    htmlFor="q3"
                    className={`text-sm ${
                      quarterlyStatus.q3
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    Q3 review
                    {quarterlyStatus.q3 && (
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
                    className="rounded"
                    checked={data.reviewTypeRegular === "Q4"}
                    disabled
                    readOnly
                  />
                  <label
                    htmlFor="q4"
                    className={`text-sm ${
                      quarterlyStatus.q4
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    Q4 review
                    {quarterlyStatus.q4 && (
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
                    className="rounded"
                    checked={data.reviewTypeOthersImprovement}
                    disabled
                    readOnly
                  />
                  <label
                    htmlFor="improvement"
                    className="text-sm text-gray-700"
                  >
                    Performance Improvement
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Others:</label>
                  <input
                    type="text"
                    value={data.reviewTypeOthersCustom || ""}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                    placeholder="Enter custom review type"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Information Section */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            Employee Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Employee Name:</Label>
                <Input
                  value={employee?.fname + " " + employee?.lname || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <Label className="font-medium">Employee Number:</Label>
                <Input
                  value={employee?.emp_id || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <Label className="font-medium">Position:</Label>
                <Input
                  value={employee?.positions?.label || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <Label className="font-medium">Department:</Label>
                <Input
                  value={employee?.departments?.department_name || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Branch:</Label>
                <Input
                  value={employee?.branches[0]?.branch_name || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <Label className="font-medium">Date Hired:</Label>
                <Input
                  value={data.hireDate || ""}
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
              <div>
                <Label className="font-medium">Immediate Supervisor:</Label>
                <Input
                  value={user?.fname + " " + user?.lname || ""}
                  className="mt-1 bg-gray-50"
                  placeholder="Enter supervisor name"
                  disabled
                  readOnly
                />
              </div>
              <div>
                <Label className="font-medium">Performance Coverage:</Label>
                <Input
                  value={
                    data.coverageFrom && data.coverageTo
                      ? `${format(
                          new Date(data.coverageFrom),
                          "MMM dd, yyyy"
                        )} - ${format(
                          new Date(data.coverageTo),
                          "MMM dd, yyyy"
                        )}`
                      : ""
                  }
                  readOnly
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Evaluation Tables */}

      {/* I. JOB KNOWLEDGE */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            I. JOB KNOWLEDGE
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Demonstrates understanding of job responsibilities. Applies
            knowledge to tasks and projects. Stays updated in relevant areas.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Mastery in Core Competencies and Job Functions
                    (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates comprehensive understanding of job requirements
                    and applies knowledge effectively.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.jobKnowledgeScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.jobKnowledgeComments1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Keeps Documentation Updated
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains current and accurate documentation for projects
                    and processes.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.jobKnowledgeScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.jobKnowledgeComments2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Problem Solving
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Effectively identifies and resolves work-related challenges
                    using job knowledge.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.jobKnowledgeScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.jobKnowledgeComments3 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateJobKnowledgeScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateJobKnowledgeScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* II. QUALITY OF WORK */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            II. QUALITY OF WORK
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Accuracy and precision in completing tasks. Attention to detail.
            Consistency in delivering high-quality results. Timely completion of
            tasks and projects. Effective use of resources. Ability to meet
            deadlines.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Meets Standards and Requirements
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistently delivers work that meets or exceeds established
                    standards and requirements.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.qualityOfWorkScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.qualityOfWorkScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.qualityOfWorkScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.qualityOfWorkScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.qualityOfWorkScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.qualityOfWorkScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.qualityOfWorkScore1 === 5
                        ? "Outstanding"
                        : data.qualityOfWorkScore1 === 4
                        ? "Exceeds Expectation"
                        : data.qualityOfWorkScore1 === 3
                        ? "Meets Expectations"
                        : data.qualityOfWorkScore1 === 2
                        ? "Needs Improvement"
                        : data.qualityOfWorkScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.qualityOfWorkComments1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Timeliness (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Completes tasks and projects within established deadlines
                    and timeframes.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.qualityOfWorkScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.qualityOfWorkScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.qualityOfWorkScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.qualityOfWorkScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.qualityOfWorkScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.qualityOfWorkScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.qualityOfWorkScore2 === 5
                        ? "Outstanding"
                        : data.qualityOfWorkScore2 === 4
                        ? "Exceeds Expectation"
                        : data.qualityOfWorkScore2 === 3
                        ? "Meets Expectations"
                        : data.qualityOfWorkScore2 === 2
                        ? "Needs Improvement"
                        : data.qualityOfWorkScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.qualityOfWorkComments2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Work Output Volume (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Produces an appropriate volume of work output relative to
                    role expectations.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.qualityOfWorkScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.qualityOfWorkScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.qualityOfWorkScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.qualityOfWorkScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.qualityOfWorkScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.qualityOfWorkScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.qualityOfWorkScore3 === 5
                        ? "Outstanding"
                        : data.qualityOfWorkScore3 === 4
                        ? "Exceeds Expectation"
                        : data.qualityOfWorkScore3 === 3
                        ? "Meets Expectations"
                        : data.qualityOfWorkScore3 === 2
                        ? "Needs Improvement"
                        : data.qualityOfWorkScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.qualityOfWorkComments3 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistency in Performance (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains consistent quality and performance standards
                    across all tasks and projects.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.qualityOfWorkScore4 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.qualityOfWorkScore4 === 5
                          ? "bg-green-100 text-green-800"
                          : data.qualityOfWorkScore4 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.qualityOfWorkScore4 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.qualityOfWorkScore4 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.qualityOfWorkScore4 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.qualityOfWorkScore4 === 5
                        ? "Outstanding"
                        : data.qualityOfWorkScore4 === 4
                        ? "Exceeds Expectation"
                        : data.qualityOfWorkScore4 === 3
                        ? "Meets Expectations"
                        : data.qualityOfWorkScore4 === 2
                        ? "Needs Improvement"
                        : data.qualityOfWorkScore4 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.qualityOfWorkComments4 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Attention to Detail
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates thoroughness and accuracy in work, catching and
                    correcting errors.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.qualityOfWorkScore5 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.qualityOfWorkScore5 === 5
                          ? "bg-green-100 text-green-800"
                          : data.qualityOfWorkScore5 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.qualityOfWorkScore5 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.qualityOfWorkScore5 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.qualityOfWorkScore5 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.qualityOfWorkScore5 === 5
                        ? "Outstanding"
                        : data.qualityOfWorkScore5 === 4
                        ? "Exceeds Expectation"
                        : data.qualityOfWorkScore5 === 3
                        ? "Meets Expectations"
                        : data.qualityOfWorkScore5 === 2
                        ? "Needs Improvement"
                        : data.qualityOfWorkScore5 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.qualityOfWorkComments5 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateQualityOfWorkScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateQualityOfWorkScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* III. ADAPTABILITY */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            III. ADAPTABILITY
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Flexibility in handling change. Ability to work effectively in
            diverse situations. Resilience in the face of challenges.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Openness to Change (attitude towards change)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates a positive attitude and openness to new ideas
                    and major changes at work
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.adaptabilityScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.adaptabilityComments1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Flexibility in Job Role (ability to adapt to changes)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Adapts to changes in job responsibilities and willingly
                    takes on new tasks
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.adaptabilityScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.adaptabilityComments2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Resilience in the Face of Challenges
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains a positive attitude and performance under
                    challenging or difficult conditions
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.adaptabilityScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.adaptabilityComments3 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateAdaptabilityScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateAdaptabilityScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IV. TEAMWORK */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">IV. TEAMWORK</h4>
          <p className="text-sm text-gray-600 mb-4">
            Ability to work well with others. Contribution to team goals and
            projects. Supportiveness of team members.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Active Participation in Team Activities
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Actively participates in team meetings and projects.
                    Contributes ideas and feedback during discussions. Engages
                    in team tasks to achieve group goals.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.teamworkScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.teamworkScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.teamworkScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.teamworkScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.teamworkScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.teamworkScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.teamworkScore1 === 5
                        ? "Outstanding"
                        : data.teamworkScore1 === 4
                        ? "Exceeds Expectation"
                        : data.teamworkScore1 === 3
                        ? "Meets Expectations"
                        : data.teamworkScore1 === 2
                        ? "Needs Improvement"
                        : data.teamworkScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.teamworkComments1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Promotion of a Positive Team Culture
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Interacts positively with coworkers. Fosters inclusive team
                    culture. Provides support and constructive feedback.
                    Promotes teamwork and camaraderie.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.teamworkScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.teamworkScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.teamworkScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.teamworkScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.teamworkScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.teamworkScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.teamworkScore2 === 5
                        ? "Outstanding"
                        : data.teamworkScore2 === 4
                        ? "Exceeds Expectation"
                        : data.teamworkScore2 === 3
                        ? "Meets Expectations"
                        : data.teamworkScore2 === 2
                        ? "Needs Improvement"
                        : data.teamworkScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.teamworkComments2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Effective Communication
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Communicates openly and clearly with team members. Shares
                    information and updates in a timely manner. Ensures
                    important details are communicated clearly.
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.teamworkScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.teamworkScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.teamworkScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.teamworkScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.teamworkScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.teamworkScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.teamworkScore3 === 5
                        ? "Outstanding"
                        : data.teamworkScore3 === 4
                        ? "Exceeds Expectation"
                        : data.teamworkScore3 === 3
                        ? "Meets Expectations"
                        : data.teamworkScore3 === 2
                        ? "Needs Improvement"
                        : data.teamworkScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.teamworkComments3 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateTeamworkScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateTeamworkScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* V. RELIABILITY */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            V. RELIABILITY
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Consistency in attendance and punctuality. Meeting commitments and
            fulfilling responsibilities.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Consistent Attendance
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates regular attendance by being present at work as
                    scheduled
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.reliabilityScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.reliabilityComments1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Punctuality
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Arrives at work and meetings on time or before the scheduled
                    time
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.reliabilityScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.reliabilityComments2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Follows Through on Commitments
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Follows through on assignments from and commitments made to
                    coworkers or superiors
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.reliabilityScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.reliabilityComments3 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Reliable Handling of Routine Tasks
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Demonstrates reliability in completing routine tasks without
                    oversight
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.reliabilityScore4 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.reliabilityComments4 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateReliabilityScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateReliabilityScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VI. ETHICAL & PROFESSIONAL BEHAVIOR */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            VI. ETHICAL & PROFESSIONAL BEHAVIOR
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Complies with company policies and ethical standards. Accountability
            for one's actions. Professionalism in interactions with coworkers
            and clients.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Follows Company Policies
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Complies with company rules, regulations, and memorandums
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.ethicalScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.ethicalScore1 === 5
                          ? "bg-green-100 text-green-800"
                          : data.ethicalScore1 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.ethicalScore1 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.ethicalScore1 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.ethicalScore1 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.ethicalScore1 === 5
                        ? "Outstanding"
                        : data.ethicalScore1 === 4
                        ? "Exceeds Expectation"
                        : data.ethicalScore1 === 3
                        ? "Meets Expectations"
                        : data.ethicalScore1 === 2
                        ? "Needs Improvement"
                        : data.ethicalScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.ethicalExplanation1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Professionalism (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains a high level of professionalism in all work
                    interactions
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.ethicalScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.ethicalScore2 === 5
                          ? "bg-green-100 text-green-800"
                          : data.ethicalScore2 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.ethicalScore2 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.ethicalScore2 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.ethicalScore2 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.ethicalScore2 === 5
                        ? "Outstanding"
                        : data.ethicalScore2 === 4
                        ? "Exceeds Expectation"
                        : data.ethicalScore2 === 3
                        ? "Meets Expectations"
                        : data.ethicalScore2 === 2
                        ? "Needs Improvement"
                        : data.ethicalScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.ethicalExplanation2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Accountability for Mistakes (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Takes responsibility for errors and actively works to
                    correct mistakes
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.ethicalScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.ethicalScore3 === 5
                          ? "bg-green-100 text-green-800"
                          : data.ethicalScore3 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.ethicalScore3 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.ethicalScore3 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.ethicalScore3 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.ethicalScore3 === 5
                        ? "Outstanding"
                        : data.ethicalScore3 === 4
                        ? "Exceeds Expectation"
                        : data.ethicalScore3 === 3
                        ? "Meets Expectations"
                        : data.ethicalScore3 === 2
                        ? "Needs Improvement"
                        : data.ethicalScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.ethicalExplanation3 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Respect for Others (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Treats all individuals fairly and with respect, regardless
                    of background or position
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.ethicalScore4 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        data.ethicalScore4 === 5
                          ? "bg-green-100 text-green-800"
                          : data.ethicalScore4 === 4
                          ? "bg-blue-100 text-blue-800"
                          : data.ethicalScore4 === 3
                          ? "bg-yellow-100 text-yellow-800"
                          : data.ethicalScore4 === 2
                          ? "bg-orange-100 text-orange-800"
                          : data.ethicalScore4 === 1
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {data.ethicalScore4 === 5
                        ? "Outstanding"
                        : data.ethicalScore4 === 4
                        ? "Exceeds Expectation"
                        : data.ethicalScore4 === 3
                        ? "Meets Expectations"
                        : data.ethicalScore4 === 2
                        ? "Needs Improvement"
                        : data.ethicalScore4 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.ethicalExplanation4 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateEthicalScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateEthicalScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VII. CUSTOMER SERVICE */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-4">
            VII. CUSTOMER SERVICE
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Customer satisfaction. Responsiveness to customer needs.
            Professional and positive interactions with customers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Behavioral Indicators
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Example
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Listening & Understanding
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Listens to customers and displays understanding of customer
                    needs and concerns
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.customerServiceScore1 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                        ? "Exceeds Expectation"
                        : data.customerServiceScore1 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore1 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore1 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.customerServiceExplanation1 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Problem-Solving for Customer Satisfaction
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Proactively identifies and solves customer problems to
                    ensure satisfaction
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.customerServiceScore2 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                        ? "Exceeds Expectation"
                        : data.customerServiceScore2 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore2 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore2 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.customerServiceExplanation2 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Product Knowledge for Customer Support (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Possesses comprehensive product knowledge to assist
                    customers effectively
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.customerServiceScore3 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                        ? "Exceeds Expectation"
                        : data.customerServiceScore3 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore3 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore3 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.customerServiceExplanation3 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Positive and Professional Attitude (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Maintains a positive and professional demeanor, particularly
                    during customer interactions
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.customerServiceScore4 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                        ? "Exceeds Expectation"
                        : data.customerServiceScore4 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore4 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore4 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.customerServiceExplanation4 || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Timely Resolution of Customer Issues (L.E.A.D.E.R.)
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Resolves customer issues promptly and efficiently
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {data.customerServiceScore5 || ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div
                      className={`px-2 py-1 rounded text-sm font-medium ${
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
                        ? "Exceeds Expectation"
                        : data.customerServiceScore5 === 3
                        ? "Meets Expectations"
                        : data.customerServiceScore5 === 2
                        ? "Needs Improvement"
                        : data.customerServiceScore5 === 1
                        ? "Unsatisfactory"
                        : "Not Rated"}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 bg-yellow-50">
                    {data.customerServiceExplanation5 || ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <strong>
                Average: {calculateCustomerServiceScore()} | Rating:{" "}
                {getRatingLabel(parseFloat(calculateCustomerServiceScore()))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Assessment Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Performance Criteria
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Rating
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Score
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-24">
                    Weight (%)
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-32">
                    Weighted Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Job Knowledge */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Job Knowledge
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(jobKnowledgeScore)
                        )}`}
                      >
                        {getRatingLabel(jobKnowledgeScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(jobKnowledgeScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {jobKnowledgeScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    20%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {jobKnowledgeWeighted}
                  </td>
                </tr>

                {/* Quality of Work */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Quality of Work
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(qualityOfWorkScore)
                        )}`}
                      >
                        {getRatingLabel(qualityOfWorkScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(qualityOfWorkScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {qualityOfWorkScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    20%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {qualityOfWorkWeighted}
                  </td>
                </tr>

                {/* Adaptability */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Adaptability
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(adaptabilityScore)
                        )}`}
                      >
                        {getRatingLabel(adaptabilityScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(adaptabilityScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {adaptabilityScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    10%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {adaptabilityWeighted}
                  </td>
                </tr>

                {/* Teamwork */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Teamwork
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(teamworkScore)
                        )}`}
                      >
                        {getRatingLabel(teamworkScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(teamworkScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {teamworkScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    10%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {teamworkWeighted}
                  </td>
                </tr>

                {/* Reliability */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Reliability
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(reliabilityScore)
                        )}`}
                      >
                        {getRatingLabel(reliabilityScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(reliabilityScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {reliabilityScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    5%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {reliabilityWeighted}
                  </td>
                </tr>

                {/* Ethical & Professional Behavior */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Ethical & Professional Behavior
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(ethicalScore)
                        )}`}
                      >
                        {getRatingLabel(ethicalScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(ethicalScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {ethicalScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    5%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {ethicalWeighted}
                  </td>
                </tr>

                {/* Customer Service */}
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    Customer Service
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                          getRatingLabel(customerServiceScore)
                        )}`}
                      >
                        {getRatingLabel(customerServiceScore)}
                      </span>
                      {getRatingIcon(getRatingLabel(customerServiceScore))}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {customerServiceScore.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    30%
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {customerServiceWeighted}
                  </td>
                </tr>

                {/* Overall Performance Rating */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
                  >
                    Overall Performance Rating
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                    {overallWeightedScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 flex justify-end items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {overallPercentage}%
              </div>
              <div className="text-sm text-gray-500">Performance Score</div>
            </div>
            <div
              className={`px-6 py-3 rounded-lg font-bold text-white ${
                isPass ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {isPass ? "PASS" : "FAIL"}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            NOTE: For probationary employees
          </div>
        </CardContent>
      </Card>

      {/* Priority Areas for Improvement */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-3">
            PRIORITY AREAS FOR IMPROVEMENT
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            This section identifies key areas the employee can focus on for
            development in the upcoming quarter. These can be specific skills,
            behaviors, or work outputs that will contribute to better overall
            performance and align with branch or company goals. Keep the
            feedback clear, helpful, and easy to act on.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="priority1" className="text-sm font-medium">
                1.
              </Label>
              <Input
                id="priority1"
                value={data.priorityArea1 || ""}
                onChange={(e) => {
                  updateDataAction({ priorityArea1: e.target.value });
                }}
                className="mt-1 bg-yellow-50 border-gray-300"
                placeholder="Enter priority area for improvement"
              />
            </div>
            <div>
              <Label htmlFor="priority2" className="text-sm font-medium">
                2.
              </Label>
              <Input
                id="priority2"
                value={data.priorityArea2 || ""}
                onChange={(e) => {
                  updateDataAction({ priorityArea2: e.target.value });
                }}
                className="mt-1 bg-yellow-50 border-gray-300"
                placeholder="Enter priority area for improvement"
              />
            </div>
            <div>
              <Label htmlFor="priority3" className="text-sm font-medium">
                3.
              </Label>
              <Input
                id="priority3"
                value={data.priorityArea3 || ""}
                onChange={(e) => {
                  updateDataAction({ priorityArea3: e.target.value });
                }}
                className="mt-1 bg-yellow-50 border-gray-300"
                placeholder="Enter priority area for improvement"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-3">REMARKS</h4>
          <textarea
            value={data.remarks || ""}
            onChange={(e) => {
              updateDataAction({ remarks: e.target.value });
            }}
            className="w-full h-32 p-3 border border-gray-300 rounded-md bg-yellow-50 resize-none"
            placeholder="Enter additional remarks or comments..."
          />
        </CardContent>
      </Card>

      {/* Acknowledgement */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-bold text-lg text-gray-900 mb-3">
            ACKNOWLEDGEMENT
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            I hereby acknowledge that the Evaluator has explained to me, to the
            best of their ability, and in a manner I fully understand, my
            performance and respective rating on this performance evaluation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Section */}
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Employee signature:
                </Label>
                <div className="border border-gray-300 rounded-lg bg-white p-4 relative">
                  <div className="h-16 flex items-center justify-center relative">
                    {/* Name as background text - always show */}
                    <span className="text-md text-gray-900 font-bold">
                      {employee?.fname + " " + employee?.lname ||
                        "Evaluator Name"}
                    </span>
                    {/* Signature overlay - automatically show when signature exists */}

                    {/* Show message if no signature */}
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Employee's Name & Signature
              </p>

              <div className="text-center">
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  ⏳ Waiting for employee approval
                </span>
              </div>
            </div>

            {/* Evaluator Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Evaluator Signature
                </h4>

                {/* Signature area */}
                <div className="border border-gray-300 rounded-lg bg-white p-4 relative">
                  <div className="h-16 flex items-center justify-center relative">
                    {/* Name as background text - always show */}
                    <span className="text-md text-gray-900 font-bold">
                      {user?.fname + " " + user?.lname || "Evaluator Name"}
                    </span>
                    {/* Signature overlay - automatically show when signature exists */}
                    {user?.signature && (
                      <img
                        src={`${CONFIG.API_URL_STORAGE}/${user.signature}`}
                        alt="Evaluator Signature"
                        className="absolute top-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-14 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    {/* Show message if no signature */}
                    {!user?.signature && (
                      <span className="text-xs text-red-600">
                        Please add signature to your profile
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Label className="text-sm font-medium text-gray-600">
                  Date:
                </Label>
                <Input
                  type="date"
                  value={new Date().toISOString().split("T")[0]}
                  readOnly
                  className="w-32 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-20">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="px-8 py-3 text-lg cursor-pointer bg-blue-500 text-white hover:bg-blue-700 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {/* Center Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Submit Button */}
          <Button
            disabled={isSubmittingEvaluation}
            onClick={async () => {
              setIsSubmittingEvaluation(true);

              try {
                await handleSubmitEvaluation();
              } finally {
                setIsSubmittingEvaluation(false);
              }
            }}
            className={`px-8 py-3 text-lg bg-green-600 hover:bg-green-700 text-white
    flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200
    ${
      isSubmittingEvaluation
        ? "opacity-70 cursor-not-allowed hover:scale-100"
        : ""
    }
  `}
            size="lg"
          >
            {isSubmittingEvaluation ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Evaluation
              </>
            )}
          </Button>
        </div>

        {/* Empty div for balance */}
        <div></div>
      </div>

      {/* No validation messages needed since validation was removed */}

      {/* Error Messages */}
      {submissionError && (
        <div className="mt-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Validation Error
                  </h4>
                  <p className="text-sm text-red-700">{submissionError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-save indicator */}
      {showAutoSaveIndicator && (
        <div className="auto-save-indicator show">✓ Auto-saved</div>
      )}
    </div>
  );
}
