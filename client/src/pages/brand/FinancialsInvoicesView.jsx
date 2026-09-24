import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';

export const FinancialsInvoicesView = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await marketplaceApi.getBrandContracts();
        if (res.data?.success) {
          setContracts(res.data.contracts || []);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute metrics
  let totalCommitted = 0;
  let inEscrow = 0;
  let totalReleased = 0;
  const transactions = [];

  contracts.forEach((c) => {
    totalCommitted += Number(c.totalBudget || 0);
    c.milestones?.forEach((m) => {
      if (m.escrowStatus === 'funded') inEscrow += Number(m.amount || 0);
      if (m.escrowStatus === 'released') totalReleased += Number(m.amount || 0);

      if (m.escrowStatus === 'funded' || m.escrowStatus === 'released') {
        transactions.push({
          contractId: c._id,
          contractTitle: c.title,
          milestoneNumber: m.milestoneNumber,
          milestoneTitle: m.title,
          amount: m.amount,
          escrowStatus: m.escrowStatus,
          razorpayPaymentId: m.razorpayPaymentId || 'rzp_paid',
          date: m.fundedAt || m.approvedAt || c.updatedAt,
          studentName: `${c.studentId?.firstName || 'Student'} ${c.studentId?.lastName || ''}`,
        });
      }
    });
  });

  const openInvoice = async (contractId, milestoneNumber) => {
    try {
      const res = await marketplaceApi.getMilestoneInvoice(contractId, milestoneNumber);
      if (res.data?.success) {
        setActiveInvoice(res.data.invoice);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invoice unavailable.');
    }
  };

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> Escrow Audit Trail & Tax Receipts
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Financial Ledger & Invoices
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Immutable record of Razorpay-backed escrow deposits, release payouts, and GST-compliant tax invoices.
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card-tactile" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Budget Committed
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            ₹{totalCommitted.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all active & archived contracts
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Held in NNG Escrow
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', marginTop: '6px' }}>
            ₹{inEscrow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px' }}>
            Protected by Razorpay milestone lock
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid var(--brand-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary-hover)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Released to Talent
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '6px' }}>
            ₹{totalReleased.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary-hover)', marginTop: '4px' }}>
            Approved milestone payouts
          </div>
        </div>

        <div className="card-tactile" style={{ padding: '20px', borderLeft: '3px solid #6366f1' }}>
          <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Funded Milestones
          </div>
          <div className="font-mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#4338ca', marginTop: '6px' }}>
            {transactions.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Audited transaction ledger items
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card-tactile" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF9' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Escrow Transaction Ledger
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {transactions.length} recorded items
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                <th style={{ padding: '12px 18px' }}>Date</th>
                <th style={{ padding: '12px 18px' }}>Project & Milestone</th>
                <th style={{ padding: '12px 18px' }}>Student Freelancer</th>
                <th style={{ padding: '12px 18px' }}>Razorpay Payment ID</th>
                <th style={{ padding: '12px 18px' }}>Amount (INR)</th>
                <th style={{ padding: '12px 18px' }}>Escrow Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Tax Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                  <td className="font-mono" style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{tx.contractTitle}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Milestone #{tx.milestoneNumber}: {tx.milestoneTitle}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>
                    <div style={{ fontWeight: 600 }}>{tx.studentName}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <code className="font-mono" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 7px', borderRadius: '4px', fontSize: '0.75rem', color: '#334155' }}>
                      {tx.razorpayPaymentId}
                    </code>
                  </td>
                  <td className="font-mono" style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    ₹{tx.amount?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {tx.escrowStatus === 'released' ? (
                      <span className="chip-escrow-released">
                        <span>✓</span> Released
                      </span>
                    ) : (
                      <span className="chip-escrow-locked">
                        <span>🔒</span> Held in Escrow
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => openInvoice(tx.contractId, tx.milestoneNumber)}
                      className="btn-secondary-tactile"
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      Receipt PDF
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>📄</div>
                    <div style={{ fontWeight: 600 }}>No escrow transactions recorded yet</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                      When you hire student talent and fund project milestones, invoices and payment receipts will generate here.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {activeInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card-tactile"
            style={{
              background: '#ffffff',
              maxWidth: '640px',
              width: '100%',
              padding: '32px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-primary)', fontWeight: 700 }}>
                  GST Tax Invoice & Receipt
                </div>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                  NextGenGrowth Invoicing
                </h2>
                <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Invoice No: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeInvoice.invoiceNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Entity Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.82rem', marginBottom: '22px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                  Service Provider
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{activeInvoice.platform.legalName}</div>
                <div className="font-mono" style={{ color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                  GSTIN: {activeInvoice.platform.gstin}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.78rem', lineHeight: 1.4 }}>
                  {activeInvoice.platform.address}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '4px' }}>
                  Billed To (Brand)
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                  {activeInvoice.brand.companyName}
                </div>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  Representative: {activeInvoice.brand.representative}
                </div>
                <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                  Client ID: {activeInvoice.brand.brandId?.slice(-8) || 'verified'}
                </div>
              </div>
            </div>

            {/* Scope Details Banner */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Project Scope:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeInvoice.project.contractTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Milestone:</span>
                <span style={{ fontWeight: 600 }}>#{activeInvoice.project.milestoneNumber}: {activeInvoice.project.milestoneTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Reference:</span>
                <code className="font-mono" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1px 5px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {activeInvoice.project.razorpayPaymentId}
                </code>
              </div>
            </div>

            {/* Calculation Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-main)' }}>Milestone Gross Value</td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{activeInvoice.breakdown.milestoneGrossAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>
                    Platform Facilitation Fee ({activeInvoice.breakdown.platformFeePercent}%)
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    ₹{activeInvoice.breakdown.platformFeeAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>
                    GST on Facilitation Fee (18%)
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    ₹{activeInvoice.breakdown.gstAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid var(--text-main)', fontWeight: 800, fontSize: '0.95rem' }}>
                  <td style={{ padding: '12px 0', color: 'var(--text-main)' }}>Total Escrow Paid by Brand</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
                    ₹{activeInvoice.breakdown.totalPaidByBrand?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary-tactile"
                onClick={() => window.print()}
              >
                Print / Download PDF
              </button>
              <button
                className="btn-emerald"
                onClick={() => setActiveInvoice(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialsInvoicesView;
