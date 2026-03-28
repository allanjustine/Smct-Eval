// src/lib/quarterUtils.ts

/**
 * Get quarter from evaluation data based on selected review type
 * This is the correct way to determine quarter - from the review type selection, not submission date
 */
export const getQuarterFromEvaluationData = (evaluationData: any): string => {
  if (!evaluationData) return 'Unknown';
  
  // Determine the year from the evaluation data
  // Try to get year from coverage period first, then submission date
  let year = new Date().getFullYear();
  
  if (evaluationData.coverageFrom) {
    year = new Date(evaluationData.coverageFrom).getFullYear();
  } else if (evaluationData.submittedAt) {
    year = new Date(evaluationData.submittedAt).getFullYear();
  }
  
  // Determine quarter from review type selection
  if (evaluationData.reviewTypeRegularQ1) {
    return `Q1 ${year}`;
  }
  if (evaluationData.reviewTypeRegularQ2) {
    return `Q2 ${year}`;
  }
  if (evaluationData.reviewTypeRegularQ3) {
    return `Q3 ${year}`;
  }
  if (evaluationData.reviewTypeRegularQ4) {
    return `Q4 ${year}`;
  }
  
  // If no regular review type is selected, fall back to date-based calculation
  if (evaluationData.submittedAt) {
    const date = new Date(evaluationData.submittedAt);
    const month = date.getMonth() + 1;
    
    if (month >= 1 && month <= 3) return `Q1 ${year}`;
    if (month >= 4 && month <= 6) return `Q2 ${year}`;
    if (month >= 7 && month <= 9) return `Q3 ${year}`;
    if (month >= 10 && month <= 12) return `Q4 ${year}`;
  }
  
  return 'Unknown';
};

/**
 * Get quarter from date (legacy function for backward compatibility)
 * This should only be used when evaluation data is not available
 */
export const getQuarterFromDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    
    if (month >= 1 && month <= 3) return `Q1 ${year}`;
    if (month >= 4 && month <= 6) return `Q2 ${year}`;
    if (month >= 7 && month <= 9) return `Q3 ${year}`;
    if (month >= 10 && month <= 12) return `Q4 ${year}`;
    
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Get quarter color for UI display
 */
export const getQuarterColor = (quarter: string | number | null | undefined) => {
  // Convert to string and handle null/undefined
  const quarterStr = quarter ? String(quarter) : '';
  
  if (!quarterStr) return 'bg-gray-100 text-gray-800';
  
  if (quarterStr.includes('Q1')) return 'bg-blue-100 text-blue-800';
  if (quarterStr.includes('Q2')) return 'bg-green-100 text-green-800';
  if (quarterStr.includes('Q3')) return 'bg-yellow-100 text-yellow-800';
  if (quarterStr.includes('Q4')) return 'bg-purple-100 text-purple-800';
  
  // Handle numeric probationary values (3, 5)
  if (quarterStr === '3' || quarterStr === '5') return 'bg-orange-100 text-orange-800';
  
  return 'bg-gray-100 text-gray-800';
};
