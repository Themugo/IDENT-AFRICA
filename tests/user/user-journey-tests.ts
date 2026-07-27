/**
 * IDENT AFRICA - User Journey Test Suite
 * Tests for customer registration, login, browsing, and booking flows
 */

export interface UserTest {
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

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  duration: number;
  errors: string[];
  screenshots?: string[];
  timestamp: string;
}

// =============================================================================
// USER REGISTRATION TESTS
// =============================================================================

export const userRegistrationTests: UserTest[] = [
  {
    id: 'UR-001',
    name: 'Register New Customer - Valid Data',
    description: 'Test complete user registration with valid data',
    priority: 'critical',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration page', element: '/register' },
      { step: 2, action: 'Click registration button', element: '[data-testid="register-btn"]' },
      { step: 3, action: 'Enter full name', element: '[name="fullName"]', input: 'John Safari' },
      { step: 4, action: 'Enter email', element: '[name="email"]', input: 'john.safari@example.com' },
      { step: 5, action: 'Enter password', element: '[name="password"]', input: 'SecurePass123!' },
      { step: 6, action: 'Confirm password', element: '[name="confirmPassword"]', input: 'SecurePass123!' },
      { step: 7, action: 'Accept terms', element: '[name="acceptTerms"]' },
      { step: 8, action: 'Submit registration', element: '[type="submit"]' },
      { step: 9, action: 'Verify email confirmation sent', element: '.confirmation-message', waitFor: 'visible' },
    ],
    expectedResults: [
      'User account created successfully',
      'Email verification link sent',
      'Redirect to email verification page',
      'Success toast notification displayed',
    ],
    testData: {
      email: 'john.safari@example.com',
      password: 'SecurePass123!',
      fullName: 'John Safari',
    },
  },
  {
    id: 'UR-002',
    name: 'Register - Invalid Email Format',
    description: 'Test registration with invalid email format',
    priority: 'high',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration', element: '/register' },
      { step: 2, action: 'Enter invalid email', element: '[name="email"]', input: 'notanemail' },
      { step: 3, action: 'Trigger validation', element: '[name="email"]', input: '' },
      { step: 4, action: 'Check error message', element: '.error-email', waitFor: 'visible' },
    ],
    expectedResults: [
      'Email validation error displayed',
      'Registration form not submitted',
    ],
    testData: {
      email: 'notanemail',
    },
  },
  {
    id: 'UR-003',
    name: 'Register - Password Too Short',
    description: 'Test registration with password below minimum length',
    priority: 'high',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration', element: '/register' },
      { step: 2, action: 'Enter short password', element: '[name="password"]', input: '123' },
      { step: 3, action: 'Check strength indicator', element: '.password-strength' },
    ],
    expectedResults: [
      'Password strength shows weak',
      'Minimum length error displayed',
    ],
    testData: {
      password: '123',
    },
  },
  {
    id: 'UR-004',
    name: 'Register - Duplicate Email',
    description: 'Test registration with already registered email',
    priority: 'high',
    category: 'Registration',
    steps: [
      { step: 1, action: 'Navigate to registration', element: '/register' },
      { step: 2, action: 'Enter existing email', element: '[name="email"]', input: 'existing@example.com' },
      { step: 3, action: 'Submit form', element: '[type="submit"]' },
      { step: 4, action: 'Check error', element: '.error-email-exists', waitFor: 'visible' },
    ],
    expectedResults: [
      'Error message: Email already registered',
      'Form not submitted',
    ],
    testData: {
      email: 'existing@example.com',
    },
  },
];

// =============================================================================
// USER LOGIN TESTS
// =============================================================================

