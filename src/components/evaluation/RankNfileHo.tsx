"use client";

import EvaluationForm from "./index";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import OverallAssessmentRankNfile from "./OverallAssessmentRankNfile";
import { EvaluationStepConfig } from "./types";
import { User } from "../../contexts/UserContext";

// Rank and File HO evaluation configuration - Steps 1-6, Step 7 (Overall Assessment without Customer Service)
// Note: Job Targets (qualityOfWorkScore5) is automatically excluded from Step2 and calculations for HO users
const rankNfileHoSteps: EvaluationStepConfig[] = [
  { id: 1, title: "Employee Information / Job Knowledge", component: Step1 },
  { id: 2, title: "Quality of Work", component: Step2 }, // Job Targets row hidden and excluded from calculations for HO
  { id: 3, title: "Adaptability", component: Step3 },
  { id: 4, title: "Teamwork", component: Step4 },
  { id: 5, title: "Reliability", component: Step5 },
  { id: 6, title: "Ethical & Professional Behavior", component: Step6 },
  { id: 7, title: "Overall Assessment", component: OverallAssessmentRankNfile },
];

interface RankNfileHoProps {
  employee?: User | null;
  onCloseAction?: () => void;
  onCancelAction?: () => void;
}

export default function RankNfileHo({
  employee,
  onCloseAction,
  onCancelAction,
}: RankNfileHoProps) {
  return (
    <EvaluationForm
      employee={employee}
      onCloseAction={onCloseAction}
      onCancelAction={onCancelAction}
      steps={rankNfileHoSteps}
      evaluationType="rankNfile"
    />
  );
}
