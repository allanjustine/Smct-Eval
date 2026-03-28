"use client";

import EvaluationForm from "./index";
import { branchEvaluationSteps } from "./configs";
import { User } from "../../contexts/UserContext";

interface BranchEvaluationFormProps {
  branch?: {
    id: number;
    name: string;
    branchCode?: string;
    location?: string;
  } | null;
  employee?: User | null;
  onCloseAction?: () => void;
  onCancelAction?: () => void;
  evaluationType?: 'rankNfile' | 'basic' | 'default';
}

export default function BranchEvaluationForm({
  branch,
  employee,
  onCloseAction,
  onCancelAction,
  evaluationType = 'default',
}: BranchEvaluationFormProps) {
  // For branch evaluations, you can customize the employee data
  // or create a branch-specific user object if needed
  // This is a template that can be extended based on your branch evaluation requirements

  return (
    <EvaluationForm
      employee={employee}
      onCloseAction={onCloseAction}
      onCancelAction={onCancelAction}
      steps={branchEvaluationSteps}
      evaluationType={evaluationType}
    />
  );
}