export const userLoginTests: UserTest[] = [
  {
    id: 'UL-001',
    name: 'Login - Valid Credentials',
    description: 'Test login with valid email and password',
    priority: 'critical',
    category: 'Authentication',
    steps: [
      { step: 1, action: 'Navigate to login page', element: '/login' },
      { step: 2, action: 'Enter email', element: '[name="email"]', input: 'testuser@example.com' },
      { step: 3, action: 'Enter password', element: '[name="password"]', input: 'ValidPass123!' },
      { step: 4, action: 'Click login', element: '[type="submit"]' },
      { step: 5, action: 'Verify dashboard loaded', element: '.dashboard', waitFor: 'visible' },
    ],
    expectedResults: [
      'Login successful',
      'Redirect to dashboard',
      'User session created',
      'User profile displayed',
    ],
    testData: {
      email: 'testuser@example.com',
      password: 'ValidPass123!',
    },
  },
  {
    id: 'UL-002',
    name: 'Login - Invalid Password',
    description: 'Test login with incorrect password',
    priority: 'high',
    category: 'Authentication',
    steps: [
      { step: 1, action: 'Navigate to login', element: '/login' },
      { step: 2, action: 'Enter email', element: '[name="email"]', input: 'testuser@example.com' },
      { step: 3, action: 'Enter wrong password', element: '[name="password"]', input: 'WrongPassword' },
      { step: 4, action: 'Submit', element: '[type="submit"]' },
      { step: 5, action: 'Check error', element: '.error-login', waitFor: 'visible' },
    ],
    expectedResults: [
      'Error message displayed',
      'Account lockout after 5 failures',
    ],
    testData: {
      email: 'testuser@example.com',
      password: 'WrongPassword',
    },
  },
  {
    id: 'UL-003',
    name: 'Login - Password Reset',
    description: 'Test password reset flow',
    priority: 'high',
    category: 'Authentication',
    steps: [
      { step: 1, action: 'Navigate to login', element: '/login' },
      { step: 2, action: 'Click forgot password', element: '[data-testid="forgot-password"]' },
      { step: 3, action: 'Enter email', element: '[name="email"]', input: 'testuser@example.com' },
      { step: 4, action: 'Submit reset request', element: '[type="submit"]' },
      { step: 5, action: 'Verify success message', element: '.reset-sent', waitFor: 'visible' },
    ],
    expectedResults: [
      'Reset email sent',
      'Success message displayed',
    ],
    testData: {
      email: 'testuser@example.com',
    },
  },
  {
    id: 'UL-004',
    name: 'Login - Session Expiry',
    description: 'Test session timeout handling',
    priority: 'medium',
    category: 'Authentication',
    steps: [
      { step: 1, action: 'Login as user', element: '/login' },
      { step: 2, action: 'Wait for session expiry', element: '', waitFor: '30min' },
      { step: 3, action: 'Attempt page access', element: '/dashboard' },
      { step: 4, action: 'Verify redirect to login', element: '/login' },
    ],
    expectedResults: [
      'Session expired message',
      'Redirect to login page',
    ],
    testData: {},
  },
];

// =============================================================================
// BROWSE AND SEARCH TESTS
// =============================================================================

export const browseSearchTests: UserTest[] = [
  {
    id: 'UB-001',
    name: 'Browse Destinations',
    description: 'Test browsing destination listings',
    priority: 'critical',
    category: 'Browse',
    steps: [
      { step: 1, action: 'Navigate to homepage', element: '/' },
      { step: 2, action: 'Click destinations', element: '[data-testid="nav-destinations"]' },
      { step: 3, action: 'Verify destinations loaded', element: '.destination-grid', waitFor: 'visible' },
      { step: 4, action: 'Verify destination cards', element: '.destination-card' },
    ],
    expectedResults: [
      'Destinations page loads',
      'At least 5 destinations displayed',
      'Images load correctly',
    ],
    testData: {},
  },
  {
    id: 'UB-002',
    name: 'Search - By Destination Name',
    description: 'Test search functionality by destination',
    priority: 'critical',
    category: 'Search',
    steps: [
      { step: 1, action: 'Navigate to destinations', element: '/destinations' },
      { step: 2, action: 'Enter search query', element: '[data-testid="search-input"]', input: 'Serengeti' },
      { step: 3, action: 'Submit search', element: '[data-testid="search-btn"]' },
      { step: 4, action: 'Verify results', element: '.search-results' },
    ],
    expectedResults: [
      'Search results displayed',
      'Matching destinations shown',
      'Results count accurate',
    ],
    testData: {
      query: 'Serengeti',
    },
  },
  {
    id: 'UB-003',
    name: 'Search - By Filters',
    description: 'Test search with multiple filters',
    priority: 'high',
    category: 'Search',
    steps: [
      { step: 1, action: 'Navigate to packages', element: '/packages' },
      { step: 2, action: 'Select destination filter', element: '[name="destination"]' },
      { step: 3, action: 'Select date range', element: '[name="dates"]' },
      { step: 4, action: 'Select price range', element: '[name="priceRange"]' },
      { step: 5, action: 'Apply filters', element: '[data-testid="apply-filters"]' },
    ],
    expectedResults: [
      'Filtered results displayed',
      'All filters applied correctly',
    ],
    testData: {},
  },
  {
    id: 'UB-004',
    name: 'View Destination Details',
    description: 'Test viewing full destination information',
    priority: 'critical',
    category: 'Browse',
    steps: [
      { step: 1, action: 'Navigate to destinations', element: '/destinations' },
      { step: 2, action: 'Click destination', element: '.destination-card:first-child' },
      { step: 3, action: 'Verify detail page', element: '.destination-detail' },
      { step: 4, action: 'Check gallery', element: '.image-gallery' },
      { step: 5, action: 'Check packages section', element: '.related-packages' },
    ],
    expectedResults: [
      'Destination detail page loads',
      'All information displayed',
      'Gallery images load',
      'Related packages shown',
    ],
    testData: {},
  },
];

