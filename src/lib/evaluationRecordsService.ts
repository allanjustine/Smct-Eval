// src/lib/evaluationRecordsService.ts

import { EvaluationPayload } from '@/components/evaluation/types';
import { createApprovalNotification, createFullyApprovedNotification } from './notificationUtils';

export interface EvaluationRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail?: string;
  category: string;
  rating: number;
  submittedAt: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  evaluator: string;
  evaluatorId?: string;
  evaluationData: EvaluationPayload;
  
  // Approval and Signature Data
  employeeSignature?: string;
  employeeSignatureDate?: string;
  employeeApprovedAt?: string;
  employeeApprovedBy?: string;
  
  evaluatorSignature?: string;
  evaluatorSignatureDate?: string;
  evaluatorApprovedAt?: string;
  evaluatorApprovedBy?: string;
  
  // Additional metadata
  quarter?: string;
  year?: number;
  department?: string;
  position?: string;
  branch?: string;
  
  // Approval workflow
  approvalStatus: 'pending' | 'employee_approved' | 'evaluator_approved' | 'fully_approved' | 'rejected';
  approvalHistory?: ApprovalHistoryEntry[];
  
  // Comments and notes
  approvalComments?: string;
  rejectionReason?: string;
  lastModified?: string;
  createdBy?: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: 'submitted' | 'employee_approved' | 'evaluator_approved' | 'rejected' | 'modified';
  performedBy: string;
  performedByEmail: string;
  performedAt: string;
  comments?: string;
  signature?: string;
  metadata?: Record<string, any>;
}

