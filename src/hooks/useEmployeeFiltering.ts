import { useMemo } from 'react';
import { parseAndNormalizeBranches, matchesBranch } from '@/lib/branchUtils';

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  branch?: string;
  role: string;
  isActive: boolean;
}

interface UseEmployeeFilteringOptions {
  currentUser?: {
    position?: string;
    branch?: string;
  } | null;
  employees: Employee[];
  searchQuery?: string;
  selectedDepartment?: string;
}

/**
 * Custom hook for filtering employees based on user role and branch assignments
 * Handles:
 * - Area Managers: Shows only branch heads/managers from assigned branches
 * - Branch Managers: Shows only employees from assigned branches
 * - Other evaluators: Shows all employees
 */
export function useEmployeeFiltering({
  currentUser,
  employees,
  searchQuery = '',
  selectedDepartment = '',
}: UseEmployeeFilteringOptions) {
  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isAreaManager = currentUser?.position?.toLowerCase().includes('area manager');
    const isBranchManager = currentUser?.position?.toLowerCase().includes('branch manager') ||
                           currentUser?.position?.toLowerCase().includes('branch head');

    // Get assigned branches for area manager or branch manager
    let assignedBranches: string[] = [];
    if ((isAreaManager || isBranchManager) && currentUser?.branch) {
      assignedBranches = parseAndNormalizeBranches(currentUser.branch);
    }

    return employees.filter((employee) => {
      // Only show active employees
      if (!employee.isActive) return false;

      // Area Manager filtering: only show branch heads/managers
      if (isAreaManager) {
        const position = (employee.position || '').toLowerCase();
        const isBranchHead = position.includes('branch head') ||
                            position.includes('branchhead') ||
                            position.includes('branch manager');

        if (!isBranchHead) return false;

        // Filter by assigned branches if area manager has branches assigned
        if (assignedBranches.length > 0) {
          if (!matchesBranch(employee.branch || '', assignedBranches)) {
            return false;
          }
        }
      } else {
        // For non-area managers, only show employees (not admins, managers, etc.)
        if (employee.role !== 'employee') return false;

        // Branch Manager filtering: only show employees from assigned branches
        if (isBranchManager && assignedBranches.length > 0) {
          if (!matchesBranch(employee.branch || '', assignedBranches)) {
            return false;
          }
        }
      }

      // Search filter
      if (normalizedQuery) {
        const matchesSearch =
          employee.name.toLowerCase().includes(normalizedQuery) ||
          employee.email.toLowerCase().includes(normalizedQuery) ||
          employee.position.toLowerCase().includes(normalizedQuery) ||
          employee.department.toLowerCase().includes(normalizedQuery) ||
          employee.role.toLowerCase().includes(normalizedQuery);

        if (!matchesSearch) return false;
      }

      // Department filter
      if (selectedDepartment && employee.department !== selectedDepartment) {
        return false;
      }

      return true;
    });
  }, [currentUser, employees, searchQuery, selectedDepartment]);

  return filteredEmployees;
}

