import Step1 from "../Step1";
import Step2 from "../Step2";
import Step3 from "../Step3";
import Step4 from "../Step4";
import Step5 from "../Step5";
import Step6 from "../Step6";
import Step7 from "../Step7";
import OverallAssessmentBranchEval from "../OverallAssessmentBranchEval";
import { EvaluationStepConfig } from "../types";

// Branch evaluation configuration - can be customized for branch-specific evaluations
// Currently uses the same structure as employee evaluation, but can be extended
export const branchEvaluationSteps: EvaluationStepConfig[] = [
  { id: 1, title: "Branch Information / Job Knowledge", component: Step1 },
  { id: 2, title: "Quality of Work", component: Step2 },
  { id: 3, title: "Adaptability", component: Step3 },
  { id: 4, title: "Teamwork", component: Step4 },
  { id: 5, title: "Reliability", component: Step5 },
  { id: 6, title: "Ethical & Professional Behavior", component: Step6 },
  { id: 7, title: "Customer Service", component: Step7 },
  { id: 8, title: "Overall Assessment", component: OverallAssessmentBranchEval },
];

