import React, { useState, useMemo } from 'react';
import { Calculator, Users, Eye, UserCheck, IndianRupee, Target, MonitorPlay, Beaker } from 'lucide-react';

export function CampusCalculator({ onOpenBrandModal }) {
  const [campuses, setCampuses] = useState(50);
  const [duration, setDuration] = useState(4);
  const [campaignType, setCampaignType] = useState('ambassador');

  const typeOptions = [
    { id: 'ambassador', label: 'Ambassador Squads', icon: Users },
    { id: 'offline', label: 'Offline Activations', icon: Target },
    { id: 'digital', label: 'Digital Blitz', icon: MonitorPlay },
    { id: 'sampling', label: 'Product Sampling', icon: Beaker },
  ];

  const metrics = useMemo(() => {
    const baseReach = { ambassador: 850, offline: 1400, digital: 2200, sampling: 600 };
    const baseImpressions = { ambassador: 5500, offline: 9000, digital: 16000, sampling: 3500 };
    const baseLeads = { ambassador: 60, offline: 95, digital: 140, sampling: 40 };
    const baseCost = { ambassador: 7500, offline: 14000, digital: 4800, sampling: 11000 };
    
    const weekMultiplier = Math.pow(duration, 0.7);
    const reach = Math.round(campuses * baseReach[campaignType] * weekMultiplier);
    const impressions = Math.round(campuses * baseImpressions[campaignType] * weekMultiplier);
    const leads = Math.round(campuses * baseLeads[campaignType] * weekMultiplier);
    const cost = Math.round(campuses * baseCost[campaignType] * weekMultiplier);
    
    return { reach, impressions, leads, cost };
  }, [campuses, duration, campaignType]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);

  return (
    <section id="calculator" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-section-header">
          <div className="cp-eyebrow">
            <Calculator size={14} />
            <span>Interactive ROI Estimator</span>
          </div>
          <h2 className="cp-section-title">
            Estimate Your <span className="cp-green-gradient-text">Campus Impact & Reach</span>
          </h2>
          <p className="cp-section-subtitle">
            Use our interactive campaign calculator to project student reach, impression counts, leads, and estimated investment for your target campuses.
          </p>
        </div>

        <div className="cp-glass-card cp-calculator-panel">
          
          {/* Controls Side */}
          <div className="cp-calc-controls">
            
            {/* Slider 1: Campuses */}
            <div className="cp-calc-field-group">
              <div className="cp-calc-label-bar">
                <label>Target Campuses</label>
                <span>{campuses} Colleges</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={campuses}
                onChange={(e) => setCampuses(Number(e.target.value))}
                className="cp-range-input"
              />
            </div>

            {/* Slider 2: Duration */}
            <div className="cp-calc-field-group">
              <div className="cp-calc-label-bar">
                <label>Campaign Duration</label>
                <span>{duration} {duration === 1 ? 'Week' : 'Weeks'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="cp-range-input"
              />
            </div>

            {/* Campaign Type Buttons */}
            <div className="cp-calc-field-group">
              <div className="cp-calc-label-bar">
                <label>Select Campaign Strategy</label>
              </div>
              <div className="cp-type-options-grid">
                {typeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = campaignType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      className={`cp-type-opt-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setCampaignType(opt.id)}
                    >
                      <Icon size={18} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Results Side */}
          <div className="cp-calc-results">
            <div className="cp-results-grid">
              
              <div className="cp-result-box">
                <Users size={22} />
                <div className="cp-res-val">{formatNumber(metrics.reach)}</div>
                <div className="cp-res-lbl">Estimated Student Reach</div>
              </div>

              <div className="cp-result-box">
                <Eye size={22} />
                <div className="cp-res-val">{formatNumber(metrics.impressions)}</div>
                <div className="cp-res-lbl">Total Impressions</div>
              </div>

              <div className="cp-result-box">
                <UserCheck size={22} />
                <div className="cp-res-val">{formatNumber(metrics.leads)}</div>
                <div className="cp-res-lbl">Projected Leads / Signups</div>
              </div>

              <div className="cp-result-box highlight">
                <IndianRupee size={22} />
                <div className="cp-res-val" style={{ color: '#34d399' }}>{formatCurrency(metrics.cost)}</div>
                <div className="cp-res-lbl">Est. Investment Range</div>
              </div>

            </div>

            <button onClick={onOpenBrandModal} className="cp-btn cp-btn-primary" style={{ width: '100%' }}>
              Request Custom Campaign Proposal
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
