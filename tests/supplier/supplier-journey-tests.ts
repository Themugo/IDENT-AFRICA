/**
 * IDENT AFRICA - Supplier Journey Test Suite
 * Tests for supplier registration, approval, listing management, and earnings
 */

export interface SupplierTest {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  steps: TestStep[];
  expectedResults: string[];
  testData: Record<string, string>;
}

export interface TestStep {
  step: number;
  action: string;
  element: string;
  input?: string;
  waitFor?: string;
}

// =============================================================================
// SUPPLIER REGISTRATION TESTS
// =============================================================================

export const supplierRegistrationTests: SupplierTest[] = [
  {
    id: 'SR-001',
    name: 'Register as Supplier - Complete Profile',
    description: 'Test complete supplier registration flow',
    priority: 'critical',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to supplier registration', element: '/supplier/register' },
      { step: 2, action: 'Enter company name', element: '[name="companyName"]', input: 'Savanna Tours Ltd' },
      { step: 3, action: 'Enter registration number', element: '[name="registrationNumber"]', input: 'REG-2024-001' },
      { step: 4, action: 'Enter email', element: '[name="email"]', input: 'contact@savannatours.com' },
      { step: 5, action: 'Enter phone', element: '[name="phone"]', input: '+254712345678' },
      { step: 6, action: 'Enter address', element: '[name="address"]', input: '123 Safari Road, Nairobi' },
      { step: 7, action: 'Upload license', element: '[name="license"]' },
      { step: 8, action: 'Accept terms', element: '[name="acceptTerms"]' },
      { step: 9, action: 'Submit application', element: '[type="submit"]' },
      { step: 10, action: 'Verify pending status', element: '.application-pending', waitFor: 'visible' },
    ],
    expectedResults: [
      'Registration application submitted',
      'Pending approval status shown',
      'Email confirmation received',
    ],
    testData: {
      companyName: 'Savanna Tours Ltd',
      email: 'contact@savannatours.com',
    },
  },
  {
    id: 'SR-002',
    name: 'Register - Missing Documents',
    description: 'Test registration with missing required documents',
    priority: 'high',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration', element: '/supplier/register' },
      { step: 2, action: 'Fill basic info', element: '[name="companyName"]', input: 'Test Company' },
      { step: 3, action: 'Skip document upload', element: '' },
      { step: 4, action: 'Submit form', element: '[type="submit"]' },
    ],
    expectedResults: [
      'Validation error shown',
      'Document upload required message',
    ],
    testData: {},
  },
  {
    id: 'SR-003',
    name: 'Register - Invalid Business Info',
    description: 'Test registration with invalid business details',
    priority: 'medium',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration', element: '/supplier/register' },
      { step: 2, action: 'Enter invalid registration number', element: '[name="registrationNumber"]', input: '123' },
      { step: 3, action: 'Submit', element: '[type="submit"]' },
    ],
    expectedResults: [
      'Validation error displayed',
    ],
    testData: {},
  },
];

// =============================================================================
// SUPPLIER APPROVAL TESTS
// =============================================================================

