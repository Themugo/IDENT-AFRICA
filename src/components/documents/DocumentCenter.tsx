'use client';

/**
 * Document Center
 * 
 * Document management dashboard for IDENT AFRICA.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Send,
  Plus,
  Search,
  Loader2,
  Trash2,
  Mail,
  Link,
  Check,
  X,
  FileCheck,
  FileSpreadsheet,
  ClipboardList,
  Ticket,
  Shield,
} from 'lucide-react';

interface Document {
  id: string;
  document_type: string;
  document_number: string;
  title: string;
  booking_id?: string;
  customer_id?: string;
  supplier_id?: string;
  status: string;
  download_count: number;
  sent_via_email: boolean;
  sent_at?: string;
  sent_to_email?: string;
  generated_at: string;
}

interface Stats {
  totalDocuments: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalDownloads: number;
  totalSent: number;
}

const DOCUMENT_TYPES = [
  { value: 'booking_confirmation', label: 'Booking Confirmation', icon: FileCheck, color: 'text-emerald-400' },
  { value: 'invoice', label: 'Invoice', icon: FileSpreadsheet, color: 'text-blue-400' },
  { value: 'safari_itinerary', label: 'Safari Itinerary', icon: FileText, color: 'text-amber-400' },
  { value: 'travel_checklist', label: 'Travel Checklist', icon: ClipboardList, color: 'text-purple-400' },
  { value: 'supplier_voucher', label: 'Supplier Voucher', icon: Ticket, color: 'text-pink-400' },
  { value: 'travel_insurance', label: 'Travel Insurance', icon: Shield, color: 'text-cyan-400' },
];

export function DocumentCenter() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/documents/stats/all'),
      ]);

      const docsData = await docsRes.json();
      const statsData = await statsRes.json();

      if (docsData.success) setDocuments(docsData.data.documents || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      const data = await res.json();
      
      if (data.success) {
        // In production, trigger actual download
        alert(`Downloading ${doc.document_number}`);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSendEmail = async (doc: Document, email: string) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Document sent successfully!');
        setShowEmailModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleShare = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.data.shareUrl);
        setCopiedId(doc.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Draft</span>;
      case 'generated': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Generated</span>;
      case 'sent': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Sent</span>;
      case 'viewed': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Viewed</span>;
      case 'expired': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Expired</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>;
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C89A4B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-[#D6B06A]">
            Document Center
          </h1>
          <p className="text-[#8B7355]">Generate, manage, and share travel documents</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Document
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<FileText className="w-5 h-5" />} label="Total Documents" value={stats.totalDocuments} />
          <StatCard icon={<Download className="w-5 h-5" />} label="Downloads" value={stats.totalDownloads} />
          <StatCard icon={<Send className="w-5 h-5" />} label="Sent" value={stats.totalSent} />
          <StatCard icon={<FileCheck className="w-5 h-5" />} label="Generated Today" value={stats.byType['booking_confirmation'] || 0} />
        </div>
      )}

      {/* Document Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {DOCUMENT_TYPES.map((type) => {
          const Icon = type.icon;
          const count = stats?.byType[type.value] || 0;
          return (
            <button
              key={type.value}
              onClick={() => setFilterType(filterType === type.value ? 'all' : type.value)}
              className={`p-4 rounded-xl border transition-all ${
                filterType === type.value
                  ? 'bg-[#C89A4B]/10 border-[#C89A4B]/50'
                  : 'bg-[#2E2015] border-[#C89A4B]/20 hover:border-[#C89A4B]/40'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
              <p className="text-xs text-[#8B7355] truncate">{type.label}</p>
              <p className="text-lg font-bold text-[#D6B06A]">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
          >
            <option value="all">All Types</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3D2B1F]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#8B7355] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C89A4B]/10">
              {filteredDocs.map((doc) => {
                const typeInfo = getTypeInfo(doc.document_type);
                const Icon = typeInfo.icon;
                return (
                  <tr key={doc.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                        <div>
                          <p className="font-medium text-[#F4E8D5]">{doc.title}</p>
                          <p className="text-xs text-[#8B7355]">{doc.document_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#F4E8D5]">{typeInfo.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-4 py-3 text-[#F4E8D5]">{doc.download_count}</td>
                    <td className="px-4 py-3 text-[#8B7355] text-sm">
                      {new Date(doc.generated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                          title="Send via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(doc)}
                          className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors"
                          title="Share Link"
                        >
                          {copiedId === doc.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Link className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-[#8B7355] hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#8B7355]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No documents found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateDocumentModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={loadData}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && selectedDoc && (
        <EmailDocumentModal
          document={selectedDoc}
          onClose={() => { setShowEmailModal(false); setSelectedDoc(null); }}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#C89A4B]">{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function GenerateDocumentModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: () => void }) {
  const [docType, setDocType] = useState('booking_confirmation');
  const [bookingId, setBookingId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    setIsSubmitting(true);
    try {
      const endpoints: Record<string, string> = {
        booking_confirmation: '/api/documents/generate/booking-confirmation',
        safari_itinerary: '/api/documents/generate/safari-itinerary',
        travel_checklist: '/api/documents/generate/travel-checklist',
        invoice: '/api/documents/generate/invoice',
        supplier_voucher: '/api/documents/generate/supplier-voucher',
      };

      const endpoint = endpoints[docType];
      if (!endpoint) {
        alert('Document type not supported yet');
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          bookingData: { customerId, customerName: 'Customer' },
          itineraryData: { customerId },
          checklistData: { customerId, customerName: 'Customer' },
          invoiceData: { customerId },
          voucherData: { supplierId: customerId },
        }),
      });

      const data = await res.json();
      if (data.success) {
        onGenerated();
        onClose();
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Generate Document</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Booking ID</label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="book_xxx"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Customer ID</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="user_xxx"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#C89A4B]/30 text-[#8B7355] rounded-lg hover:bg-[#3D2B1F] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isSubmitting || !bookingId}
              className="flex-1 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailDocumentModal({ document, onClose, onSend }: { document: Document; onClose: () => void; onSend: (doc: Document, email: string) => void }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = () => {
    setIsSubmitting(true);
    onSend(document, email);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Send Document via Email</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-[#3D2B1F] rounded-lg p-3">
            <p className="text-sm text-[#8B7355]">Document</p>
            <p className="font-medium text-[#F4E8D5]">{document.title}</p>
            <p className="text-xs text-[#8B7355]">{document.document_number}</p>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#C89A4B]/30 text-[#8B7355] rounded-lg hover:bg-[#3D2B1F] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSubmitting || !email}
              className="flex-1 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCenter;
