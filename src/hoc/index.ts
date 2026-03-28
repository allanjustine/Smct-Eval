/**
 * Higher-Order Components (HOC) for the application
 * 
 * Import examples:
 * import { withAuth } from '@/hoc';
 * import { withDashboardPage } from '@/hoc';
 */

// Authentication HOCs
export { withAuth, withSimpleAuth } from './withAuth';

// Dashboard HOCs
export { withDashboard, withSimpleDashboard } from './withDashboard';

// Universal Page HOCs
export { 
  withPage, 
  withDashboardPage, 
  withAuthPage, 
  withPublicPage 
} from './withPage';

// Re-export types
export type { WithPageOptions } from './withPage';

