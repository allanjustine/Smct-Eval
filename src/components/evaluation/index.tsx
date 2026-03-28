"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import WelcomeStep from "./WelcomeStep";
import { EvaluationPayload, EvaluationStepConfig } from "./types";
import { storeEvaluationResult } from "@/lib/evaluationStorage";
import { apiService } from "@/lib/apiService";
import { createEvaluationNotification } from "@/lib/notificationUtils";
import { User, useAuth } from "../../contexts/UserContext";
import { branchEvaluationSteps } from "./configs";

// Default steps use branch evaluation configuration
const defaultSteps: EvaluationStepConfig[] = branchEvaluationSteps;

interface EvaluationFormProps {
  employee?: User | null;
  onCloseAction?: () => void;
  onCancelAction?: () => void;
  steps?: EvaluationStepConfig[]; // Optional: custom step configuration
  evaluationType?: 'rankNfile' | 'basic' | 'default'; // Optional: evaluation type
}

export default function EvaluationForm({
  employee,
  onCloseAction,
  onCancelAction,
  steps: customSteps,
  evaluationType = 'default',
}: EvaluationFormProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome step, 1-N = actual steps
  const [welcomeAnimationKey, setWelcomeAnimationKey] = useState(0);
  const { user } = useAuth();
  
  // Use custom steps if provided, otherwise use default steps
  const baseSteps = customSteps || defaultSteps;
  
  // Check if evaluator's branch is HO (Head Office)
  const isEvaluatorHO = () => {
    if (!user?.branches) return false;
    
    // Handle branches as array
    if (Array.isArray(user.branches)) {
      const branch = user.branches[0];
      if (branch) {
        const branchName = branch.branch_name?.toUpperCase() || "";
        const branchCode = branch.branch_code?.toUpperCase() || "";
        return (
          branchName === "HO" || 
          branchCode === "HO" || 
          branchName.includes("HEAD OFFICE") ||
          branchCode.includes("HEAD OFFICE") ||
          branchName === "HEAD OFFICE" ||
          branchCode === "HEAD OFFICE"
        );
      }
    }
    
    // Handle branches as object
    if (typeof user.branches === 'object') {
      const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
      const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
      return (
        branchName === "HO" || 
        branchCode === "HO" || 
        branchName.includes("HEAD OFFICE") ||
        branchCode.includes("HEAD OFFICE") ||
        branchName === "HEAD OFFICE" ||
        branchCode === "HEAD OFFICE"
      );
    }
    
    return false;
  };

  const isHO = isEvaluatorHO();
  
  // Filter steps based on HO status and evaluation type
  // For default evaluation type, remove Step 7 for HO evaluators
  // For custom steps, use them as-is
  const filteredSteps = (() => {
    if (customSteps) {
      // Use custom steps as-is (already configured for specific evaluation type)
      return customSteps;
    }
    // Default behavior: remove Step 7 for HO evaluators
    return isHO ? baseSteps.filter(step => step.id !== 7) : baseSteps;
  })();
  
  // Helper to get step by ID
  const getStepById = (id: number) => filteredSteps.find(step => step.id === id);
  
  // Helper to get step index by ID
  const getStepIndexById = (id: number) => filteredSteps.findIndex(step => step.id === id);
  
  // Helper to get current step ID from current step index
  const getCurrentStepId = () => {
    if (currentStep === 0) return 0;
    const stepIndex = currentStep - 1;
    return filteredSteps[stepIndex]?.id || currentStep;
  };
  
  const [form, setForm] = useState<EvaluationPayload>({
    hireDate: "",
    rating: 0,
    coverageFrom: "",
    coverageTo: "",
    reviewTypeProbationary: "",
    reviewTypeRegular: "",
    reviewTypeOthersImprovement: false,
    reviewTypeOthersCustom: "",
    priorityArea1: "",
    priorityArea2: "",
    priorityArea3: "",
    remarks: "",
    jobKnowledgeScore1: 0,
    jobKnowledgeScore2: 0,
    jobKnowledgeScore3: 0,
    jobKnowledgeComments1: "",
    jobKnowledgeComments2: "",
    jobKnowledgeComments3: "",
    qualityOfWorkScore1: 0,
    qualityOfWorkScore2: 0,
    qualityOfWorkScore3: 0,
    qualityOfWorkScore4: 0,
    qualityOfWorkScore5: 0,
    qualityOfWorkScore6: 0, // Branch Manager only
    qualityOfWorkScore7: 0, // Branch Manager only
    qualityOfWorkScore8: 0, // Branch Manager only
    qualityOfWorkScore9: 0, // Branch Manager only
    qualityOfWorkScore10: 0, // Branch Manager only
    qualityOfWorkScore11: 0, // Branch Manager only
    qualityOfWorkComments1: "",
    qualityOfWorkComments2: "",
    qualityOfWorkComments3: "",
    qualityOfWorkComments4: "",
    qualityOfWorkComments5: "",
    qualityOfWorkComments6: "", // Branch Manager only
    qualityOfWorkComments7: "", // Branch Manager only
    qualityOfWorkComments8: "", // Branch Manager only
    qualityOfWorkComments9: "", // Branch Manager only
    qualityOfWorkComments10: "", // Branch Manager only
    qualityOfWorkComments11: "", // Branch Manager only
    adaptabilityScore1: 0,
    adaptabilityScore2: 0,
    adaptabilityScore3: 0,
    adaptabilityComments1: "",
    adaptabilityComments2: "",
    adaptabilityComments3: "",
    teamworkScore1: 0,
    teamworkScore2: 0,
    teamworkScore3: 0,
    teamworkComments1: "",
    teamworkComments2: "",
    teamworkComments3: "",
    reliabilityScore1: 0,
    reliabilityScore2: 0,
    reliabilityScore3: 0,
    reliabilityScore4: 0,
    reliabilityComments1: "",
    reliabilityComments2: "",
    reliabilityComments3: "",
    reliabilityComments4: "",
    ethicalScore1: 0,
    ethicalScore2: 0,
    ethicalScore3: 0,
    ethicalScore4: 0,
    ethicalExplanation1: "",
    ethicalExplanation2: "",
    ethicalExplanation3: "",
    ethicalExplanation4: "",
    customerServiceScore1: 0,
    customerServiceScore2: 0,
    customerServiceScore3: 0,
    customerServiceScore4: 0,
    customerServiceScore5: 0,
    customerServiceExplanation1: "",
    customerServiceExplanation2: "",
    customerServiceExplanation3: "",
    customerServiceExplanation4: "",
    customerServiceExplanation5: "",
    managerialSkillsScore1: 0,
    managerialSkillsScore2: 0,
    managerialSkillsScore3: 0,
    managerialSkillsScore4: 0,
    managerialSkillsScore5: 0,
    managerialSkillsScore6: 0,
    managerialSkillsExplanation1: "",
    managerialSkillsExplanation2: "",
    managerialSkillsExplanation3: "",
    managerialSkillsExplanation4: "",
    managerialSkillsExplanation5: "",
    managerialSkillsExplanation6: "",
    created_at: "",
  });
  const [isCancelling, setIsCancelling] = useState(false);

  const updateDataAction = (updates: Partial<EvaluationPayload>) => {
    setForm((prev: EvaluationPayload) => ({
      ...prev,
      ...updates,
    }));
  };

  // Reset animation when returning to welcome step or on initial mount
  useEffect(() => {
    if (currentStep === 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setWelcomeAnimationKey((prev) => prev + 1);
      }, 10);
    }
  }, [currentStep]);

  // Trigger animation on initial mount
  useEffect(() => {
    setWelcomeAnimationKey((prev) => prev + 1);
  }, []);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const startEvaluation = () => {
    setCurrentStep(1);
  };

  // Check if current step scores are complete
  const isCurrentStepComplete = () => {
    switch (currentStep) {
      case 1: // Employee Information & Job Knowledge
        // Check if at least one review type is selected
        const hasReviewType =
          form.reviewTypeProbationary ||
          form.reviewTypeProbationary ||
          form.reviewTypeRegular ||
          form.reviewTypeOthersImprovement ||
          (form.reviewTypeOthersCustom &&
            form.reviewTypeOthersCustom.trim() !== "");

        // Check if all job knowledge scores are filled
        const hasJobKnowledgeScores =
          form.jobKnowledgeScore1 &&
          form.jobKnowledgeScore1 !== 0 &&
          form.jobKnowledgeScore2 &&
          form.jobKnowledgeScore2 !== 0 &&
          form.jobKnowledgeScore3 &&
          form.jobKnowledgeScore3 !== 0;

        // Check if basic employee information is filled
        const hasBasicInfo =
          form.coverageFrom &&
          form.coverageFrom !== "" &&
          form.coverageTo &&
          form.coverageTo !== "";

        // Check if coverage dates are valid (coverageFrom must be before coverageTo and not before hireDate)
        const hasValidCoverageDates = (() => {
          if (!hasBasicInfo) return false;
          try {
            // Convert to date strings in YYYY-MM-DD format for reliable comparison
            const fromDateStr =
              typeof form.coverageFrom === "string"
                ? form.coverageFrom
                : new Date(form.coverageFrom).toISOString().split("T")[0];
            const toDateStr =
              typeof form.coverageTo === "string"
                ? form.coverageTo
                : new Date(form.coverageTo).toISOString().split("T")[0];

            // Validate date strings are in correct format
            if (
              !fromDateStr ||
              !toDateStr ||
              fromDateStr.length !== 10 ||
              toDateStr.length !== 10
            ) {
              return false;
            }

            // Check if fromDate is before toDate (string comparison works for YYYY-MM-DD format)
            if (fromDateStr >= toDateStr) {
              return false;
            }

            // Check if coverageFrom is not before date hired
            if (form.hireDate) {
              const hireDateStr =
                typeof form.hireDate === "string"
                  ? form.hireDate
                  : new Date(form.hireDate).toISOString().split("T")[0];
              if (
                hireDateStr &&
                hireDateStr.length === 10 &&
                fromDateStr < hireDateStr
              ) {
                return false;
              }
            }
            return true;
          } catch (error) {
            return false;
          }
        })();

        return (
          hasReviewType &&
          hasJobKnowledgeScores &&
          hasBasicInfo &&
          hasValidCoverageDates
        );
      case 2: // Quality of Work
        // Check if evaluator is HO
        const isEvaluatorHO = () => {
          if (!user?.branches) return false;
          
          // Handle branches as array
          if (Array.isArray(user.branches)) {
            const branch = user.branches[0];
            if (branch) {
              const branchName = branch.branch_name?.toUpperCase() || "";
              const branchCode = branch.branch_code?.toUpperCase() || "";
              return (
                branchName === "HO" || 
                branchCode === "HO" || 
                branchName.includes("HEAD OFFICE") ||
                branchCode.includes("HEAD OFFICE") ||
                branchName === "HEAD OFFICE" ||
                branchCode === "HEAD OFFICE"
              );
            }
          }
          
          // Handle branches as object
          if (typeof user.branches === 'object') {
            const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
            const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
            return (
              branchName === "HO" || 
              branchCode === "HO" || 
              branchName.includes("HEAD OFFICE") ||
              branchCode.includes("HEAD OFFICE") ||
              branchName === "HEAD OFFICE" ||
              branchCode === "HEAD OFFICE"
            );
          }
          
          return false;
        };
        
        const isHO = isEvaluatorHO();
        
        return (
          form.qualityOfWorkScore1 &&
          form.qualityOfWorkScore1 !== 0 &&
          form.qualityOfWorkScore2 &&
          form.qualityOfWorkScore2 !== 0 &&
          form.qualityOfWorkScore3 &&
          form.qualityOfWorkScore3 !== 0 &&
          form.qualityOfWorkScore4 &&
          form.qualityOfWorkScore4 !== 0 &&
          // qualityOfWorkScore5 is only required if not HO
          (isHO || (form.qualityOfWorkScore5 && form.qualityOfWorkScore5 !== 0))
        );
      case 3: // Adaptability
        return (
          form.adaptabilityScore1 &&
          form.adaptabilityScore1 !== 0 &&
          form.adaptabilityScore2 &&
          form.adaptabilityScore2 !== 0 &&
          form.adaptabilityScore3 &&
          form.adaptabilityScore3 !== 0
        );
      case 4: // Teamwork
        return (
          form.teamworkScore1 &&
          form.teamworkScore1 !== 0 &&
          form.teamworkScore2 &&
          form.teamworkScore2 !== 0 &&
          form.teamworkScore3 &&
          form.teamworkScore3 !== 0
        );
      case 5: // Reliability
        return (
          form.reliabilityScore1 &&
          form.reliabilityScore1 !== 0 &&
          form.reliabilityScore2 &&
          form.reliabilityScore2 !== 0 &&
          form.reliabilityScore3 &&
          form.reliabilityScore3 !== 0 &&
          form.reliabilityScore4 &&
          form.reliabilityScore4 !== 0
        );
      case 6: // Ethical & Professional Behavior
        return (
          form.ethicalScore1 &&
          form.ethicalScore1 !== 0 &&
          form.ethicalScore2 &&
          form.ethicalScore2 !== 0 &&
          form.ethicalScore3 &&
          form.ethicalScore3 !== 0 &&
          form.ethicalScore4 &&
          form.ethicalScore4 !== 0
        );
      case 7: // Customer Service
        // Check if evaluator is HO - Step 7 is not applicable for HO
        const isEvaluatorHO_Step7 = () => {
          if (!user?.branches) return false;
          
          // Handle branches as array
          if (Array.isArray(user.branches)) {
            const branch = user.branches[0];
            if (branch) {
              const branchName = branch.branch_name?.toUpperCase() || "";
              const branchCode = branch.branch_code?.toUpperCase() || "";
              return (
                branchName === "HO" || 
                branchCode === "HO" || 
                branchName.includes("HEAD OFFICE") ||
                branchCode.includes("HEAD OFFICE") ||
                branchName === "HEAD OFFICE" ||
                branchCode === "HEAD OFFICE"
              );
            }
          }
          
          // Handle branches as object
          if (typeof user.branches === 'object') {
            const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
            const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
            return (
              branchName === "HO" || 
              branchCode === "HO" || 
              branchName.includes("HEAD OFFICE") ||
              branchCode.includes("HEAD OFFICE") ||
              branchName === "HEAD OFFICE" ||
              branchCode === "HEAD OFFICE"
            );
          }
          
          return false;
        };
        
        const isHO_Step7 = isEvaluatorHO_Step7();
        
        // Step 7 is always valid for HO evaluators (not applicable)
        if (isHO_Step7) {
          return true;
        }
        
        // For non-HO evaluators, require all customer service scores
        return (
          form.customerServiceScore1 &&
          form.customerServiceScore1 !== 0 &&
          form.customerServiceScore2 &&
          form.customerServiceScore2 !== 0 &&
          form.customerServiceScore3 &&
          form.customerServiceScore3 !== 0 &&
          form.customerServiceScore4 &&
          form.customerServiceScore4 !== 0 &&
          form.customerServiceScore5 &&
          form.customerServiceScore5 !== 0
        );
      case 8: // Overall Assessment
        return true; // No validation required for step 8
      default:
        return true; // For other steps, allow progression
    }
  };

  // Get step name for tooltip
  const getStepName = () => {
    switch (currentStep) {
      case 1:
        return "Employee Information & Job Knowledge";
      case 2:
        return "Quality of Work";
      case 3:
        return "Adaptability";
      case 4:
        return "Teamwork";
      case 5:
        return "Reliability";
      case 6:
        return "Ethical & Professional Behavior";
      case 7:
        return "Customer Service";
      case 8:
        return "Overall Assessment";
      default:
        return "evaluation";
    }
  };

  // Get validation message for incomplete steps
  const getValidationMessage = () => {
    switch (currentStep) {
      case 1: // Employee Information & Job Knowledge
        if (
          !form.reviewTypeProbationary &&
          !form.reviewTypeRegular &&
          !form.reviewTypeOthersImprovement &&
          (!form.reviewTypeOthersCustom ||
            form.reviewTypeOthersCustom.trim() === "")
        ) {
          return "Please select at least one review type";
        }

        if (!form.coverageFrom || form.coverageFrom === "") {
          return "Please select Performance Coverage 'From' date";
        }
        if (!form.coverageTo || form.coverageTo === "") {
          return "Please select Performance Coverage 'To' date";
        }
        // Check if coverage dates are valid (coverageFrom must be before coverageTo and not before hireDate)
        if (form.coverageFrom && form.coverageTo) {
          try {
            // Convert to date strings in YYYY-MM-DD format for reliable comparison
            const fromDateStr =
              typeof form.coverageFrom === "string"
                ? form.coverageFrom
                : new Date(form.coverageFrom).toISOString().split("T")[0];
            const toDateStr =
              typeof form.coverageTo === "string"
                ? form.coverageTo
                : new Date(form.coverageTo).toISOString().split("T")[0];

            if (
              fromDateStr &&
              toDateStr &&
              fromDateStr.length === 10 &&
              toDateStr.length === 10
            ) {
              // Check if fromDate is before toDate (string comparison works for YYYY-MM-DD format)
              if (fromDateStr >= toDateStr) {
                return "Performance Coverage 'From' date must be earlier than 'To' date";
              }
              // Check if coverageFrom is before date hired
              if (form.hireDate) {
                const hireDateStr =
                  typeof form.hireDate === "string"
                    ? form.hireDate
                    : new Date(form.hireDate).toISOString().split("T")[0];
                if (
                  hireDateStr &&
                  hireDateStr.length === 10 &&
                  fromDateStr < hireDateStr
                ) {
                  return "Performance Coverage cannot start before Date Hired";
                }
              }
            }
          } catch (error) {
            return "Please enter valid Performance Coverage dates";
          }
        }
        if (
          !form.jobKnowledgeScore1 ||
          form.jobKnowledgeScore1 === 0 ||
          !form.jobKnowledgeScore2 ||
          form.jobKnowledgeScore2 === 0 ||
          !form.jobKnowledgeScore1 ||
          form.jobKnowledgeScore3 === 0
        ) {
          return "Please complete all job knowledge scores";
        }

        return "Please complete all required fields";
      case 8: // Overall Assessment
        return "Please complete all required fields";
      default:
        return "Please complete all scores for this step";
    }
  };

  const nextStep = () => {
    // Move to next step in filtered steps array
    if (currentStep < filteredSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Move to previous step
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Direct submission - no modal needed
    confirmSubmit();
  };

  const handleCloseAfterSubmission = () => {
    // Close the modal after successful submission
    if (onCloseAction) {
      onCloseAction();
    }
  };


  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Close the main evaluation modal
    if (onCloseAction) {
      onCloseAction();
    }
  };

  // submission confirmation
  const confirmSubmit = async () => {
    try {
      const empID = employee?.id;
      if (empID) {
        // Check if evaluator's branch is HO (Head Office)
        const isEvaluatorHO = () => {
          if (!user?.branches) return false;
          
          // Handle branches as array
          if (Array.isArray(user.branches)) {
            const branch = user.branches[0];
            if (branch) {
              const branchName = branch.branch_name?.toUpperCase() || "";
              const branchCode = branch.branch_code?.toUpperCase() || "";
              return (
                branchName === "HO" || 
                branchCode === "HO" || 
                branchName.includes("HEAD OFFICE") ||
                branchCode.includes("HEAD OFFICE") ||
                branchName === "HEAD OFFICE" ||
                branchCode === "HEAD OFFICE"
              );
            }
          }
          
          // Handle branches as object
          if (typeof user.branches === 'object') {
            const branchName = (user.branches as any)?.branch_name?.toUpperCase() || "";
            const branchCode = (user.branches as any)?.branch_code?.toUpperCase() || "";
            return (
              branchName === "HO" || 
              branchCode === "HO" || 
              branchName.includes("HEAD OFFICE") ||
              branchCode.includes("HEAD OFFICE") ||
              branchName === "HEAD OFFICE" ||
              branchCode === "HEAD OFFICE"
            );
          }
          
          return false;
        };
        
        // Check if evaluator is Area Manager
        const isAreaManager = () => {
          if (!user?.positions) return false;
          
          // Get position name from various possible fields
          const positionName = (
            user.positions?.label || 
            user.positions?.name || 
            (user as any).position ||
            ""
          ).toLowerCase().trim();
          
          // Check if position is Area Manager
          return (
            positionName === "area manager" ||
            positionName.includes("area manager")
          );
        };
        
        const isHO = isEvaluatorHO();
        const isAreaMgr = isAreaManager();
        
        // Use appropriate API endpoint based on branch, position, and evaluation type
        if (isHO && isAreaMgr) {
          // Head Office Area Manager - use Branch endpoints
          if (evaluationType === 'rankNfile') {
            const response = await apiService.postBranchRankNFile(empID, form);
          } else if (evaluationType === 'basic') {
            const response = await apiService.postBranchBasic(empID, form);
          } else {
            // Default evaluation for HO Area Manager - use standard createSubmission endpoint
            const response = await apiService.createSubmission(empID, form);
          }
        } else if (isHO) {
          // Head Office evaluator (not Area Manager) - use HO endpoints
          if (evaluationType === 'rankNfile') {
            const response = await apiService.postHoRankNFile(empID, form);
          } else if (evaluationType === 'basic') {
            const response = await apiService.postHoBasic(empID, form);
          } else {
            // Default evaluation for HO - use standard createSubmission endpoint
            const response = await apiService.createSubmission(empID, form);
          }
        } else {
          // Branch evaluator (not Head Office) - use Branch endpoints
          if (evaluationType === 'rankNfile') {
            const response = await apiService.postBranchRankNFile(empID, form);
          } else if (evaluationType === 'basic') {
            const response = await apiService.postBranchBasic(empID, form);
          } else {
            // Default evaluation for branch - use BranchBasic endpoint
            const response = await apiService.postBranchBasic(empID, form);
          }
        }
      }
      setShowSuccessDialog(true);
    } catch (clientError) {
      console.log(
        "Client data service storage failed, but localStorage storage succeeded:",
        clientError
      );
    }
  };



    // Get current step info
    const currentStepInfo = currentStep > 0 ? filteredSteps[currentStep - 1] : null;
    const isLastStep = currentStep === filteredSteps.length;
    // Check if current step is Overall Assessment (any variant)
    const isOverallAssessmentStep = isLastStep || 
      (currentStep > 0 && filteredSteps[currentStep - 1]?.title === "Overall Assessment");
    
    // Get the current step component for rendering
    const getCurrentStepComponent = () => {
      if (currentStep === 0) return WelcomeStep;
      const stepIndex = currentStep - 1;
      return filteredSteps[stepIndex]?.component || WelcomeStep;
    };

  return (
    <>
      <style jsx>{`
        @keyframes dialogPopup {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes successBounce {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .check-animation {
          animation: drawCheck 0.6s ease-in-out 0.3s forwards;
        }

        .success-dialog {
          animation: successBounce 0.5s ease-out;
        }

        .success-message {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            background-color: rgb(240 253 244);
          }
          50% {
            background-color: rgb(220 252 231);
          }
        }

        @keyframes welcomePopup {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.02) translateY(-5px);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .welcome-step-animate {
          animation: welcomePopup 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        /* Ensure animation works even inside containers */
        .evaluation-container .welcome-step-animate {
          animation: welcomePopup 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          transform-origin: center;
        }
      `}</style>
      <div className="max-h-[95vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-y-auto">
        <div className="w-full mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Step Numbers Indicator */}
            {currentStep > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center">
                      {filteredSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                          {/* Step Circle */}
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 relative z-10 ${
                              index + 1 === currentStep
                                ? "bg-blue-500 text-white shadow-md scale-110"
                                : index + 1 < currentStep
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {index === filteredSteps.length - 1 ? "End" : step.id}
                          </div>

                          {/* Connecting Line */}
                          {index < filteredSteps.length - 1 && (
                            <div className="w-16 h-1 mx-2 relative">
                              <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                              <div
                                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                  index + 1 < currentStep
                                    ? "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                                style={{
                                  width:
                                    index + 1 < currentStep ? "100%" : "0%",
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      {isOverallAssessmentStep 
                        ? `End of ${filteredSteps.length} steps: ${currentStepInfo?.title || "Overall Assessment"}`
                        : `Step ${currentStep} of ${filteredSteps.length}: ${currentStepInfo?.title || "Welcome"}`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step Content */}
            {currentStep === 0 ? (
              <Card
                key={`welcome-${welcomeAnimationKey}`}
                className="welcome-step-animate"
              >
                <CardContent>
                  <WelcomeStep
                    data={form}
                    updateDataAction={updateDataAction}
                    employee={employee}
                    onStartAction={startEvaluation}
                    onBackAction={onCloseAction}
                    evaluationType={evaluationType}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {isOverallAssessmentStep ? "End" : currentStep}
                    </span>
                    {currentStepInfo?.title || "Step"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStep === 0 ? (
                    <WelcomeStep
                      data={form}
                      updateDataAction={updateDataAction}
                      employee={employee}
                      onStartAction={startEvaluation}
                      onBackAction={onCloseAction}
                      evaluationType={evaluationType}
                    />
                  ) : (() => {
                    const stepIndex = currentStep - 1;
                    const step = filteredSteps[stepIndex];
                    if (!step) return null;
                    const StepComponent = step.component;
                    
                    // For Overall Assessment steps, pass additional props
                    if (isOverallAssessmentStep) {
                      return (
                        <StepComponent
                          data={form}
                          updateDataAction={updateDataAction}
                          employee={employee}
                          onSubmitAction={handleSubmit}
                          onPreviousAction={prevStep}
                          onCloseAction={handleCloseAfterSubmission}
                        />
                      );
                    }
                    
                    // For regular steps - pass evaluationType if StepComponent accepts it
                    const stepProps: any = {
                      data: form,
                      updateDataAction: updateDataAction,
                      employee: employee,
                    };
                    // Pass evaluationType to Step1 and Step2 (and potentially other steps that need it)
                    if (step.id === 1 || step.id === 2) {
                      stepProps.evaluationType = evaluationType;
                    }
                    return <StepComponent {...stepProps} />;
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons - Only show for steps before Overall Assessment */}
            {currentStep > 0 && !isOverallAssessmentStep && (
              <div className="flex justify-between mt-6">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 cursor-pointer bg-blue-500 text-white hover:scale-110 transition-transform duration-200 hover:bg-blue-500 hover:text-white"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCancelDialog(true);
                    }}
                    className="px-6 text-red-600 bg-red-500 text-white border-red-300 hover:bg-red-500 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
                  >
                    Cancel Evaluation
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <TooltipProvider>
                    {currentStep >= 1 &&
                    !isOverallAssessmentStep &&
                    !isCurrentStepComplete() ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              // Button is disabled, do nothing
                            }}
                            className="px-6 opacity-50 cursor-not-allowed"
                          >
                            Next
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getValidationMessage()}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={nextStep}
                            className="px-6 bg-blue-500 text-white hover:bg-green-600 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
                          >
                            Next
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Proceed to the next step</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Evaluation Dialog */}
      <Dialog open={showCancelDialog} onOpenChangeAction={setShowCancelDialog}>
        <DialogContent
          className="max-w-md m-8"
          style={{
            animation: "dialogPopup 0.3s ease-out",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Evaluation
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 bg-red-50 p-4 mx-2 my-2">
            <p className="text-gray-600">
              Are you sure you want to cancel this evaluation? All progress will
              be lost and cannot be recovered.
            </p>
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCancelDialog(false);
              }}
              className="px-4 bg-blue-500 text-white hover:bg-blue-600 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
            >
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelling}
              className={`px-4 flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200
    ${isCancelling ? "opacity-70 cursor-not-allowed" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsCancelling(true);

                try {
                  setShowCancelDialog(false);

                  if (onCancelAction) {
                    onCancelAction();
                  } else if (onCloseAction) {
                    onCloseAction();
                  }

                  setForm({
                    hireDate: "",
                    rating: 0,
                    coverageFrom: "",
                    coverageTo: "",
                    reviewTypeProbationary: "",
                    reviewTypeRegular: "",
                    reviewTypeOthersImprovement: false,
                    reviewTypeOthersCustom: "",
                    priorityArea1: "",
                    priorityArea2: "",
                    priorityArea3: "",
                    remarks: "",
                    jobKnowledgeScore1: 0,
                    jobKnowledgeScore2: 0,
                    jobKnowledgeScore3: 0,
                    jobKnowledgeComments1: "",
                    jobKnowledgeComments2: "",
                    jobKnowledgeComments3: "",
                    qualityOfWorkScore1: 0,
                    qualityOfWorkScore2: 0,
                    qualityOfWorkScore3: 0,
                    qualityOfWorkScore4: 0,
                    qualityOfWorkScore5: 0,
                    qualityOfWorkScore6: 0,
                    qualityOfWorkScore7: 0,
                    qualityOfWorkScore8: 0,
                    qualityOfWorkScore9: 0,
                    qualityOfWorkScore10: 0,
                    qualityOfWorkScore11: 0,
                    qualityOfWorkComments1: "",
                    qualityOfWorkComments2: "",
                    qualityOfWorkComments3: "",
                    qualityOfWorkComments4: "",
                    qualityOfWorkComments5: "",
                    qualityOfWorkComments6: "",
                    qualityOfWorkComments7: "",
                    qualityOfWorkComments8: "",
                    qualityOfWorkComments9: "",
                    qualityOfWorkComments10: "",
                    qualityOfWorkComments11: "",
                    adaptabilityScore1: 0,
                    adaptabilityScore2: 0,
                    adaptabilityScore3: 0,
                    adaptabilityComments1: "",
                    adaptabilityComments2: "",
                    adaptabilityComments3: "",
                    teamworkScore1: 0,
                    teamworkScore2: 0,
                    teamworkScore3: 0,
                    teamworkComments1: "",
                    teamworkComments2: "",
                    teamworkComments3: "",
                    reliabilityScore1: 0,
                    reliabilityScore2: 0,
                    reliabilityScore3: 0,
                    reliabilityScore4: 0,
                    reliabilityComments1: "",
                    reliabilityComments2: "",
                    reliabilityComments3: "",
                    reliabilityComments4: "",
                    ethicalScore1: 0,
                    ethicalScore2: 0,
                    ethicalScore3: 0,
                    ethicalScore4: 0,
                    ethicalExplanation1: "",
                    ethicalExplanation2: "",
                    ethicalExplanation3: "",
                    ethicalExplanation4: "",
                    customerServiceScore1: 0,
                    customerServiceScore2: 0,
                    customerServiceScore3: 0,
                    customerServiceScore4: 0,
                    customerServiceScore5: 0,
                    customerServiceExplanation1: "",
                    customerServiceExplanation2: "",
                    customerServiceExplanation3: "",
                    customerServiceExplanation4: "",
                    customerServiceExplanation5: "",
                    managerialSkillsScore1: 0,
                    managerialSkillsScore2: 0,
                    managerialSkillsScore3: 0,
                    managerialSkillsScore4: 0,
                    managerialSkillsScore5: 0,
                    managerialSkillsScore6: 0,
                    managerialSkillsExplanation1: "",
                    managerialSkillsExplanation2: "",
                    managerialSkillsExplanation3: "",
                    managerialSkillsExplanation4: "",
                    managerialSkillsExplanation5: "",
                    managerialSkillsExplanation6: "",
                    created_at: "",
                  });
                } finally {
                  setIsCancelling(false);
                }
              }}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Evaluation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onOpenChangeAction={setShowSuccessDialog}
      >
        <DialogContent
          className="max-w-md m-8 success-dialog"
          style={{
            animation: "dialogPopup 0.3s ease-out",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 check-animation"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    strokeDasharray: "20",
                    strokeDashoffset: "20",
                    animation: "drawCheck 0.6s ease-in-out 0.3s forwards",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              Evaluation Submitted Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-green-50 p-4 rounded-lg mb-4 success-message">
              <p className="text-gray-700 text-center">
                🎉 Your evaluation has been submitted successfully!
                <br />
                The employee can now view their results in their dashboard.
              </p>
            </div>
            <div className="text-sm text-gray-600 text-center">
              <p>
                <strong>Employee:</strong>{" "}
                {employee?.fname + " " + employee?.lname}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={handleSuccessDialogClose}
              className="px-8 py-2 bg-red-600 text-white hover:bg-red-700 hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