// =============================================================================
// AI PLANNING TESTS
// =============================================================================

export const aiPlanningTests: UserTest[] = [
  {
    id: 'UA-001',
    name: 'AI Trip Planner - Basic Request',
    description: 'Test AI trip planning with basic requirements',
    priority: 'high',
    category: 'AI Planning',
    steps: [
      { step: 1, action: 'Navigate to AI planner', element: '/ai-planner' },
      { step: 2, action: 'Enter trip preferences', element: '[data-testid="trip-preferences"]', input: '5 day safari in Tanzania' },
      { step: 3, action: 'Set budget', element: '[name="budget"]', input: '5000' },
      { step: 4, action: 'Submit request', element: '[data-testid="generate-plan"]' },
      { step: 5, action: 'Wait for AI response', element: '.ai-response', waitFor: 'visible' },
    ],
    expectedResults: [
      'AI plan generated',
      'Itinerary displayed',
      'Estimated costs shown',
    ],
    testData: {
      preferences: '5 day safari in Tanzania',
      budget: '5000',
    },
  },
  {
    id: 'UA-002',
    name: 'AI Planner - Customize Itinerary',
    description: 'Test modifying AI-generated itinerary',
    priority: 'medium',
    category: 'AI Planning',
    steps: [
      { step: 1, action: 'Generate AI plan', element: '/ai-planner' },
      { step: 2, action: 'Click edit day', element: '[data-testid="edit-day-2"]' },
      { step: 3, action: 'Modify activity', element: '[name="activity"]' },
      { step: 4, action: 'Save changes', element: '[data-testid="save-changes"]' },
    ],
    expectedResults: [
      'Changes saved',
      'Updated itinerary displayed',
    ],
    testData: {},
  },
];

// =============================================================================
// BOOKING TESTS
// =============================================================================

export const bookingTests: UserTest[] = [
  {
    id: 'BK-001',
    name: 'Complete Booking Flow',
    description: 'Test complete booking from package selection to confirmation',
    priority: 'critical',
    category: 'Booking',
    steps: [
      { step: 1, action: 'Select package', element: '/packages/safari-classic' },
      { step: 2, action: 'Click book now', element: '[data-testid="book-btn"]' },
      { step: 3, action: 'Select dates', element: '[name="travelDate"]' },
      { step: 4, action: 'Enter travelers', element: '[name="travelers"]', input: '2' },
      { step: 5, action: 'Add extras', element: '[data-testid="extras"]' },
      { step: 6, action: 'Proceed to payment', element: '[data-testid="proceed-payment"]' },
      { step: 7, action: 'Verify booking summary', element: '.booking-summary' },
      { step: 8, action: 'Confirm booking', element: '[data-testid="confirm-booking"]' },
    ],
    expectedResults: [
      'Booking created successfully',
      'Booking ID generated',
      'Confirmation email sent',
      'Payment initiated',
    ],
    testData: {
      package: 'safari-classic',
      travelers: '2',
    },
  },
  {
    id: 'BK-002',
    name: 'Booking - Date Unavailable',
    description: 'Test booking with unavailable dates',
    priority: 'high',
    category: 'Booking',
    steps: [
      { step: 1, action: 'Select package', element: '/packages/safari-classic' },
      { step: 2, action: 'Select booked dates', element: '[name="travelDate"]' },
      { step: 3, action: 'Check availability', element: '[data-testid="check-availability"]' },
    ],
    expectedResults: [
      'Unavailability message shown',
      'Alternative dates suggested',
    ],
    testData: {},
  },
  {
    id: 'BK-003',
    name: 'View Booking History',
    description: 'Test viewing past and current bookings',
    priority: 'high',
    category: 'Booking',
    steps: [
      { step: 1, action: 'Login as customer', element: '/login' },
      { step: 2, action: 'Navigate to bookings', element: '/bookings' },
      { step: 3, action: 'Verify booking list', element: '.booking-list' },
    ],
    expectedResults: [
      'All user bookings displayed',
      'Status correctly shown',
    ],
    testData: {},
  },
];

