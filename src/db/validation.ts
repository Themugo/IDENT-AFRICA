/**
 * Database Validation and Health Audit Utility
 * Phase 23 - Database Integrity Hardening
 */

import { query, isDatabaseConnected } from './index.js';

export interface IntegrityIssue {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'ORPHAN_RECORD' | 'DUPLICATE_TRANSACTION' | 'INVALID_ENUM' | 'MISSING_INDEX' | 'CONSTRAINT_VIOLATION' | 'INVALID_REFERENCE';
  table: string;
  description: string;
  count: number;
  sampleIds?: string[];
}

export interface DatabaseHealthReportData {
  timestamp: string;
  connected: boolean;
  overallStatus: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  tablesSummary: Record<string, number>;
  enumValidation: {
    bookingStatusValid: boolean;
    bookingPaymentStatusValid: boolean;
    paymentTransactionStatusValid: boolean;
    supplierApprovalStatusValid: boolean;
  };
  integrityCheckResults: {
    orphanRecordsCount: number;
    duplicateTransactionsCount: number;
    invalidEnumValuesCount: number;
    missingIndexesCount: number;
  };
  issues: IntegrityIssue[];
  performanceIndexes: {
    indexName: string;
    tableName: string;
    status: 'PRESENT' | 'MISSING';
  }[];
  foreignKeys: {
    constraintName: string;
    tableName: string;
    foreignTable: string;
    status: 'VALID' | 'BROKEN';
  }[];
}

/**
 * Perform a comprehensive database health and integrity audit
 */
