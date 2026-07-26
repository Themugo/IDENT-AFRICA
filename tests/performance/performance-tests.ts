/**
 * IDENT AFRICA - Performance Test Suite
 * Tests for mobile speed, image loading, database queries, and API response
 */

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  metrics: Metric[];
  thresholds: Record<string, number>;
  testData: Record<string, string | number>;
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  passed: boolean;
}

export interface PerformanceResult {
  testId: string;
  timestamp: string;
  duration: number;
  metrics: Metric[];
  overallStatus: 'passed' | 'failed' | 'warning';
  recommendations: string[];
}

// =============================================================================
// MOBILE SPEED TESTS
// =============================================================================

export const mobileSpeedTests: PerformanceTest[] = [
  {
    id: 'PM-001',
    name: 'Mobile Homepage Load Time',
    description: 'Test homepage load time on mobile (3G)',
    priority: 'critical',
    category: 'Mobile Speed',
    metrics: [
      { name: 'First Contentful Paint', value: 0, unit: 'ms', passed: false },
      { name: 'Largest Contentful Paint', value: 0, unit: 'ms', passed: false },
      { name: 'Time to Interactive', value: 0, unit: 'ms', passed: false },
      { name: 'Total Blocking Time', value: 0, unit: 'ms', passed: false },
      { name: 'Cumulative Layout Shift', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'First Contentful Paint': 1800,
      'Largest Contentful Paint': 2500,
      'Time to Interactive': 3800,
      'Total Blocking Time': 300,
      'Cumulative Layout Shift': 100,
    },
    testData: {
      device: 'iPhone 12',
      network: '4G Slow (1.6 Mbps)',
    },
  },
  {
    id: 'PM-002',
    name: 'Mobile Navigation Speed',
    description: 'Test page navigation on mobile',
    priority: 'high',
    category: 'Mobile Speed',
    metrics: [
      { name: 'Page Transition Time', value: 0, unit: 'ms', passed: false },
      { name: 'JavaScript Execution', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Page Transition Time': 1000,
      'JavaScript Execution': 200,
    },
    testData: {
      device: 'Android Mid-range',
      network: '4G',
    },
  },
  {
    id: 'PM-003',
    name: 'Mobile Search Performance',
    description: 'Test search functionality on mobile',
    priority: 'high',
    category: 'Mobile Speed',
    metrics: [
      { name: 'Search Input Response', value: 0, unit: 'ms', passed: false },
      { name: 'Results Display Time', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Search Input Response': 100,
      'Results Display Time': 2000,
    },
    testData: {},
  },
  {
    id: 'PM-004',
    name: 'Mobile AI Planner Performance',
    description: 'Test AI trip planner on mobile',
    priority: 'medium',
    category: 'Mobile Speed',
    metrics: [
      { name: 'AI Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'UI Responsiveness', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'AI Response Time': 5000,
      'UI Responsiveness': 100,
    },
    testData: {},
  },
];

// =============================================================================
// IMAGE LOADING TESTS
// =============================================================================

export const imageLoadingTests: PerformanceTest[] = [
  {
    id: 'PI-001',
    name: 'Hero Image Loading',
    description: 'Test hero image load performance',
    priority: 'critical',
    category: 'Image Loading',
    metrics: [
      { name: 'Image Size', value: 0, unit: 'KB', passed: false },
      { name: 'Load Time', value: 0, unit: 'ms', passed: false },
      { name: 'Format Efficiency', value: 0, unit: '%', passed: false },
    ],
    thresholds: {
      'Image Size': 200,
      'Load Time': 1500,
      'Format Efficiency': 80,
    },
    testData: {
      imageType: 'hero',
    },
  },
  {
    id: 'PI-002',
    name: 'Gallery Lazy Loading',
    description: 'Test lazy loading of gallery images',
    priority: 'high',
    category: 'Image Loading',
    metrics: [
      { name: 'Initial Load Images', value: 0, unit: 'count', passed: false },
      { name: 'Lazy Load Trigger Distance', value: 0, unit: 'px', passed: false },
      { name: 'Placeholder Display Time', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Initial Load Images': 6,
      'Lazy Load Trigger Distance': 200,
      'Placeholder Display Time': 50,
    },
    testData: {},
  },
  {
    id: 'PI-003',
    name: 'Responsive Image Serving',
    description: 'Test responsive image breakpoints',
    priority: 'high',
    category: 'Image Loading',
    metrics: [
      { name: 'Mobile Image Size', value: 0, unit: 'KB', passed: false },
      { name: 'Tablet Image Size', value: 0, unit: 'KB', passed: false },
      { name: 'Desktop Image Size', value: 0, unit: 'KB', passed: false },
    ],
    thresholds: {
      'Mobile Image Size': 50,
      'Tablet Image Size': 100,
      'Desktop Image Size': 200,
    },
    testData: {},
  },
  {
    id: 'PI-004',
    name: 'Image Format Comparison',
    description: 'Test WebP vs JPEG performance',
    priority: 'medium',
    category: 'Image Loading',
    metrics: [
      { name: 'JPEG Size', value: 0, unit: 'KB', passed: false },
      { name: 'WebP Size', value: 0, unit: 'KB', passed: false },
      { name: 'Size Reduction', value: 0, unit: '%', passed: false },
    ],
    thresholds: {
      'Size Reduction': 25,
    },
    testData: {},
  },
  {
    id: 'PI-005',
    name: 'Destination Card Images',
    description: 'Test destination listing image performance',
    priority: 'high',
    category: 'Image Loading',
    metrics: [
      { name: 'Grid Load Time', value: 0, unit: 'ms', passed: false },
      { name: 'Average Image Size', value: 0, unit: 'KB', passed: false },
      { name: 'Total Images Loaded', value: 0, unit: 'count', passed: false },
    ],
    thresholds: {
      'Grid Load Time': 3000,
      'Average Image Size': 80,
      'Total Images Loaded': 20,
    },
    testData: {},
  },
];

// =============================================================================
// DATABASE QUERY TESTS
// =============================================================================

export const databaseQueryTests: PerformanceTest[] = [
  {
    id: 'PD-001',
    name: 'Destination Query Performance',
    description: 'Test destination listing query',
    priority: 'critical',
    category: 'Database Queries',
    metrics: [
      { name: 'Query Time', value: 0, unit: 'ms', passed: false },
      { name: 'Rows Returned', value: 0, unit: 'count', passed: false },
      { name: 'Index Usage', value: 0, unit: '%', passed: false },
    ],
    thresholds: {
      'Query Time': 100,
      'Index Usage': 100,
    },
    testData: {
      query: 'SELECT * FROM destinations WHERE status = published',
    },
  },
  {
    id: 'PD-002',
    name: 'Package Search Query',
    description: 'Test package search with filters',
    priority: 'critical',
    category: 'Database Queries',
    metrics: [
      { name: 'Query Time', value: 0, unit: 'ms', passed: false },
      { name: 'Join Count', value: 0, unit: 'count', passed: false },
      { name: 'Full Table Scan', value: 0, unit: 'boolean', passed: false },
    ],
    thresholds: {
      'Query Time': 200,
      'Join Count': 5,
      'Full Table Scan': 0,
    },
    testData: {
      query: 'Package search with destination, date, price filters',
    },
  },
  {
    id: 'PD-003',
    name: 'Booking History Query',
    description: 'Test user booking history query',
    priority: 'high',
    category: 'Database Queries',
    metrics: [
      { name: 'Query Time', value: 0, unit: 'ms', passed: false },
      { name: 'Results Count', value: 0, unit: 'count', passed: false },
    ],
    thresholds: {
      'Query Time': 150,
    },
    testData: {},
  },
  {
    id: 'PD-004',
    name: 'Supplier Earnings Aggregation',
    description: 'Test earnings calculation query',
    priority: 'high',
    category: 'Database Queries',
    metrics: [
      { name: 'Query Time', value: 0, unit: 'ms', passed: false },
      { name: 'Aggregation Time', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Query Time': 500,
      'Aggregation Time': 200,
    },
    testData: {},
  },
  {
    id: 'PD-005',
    name: 'AI Planner Context Query',
    description: 'Test AI planning data retrieval',
    priority: 'medium',
    category: 'Database Queries',
    metrics: [
      { name: 'Query Time', value: 0, unit: 'ms', passed: false },
      { name: 'Parallel Queries', value: 0, unit: 'count', passed: false },
    ],
    thresholds: {
      'Query Time': 1000,
      'Parallel Queries': 10,
    },
    testData: {},
  },
  {
    id: 'PD-006',
    name: 'Database Connection Pool',
    description: 'Test connection pool efficiency',
    priority: 'high',
    category: 'Database Queries',
    metrics: [
      { name: 'Active Connections', value: 0, unit: 'count', passed: false },
      { name: 'Idle Connections', value: 0, unit: 'count', passed: false },
      { name: 'Connection Wait Time', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Active Connections': 20,
      'Idle Connections': 5,
      'Connection Wait Time': 100,
    },
    testData: {},
  },
];

// =============================================================================
// API RESPONSE TESTS
// =============================================================================

export const apiResponseTests: PerformanceTest[] = [
  {
    id: 'PA-001',
    name: 'Destinations API Response',
    description: 'Test destinations listing API',
    priority: 'critical',
    category: 'API Response',
    metrics: [
      { name: 'Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'Status Code', value: 0, unit: 'code', passed: false },
      { name: 'Payload Size', value: 0, unit: 'KB', passed: false },
    ],
    thresholds: {
      'Response Time': 300,
      'Status Code': 200,
      'Payload Size': 100,
    },
    testData: {
      endpoint: 'GET /api/destinations',
    },
  },
  {
    id: 'PA-002',
    name: 'Package Search API',
    description: 'Test package search with filters',
    priority: 'critical',
    category: 'API Response',
    metrics: [
      { name: 'Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'Results Count', value: 0, unit: 'count', passed: false },
    ],
    thresholds: {
      'Response Time': 500,
      'Results Count': 50,
    },
    testData: {
      endpoint: 'POST /api/packages/search',
    },
  },
  {
    id: 'PA-003',
    name: 'Booking Creation API',
    description: 'Test booking creation endpoint',
    priority: 'critical',
    category: 'API Response',
    metrics: [
      { name: 'Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'Idempotency Check', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Response Time': 1000,
      'Idempotency Check': 50,
    },
    testData: {
      endpoint: 'POST /api/bookings',
    },
  },
  {
    id: 'PA-004',
    name: 'Payment Processing API',
    description: 'Test payment initiation',
    priority: 'critical',
    category: 'API Response',
    metrics: [
      { name: 'Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'Webhook Processing', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Response Time': 2000,
      'Webhook Processing': 500,
    },
    testData: {
      endpoint: 'POST /api/payments/initiate',
    },
  },
  {
    id: 'PA-005',
    name: 'AI Planner API',
    description: 'Test AI trip planning endpoint',
    priority: 'high',
    category: 'API Response',
    metrics: [
      { name: 'Response Time', value: 0, unit: 'ms', passed: false },
      { name: 'Token Count', value: 0, unit: 'count', passed: false },
    ],
    thresholds: {
      'Response Time': 10000,
      'Token Count': 500,
    },
    testData: {
      endpoint: 'POST /api/ai/planner',
    },
  },
  {
    id: 'PA-006',
    name: 'Concurrent API Load',
    description: 'Test API under concurrent load',
    priority: 'high',
    category: 'API Response',
    metrics: [
      { name: 'Requests/Second', value: 0, unit: 'rps', passed: false },
      { name: 'Error Rate', value: 0, unit: '%', passed: false },
      { name: 'P95 Latency', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Requests/Second': 100,
      'Error Rate': 1,
      'P95 Latency': 500,
    },
    testData: {
      concurrent: 50,
      duration: '60s',
    },
  },
  {
    id: 'PA-007',
    name: 'Rate Limiting Test',
    description: 'Test API rate limiting',
    priority: 'medium',
    category: 'API Response',
    metrics: [
      { name: 'Limit Response Time', value: 0, unit: 'ms', passed: false },
      { name: '429 Response Correct', value: 0, unit: 'boolean', passed: false },
    ],
    thresholds: {
      'Limit Response Time': 100,
      '429 Response Correct': 1,
    },
    testData: {},
  },
];

// =============================================================================
// LOAD TESTS
// =============================================================================

export const loadTests: PerformanceTest[] = [
  {
    id: 'PL-001',
    name: 'Peak Hour Simulation',
    description: 'Simulate peak traffic (1000 concurrent users)',
    priority: 'critical',
    category: 'Load Testing',
    metrics: [
      { name: 'Total Requests', value: 0, unit: 'count', passed: false },
      { name: 'Failed Requests', value: 0, unit: 'count', passed: false },
      { name: 'Average Response', value: 0, unit: 'ms', passed: false },
      { name: 'P99 Response', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Failed Requests': 10,
      'Average Response': 500,
      'P99 Response': 2000,
    },
    testData: {
      users: 1000,
      duration: '5min',
      rampUp: '30s',
    },
  },
  {
    id: 'PL-002',
    name: 'Stress Test - Breaking Point',
    description: 'Find system breaking point',
    priority: 'high',
    category: 'Load Testing',
    metrics: [
      { name: 'Max Concurrent Users', value: 0, unit: 'count', passed: false },
      { name: 'Response Time at Max', value: 0, unit: 'ms', passed: false },
      { name: 'Recovery Time', value: 0, unit: 'ms', passed: false },
    ],
    thresholds: {
      'Max Concurrent Users': 5000,
      'Recovery Time': 30000,
    },
    testData: {},
  },
  {
    id: 'PL-003',
    name: 'Soak Test - Memory Leaks',
    description: 'Extended load test for memory leaks',
    priority: 'medium',
    category: 'Load Testing',
    metrics: [
      { name: 'Memory Usage Start', value: 0, unit: 'MB', passed: false },
      { name: 'Memory Usage End', value: 0, unit: 'MB', passed: false },
      { name: 'Memory Growth', value: 0, unit: 'MB', passed: false },
    ],
    thresholds: {
      'Memory Growth': 100,
    },
    testData: {
      duration: '2hr',
    },
  },
];

// Export all tests
export const allPerformanceTests: PerformanceTest[] = [
  ...mobileSpeedTests,
  ...imageLoadingTests,
  ...databaseQueryTests,
  ...apiResponseTests,
  ...loadTests,
];

export default allPerformanceTests;
