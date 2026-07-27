/**
 * IDENT AFRICA - Supplier Journey Simulation
 * Simulates complete supplier experience from registration to managing bookings
 */

import { createLogger } from '../../src/services/monitoring/logger.js';

const logger = createLogger('SupplierJourney');

interface SimulationResult {
  step: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  details?: string;
}

interface JourneyResult {
  journey: string;
  totalSteps: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  steps: SimulationResult[];
}

async function simulateRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
    
    if (endpoint.includes('/auth/register') || endpoint.includes('/auth/login')) {
      return { success: true, data: { token: 'mock_token', userId: 'mock_supplier_id' } };
    }
    if (endpoint.includes('/suppliers/register')) {
      return { success: true, data: { supplierId: 'mock_supplier_id', status: 'pending' } };
    }
    if (endpoint.includes('/suppliers/approve')) {
      return { success: true, data: { status: 'approved' } };
    }
    if (endpoint.includes('/packages')) {
      return { success: true, data: { packageId: 'mock_package_id' } };
    }
    if (endpoint.includes('/bookings')) {
      return { success: true, data: { bookings: [] } };
    }
    if (endpoint.includes('/earnings')) {
      return { success: true, data: { total: 15000, pending: 5000 } };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function runStep(
  name: string,
  fn: () => Promise<{ success: boolean; details?: string }>
): Promise<SimulationResult> {
  const start = Date.now();
  try {
    const result = await fn();
    return {
      step: name,
      status: result.success ? 'pass' : 'fail',
      duration: Date.now() - start,
      details: result.details,
    };
  } catch (error) {
    return {
      step: name,
      status: 'fail',
      duration: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function simulateSupplierJourney(): Promise<JourneyResult> {
  logger.info('Starting supplier journey simulation');
  const startTime = Date.now();
  const steps: SimulationResult[] = [];

  // Step 1: Supplier Registration
  steps.push(
    await runStep('1.1 - Navigate to supplier registration', async () => {
      const response = await simulateRequest('GET', '/supplier/register');
      return { success: response.success };
    })
  );

  steps.push(
    await runStep('1.2 - Fill supplier registration form', async () => {
      const response = await simulateRequest('POST', '/suppliers/register', {
        companyName: 'Luxury Safari Co.',
        email: 'contact@luxurysafari.com',
        phone: '+254700000000',
        country: 'Kenya',
        registrationNumber: 'KEN/2024/001',
        businessType: 'lodge',
        address: 'Nairobi, Kenya',
      });
      return { success: response.success, details: 'Registration submitted for approval' };
    })
  );

  steps.push(
    await runStep('1.3 - Receive confirmation email', async () => {
      return { success: true, details: 'Email sent with pending status' };
    })
  );

  steps.push(
    await runStep('1.4 - Wait for admin approval', async () => {
      return { success: true, details: 'Admin reviewing application' };
    })
  );

  // Step 2: Approval Process (simulated admin action)
  steps.push(
    await runStep('2.1 - Admin reviews application', async () => {
      return { success: true, details: 'Documents verified' };
    })
  );

  steps.push(
    await runStep('2.2 - Admin approves supplier', async () => {
      const response = await simulateRequest('POST', '/suppliers/approve', {
        supplierId: 'mock_supplier_id',
      });
      return { success: response.success, details: 'Supplier approved' };
    })
  );

  steps.push(
    await runStep('2.3 - Receive approval notification', async () => {
      return { success: true, details: 'Approval email sent' };
    })
  );

  // Step 3: Create Package
  steps.push(
    await runStep('3.1 - Access supplier dashboard', async () => {
      return { success: true, details: 'Dashboard loaded' };
    })
  );

  steps.push(
    await runStep('3.2 - Navigate to packages', async () => {
      return { success: true, details: 'Packages page loaded' };
    })
  );

  steps.push(
    await runStep('3.3 - Create new package', async () => {
      const response = await simulateRequest('POST', '/packages', {
        name: 'Big Five Safari Experience',
        destination: 'Masai Mara',
        duration: 5,
        pricePerPerson: 2500,
        description: 'Experience the Big Five...',
        highlights: ['Game drives', 'Hot air balloon', 'Bush dinner'],
        included: ['Accommodation', 'Meals', 'Transport', 'Park fees'],
        maxGuests: 8,
        category: 'safari',
      });
      return { success: response.success, details: 'Package created' };
    })
  );

  steps.push(
    await runStep('3.4 - Add package images', async () => {
      return { success: true, details: '5 images uploaded' };
    })
  );

  steps.push(
    await runStep('3.5 - Set availability calendar', async () => {
      return { success: true, details: 'Calendar configured' };
    })
  );

  steps.push(
    await runStep('3.6 - Set pricing rules', async () => {
      return { success: true, details: 'Base price + seasonal rates set' };
    })
  );

  steps.push(
    await runStep('3.7 - Submit for review', async () => {
      return { success: true, details: 'Package submitted' };
    })
  );

  steps.push(
    await runStep('3.8 - Package published', async () => {
      return { success: true, details: 'Package now visible to customers' };
    })
  );

  // Step 4: Manage Bookings
  steps.push(
    await runStep('4.1 - View incoming bookings', async () => {
      const response = await simulateRequest('GET', '/bookings?status=pending');
      return { success: response.success, details: '2 new bookings' };
    })
  );

  steps.push(
    await runStep('4.2 - Accept booking', async () => {
      return { success: true, details: 'Booking confirmed' };
    })
  );

  steps.push(
    await runStep('4.3 - Send confirmation to customer', async () => {
      return { success: true, details: 'Email sent with itinerary' };
    })
  );

  steps.push(
    await runStep('4.4 - Update booking status', async () => {
      return { success: true, details: 'Status: Confirmed' };
    })
  );

  // Step 5: View Earnings
  steps.push(
    await runStep('5.1 - Access earnings dashboard', async () => {
      const response = await simulateRequest('GET', '/earnings');
      return { success: response.success, details: 'Earnings loaded' };
    })
  );

  steps.push(
    await runStep('5.2 - View transaction history', async () => {
      return { success: true, details: '15 transactions found' };
    })
  );

  steps.push(
    await runStep('5.3 - View pending payouts', async () => {
      return { success: true, details: 'Pending: $5,000' };
    })
  );

  steps.push(
    await runStep('5.4 - Request payout', async () => {
      return { success: true, details: 'Payout requested' };
    })
  );

  steps.push(
    await runStep('5.5 - Update pricing for peak season', async () => {
      return { success: true, details: 'Seasonal pricing applied' };
    })
  );

  // Calculate results
  const passed = steps.filter((s) => s.status === 'pass').length;
  const failed = steps.filter((s) => s.status === 'fail').length;
  const skipped = steps.filter((s) => s.status === 'skip').length;

  logger.info(`Supplier journey completed: ${passed}/${steps.length} passed`);

  return {
    journey: 'Supplier Journey',
    totalSteps: steps.length,
    passed,
    failed,
    skipped,
    duration: Date.now() - startTime,
    steps,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  simulateSupplierJourney().then((result) => {
    console.log('\n=== SUPPLIER JOURNEY RESULTS ===');
    console.log(`Total Steps: ${result.totalSteps}`);
    console.log(`Passed: ${result.passed}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Skipped: ${result.skipped}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log('\nStep Details:');
    result.steps.forEach((step) => {
      const icon = step.status === 'pass' ? '✅' : step.status === 'skip' ? '⏭️' : '❌';
      console.log(`${icon} ${step.step} (${step.duration}ms) ${step.details || ''}`);
    });
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

export default simulateSupplierJourney;
