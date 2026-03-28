"use client";

import EvaluationForm from "./index";
import { managerEvaluationSteps } from "./configs";
import { User } from "../../contexts/UserContext";

interface ManagerEvaluationFormProps {
  employee?: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    branch?: string;
    role?: string;
    employeeId?: string;
    hireDate: string;
  } | null;
  onCloseAction?: () => void;
  onCancelAction?: () => void;
}

export default function ManagerEvaluationForm({
  employee,
  onCloseAction,
  onCancelAction,
}: ManagerEvaluationFormProps) {
  // Convert the employee prop to match the User type expected by EvaluationForm
  const convertedEmployee: User | null = employee
    ? {
        id: employee.id,
        fname: employee.name.split(" ")[0] || "",
        lname: employee.name.split(" ").slice(1).join(" ") || "",
        username: employee.email || "",
        contact: 0, // Default value as contact is required
        email: employee.email,
        position_id: 0, // Default value as position_id is required
        positions: { label: employee.position, name: employee.position },
        department_id: "",
        departments: { department_name: employee.department },
        branch_id: "",
        branches: employee.branch ? { branch_name: employee.branch } : undefined,
        roles: employee.role ? [{ name: employee.role }] : undefined,
        emp_id: employee.employeeId,
        is_active: "1",
        notifications: [],
        notification_counts: 0,
        approvedSignatureReset: 0,
        requestSignatureReset: 0,
        date_hired: employee.hireDate,
      } as User
    : null;

  return (
    <EvaluationForm
      employee={convertedEmployee}
      onCloseAction={onCloseAction}
      onCancelAction={onCancelAction}
      steps={managerEvaluationSteps}
      evaluationType="default"
    />
  );
}

