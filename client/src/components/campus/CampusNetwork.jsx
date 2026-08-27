import React, { useState } from 'react';
import { MapPin, Users, TrendingUp } from 'lucide-react';

const zonesData = {
  north: {
    label: 'North Zone',
    campuses: 145,
    ambassadors: '12,500+',
    reach: '3.4M',
    colleges: [
      { name: 'IIT Delhi', city: 'New Delhi', leads: 85 },
      { name: 'Delhi University (DU)', city: 'New Delhi', leads: 340 },
      { name: 'Delhi Technological Univ (DTU)', city: 'New Delhi', leads: 160 },
      { name: 'Jawaharlal Nehru Univ (JNU)', city: 'New Delhi', leads: 95 },
      { name: 'Amity University', city: 'Noida', leads: 220 },
      { name: 'IP University (GGSIPU)', city: 'New Delhi', leads: 195 },
      { name: 'Chandigarh University', city: 'Chandigarh', leads: 175 },
      { name: 'Lovely Professional Univ (LPU)', city: 'Punjab', leads: 240 },
    ]
  },
  south: {
    label: 'South Zone',
    campuses: 135,
    ambassadors: '11,800+',
    reach: '3.1M',
    colleges: [
      { name: 'IIT Madras', city: 'Chennai', leads: 90 },
      { name: 'Christ University', city: 'Bangalore', leads: 290 },
      { name: 'VIT University', city: 'Vellore', leads: 380 },
      { name: 'SRM Institute', city: 'Chennai', leads: 320 },
      { name: 'Manipal Academy (MAHE)', city: 'Manipal', leads: 260 },
      { name: 'IIIT Hyderabad', city: 'Hyderabad', leads: 130 },
      { name: 'NIT Trichy', city: 'Tiruchirappalli', leads: 115 },
      { name: 'BITS Pilani Goa', city: 'Goa', leads: 105 },
    ]
  },
  west: {
    label: 'West Zone',
    campuses: 115,
    ambassadors: '10,200+',
    reach: '2.6M',
    colleges: [
      { name: 'IIT Bombay', city: 'Mumbai', leads: 95 },
      { name: 'NMIMS University', city: 'Mumbai', leads: 210 },
      { name: 'BITS Pilani', city: 'Pilani', leads: 140 },
      { name: 'DJ Sanghvi College', city: 'Mumbai', leads: 110 },
      { name: 'Symbiosis International', city: 'Pune', leads: 230 },
      { name: 'MIT World Peace Univ', city: 'Pune', leads: 170 },
      { name: 'IIT Gandhinagar', city: 'Ahmedabad', leads: 80 },
      { name: 'SVNIT Surat', city: 'Surat', leads: 90 },
    ]
  },
  east: {
    label: 'East Zone',
    campuses: 75,
    ambassadors: '8,400+',
    reach: '1.4M',
    colleges: [
      { name: 'IIT Kharagpur', city: 'Kharagpur', leads: 115 },
      { name: 'Jadavpur University', city: 'Kolkata', leads: 210 },
      { name: 'NIT Durgapur', city: 'Durgapur', leads: 135 },
      { name: 'KIIT University', city: 'Bhubaneswar', leads: 260 },
      { name: 'IIT Guwahati', city: 'Guwahati', leads: 85 },
      { name: 'NIT Silchar', city: 'Silchar', leads: 70 },
    ]
  },
  central: {
    label: 'Central Zone',
    campuses: 55,
    ambassadors: '9,200+',
    reach: '1.5M',
    colleges: [
      { name: 'IIT Kanpur', city: 'Kanpur', leads: 95 },
      { name: 'IIT (BHU) Varanasi', city: 'Varanasi', leads: 110 },
      { name: 'IIIT Allahabad', city: 'Prayagraj', leads: 90 },
      { name: 'MANIT Bhopal', city: 'Bhopal', leads: 120 },
      { name: 'IIT Indore', city: 'Indore', leads: 75 },
      { name: 'IIIT Jabalpur', city: 'Jabalpur', leads: 60 },
    ]
  }
};

export function CampusNetwork() {
  const [activeZoneKey, setActiveZoneKey] = useState('north');
  const activeZone = zonesData[activeZoneKey];

  return (
    <section id="network" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-section-header">
          <div className="cp-eyebrow">
            <MapPin size={14} />
            <span>Pan-India Presence</span>
          </div>
          <h2 className="cp-section-title">
            500+ Campuses. <span className="cp-green-gradient-text">One Unified Network.</span>
          </h2>
          <p className="cp-section-subtitle">
            Direct student reach across premier technical institutes, central universities, and top tier-1/tier-2 college hubs.
          </p>
        </div>

        {/* Zone Filter Tabs */}
        <div className="cp-zone-tabs">
          {Object.keys(zonesData).map((key) => (
            <button
              key={key}
              className={`cp-zone-tab-btn ${activeZoneKey === key ? 'active' : ''}`}
              onClick={() => setActiveZoneKey(key)}
            >
              {zonesData[key].label}
            </button>
          ))}
        </div>

        {/* Zone Stats Summary Bar */}
        <div className="cp-network-summary-bar">
          <div className="cp-glass-card cp-zone-stat-card">
            <div className="cp-zone-stat-icon"><MapPin size={22} /></div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>{activeZone.campuses}</h4>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Target Campuses</p>
            </div>
          </div>

          <div className="cp-glass-card cp-zone-stat-card">
            <div className="cp-zone-stat-icon"><Users size={22} /></div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>{activeZone.ambassadors}</h4>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Active Ambassadors</p>
            </div>
          </div>

          <div className="cp-glass-card cp-zone-stat-card">
            <div className="cp-zone-stat-icon"><TrendingUp size={22} /></div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800 }}>{activeZone.reach}</h4>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Monthly Impressions</p>
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="cp-colleges-grid">
          {activeZone.colleges.map((college, idx) => (
            <div key={idx} className="cp-glass-card cp-college-card">
              <div className="cp-college-top">
                <div className="cp-green-dot" />
                <div className="cp-college-name">{college.name}</div>
              </div>
              <div className="cp-college-bottom">
                <span>{college.city}</span>
                <span className="cp-amb-badge">{college.leads} Leads</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
