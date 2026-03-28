/**
 * Utility functions for branch name normalization and matching
 */

/**
 * Normalizes a branch name to handle variations (spaces, hyphens, case)
 * @param branchName - The branch name to normalize
 * @returns Array of normalized variations of the branch name
 */
export function normalizeBranchName(branchName: string): string[] {
  const trimmed = branchName.trim().toLowerCase();
  const variations = [
    trimmed,
    trimmed.replace(/\s+/g, '-'),
    trimmed.replace(/-/g, ' '),
    trimmed.replace(/\s+/g, ''),
  ];
  return [...new Set(variations)]; // Remove duplicates
}

/**
 * Parses comma-separated branch names and returns all normalized variations
 * @param branchesString - Comma-separated branch names (e.g., "Cebu Branch, Manila Branch")
 * @returns Array of all normalized branch name variations
 */
export function parseAndNormalizeBranches(branchesString: string): string[] {
  const branches = branchesString.split(',').map(b => b.trim());
  const allVariations: string[] = [];
  
  branches.forEach(branch => {
    const variations = normalizeBranchName(branch);
    allVariations.push(...variations);
  });
  
  return [...new Set(allVariations)]; // Remove duplicates
}

/**
 * Checks if an employee's branch matches any of the assigned branches
 * @param employeeBranch - The employee's branch name
 * @param assignedBranches - Array of normalized assigned branch variations
 * @returns true if the employee's branch matches any assigned branch
 */
export function matchesBranch(employeeBranch: string, assignedBranches: string[]): boolean {
  const normalizedEmployee = normalizeBranchName(employeeBranch);
  
  return assignedBranches.some(assignedBranch => {
    return normalizedEmployee.some(empVariation => {
      return empVariation === assignedBranch ||
             empVariation.includes(assignedBranch) ||
             assignedBranch.includes(empVariation);
    });
  });
}

