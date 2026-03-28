"use client";

import EvaluationForm from "./index";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step8 from "./Step8";
import OverallAssessmentBasic from "./OverallAssessmentBasic";
import { EvaluationStepConfig } from "./types";
import { User } from "../../contexts/UserContext";

// Basic HO evaluation configuration - Steps 1-6, Step 7 (Managerial Skills), Step 8 (Overall Assessment with Managerial Skills)
// Note: Job Targets (qualityOfWorkScore5) is automatically excluded from Step2 and calculations for HO users
const basicHoSteps: EvaluationStepConfig[] = [
  { id: 1, title: "Employee Information / Job Knowledge", component: Step1 },
  { id: 2, title: "Quality of Work", component: Step2 }, // Job Targets row hidden and excluded from calculations for HO
  { id: 3, title: "Adaptability", component: Step3 },
  { id: 4, title: "Teamwork", component: Step4 },
  { id: 5, title: "Reliability", component: Step5 },
  { id: 6, title: "Ethical & Professional Behavior", component: Step6 },
  { id: 7, title: "Managerial Skills", component: Step8 },
  { id: 8, title: "Overall Assessment", component: OverallAssessmentBasic },
];

interface BasicHoProps {
  employee?: User | null;
  onCloseAction?: () => void;
  onCancelAction?: () => void;
}

export default function BasicHo({
  employee,
  onCloseAction,
  onCancelAction,
}: BasicHoProps) {
  return (
    <EvaluationForm
      employee={employee}
      onCloseAction={onCloseAction}
      onCancelAction={onCancelAction}
      steps={basicHoSteps}
      evaluationType="basic"
    />
  );
}
