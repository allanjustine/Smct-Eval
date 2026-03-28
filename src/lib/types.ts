// Shared TypeScript types for the application
// Extracted from clientDataService.ts

export interface Notification {
  id: number;
  notifiable_id: number;
  data: any;
  created_at: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  branch?: string;
  role: string;
  hireDate?: string; // Optional - hire date removed from forms
  avatar?: string | null;
  bio?: string | null;
  contact?: string;
  updatedAt?: string;
  username?: string;
  password?: string;
  isActive?: boolean;
  lastLogin?: string;
  signature?: string;
  approvedDate?: string; // Date when the user was approved
}

export interface EmployeeSearchResult {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  branch?: string;
  role: string;
  hireDate?: string; // Optional - hire date removed from forms
  isActive: boolean;
}

export interface Submission {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  evaluatorId: number;
  evaluatorName: string;
  evaluationData: any;
  status: "pending" | "completed" | "approved";
  period: string;
  overallRating: string;
  submittedAt: string;
  category?: string;
  evaluator?: string;
  // Approval-related properties
  approvalStatus?: string;
  employeeSignature?: string | null;
  employeeApprovedAt?: string | null;
  evaluatorSignature?: string | null;
  evaluatorApprovedAt?: string | null;
  fullyApprovedNotified?: boolean;
}

export interface PendingRegistration {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string; // Required field
  branch?: string; // Made optional
  role: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  signature?: string; // Digital signature as base64 image
  username?: string;
  contact?: string;
  password?: string; // Note: In production, this should be hashed
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  branch?: string;
  avatar?: string;
  bio?: string;
  contact?: string;
  updatedAt?: string;
  signature?: string;
}

export interface Account {
  id: number;
  email: string;
  password: string;
  role: string;
  employeeId?: number;
  username?: string;
  name?: string;
  position?: string;
  department?: string;
  branch?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  contact?: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  signature?: string; // Digital signature as base64 or URL
  availableRoles?: string[]; // Added for role selection modal
}
