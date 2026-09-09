import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SafetyPage: React.FC = () => {
  return (
    <div className="container" style={{ maxWidth: '880px', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#ccfbf1',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Campus Safety Guidelines
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: '580px', margin: '0 auto' }}>
          Keeping student-to-student transactions transparent, safe, and trustworthy across campus.
        </p>
      </div>

      {/* 4 Golden Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
        <h2 className="heading-section" style={{ fontSize: '1.5rem' }}>The 4 Golden Rules of Trading on Campus</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <MapPin size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Meet in Public Campus Spots</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Always organize handovers at bustling campus locations such as <strong>UniMall</strong>, <strong>Central Library</strong>, <strong>Block 34</strong>, or <strong>Hostel Main Entrances</strong> during daylight hours.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <CheckCircle size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Inspect Before Paying</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Check book editions, turn on electronic items (calculators, laptops, keyboards), and test bicycle brakes thoroughly before transferring any money.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <CreditCard size={22} color="#ef4444" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Never Send Advance Deposits</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Never wire money or UPI tokens to "reserve" an item prior to meeting. Real campus sellers will gladly arrange an on-campus handover.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <Clock size={22} color="#6366f1" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Keep Chat on Platform</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Communicate within CampusBazaar messages. This ensures an immutable record in case a dispute or item discrepancy needs moderator assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Prohibited Items Section */}
      <div id="rules" className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', backgroundColor: '#fff1f2', borderColor: '#fecdd3', marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <AlertOctagon size={28} color="#e11d48" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#9f1239' }}>
            Strictly Prohibited Items
          </h2>
        </div>
        <p style={{ color: '#881337', fontSize: '0.9375rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          CampusBazaar strictly bans the listing of any unlawful, dangerous, or unauthorized goods. Any user attempting to list the following will be immediately suspended:
        </p>
        <ul style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '0.75rem',
          color: '#9f1239',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Weapons, blades, or self-defense sprays
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Alcohol, tobacco, nicotine, or vapes
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Stolen college or hostel property
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Prescribed medicines or narcotics
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Pirated software keys & cheats
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={16} color="#e11d48" /> Counterfeit branded goods
          </li>
        </ul>
      </div>

      {/* Reporting Section */}
      <div id="reporting" style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Notice Something Suspicious?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
          Every product detail page includes a <strong>Flag / Report</strong> button. Our student moderation team reviews flagged listings within 2 hours.
        </p>
        <Link to="/search" className="btn btn-primary">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
};
