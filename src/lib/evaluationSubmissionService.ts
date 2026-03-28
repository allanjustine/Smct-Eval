// src/lib/evaluationSubmissionService.ts

import { EvaluationPayload } from '@/components/evaluation/types';

interface SubmissionPayload {
  evaluationData: EvaluationPayload & {
    employeeId?: string;
    employeeName?: string;
    employeeEmail?: string;
  };
  evaluatorName: string;
  evaluatorId: string;
  submittedAt: string;
  recipients: {
    employee: {
      id: string;
      name: string;
      email: string;
    };
    hr: {
      id: string;
      name: string;
      email: string;
    };
    admin: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface SubmissionResult {
  id: string;
  submissionId: string;
  status: 'success' | 'error';
  message: string;
  submittedAt: string;
  recipients: string[];
  evaluationData: EvaluationPayload & {
    employeeId?: string;
    employeeName?: string;
    employeeEmail?: string;
  };
}

const MOCK_SUBMISSIONS_STORAGE_KEY = 'mockEvaluationSubmissions';

// Helper to get current mock submissions from localStorage
const getMockSubmissions = (): SubmissionResult[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(MOCK_SUBMISSIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save mock submissions to localStorage
const saveMockSubmissions = (submissions: SubmissionResult[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  }
};

// Helper to get user info from localStorage
const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('authenticatedUser');
  return stored ? JSON.parse(stored) : null;
};

export const submitEvaluation = async (
  evaluationData: EvaluationPayload & {
    employeeId?: string;
    employeeName?: string;
    employeeEmail?: string;
  },
  evaluatorName: string
): Promise<SubmissionResult> => {
  console.log('Mock API Call: Submitting evaluation with data:', evaluationData);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate success or failure (100% success rate for development)
  const isSuccess = true; // Math.random() > 0.05; // Uncomment for 95% success rate

  if (!isSuccess) {
    throw new Error('Mock API Error: Failed to submit evaluation. Please try again.');
  }

  const currentUser = getCurrentUser();
  const submissionId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payload: SubmissionPayload = {
    evaluationData,
    evaluatorName,
    evaluatorId: currentUser?.id || 'unknown',
    submittedAt: new Date().toISOString(),
    recipients: {
      employee: {
        id: evaluationData.employeeId || 'emp_001',
        name: evaluationData.employeeName || 'Employee Name',
        email: evaluationData.employeeEmail || 'employee@company.com'
      },
      hr: {
        id: 'hr_001',
        name: 'HR Department',
        email: 'hr@company.com'
      },
      admin: {
        id: 'admin_001',
        name: 'Administrator',
        email: 'admin@company.com'
      }
    }
  };

  const result: SubmissionResult = {
    id: `submission_${Date.now()}`,
    submissionId,
    status: 'success',
    message: 'Evaluation submitted successfully to employee, HR, and admin',
    submittedAt: payload.submittedAt,
    recipients: [
      payload.recipients.employee.email,
      payload.recipients.hr.email,
      payload.recipients.admin.email
    ],
    evaluationData
  };

  // Save to mock storage
  const currentSubmissions = getMockSubmissions();
  currentSubmissions.push(result);
  saveMockSubmissions(currentSubmissions);

  console.log('Mock API Call: Evaluation submitted successfully:', result);
  
  // Simulate sending notifications to recipients
  console.log('📧 Mock notifications sent to:');
  console.log(`  - Employee: ${payload.recipients.employee.email}`);
  console.log(`  - HR: ${payload.recipients.hr.email}`);
  console.log(`  - Admin: ${payload.recipients.admin.email}`);

  return result;
};

export const getSubmissionStatus = async (submissionId: string): Promise<SubmissionResult | null> => {
  console.log(`Mock API Call: Getting submission status for: ${submissionId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const submissions = getMockSubmissions();
  return submissions.find(sub => sub.submissionId === submissionId) || null;
};

export const getAllSubmissions = async (): Promise<SubmissionResult[]> => {
  console.log('Mock API Call: Getting all evaluation submissions');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return getMockSubmissions();
};

// TODO: Replace with actual API calls when backend is ready:
/*
export const submitEvaluation = async (
  evaluationData: EvaluationPayload & {
    employeeId?: string;
    employeeName?: string;
    employeeEmail?: string;
  },
  evaluatorName: string
): Promise<SubmissionResult> => {
  const response = await fetch('/api/evaluations/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      evaluationData,
      evaluatorName,
      submittedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
*/
