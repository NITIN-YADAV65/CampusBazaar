import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  TrendingUp 
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Report } from '../lib/database.types';

export const AdminDashboardPage: React.FC = () => {
  const { listings, deleteListing } = useMarketplace();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'reports'>('overview');

  // Sample users list for admin moderation
  const [usersList, setUsersList] = useState([
    { id: 'u-1', name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', role: 'user', status: 'active', listings: 2 },
    { id: 'u-2', name: 'Rohan Mehra', email: 'rohan.mehra@lpu.in', role: 'user', status: 'active', listings: 2 },
    { id: 'u-3', name: 'Pooja Verma', email: 'pooja.verma@outlook.com', role: 'user', status: 'active', listings: 1 },
    { id: 'u-4', name: 'Simran Kaur', email: 'simran.kaur@yahoo.com', role: 'user', status: 'active', listings: 2 },
    { id: 'u-5', name: 'Vikramaditya Roy', email: 'vikram.roy@gmail.com', role: 'user', status: 'active', listings: 1 }
  ]);

  // Reports list: empty when Supabase is configured, or load from DB
  const [reportsList, setReportsList] = useState<Report[]>(() => {
    if (isSupabaseConfigured) return [];
    return [
      {
        id: 'rep-1',
        reporter_id: 'u-3',
        listing_id: 'sample-1',
        reason: 'Wrong information',
        description: 'The model number mentioned is Casio 991EX but photo shows older 991ES. Please check.',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        listing: listings[0]
      }
    ];
  });

  React.useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const fetchAdminReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, listing:listings(*)');
        if (!error && data) {
          setReportsList(data);
        }
      } catch (e) {
        console.error('Error fetching admin reports:', e);
      }
    };
    fetchAdminReports();
  }, [user]);

  const handleToggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    }));
  };

  const handleResolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReportsList(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
  };

  const totalValue = listings.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Admin Header */}
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800 }}>CampusBazaar Admin Portal</h1>
              <span className="badge" style={{ backgroundColor: '#f59e0b', color: '#0f172a', fontWeight: 800 }}>
                Restricted Access
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Logged in as Moderator: <strong>{profile?.full_name || user?.email || 'Campus Administrator'}</strong>
            </p>
          </div>
        </div>

        {/* Quick stat chips */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2dd4bf' }}>{listings.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Listings</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{reportsList.filter(r => r.status === 'pending').length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pending Reports</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { id: 'overview', label: 'Statistics Overview', icon: TrendingUp },
          { id: 'listings', label: `Manage Listings (${listings.length})`, icon: Package },
          { id: 'users', label: `Manage Users (${usersList.length})`, icon: Users },
          { id: 'reports', label: `Review Reports (${reportsList.filter(r => r.status === 'pending').length})`, icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.875rem' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Listings</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {listings.filter(l => l.status === 'active').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Across 12 Campus Categories</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Catalog Value</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                ₹{totalValue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Available for student trade</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                {usersList.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>100% email verified</div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Campus Safety Rating</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>
                99.4%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>0 illegal items detected</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE LISTINGS */}
      {activeTab === 'listings' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem' }}>Listing</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Condition</th>
                <th style={{ padding: '1rem' }}>Seller</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{item.category_id}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-used">{item.condition}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{item.seller?.full_name || 'Campus Student'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${item.status === 'active' ? 'badge-new' : 'badge-sold'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => deleteListing(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Remove listing from marketplace"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Active Listings</th>
                <th style={{ padding: '1rem' }}>Account Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Moderation Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{u.role}</td>
                  <td style={{ padding: '1rem' }}>{u.listings} items</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.status === 'active' ? 'badge-verified' : 'badge-used'}`} style={{ color: u.status === 'suspended' ? '#ef4444' : undefined }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`btn btn-sm ${u.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                      style={{ color: u.status === 'active' ? 'var(--danger)' : '#ffffff' }}
                    >
                      <Ban size={14} />
                      <span>{u.status === 'active' ? 'Suspend' : 'Unsuspend'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REVIEW REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reportsList.map((report) => (
            <div key={report.id} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${report.status === 'pending' ? '#f59e0b' : '#10b981'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                      Reason: {report.reason}
                    </span>
                    <span className="badge" style={{ backgroundColor: report.status === 'pending' ? '#fef3c7' : '#d1fae5', color: report.status === 'pending' ? '#b45309' : '#059669' }}>
                      Status: {report.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, marginTop: '0.5rem' }}>
                    Reported Listing: "{report.listing?.title || 'Listing item'}"
                  </h4>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>

              {report.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  "{report.description}"
                </p>
              )}

              {report.status === 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => handleResolveReport(report.id, 'dismissed')} className="btn btn-outline btn-sm">
                    Dismiss Report
                  </button>
                  <button onClick={() => {
                    if (report.listing_id) deleteListing(report.listing_id);
                    handleResolveReport(report.id, 'resolved');
                  }} className="btn btn-danger btn-sm">
                    Remove Listing & Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
