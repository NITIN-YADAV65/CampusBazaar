import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReportReason } from '../../lib/database.types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS: ReportReason[] = [
  'Scam',
  'Fake listing',
  'Wrong information',
  'Duplicate listing',
  'Inappropriate content',
  'Other'
];

export const ReportModal: React.FC<ReportModalProps> = ({
  listingId,
  listingTitle,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('Scam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please log in to report this listing.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('reports').insert({
          reporter_id: user.id,
          listing_id: listingId,
          reason: selectedReason,
          description: description.trim() || null,
          status: 'pending'
        });

        if (error) throw error;
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Report Listing
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Keep our campus marketplace safe and authentic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Submitted</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Thank you for keeping CampusBazaar safe. Our moderators will review this listing shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Reporting Item:</span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{listingTitle}</strong>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}>
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Reason *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${selectedReason === reason ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: selectedReason === reason ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: selectedReason === reason ? 'var(--primary)' : 'var(--text-primary)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Provide any specific details to help our campus moderation team investigate..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