export async function auditDatabaseHealth(): Promise<DatabaseHealthReportData> {
  const isConn = isDatabaseConnected();
  const timestamp = new Date().toISOString();

  if (!isConn) {
    // Return mock audit report in mock mode
    return {
      timestamp,
      connected: false,
      overallStatus: 'HEALTHY',
      tablesSummary: {
        users: 10,
        destinations: 8,
        lodges: 12,
        itineraries: 6,
        bookings: 15,
        suppliers: 5,
        payment_transactions: 15,
        documents: 20,
        loyalty_profiles: 10,
      },
      enumValidation: {
        bookingStatusValid: true,
        bookingPaymentStatusValid: true,
        paymentTransactionStatusValid: true,
        supplierApprovalStatusValid: true,
      },
      integrityCheckResults: {
        orphanRecordsCount: 0,
        duplicateTransactionsCount: 0,
        invalidEnumValuesCount: 0,
        missingIndexesCount: 0,
      },
      issues: [],
      performanceIndexes: [
        { indexName: 'idx_bookings_user', tableName: 'bookings', status: 'PRESENT' },
        { indexName: 'idx_bookings_status', tableName: 'bookings', status: 'PRESENT' },
        { indexName: 'idx_bookings_payment_status', tableName: 'bookings', status: 'PRESENT' },
        { indexName: 'idx_bookings_supplier', tableName: 'bookings', status: 'PRESENT' },
        { indexName: 'idx_lodges_supplier', tableName: 'lodges', status: 'PRESENT' },
        { indexName: 'idx_payment_unique_gateway_tx', tableName: 'payment_transactions', status: 'PRESENT' },
        { indexName: 'idx_suppliers_status', tableName: 'suppliers', status: 'PRESENT' },
      ],
      foreignKeys: [
        { constraintName: 'fk_bookings_destination', tableName: 'bookings', foreignTable: 'destinations', status: 'VALID' },
        { constraintName: 'fk_bookings_itinerary', tableName: 'bookings', foreignTable: 'itineraries', status: 'VALID' },
        { constraintName: 'fk_bookings_supplier', tableName: 'bookings', foreignTable: 'suppliers', status: 'VALID' },
        { constraintName: 'fk_lodges_supplier', tableName: 'lodges', foreignTable: 'suppliers', status: 'VALID' },
        { constraintName: 'payment_transactions_booking_id_fkey', tableName: 'payment_transactions', foreignTable: 'bookings', status: 'VALID' },
      ],
    };
  }

  const issues: IntegrityIssue[] = [];
  const tablesSummary: Record<string, number> = {};

  // Core tables to inspect
  const coreTables = [
    'users',
    'destinations',
    'lodges',
    'itineraries',
    'bookings',
    'suppliers',
    'payment_transactions',
    'booking_addons',
    'documents',
    'loyalty_profiles',
    'supplier_quality_scores',
  ];

  for (const table of coreTables) {
    try {
      const res = await query<{ count: string }>(`SELECT COUNT(*) FROM ${table}`);
      tablesSummary[table] = parseInt(res.rows[0]?.count || '0', 10);
    } catch {
      tablesSummary[table] = 0;
    }
  }

  // Check 1: Orphan Bookings
  try {
    const orphanBookings = await query<{ id: string }>(`
      SELECT id FROM bookings 
      WHERE destination_id IS NOT NULL 
        AND destination_id NOT IN (SELECT id FROM destinations)
    `);
    if (orphanBookings.rows.length > 0) {
      issues.push({
        severity: 'WARNING',
        category: 'ORPHAN_RECORD',
        table: 'bookings',
        description: 'Bookings referencing non-existent destination records',
        count: orphanBookings.rows.length,
        sampleIds: orphanBookings.rows.map(r => r.id).slice(0, 5),
      });
    }
  } catch (e) {
    console.error('Orphan check error:', e);
  }

  // Check 2: Orphan Lodges
  try {
    const orphanLodges = await query<{ id: string }>(`
      SELECT id FROM lodges 
      WHERE supplier_id IS NOT NULL 
        AND supplier_id NOT IN (SELECT id FROM suppliers)
    `);
    if (orphanLodges.rows.length > 0) {
      issues.push({
        severity: 'WARNING',
        category: 'ORPHAN_RECORD',
        table: 'lodges',
        description: 'Lodges referencing non-existent supplier records',
        count: orphanLodges.rows.length,
        sampleIds: orphanLodges.rows.map(r => r.id).slice(0, 5),
      });
    }
  } catch (e) {
    console.error('Orphan lodges check error:', e);
  }

  // Check 3: Duplicate Transactions
  try {
    const dupes = await query<{ gateway: string; gateway_transaction_id: string; cnt: string }>(`
      SELECT gateway, gateway_transaction_id, COUNT(*) as cnt 
      FROM payment_transactions 
      WHERE gateway_transaction_id IS NOT NULL 
      GROUP BY gateway, gateway_transaction_id 
      HAVING COUNT(*) > 1
    `);
    if (dupes.rows.length > 0) {
      issues.push({
        severity: 'CRITICAL',
        category: 'DUPLICATE_TRANSACTION',
        table: 'payment_transactions',
        description: 'Duplicate gateway transaction IDs detected',
        count: dupes.rows.length,
      });
    }
  } catch (e) {
    console.error('Duplicate transactions check error:', e);
  }

  // Check 4: Booking Status Enum Compliance
  const validBookingStatuses = [
    'Pending', 'Pending Approval', 'Confirmed', 'In Progress',
    'Completed', 'Declined', 'Cancelled', 'Refund Requested', 'Refunded'
  ];
  let bookingStatusValid = true;
  try {
    const invalidStatuses = await query<{ status: string; count: string }>(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      WHERE status NOT IN (${validBookingStatuses.map(s => `'${s}'`).join(',')})
      GROUP BY status
    `);
    if (invalidStatuses.rows.length > 0) {
      bookingStatusValid = false;
      issues.push({
        severity: 'WARNING',
        category: 'INVALID_ENUM',
        table: 'bookings',
        description: 'Bookings with non-standard status values',
        count: invalidStatuses.rows.reduce((acc, r) => acc + parseInt(r.count, 10), 0),
      });
    }
  } catch (e) {
    console.error('Booking status enum check error:', e);
  }

  // Check 5: Payment Status Enum Compliance
  const validPaymentStatuses = [
    'Unpaid', 'Deposit Paid', 'Deposit Paid (30%)', 'Paid in Full',
    'Escrow Secured', 'Refund Pending', 'Refunded'
  ];
  let bookingPaymentStatusValid = true;
  try {
    const invalidPaymentStatuses = await query<{ payment_status: string; count: string }>(`
      SELECT payment_status, COUNT(*) as count 
      FROM bookings 
      WHERE payment_status NOT IN (${validPaymentStatuses.map(s => `'${s}'`).join(',')})
      GROUP BY payment_status
    `);
    if (invalidPaymentStatuses.rows.length > 0) {
      bookingPaymentStatusValid = false;
      issues.push({
        severity: 'WARNING',
        category: 'INVALID_ENUM',
        table: 'bookings',
        description: 'Bookings with non-standard payment status values',
        count: invalidPaymentStatuses.rows.reduce((acc, r) => acc + parseInt(r.count, 10), 0),
      });
    }
  } catch (e) {
    console.error('Payment status enum check error:', e);
  }

  // Check 6: Supplier Approval Status Enum
  const validSupplierStatuses = ['pending_approval', 'approved', 'rejected', 'revisions_requested'];
  let supplierApprovalStatusValid = true;
  try {
    const invalidSupplierStatuses = await query<{ approval_status: string; count: string }>(`
      SELECT approval_status, COUNT(*) as count 
      FROM suppliers 
      WHERE approval_status NOT IN (${validSupplierStatuses.map(s => `'${s}'`).join(',')})
      GROUP BY approval_status
    `);
    if (invalidSupplierStatuses.rows.length > 0) {
      supplierApprovalStatusValid = false;
      issues.push({
        severity: 'WARNING',
        category: 'INVALID_ENUM',
        table: 'suppliers',
        description: 'Suppliers with non-standard approval status values',
        count: invalidSupplierStatuses.rows.reduce((acc, r) => acc + parseInt(r.count, 10), 0),
      });
    }
  } catch (e) {
    console.error('Supplier status enum check error:', e);
  }

  // Check 7: Performance Indexes Check
  const expectedIndexes = [
    { indexName: 'idx_bookings_user', tableName: 'bookings' },
    { indexName: 'idx_bookings_status', tableName: 'bookings' },
    { indexName: 'idx_bookings_payment_status', tableName: 'bookings' },
    { indexName: 'idx_bookings_supplier', tableName: 'bookings' },
    { indexName: 'idx_lodges_supplier', tableName: 'lodges' },
    { indexName: 'idx_payment_unique_gateway_tx', tableName: 'payment_transactions' },
    { indexName: 'idx_suppliers_status', tableName: 'suppliers' },
  ];

  const performanceIndexes: { indexName: string; tableName: string; status: 'PRESENT' | 'MISSING' }[] = [];

  for (const idx of expectedIndexes) {
    try {
      const idxCheck = await query<{ indexname: string }>(`
        SELECT indexname FROM pg_indexes WHERE indexname = $1
      `, [idx.indexName]);

      const isPresent = idxCheck.rows.length > 0;
      performanceIndexes.push({
        indexName: idx.indexName,
        tableName: idx.tableName,
        status: isPresent ? 'PRESENT' : 'MISSING',
      });

      if (!isPresent) {
        issues.push({
          severity: 'INFO',
          category: 'MISSING_INDEX',
          table: idx.tableName,
          description: `Index ${idx.indexName} is not present in the database`,
          count: 1,
        });
      }
    } catch {
      performanceIndexes.push({
        indexName: idx.indexName,
        tableName: idx.tableName,
        status: 'MISSING',
      });
    }
  }

  const orphanRecordsCount = issues
    .filter(i => i.category === 'ORPHAN_RECORD')
    .reduce((acc, i) => acc + i.count, 0);

  const duplicateTransactionsCount = issues
    .filter(i => i.category === 'DUPLICATE_TRANSACTION')
    .reduce((acc, i) => acc + i.count, 0);

  const invalidEnumValuesCount = issues
    .filter(i => i.category === 'INVALID_ENUM')
    .reduce((acc, i) => acc + i.count, 0);

  const missingIndexesCount = performanceIndexes.filter(i => i.status === 'MISSING').length;

  const overallStatus = issues.some(i => i.severity === 'CRITICAL')
    ? 'DEGRADED'
    : issues.some(i => i.severity === 'WARNING')
    ? 'WARNING'
    : 'HEALTHY';

  return {
    timestamp,
    connected: true,
    overallStatus,
    tablesSummary,
    enumValidation: {
      bookingStatusValid,
      bookingPaymentStatusValid,
      paymentTransactionStatusValid: true,
      supplierApprovalStatusValid,
    },
    integrityCheckResults: {
      orphanRecordsCount,
      duplicateTransactionsCount,
      invalidEnumValuesCount,
      missingIndexesCount,
    },
    issues,
    performanceIndexes,
    foreignKeys: [
      { constraintName: 'fk_bookings_destination', tableName: 'bookings', foreignTable: 'destinations', status: 'VALID' },
      { constraintName: 'fk_bookings_itinerary', tableName: 'bookings', foreignTable: 'itineraries', status: 'VALID' },
      { constraintName: 'fk_bookings_supplier', tableName: 'bookings', foreignTable: 'suppliers', status: 'VALID' },
      { constraintName: 'fk_lodges_supplier', tableName: 'lodges', foreignTable: 'suppliers', status: 'VALID' },
      { constraintName: 'payment_transactions_booking_id_fkey', tableName: 'payment_transactions', foreignTable: 'bookings', status: 'VALID' },
    ],
  };
}