export const supplierApprovalTests: SupplierTest[] = [
  {
    id: 'SA-001',
    name: 'Admin Approves Supplier',
    description: 'Test admin approving pending supplier application',
    priority: 'critical',
    category: 'Approval',
    steps: [
      { step: 1, action: 'Login as admin', element: '/admin/login' },
      { step: 2, action: 'Navigate to suppliers', element: '/admin/suppliers' },
      { step: 3, action: 'View pending applications', element: '[data-testid="pending-suppliers"]' },
      { step: 4, action: 'Select supplier', element: '.supplier-pending:first' },
      { step: 5, action: 'Review documents', element: '[data-testid="view-documents"]' },
      { step: 6, action: 'Approve supplier', element: '[data-testid="approve-btn"]' },
      { step: 7, action: 'Confirm approval', element: '[data-testid="confirm-approve"]' },
    ],
    expectedResults: [
      'Supplier status changed to approved',
      'Approval email sent to supplier',
      'Supplier can now login',
    ],
    testData: {},
  },
  {
    id: 'SA-002',
    name: 'Admin Rejects Supplier',
    description: 'Test admin rejecting supplier with reason',
    priority: 'high',
    category: 'Approval',
    steps: [
      { step: 1, action: 'Login as admin', element: '/admin/login' },
      { step: 2, action: 'View pending supplier', element: '/admin/suppliers' },
      { step: 3, action: 'Click reject', element: '[data-testid="reject-btn"]' },
      { step: 4, action: 'Enter rejection reason', element: '[name="reason"]', input: 'Invalid business license' },
      { step: 5, action: 'Confirm rejection', element: '[data-testid="confirm-reject"]' },
    ],
    expectedResults: [
      'Supplier notified of rejection',
      'Rejection reason provided',
    ],
    testData: {},
  },
  {
    id: 'SA-003',
    name: 'Supplier Login After Approval',
    description: 'Test supplier accessing dashboard after approval',
    priority: 'critical',
    category: 'Approval',
    steps: [
      { step: 1, action: 'Navigate to login', element: '/supplier/login' },
      { step: 2, action: 'Enter credentials', element: '[name="email"]', input: 'approved@supplier.com' },
      { step: 3, action: 'Enter password', element: '[name="password"]', input: 'SupplierPass123!' },
      { step: 4, action: 'Submit', element: '[type="submit"]' },
      { step: 5, action: 'Verify dashboard', element: '.supplier-dashboard' },
    ],
    expectedResults: [
      'Login successful',
      'Dashboard accessible',
      'Full features available',
    ],
    testData: {
      email: 'approved@supplier.com',
    },
  },
];

// =============================================================================
// LISTING MANAGEMENT TESTS
// =============================================================================

export const listingManagementTests: SupplierTest[] = [
  {
    id: 'SL-001',
    name: 'Create New Package Listing',
    description: 'Test creating a new safari package',
    priority: 'critical',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Login as supplier', element: '/supplier/login' },
      { step: 2, action: 'Navigate to listings', element: '/supplier/listings' },
      { step: 3, action: 'Click add new', element: '[data-testid="add-listing"]' },
      { step: 4, action: 'Enter package name', element: '[name="packageName"]', input: 'Luxury Serengeti Safari' },
      { step: 5, action: 'Select destination', element: '[name="destination"]', input: 'Serengeti' },
      { step: 6, action: 'Enter description', element: '[name="description"]', input: '5-day luxury safari experience' },
      { step: 7, action: 'Set price', element: '[name="price"]', input: '2500' },
      { step: 8, action: 'Set duration', element: '[name="duration"]', input: '5' },
      { step: 9, action: 'Upload images', element: '[name="images"]' },
      { step: 10, action: 'Set availability', element: '[name="availability"]' },
      { step: 11, action: 'Save draft', element: '[data-testid="save-draft"]' },
    ],
    expectedResults: [
      'Package created as draft',
      'Images uploaded successfully',
      'Listing saved to dashboard',
    ],
    testData: {
      packageName: 'Luxury Serengeti Safari',
      price: '2500',
    },
  },
  {
    id: 'SL-002',
    name: 'Publish Package Listing',
    description: 'Test publishing a draft package',
    priority: 'high',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Navigate to draft listing', element: '/supplier/listings/draft-123' },
      { step: 2, action: 'Click publish', element: '[data-testid="publish-btn"]' },
      { step: 3, action: 'Review listing details', element: '.listing-preview' },
      { step: 4, action: 'Confirm publish', element: '[data-testid="confirm-publish"]' },
    ],
    expectedResults: [
      'Package status changed to published',
      'Package visible to customers',
    ],
    testData: {},
  },
  {
    id: 'SL-003',
    name: 'Update Package Pricing',
    description: 'Test modifying package pricing',
    priority: 'high',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Select package', element: '/supplier/listings/pkg-123' },
      { step: 2, action: 'Click edit', element: '[data-testid="edit-btn"]' },
      { step: 3, action: 'Update price', element: '[name="price"]', input: '2750' },
      { step: 4, action: 'Add price note', element: '[name="priceNote"]', input: 'Peak season pricing' },
      { step: 5, action: 'Save changes', element: '[data-testid="save-changes"]' },
    ],
    expectedResults: [
      'Price updated successfully',
      'Change reflected on listings',
    ],
    testData: {
      newPrice: '2750',
    },
  },
  {
    id: 'SL-004',
    name: 'Manage Package Availability',
    description: 'Test updating package dates and availability',
    priority: 'high',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Open listing', element: '/supplier/listings/pkg-123' },
      { step: 2, action: 'Navigate to availability', element: '[data-testid="availability-tab"]' },
      { step: 3, action: 'Block dates', element: '[name="blockedDates"]' },
      { step: 4, action: 'Update capacity', element: '[name="maxCapacity"]', input: '10' },
      { step: 5, action: 'Save', element: '[data-testid="save-availability"]' },
    ],
    expectedResults: [
      'Availability updated',
      'Blocked dates reflected',
    ],
    testData: {},
  },
  {
    id: 'SL-005',
    name: 'Upload Gallery Images',
    description: 'Test uploading multiple gallery images',
    priority: 'medium',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Open listing editor', element: '/supplier/listings/pkg-123' },
      { step: 2, action: 'Navigate to gallery', element: '[data-testid="gallery-tab"]' },
      { step: 3, action: 'Select multiple images', element: '[name="gallery"]' },
      { step: 4, action: 'Set featured image', element: '[data-testid="set-featured"]' },
      { step: 5, action: 'Reorder images', element: '[data-testid="reorder"]' },
      { step: 6, action: 'Save gallery', element: '[data-testid="save-gallery"]' },
    ],
    expectedResults: [
      'Images uploaded',
      'Gallery order saved',
      'Featured image set',
    ],
    testData: {},
  },
  {
    id: 'SL-006',
    name: 'Archive Package Listing',
    description: 'Test archiving an old package',
    priority: 'medium',
    category: 'Listings',
    steps: [
      { step: 1, action: 'Select listing', element: '/supplier/listings/pkg-123' },
      { step: 2, action: 'Click archive', element: '[data-testid="archive-btn"]' },
      { step: 3, action: 'Confirm archive', element: '[data-testid="confirm-archive"]' },
    ],
    expectedResults: [
      'Package archived',
      'Hidden from customers',
      'Data preserved',
    ],
    testData: {},
  },
];

