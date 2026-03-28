// Notification utility functions
// Note: Backend (Laravel) automatically creates notifications for all events
// These functions are kept as no-ops for backward compatibility with existing code

export const createEvaluationNotification = async (employeeName: string, evaluatorName: string, employeeId?: number, employeeEmail?: string) => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

export const createApprovalNotification = async (employeeName: string, approverName: string, approverType: 'employee' | 'evaluator') => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

export const createFullyApprovedNotification = async (employeeName: string) => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

export const createSystemNotification = async (message: string, roles: string[] = ['admin']) => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

export const createWarningNotification = async (message: string, roles: string[] = ['admin']) => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

export const createEmployeeNotification = async (message: string, employeeRole: string = 'employee', tab: string = 'overview') => {
  // Backend handles notification creation automatically
  // No action needed - kept for backward compatibility
};

// Example usage in components:
/*
// When an evaluation is submitted
await createEvaluationNotification('John Smith', 'Sarah Johnson');

// When an evaluation is approved
await createApprovalNotification('John Smith', 'Sarah Johnson');

// System notifications
await createSystemNotification('System maintenance scheduled for tonight');
await createWarningNotification('Database backup failed');

// Employee notifications
await createEmployeeNotification('Your quarterly evaluation is due next week');
*/
