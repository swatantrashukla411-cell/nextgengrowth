import React, { useState, useEffect } from 'react';
import marketplaceApi from '../../api/marketplace';

export const EarningsPayoutCenter = () => {
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingBalance: 0,
    lifetimeEarned: 0,
  });
  const [escrowLocked, setEscrowLocked] = useState(0);
  const [payouts, setPayouts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payout request modal/form state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('upi'); // 'upi' or 'bank'
  const [payoutAmount, setPayoutAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWallet = async () => {
    try {
      const res = await marketplaceApi.getStudentWallet();
      if (res.data?.success) {
        setWalletData(res.data.wallet || {});
        setEscrowLocked(res.data.escrowLocked || 0);
        setPayouts(res.data.payouts || []);
        setEarnings(res.data.earnings || []);
      }
    } catch (err) {
      console.error('Fetch wallet error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handlePayoutSubmit = async () => {
    const amt = Number(payoutAmount);
    if (!amt || amt < 100) {
      setErrorMsg('Minimum payout amount is ₹100.');
      return;
    }
    if (amt > walletData.availableBalance) {
      setErrorMsg(`Amount exceeds available balance (₹${walletData.availableBalance.toLocaleString('en-IN')}).`);
      return;
    }

    if (payoutMethod === 'upi' && (!upiId || !upiId.includes('@'))) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okaxis).');
      return;
    }

    if (payoutMethod === 'bank' && (!accountNumber || !ifsc || !accountHolder)) {
      setErrorMsg('Please fill in Account Holder, Account Number, and IFSC code.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        amount: amt,
        payoutMethod,
        payoutDetails: {
          upiId,
          accountHolder,
          accountNumber,
          ifsc: ifsc.toUpperCase(),
          bankName,
        },
      };

      const res = await marketplaceApi.requestPayout(payload);
      if (res.data?.success) {
        setPayoutModalOpen(false);
        setSuccessMsg(res.data.message || 'Payout request submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 6000);
        fetchWallet();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payout request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPayoutStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#ecfdf5', color: '#047857', label: '✅ Transferred' };
      case 'processing':
        return { bg: '#eff6ff', color: '#1d4ed8', label: '⏳ Processing' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejected' };
      default:
        return { bg: '#fef3c7', color: '#b45309', label: '🕒 Pending Approval' };
    }
  };

  return (
    <div style={{ padding: '28px 24px 64px', maxWidth: '1140px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          <span>●</span> India-First Student Payouts (UPI / Bank)
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
          Earnings & Payout Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Withdraw available funds directly to your verified UPI VPA or IMPS/NEFT bank account.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #34d399', borderRadius: '10px', color: '#065f46', marginBottom: '22px', fontWeight: 600, fontSize: '0.9rem' }}>
          {successMsg}
        </div>
      )}

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Available for Payout */}
        <div
          className="card-tactile"
          style={{
            padding: '24px',
            borderLeft: '4px solid var(--brand-primary)',
            background: '#ffffff',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--brand-primary-hover)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available for Payout
          </div>
          <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '6px' }}>
            ₹{walletData.availableBalance?.toLocaleString('en-IN')}
          </div>
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => {
                setPayoutAmount(walletData.availableBalance > 0 ? walletData.availableBalance : '');
                setPayoutModalOpen(true);
              }}
              disabled={walletData.availableBalance < 100}
              className="btn-emerald"
              style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
            >
              Withdraw Funds (UPI / Bank)
            </button>
          </div>
        </div>

        {/* Funds in Escrow */}
        <div className="card-tactile" style={{ padding: '24px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Funds in Escrow (Locked)
          </div>
          <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: '#b45309', marginTop: '6px' }}>
            ₹{(walletData.pendingBalance || escrowLocked).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '12px', lineHeight: 1.4 }}>
            Secured by hiring brand. Auto-releases upon deliverable approval or after 7-day review window.
          </div>
        </div>

        {/* Lifetime Earned */}
        <div className="card-tactile" style={{ padding: '24px', borderLeft: '3px solid #6366f1' }}>
          <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Lifetime Earned
          </div>
          <div className="font-mono" style={{ fontSize: '2.1rem', fontWeight: 800, color: '#4338ca', marginTop: '6px' }}>
            ₹{walletData.lifetimeEarned?.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.4 }}>
            Net earnings across all completed milestones after flat 10% platform fee.
          </div>
        </div>
      </div>

      {/* Main Grid: Payout History & Earnings Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Payout History */}
        <div className="card-tactile" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', background: '#FAFAF9' }}>
            Payout Requests History
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Date</th>
                  <th style={{ padding: '12px 18px' }}>Method</th>
                  <th style={{ padding: '12px 18px' }}>Account / VPA</th>
                  <th style={{ padding: '12px 18px' }}>Amount</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const badge = getPayoutStatusBadge(p.status);
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                      <td className="font-mono" style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                        {p.payoutMethod === 'upi' ? '⚡ UPI' : '🏦 IMPS'}
                      </td>
                      <td className="font-mono" style={{ padding: '14px 18px', color: '#334155', fontSize: '0.82rem' }}>
                        {p.payoutMethod === 'upi'
                          ? p.payoutDetails?.upiId
                          : `${p.payoutDetails?.accountNumber?.slice(-4) ? `••••${p.payoutDetails.accountNumber.slice(-4)}` : 'Bank'} (${p.payoutDetails?.ifsc})`}
                      </td>
                      <td className="font-mono" style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.92rem' }}>
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '42px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>💸</div>
                      <div style={{ fontWeight: 600 }}>No payout requests yet</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                        As you complete project milestones, withdraw earnings instantly here.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Earnings Feed */}
        <div className="card-tactile" style={{ padding: '22px' }}>
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Milestone Releases
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {earnings.map((e, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--brand-primary)' }}>
                    ₹{e.amount?.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                  {e.description || 'Milestone payment released'}
                </div>
              </div>
            ))}
            {earnings.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '28px 0' }}>
                No completed earnings yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYOUT REQUEST MODAL */}
      {payoutModalOpen && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Request Payout
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Available Balance: <strong className="font-mono" style={{ color: 'var(--brand-primary)' }}>₹{walletData.availableBalance?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <button onClick={() => setPayoutModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                ✕
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Method Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setPayoutMethod('upi')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: payoutMethod === 'upi' ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  background: payoutMethod === 'upi' ? 'var(--brand-surface)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: payoutMethod === 'upi' ? 'var(--brand-primary-hover)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                ⚡ Instant UPI VPA
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('bank')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: payoutMethod === 'bank' ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  background: payoutMethod === 'bank' ? 'var(--brand-surface)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: payoutMethod === 'bank' ? 'var(--brand-primary-hover)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                🏦 Bank IMPS / NEFT
              </button>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                Withdrawal Amount (INR) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  placeholder="Min ₹100"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="font-mono"
                  style={{ width: '100%', padding: '10px 12px 10px 26px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* UPI Fields */}
            {payoutMethod === 'upi' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  UPI Virtual Payment Address (VPA) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="font-mono"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-strong)', fontSize: '0.88rem' }}
                />
              </div>
            )}

            {/* Bank Fields */}
            {payoutMethod === 'bank' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="font-mono"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      className="font-mono"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary-tactile" onClick={() => setPayoutModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-emerald"
                onClick={handlePayoutSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting Request...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsPayoutCenter;