// =============================================================================
// BOOKING MANAGEMENT TESTS
// =============================================================================

export const bookingManagementTests: SupplierTest[] = [
  {
    id: 'SB-001',
    name: 'Receive New Booking Notification',
    description: 'Test receiving and viewing new booking',
    priority: 'critical',
    category: 'Bookings',
    steps: [
      { step: 1, action: 'Login as supplier', element: '/supplier/login' },
      { step: 2, action: 'Check notifications', element: '.notification-badge' },
      { step: 3, action: 'Open bookings', element: '/supplier/bookings' },
      { step: 4, action: 'View new booking', element: '.booking-new:first' },
    ],
    expectedResults: [
      'Booking notification received',
      'Booking details visible',
      'Customer info shown',
    ],
    testData: {},
  },
  {
    id: 'SB-002',
    name: 'Confirm Booking',
    description: 'Test confirming a pending booking',
    priority: 'critical',
    category: 'Bookings',
    steps: [
      { step: 1, action: 'Open pending booking', element: '/supplier/bookings/bk-123' },
      { step: 2, action: 'Review booking details', element: '.booking-details' },
      { step: 3, action: 'Check availability', element: '[data-testid="check-availability"]' },
      { step: 4, action: 'Confirm booking', element: '[data-testid="confirm-booking"]' },
      { step: 5, action: 'Send confirmation', element: '[data-testid="send-confirmation"]' },
    ],
    expectedResults: [
      'Booking confirmed',
      'Customer notified',
      'Calendar updated',
    ],
    testData: {},
  },
  {
    id: 'SB-003',
    name: 'Reject Booking Request',
    description: 'Test rejecting a booking with reason',
    priority: 'high',
    category: 'Bookings',
    steps: [
      { step: 1, action: 'Open booking', element: '/supplier/bookings/bk-123' },
      { step: 2, action: 'Click reject', element: '[data-testid="reject-btn"]' },
      { step: 3, action: 'Enter reason', element: '[name="reason"]', input: 'Date no longer available' },
      { step: 4, action: 'Confirm rejection', element: '[data-testid="confirm-reject"]' },
    ],
    expectedResults: [
      'Booking rejected',
      'Customer refunded',
      'Reason communicated',
    ],
    testData: {},
  },
  {
    id: 'SB-004',
    name: 'Process Booking Modification',
    description: 'Test handling customer modification request',
    priority: 'medium',
    category: 'Bookings',
    steps: [
      { step: 1, action: 'Open booking with modification', element: '/supplier/bookings/bk-123' },
      { step: 2, action: 'View modification request', element: '.modification-request' },
      { step: 3, action: 'Review proposed changes', element: '.proposed-changes' },
      { step: 4, action: 'Approve modification', element: '[data-testid="approve-mod"]' },
    ],
    expectedResults: [
      'Modification processed',
      'Booking updated',
      'Customer notified',
    ],
    testData: {},
  },
];