export interface EvaluationRecordSearchParams {
  employeeId?: number;
  employeeName?: string;
  evaluatorId?: string;
  status?: string;
  category?: string;
  department?: string;
  quarter?: string;
  year?: number;
  approvalStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EvaluationRecordStats {
  total: number;
  pending: number;
  completed: number;
  approved: number;
  rejected: number;
  byStatus: Record<string, number>;
  byDepartment: Record<string, number>;
  byQuarter: Record<string, number>;
  byApprovalStatus: Record<string, number>;
}

// In-memory storage for mock data (no localStorage needed with SWR)
let mockEvaluationRecords: EvaluationRecord[] | null = null;
let mockApprovalHistory: ApprovalHistoryEntry[] = [];

// Helper to get current evaluation records (in-memory)
const getEvaluationRecords = (): EvaluationRecord[] => {
  // Return cached data if available
  if (mockEvaluationRecords) {
    return mockEvaluationRecords;
  }
  
  // Initialize with empty array (records will be added through service functions)
  mockEvaluationRecords = [];
  return mockEvaluationRecords;
};

// Helper to save evaluation records (in-memory only)
const saveEvaluationRecords = (records: EvaluationRecord[]) => {
  mockEvaluationRecords = records;
};

// Helper to get approval history (in-memory)
const getApprovalHistory = (): ApprovalHistoryEntry[] => {
  return mockApprovalHistory;
};

// Helper to save approval history (in-memory)
const saveApprovalHistory = (history: ApprovalHistoryEntry[]) => {
  mockApprovalHistory = history;
};

// Helper to get quarter from date
const getQuarterFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

// Get all evaluation records
export const getAllEvaluationRecords = async (): Promise<EvaluationRecord[]> => {
  console.log('Mock API Call: Getting all evaluation records');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const records = getEvaluationRecords();
  console.log(`Mock API Call: Retrieved ${records.length} evaluation records`);
  
  return records;
};

// Get evaluation record by ID
export const getEvaluationRecordById = async (id: number): Promise<EvaluationRecord | null> => {
  console.log(`Mock API Call: Getting evaluation record by ID: ${id}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const records = getEvaluationRecords();
  const record = records.find(rec => rec.id === id);
  
  if (record) {
    console.log(`Mock API Call: Found evaluation record: ${record.employeeName}`);
    return record;
  } else {
    console.log(`Mock API Call: Evaluation record with ID ${id} not found`);
    return null;
  }
};

// Search evaluation records
export const searchEvaluationRecords = async (params: EvaluationRecordSearchParams): Promise<EvaluationRecord[]> => {
  console.log('Mock API Call: Searching evaluation records with params:', params);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const records = getEvaluationRecords();
  
  let filtered = records;
  
  if (params.employeeId) {
    filtered = filtered.filter(rec => rec.employeeId === params.employeeId);
  }
  
  if (params.employeeName) {
    const nameQuery = params.employeeName.toLowerCase();
    filtered = filtered.filter(rec => 
      rec.employeeName.toLowerCase().includes(nameQuery)
    );
  }
  
  if (params.evaluatorId) {
    filtered = filtered.filter(rec => rec.evaluatorId === params.evaluatorId);
  }
  
  if (params.status) {
    filtered = filtered.filter(rec => rec.status === params.status);
  }
  
  if (params.category) {
    filtered = filtered.filter(rec => rec.category === params.category);
  }
  
  if (params.department) {
    filtered = filtered.filter(rec => rec.department === params.department);
  }
  
  if (params.quarter) {
    filtered = filtered.filter(rec => rec.quarter === params.quarter);
  }
  
  if (params.year) {
    filtered = filtered.filter(rec => rec.year === params.year);
  }
  
  if (params.approvalStatus) {
    filtered = filtered.filter(rec => rec.approvalStatus === params.approvalStatus);
  }
  
  if (params.dateFrom) {
    const fromDate = new Date(params.dateFrom);
    filtered = filtered.filter(rec => new Date(rec.submittedAt) >= fromDate);
  }
  
  if (params.dateTo) {
    const toDate = new Date(params.dateTo);
    filtered = filtered.filter(rec => new Date(rec.submittedAt) <= toDate);
  }
  
  console.log(`Mock API Call: Found ${filtered.length} matching evaluation records`);
  return filtered;
};

// Update evaluation record
export const updateEvaluationRecord = async (id: number, updates: Partial<EvaluationRecord>): Promise<EvaluationRecord | null> => {
  console.log(`Mock API Call: Updating evaluation record ${id} with:`, updates);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const records = getEvaluationRecords();
  const recordIndex = records.findIndex(rec => rec.id === id);
  
  if (recordIndex === -1) {
    console.log(`Mock API Call: Evaluation record with ID ${id} not found`);
    return null;
  }
  
  // Update record
  records[recordIndex] = {
    ...records[recordIndex],
    ...updates,
    lastModified: new Date().toISOString()
  };
  
  saveEvaluationRecords(records);
  
  console.log(`Mock API Call: Evaluation record ${id} updated successfully`);
  return records[recordIndex];
};

// Add employee signature approval
export const addEmployeeSignatureApproval = async (
  recordId: number,
  approvalData: {
    employeeSignature: string;
    employeeName: string;
    employeeEmail: string;
    comments?: string;
  }
): Promise<EvaluationRecord | null> => {
  console.log(`Mock API Call: Adding employee signature approval for record ${recordId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const records = getEvaluationRecords();
  const recordIndex = records.findIndex(rec => rec.id === recordId);
  
  if (recordIndex === -1) {
    console.log(`Mock API Call: Evaluation record with ID ${recordId} not found`);
    return null;
  }
  
  const now = new Date().toISOString();
  
  // Update record with employee approval
  records[recordIndex] = {
    ...records[recordIndex],
    employeeSignature: approvalData.employeeSignature,
    employeeSignatureDate: now,
    employeeApprovedAt: now,
    employeeApprovedBy: approvalData.employeeName,
    employeeEmail: approvalData.employeeEmail,
    approvalStatus: 'employee_approved' as const,
    approvalComments: approvalData.comments || records[recordIndex].approvalComments,
    lastModified: now
  };
  
  // Add to approval history
  const history = getApprovalHistory();
  const historyEntry: ApprovalHistoryEntry = {
    id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action: 'employee_approved',
    performedBy: approvalData.employeeName,
    performedByEmail: approvalData.employeeEmail,
    performedAt: now,
    comments: approvalData.comments,
    signature: approvalData.employeeSignature,
    metadata: {
      recordId,
      approvalType: 'employee_signature'
    }
  };
  
  history.push(historyEntry);
  saveApprovalHistory(history);
  
  // Update record's approval history
  records[recordIndex].approvalHistory = history.filter(h => h.metadata?.recordId === recordId);
  
  saveEvaluationRecords(records);
  
  // Create notification for HR and Admin
  try {
    await createApprovalNotification(
      records[recordIndex].employeeName,
      approvalData.employeeName,
      'employee'
    );
  } catch (notificationError) {
    console.warn('Failed to create employee approval notification:', notificationError);
  }
  
  console.log(`Mock API Call: Employee signature approval added for record ${recordId}`);
  return records[recordIndex];
};

// Add evaluator signature approval
export const addEvaluatorSignatureApproval = async (
  recordId: number,
  approvalData: {
    evaluatorSignature: string;
    evaluatorName: string;
    evaluatorEmail: string;
    comments?: string;
  }
): Promise<EvaluationRecord | null> => {
  console.log(`Mock API Call: Adding evaluator signature approval for record ${recordId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const records = getEvaluationRecords();
  const recordIndex = records.findIndex(rec => rec.id === recordId);
  
  if (recordIndex === -1) {
    console.log(`Mock API Call: Evaluation record with ID ${recordId} not found`);
    return null;
  }
  
  const now = new Date().toISOString();
  
  // Update record with evaluator approval
  records[recordIndex] = {
    ...records[recordIndex],
    evaluatorSignature: approvalData.evaluatorSignature,
    evaluatorSignatureDate: now,
    evaluatorApprovedAt: now,
    evaluatorApprovedBy: approvalData.evaluatorName,
    evaluatorId: approvalData.evaluatorEmail,
    approvalStatus: 'fully_approved' as const,
    approvalComments: approvalData.comments || records[recordIndex].approvalComments,
    lastModified: now
  };
  
  // Add to approval history
  const history = getApprovalHistory();
  const historyEntry: ApprovalHistoryEntry = {
    id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action: 'evaluator_approved',
    performedBy: approvalData.evaluatorName,
    performedByEmail: approvalData.evaluatorEmail,
    performedAt: now,
    comments: approvalData.comments,
    signature: approvalData.evaluatorSignature,
    metadata: {
      recordId,
      approvalType: 'evaluator_signature'
    }
  };
  
  history.push(historyEntry);
  saveApprovalHistory(history);
  
  // Update record's approval history
  records[recordIndex].approvalHistory = history.filter(h => h.metadata?.recordId === recordId);
  
  saveEvaluationRecords(records);
  
  // Create notification for HR, Admin, and Employee
  try {
    await createApprovalNotification(
      records[recordIndex].employeeName,
      approvalData.evaluatorName,
      'evaluator'
    );
  } catch (notificationError) {
    console.warn('Failed to create evaluator approval notification:', notificationError);
  }

  // Create fully approved notification since both parties have now approved
  try {
    await createFullyApprovedNotification(records[recordIndex].employeeName);
  } catch (notificationError) {
    console.warn('Failed to create fully approved notification:', notificationError);
  }
  
  console.log(`Mock API Call: Evaluator signature approval added for record ${recordId}`);
  return records[recordIndex];
};

// Get evaluation records statistics
export const getEvaluationRecordsStats = async (): Promise<EvaluationRecordStats> => {
  console.log('Mock API Call: Getting evaluation records statistics');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const records = getEvaluationRecords();
  
  const stats: EvaluationRecordStats = {
    total: records.length,
    pending: records.filter(rec => rec.status === 'pending').length,
    completed: records.filter(rec => rec.status === 'completed').length,
    approved: records.filter(rec => rec.status === 'approved').length,
    rejected: records.filter(rec => rec.status === 'rejected').length,
    byStatus: records.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byDepartment: records.reduce((acc, rec) => {
      const dept = rec.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byQuarter: records.reduce((acc, rec) => {
      const quarter = rec.quarter || 'Unknown';
      acc[quarter] = (acc[quarter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byApprovalStatus: records.reduce((acc, rec) => {
      acc[rec.approvalStatus] = (acc[rec.approvalStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  console.log('Mock API Call: Evaluation records statistics:', stats);
  return stats;
};

// Get approval history for a specific record
export const getApprovalHistoryForRecord = async (recordId: number): Promise<ApprovalHistoryEntry[]> => {
  console.log(`Mock API Call: Getting approval history for record ${recordId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const history = getApprovalHistory();
  const recordHistory = history.filter(h => h.metadata?.recordId === recordId);
  
  console.log(`Mock API Call: Found ${recordHistory.length} approval history entries for record ${recordId}`);
  return recordHistory;
};

// TODO: Replace with actual API calls when backend is ready:
/*
export const getAllEvaluationRecords = async (): Promise<EvaluationRecord[]> => {
  const response = await fetch('/api/evaluation-records');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const addEmployeeSignatureApproval = async (recordId: number, approvalData: any) => {
  const response = await fetch(`/api/evaluation-records/${recordId}/employee-approval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(approvalData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};
*/
