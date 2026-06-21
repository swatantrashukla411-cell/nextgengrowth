import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

export function WhyUsSection() {
  const comparisonData = [
    {
      feature: "Hiring Turnaround",
      traditional: "2 to 4 Weeks",
      nextgen: "Instant AI Match"
    },
    {
      feature: "Talent Quality",
      traditional: "Unverified resumes & bots",
      nextgen: "Pre-screened & KYC-verified"
    },
    {
      feature: "Payment Protection",
      traditional: "Delayed invoicing & invoices",
      nextgen: "Escrow-secured milestone payouts"
    },
    {
      feature: "Experience Verification",
      traditional: "Easily forged paper letters",
      nextgen: "Cryptographic proof-of-work certificates"
    },
    {
      feature: "Student Support",
      traditional: "Solo job boards",
      nextgen: "Community-driven mentorship circles"
    },
    {
      feature: "Onboarding Overhead",
      traditional: "Complex tax forms & manual contracts",
      nextgen: "Automated billing & tax compliance"
    }
  ];

  return (
    <section id="whyus" className="lp-whyus">
      <div className="lp-container">
        <div className="lp-features-header">
          <div className="lp-hero-pill">
            <ShieldAlert size={14} /> The NextGen Advantage
          </div>
          <h2 className="lp-title-section">
            Why Brands Choose <span>NextGenGrowth</span>
          </h2>
          <p className="lp-subtitle">
            Say goodbye to traditional job board spam, endless vetting processes, and compliance headaches. Experience the next era of contract hiring.
          </p>
        </div>

        <div className="lp-compare-wrapper">
          <table className="lp-compare-table">
            <thead>
              <tr>
                <th>Features & Infrastructure</th>
                <th>Traditional Portals</th>
                <th>NextGenGrowth</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{row.feature}</td>
                  <td className="lp-tag-portal">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <X size={14} color="#ef4444" /> {row.traditional}
                    </span>
                  </td>
                  <td className="lp-tag-nng">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={16} color="#34D399" /> {row.nextgen}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
