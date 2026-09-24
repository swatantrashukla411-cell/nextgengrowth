import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';

export const ActiveContractsView = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeReviewData, setActiveReviewData] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Invoice modal state
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchContracts = async () => {
    try {
      const res = await marketplaceApi.getBrandContracts();
      if (res.data?.success) {
        setContracts(res.data.contracts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Razorpay Escrow Milestone Funding
  const handleFundMilestone = async (contractId, milestoneNumber) => {
    setError('');
    try {
      const res = await marketplaceApi.createFundOrder(contractId, milestoneNumber);
      if (!res.data?.success) throw new Error(res.data?.message || 'Could not initiate funding.');

      const { orderId, amount, currency, key, milestoneTitle, contractTitle, studentName } = res.data;

      const options = {
        key,
        amount,
        currency: currency || 'INR',
        name: 'NextGenGrowth Escrow',
        description: `Fund Milestone: ${milestoneTitle}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await marketplaceApi.verifyFundMilestone(contractId, milestoneNumber, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              setSuccessMsg(`✅ Escrow funded! ₹${(amount / 100).toLocaleString('en-IN')} locked for ${studentName}.`);
              setTimeout(() => setSuccessMsg(''), 5000);
              fetchContracts();
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Escrow verification failed.');
          }
        },
        theme: { color: '#059669' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Funding initiation failed.');
    }
  };

  // Open Deliverable Review Modal
  const openReviewModal = (contract, milestone) => {
    setActiveReviewData({
      contractId: contract._id,
      milestoneNumber: milestone.milestoneNumber,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      submission: milestone.submission,
      autoReleaseAt: milestone.autoReleaseAt,
      revisions: milestone.revisions || [],
    });
    setRevisionNote('');
    setReviewModalOpen(true);
  };

  // Submit Review (Approve & Release or Request Revision)
  const handleReviewAction = async (action) => {
    if (action === 'revision' && !revisionNote.trim()) {
      alert('Please specify the revision notes/changes needed.');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await marketplaceApi.reviewMilestoneWork(
        activeReviewData.contractId,
        activeReviewData.milestoneNumber,
        { action, revisionNote }
      );

      if (res.data?.success) {
        setReviewModalOpen(false);
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(''), 5000);
        fetchContracts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Review action failed.');
    } finally {
      setReviewLoading(false);
    }
  };

  // View GST Invoice
  const handleViewInvoice = async (contractId, milestoneNumber) => {
    try {
      const res = await marketplaceApi.getMilestoneInvoice(contractId, milestoneNumber);
      if (res.data?.success) {
        setInvoiceData(res.data.invoice);
        setInvoiceModalOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invoice not available yet.');
    }
  };

  const getStatusBadge = (escrowStatus, workStatus) => {
    if (escrowStatus === 'released' || workStatus === 'approved') {
      return { class: 'chip-escrow-released', label: '✓ Escrow Released' };
    }
    if (workStatus === 'submitted') {
      return { class: 'chip-escrow-locked', label: '● Review Submission' };
    }
    if (workStatus === 'revision') {
      return { class: 'chip-escrow-locked', label: '↻ Revision Requested' };
    }
    if (escrowStatus === 'funded') {
      return { class: 'chip-escrow-locked', label: '🛡️ Escrow Funded (In Progress)' };
    }
    return { class: 'chip-college', label: '⏳ Unfunded Milestone' };
  };

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1120px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--brand-surface)', color: 'var(--brand-primary)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
            Escrow Workspace
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Upwork & Contra Milestone Standard
          </span>
        </div>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Active Contracts & Workspaces
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
          Funds are held securely in NextGenGrowth Escrow. Review deliverable proofs and release payouts with 1 click.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', marginBottom: '20px', fontSize: '0.86rem' }}>
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '20px', fontSize: '0.86rem' }}>
          {successMsg}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading active contracts...
        </div>
      )}

      {!loading && contracts.length === 0 && (
        <div className="card-tactile" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📑</div>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            No Active Contracts Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            When you hire student applicants from your pipeline, contracts with escrow milestones will appear here.
          </p>
        </div>
      )}

      {/* Contracts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {contracts.map((contract) => {
          const student = contract.studentId || {};
          const isContractDone = contract.status === 'completed';

          return (
            <div
              key={contract._id}
              className="card-tactile"
              style={{
                padding: '22px 24px',
                background: '#FFFFFF',
              }}
            >
              {/* Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {contract.title}
                    </h3>
                    <span
                      style={{
                        background: isContractDone ? 'var(--brand-surface)' : '#EFF6FF',
                        color: isContractDone ? 'var(--brand-primary)' : '#2563EB',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {contract.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Freelancer: <strong>{student.firstName} {student.lastName}</strong></span>
                    {student.college && <span className="chip-college">{student.college}</span>}
                    <span>•</span>
                    <span className="font-mono">Budget: ₹{contract.totalBudget?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                    100% Escrow Protected
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Platform fee: {contract.platformFeePercent || 10}%
                  </div>
                </div>
              </div>

              {/* Milestones Tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {contract.milestones?.map((m) => {
                  const badge = getStatusBadge(m.escrowStatus, m.workStatus);
                  const isFunded = m.escrowStatus === 'funded';
                  const isSubmitted = m.workStatus === 'submitted';
                  const isApproved = m.workStatus === 'approved';

                  return (
                    <div
                      key={m.milestoneNumber}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '8px',
                        background: '#FAFAF9',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--brand-primary)' }}>
                            #{m.milestoneNumber}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {m.title}
                          </span>
                          <span className={badge.class}>
                            {badge.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Milestone Value: <strong className="font-mono" style={{ color: 'var(--text-main)' }}>₹{m.amount?.toLocaleString('en-IN')}</strong>
                          {m.description && ` • ${m.description}`}
                        </div>

                        {/* Submission Preview if submitted */}
                        {m.submission?.deliverableUrl && (
                          <div style={{ marginTop: '8px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <a
                              href={m.submission.deliverableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}
                            >
                              🔗 Inspect Deliverable: {m.submission.deliverableUrl.slice(0, 48)}... ↗
                            </a>
                            {m.autoReleaseAt && !isApproved && (
                              <span className="font-mono" style={{ color: '#92400E', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                7-day auto-release: {new Date(m.autoReleaseAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Milestone Actions */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {m.escrowStatus === 'unfunded' && (
                          <button
                            onClick={() => handleFundMilestone(contract._id, m.milestoneNumber)}
                            className="btn-emerald"
                            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                          >
                            💳 Fund Escrow (₹{m.amount?.toLocaleString('en-IN')})
                          </button>
                        )}

                        {isSubmitted && (
                          <button
                            onClick={() => openReviewModal(contract, m)}
                            className="btn-emerald"
                            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                          >
                            Review Submission
                          </button>
                        )}

                        {(isFunded || isApproved) && (
                          <button
                            onClick={() => handleViewInvoice(contract._id, m.milestoneNumber)}
                            className="btn-secondary-tactile"
                            style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                          >
                            🧾 GST Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DELIVERABLE REVIEW MODAL */}
      {reviewModalOpen && activeReviewData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.25rem', fontWeight: 700 }}>
                  Review Deliverable: {activeReviewData.milestoneTitle}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                  Escrow Funds Held: <strong className="font-mono">₹{activeReviewData.amount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Submission Link & Notes */}
            <div style={{ background: '#FAFAF9', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                Deliverable Proof URL:
              </div>
              <a
                href={activeReviewData.submission?.deliverableUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.88rem', wordBreak: 'break-all' }}
              >
                {activeReviewData.submission?.deliverableUrl} ↗
              </a>

              {activeReviewData.submission?.notes && (
                <div style={{ marginTop: '10px', fontSize: '0.84rem', color: '#334155' }}>
                  <strong>Student Notes:</strong> {activeReviewData.submission.notes}
                </div>
              )}
            </div>

            {/* Revision feedback area */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
                Revision Feedback (If requesting changes):
              </label>
              <textarea
                rows="3"
                placeholder="Give constructive feedback for the student creator before approving release..."
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => handleReviewAction('revision')}
                disabled={reviewLoading}
                className="btn-secondary-tactile"
                style={{ color: '#92400E', borderColor: '#FDE68A', background: '#FEF3C7' }}
              >
                ↻ Request Revision
              </button>

              <button
                className="btn-emerald"
                onClick={() => handleReviewAction('approve')}
                disabled={reviewLoading}
              >
                {reviewLoading ? 'Releasing Funds...' : `✓ Approve & Release ₹${activeReviewData.amount?.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GST INVOICE MODAL */}
      {invoiceModalOpen && invoiceData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '640px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  TAX INVOICE / RECEIPT
                </h3>
                <div className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {invoiceData.invoiceNumber}
                </div>
              </div>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Platform & Brand Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', marginBottom: '18px' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{invoiceData.platform.legalName}</div>
                <div className="font-mono">GSTIN: {invoiceData.platform.gstin}</div>
                <div>{invoiceData.platform.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Billed To:</div>
                <div>{invoiceData.brand.companyName}</div>
                <div>{invoiceData.brand.representative}</div>
              </div>
            </div>

            {/* Project Specs */}
            <div style={{ background: '#FAFAF9', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px' }}>
              <div><strong>Project:</strong> {invoiceData.project.contractTitle}</div>
              <div><strong>Milestone #{invoiceData.project.milestoneNumber}:</strong> {invoiceData.project.milestoneTitle}</div>
              <div className="font-mono"><strong>Razorpay Payment ID:</strong> {invoiceData.project.razorpayPaymentId}</div>
            </div>

            {/* Financial Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', marginBottom: '20px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0' }}>Milestone Gross Amount</td>
                  <td className="font-mono" style={{ textAlign: 'right', fontWeight: 600 }}>₹{invoiceData.breakdown.milestoneGrossAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0' }}>Platform Service Fee ({invoiceData.breakdown.platformFeePercent}%)</td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>₹{invoiceData.breakdown.platformFeeAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 0' }}>GST on Platform Fee (18%)</td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>₹{invoiceData.breakdown.gstAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '2px solid #0F172A', fontWeight: 700, fontSize: '0.94rem' }}>
                  <td style={{ padding: '10px 0' }}>Total Paid by Brand</td>
                  <td className="font-mono" style={{ textAlign: 'right', color: '#059669' }}>₹{invoiceData.breakdown.totalPaidByBrand?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary-tactile"
                onClick={() => window.print()}
              >
                🖨️ Print / Save PDF
              </button>
              <button
                className="btn-emerald"
                onClick={() => setInvoiceModalOpen(false)}
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

export default ActiveContractsView;
