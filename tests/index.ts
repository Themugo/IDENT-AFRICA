/**
 * IDENT AFRICA - Test Suite Exports
 * Comprehensive testing framework for production readiness
 */

// User Tests
export {
  allUserTests,
  userRegistrationTests,
  userLoginTests,
  browseSearchTests,
  aiPlanningTests,
  bookingTests,
  paymentTests,
  reviewTests,
} from './user/user-journey-tests';

// Supplier Tests
export {
  allSupplierTests,
  supplierRegistrationTests,
  supplierApprovalTests,
  listingManagementTests,
  bookingManagementTests,
  earningsTests,
} from './supplier/supplier-journey-tests';

// Admin Tests
export {
  allAdminTests,
  adminAuthTests,
  contentManagementTests,
  supplierManagementTests,
  reportsTests,
  paymentManagementTests,
  systemSettingsTests,
} from './admin/admin-journey-tests';

// Performance Tests
export {
  allPerformanceTests,
  mobileSpeedTests,
  imageLoadingTests,
  databaseQueryTests,
  apiResponseTests,
  loadTests,
} from './performance/performance-tests';

// Integration Tests
export {
  allIntegrationSuites,
  bookingWorkflowTests,
  paymentIntegrationTests,
  supplierWorkflowTests,
  aiPlannerIntegrationTests,
  notificationIntegrationTests,
  securityIntegrationTests,
} from './integration/integration-tests';

// Test Statistics
export const testStatistics = {
  totalUserTests: 16,
  totalSupplierTests: 20,
  totalAdminTests: 26,
  totalPerformanceTests: 22,
  totalIntegrationSuites: 6,
  totalIntegrationTests: 16,
  
  criticalTests: 32,
  highPriorityTests: 45,
  mediumPriorityTests: 20,
  lowPriorityTests: 3,
  
  categories: [
    'Registration',
    'Authentication',
    'Browse',
    'Search',
    'AI Planning',
    'Booking',
    'Payment',
    'Reviews',
    'Approvals',
    'Listings',
    'Earnings',
    'Content',
    'Reports',
    'Settings',
    'Mobile Speed',
    'Image Loading',
    'Database Queries',
    'API Response',
    'Load Testing',
  ],
};

// Run All Tests Function (placeholder for actual test runner)
export async function runAllTests(): Promise<void> {
  console.log('Starting IDENT AFRICA Test Suite...');
  console.log(`Total Tests: ${testStatistics.totalUserTests + testStatistics.totalSupplierTests + testStatistics.totalAdminTests}`);
  console.log('Test execution would run here with actual test framework');
}