// =============================================================================
// PAYMENT TESTS
// =============================================================================

export const paymentTests: UserTest[] = [
  {
    id: 'PY-001',
    name: 'Process Payment - Card',
    description: 'Test payment with credit card',
    priority: 'critical',
    category: 'Payment',
    steps: [
      { step: 1, action: 'Proceed to payment', element: '/checkout' },
      { step: 2, action: 'Select card payment', element: '[data-testid="payment-card"]' },
      { step: 3, action: 'Enter card details', element: '[name="cardNumber"]', input: '4242424242424242' },
      { step: 4, action: 'Enter expiry', element: '[name="expiry"]', input: '12/28' },
      { step: 5, action: 'Enter CVV', element: '[name="cvv"]', input: '123' },
      { step: 6, action: 'Submit payment', element: '[data-testid="pay-now"]' },
      { step: 7, action: 'Verify success', element: '.payment-success', waitFor: 'visible' },
    ],
    expectedResults: [
      'Payment processed successfully',
      'Booking confirmed',
      'Receipt generated',
    ],
    testData: {
      cardNumber: '4242424242424242',
    },
  },
  {
    id: 'PY-002',
    name: 'Payment - Mobile Money',
    description: 'Test payment with mobile money',
    priority: 'high',
    category: 'Payment',
    steps: [
      { step: 1, action: 'Select mobile payment', element: '[data-testid="payment-mpesa"]' },
      { step: 2, action: 'Enter phone number', element: '[name="phone"]', input: '+254712345678' },
      { step: 3, action: 'Submit', element: '[data-testid="pay-now"]' },
      { step: 4, action: 'Check OTP prompt', element: '.otp-prompt' },
    ],
    expectedResults: [
      'STK push sent',
      'OTP verification prompt shown',
    ],
    testData: {
      phone: '+254712345678',
    },
  },
  {
    id: 'PY-003',
    name: 'Payment - Duplicate Prevention',
    description: 'Test idempotency on payment retry',
    priority: 'critical',
    category: 'Payment',
    steps: [
      { step: 1, action: 'Start payment', element: '/checkout' },
      { step: 2, action: 'Submit payment', element: '[data-testid="pay-now"]' },
      { step: 3, action: 'Simulate network error', element: '' },
      { step: 4, action: 'Retry payment', element: '[data-testid="retry-payment"]' },
    ],
    expectedResults: [
      'Same payment not charged twice',
      'Original booking preserved',
    ],
    testData: {},
  },
];

// =============================================================================
// REVIEW TESTS
// =============================================================================

export const reviewTests: UserTest[] = [
  {
    id: 'RV-001',
    name: 'Submit Review - Completed Booking',
    description: 'Test submitting review after completed safari',
    priority: 'high',
    category: 'Reviews',
    steps: [
      { step: 1, action: 'Navigate to completed booking', element: '/bookings/bk-123' },
      { step: 2, action: 'Click write review', element: '[data-testid="write-review"]' },
      { step: 3, action: 'Select rating', element: '[name="rating"]', input: '5' },
      { step: 4, action: 'Write review', element: '[name="reviewText"]', input: 'Amazing safari experience!' },
      { step: 5, action: 'Submit review', element: '[data-testid="submit-review"]' },
    ],
    expectedResults: [
      'Review submitted successfully',
      'Rating displayed on package',
    ],
    testData: {
      rating: '5',
      review: 'Amazing safari experience!',
    },
  },
  {
    id: 'RV-002',
    name: 'View Reviews',
    description: 'Test viewing package reviews',
    priority: 'medium',
    category: 'Reviews',
    steps: [
      { step: 1, action: 'Navigate to package', element: '/packages/safari-classic' },
      { step: 2, action: 'Scroll to reviews', element: '.reviews-section' },
      { step: 3, action: 'Check review display', element: '.review-card' },
    ],
    expectedResults: [
      'Reviews displayed correctly',
      'Average rating shown',
      'Pagination works',
    ],
    testData: {},
  },
];

// Export all tests
export const allUserTests: UserTest[] = [
  ...userRegistrationTests,
  ...userLoginTests,
  ...browseSearchTests,
  ...aiPlanningTests,
  ...bookingTests,
  ...paymentTests,
  ...reviewTests,
];

export default allUserTests;