// =============================================================================
// EARNINGS AND PAYOUTS TESTS
// =============================================================================

export const earningsTests: SupplierTest[] = [
  {
    id: 'SE-001',
    name: 'View Earnings Dashboard',
    description: 'Test accessing earnings overview',
    priority: 'critical',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'Login as supplier', element: '/supplier/login' },
      { step: 2, action: 'Navigate to earnings', element: '/supplier/earnings' },
      { step: 3, action: 'Verify dashboard loads', element: '.earnings-dashboard' },
    ],
    expectedResults: [
      'Dashboard displays',
      'Total earnings shown',
      'Recent transactions listed',
    ],
    testData: {},
  },
  {
    id: 'SE-002',
    name: 'View Detailed Transaction History',
    description: 'Test viewing individual transaction details',
    priority: 'high',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'Navigate to earnings', element: '/supplier/earnings' },
      { step: 2, action: 'Click transaction', element: '.transaction:first' },
      { step: 3, action: 'View details', element: '.transaction-detail' },
    ],
    expectedResults: [
      'Transaction details displayed',
      'Commission breakdown shown',
      'Booking reference linked',
    ],
    testData: {},
  },
  {
    id: 'SE-003',
    name: 'View Earnings by Period',
    description: 'Test filtering earnings by date range',
    priority: 'medium',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'Open earnings', element: '/supplier/earnings' },
      { step: 2, action: 'Select date range', element: '[name="dateRange"]' },
      { step: 3, action: 'Apply filter', element: '[data-testid="apply-filter"]' },
    ],
    expectedResults: [
      'Filtered results displayed',
      'Summary updated',
    ],
    testData: {},
  },
  {
    id: 'SE-004',
    name: 'Request Payout',
    description: 'Test requesting withdrawal of earnings',
    priority: 'high',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'Navigate to payouts', element: '/supplier/payouts' },
      { step: 2, action: 'Check available balance', element: '.available-balance' },
      { step: 3, action: 'Enter payout amount', element: '[name="amount"]', input: '5000' },
      { step: 4, action: 'Select method', element: '[name="method"]', input: 'bank' },
      { step: 5, action: 'Submit request', element: '[data-testid="request-payout"]' },
    ],
    expectedResults: [
      'Payout request submitted',
      'Balance updated',
      'Confirmation received',
    ],
    testData: {
      amount: '5000',
    },
  },
  {
    id: 'SE-005',
    name: 'View Payout History',
    description: 'Test viewing past payouts',
    priority: 'medium',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'Open payouts section', element: '/supplier/payouts' },
      { step: 2, action: 'Navigate to history', element: '[data-testid="payout-history"]' },
    ],
    expectedResults: [
      'Payout history displayed',
      'Status of each payout shown',
    ],
    testData: {},
  },
  {
    id: 'SE-006',
    name: 'Verify Commission Calculation',
    description: 'Test commission deduction accuracy',
    priority: 'high',
    category: 'Earnings',
    steps: [
      { step: 1, action: 'View transaction', element: '/supplier/earnings/tx-123' },
      { step: 2, action: 'Check gross amount', element: '.gross-amount' },
      { step: 3, action: 'Check commission', element: '.commission' },
      { step: 4, action: 'Verify net amount', element: '.net-amount' },
    ],
    expectedResults: [
      'Commission calculated correctly',
      'Net amount accurate',
      'Commission rate matches agreement',
    ],
    testData: {},
  },
];

// Export all tests
export const allSupplierTests: SupplierTest[] = [
  ...supplierRegistrationTests,
  ...supplierApprovalTests,
  ...listingManagementTests,
  ...bookingManagementTests,
  ...earningsTests,
];

export default allSupplierTests;
