import React, { useEffect, useState } from "react";
import "../styles/Admin.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import api from "../utils/api";

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
 const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

 const resolveAssetUrl = (value) => {
   if (!value) return null;
   if (/^https?:\/\//i.test(value)) return value;
   if (value.startsWith('/')) return `${BACKEND_ORIGIN}${value}`;
   return `${BACKEND_ORIGIN}/${value}`;
 };

function UserModal({ user, onClose }) {
  if (!user) return null;
  const idPath = user.id_image_url || user.id_verification?.file_path || null;
  const idUrl = resolveAssetUrl(idPath);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>User details</h3>
          <button className="close" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">
          <p><strong>Name:</strong> {user.full_name || '—'}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Student ID:</strong> {user.student_id || '—'}</p>
          <p><strong>University:</strong> {user.university || '—'}</p>
          <p><strong>Batch:</strong> {user.batch || '—'}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.blocked ? 'Blocked' : (user.status === 'approved' ? 'Approved' : 'Pending')}</p>
          <div>
            <p><strong>ID Image:</strong></p>
            {idUrl ? (
              <div>
                <button
                  type="button"
                  className="btn-outline open-full-image"
                  onClick={() => window.open(idUrl, '_blank', 'noopener,noreferrer')}
                >
                  Open Full Image
                </button>
                <img
                  src={idUrl}
                  alt="ID Image"
                  style={{maxWidth: '100%', maxHeight: '300px', border: '1px solid #ccc', borderRadius: '4px'}}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <p className="no-id">No ID uploaded</p>
            )}
          </div>
          {user.bio && (
            <div>
              <p><strong>Bio:</strong></p>
              <pre style={{whiteSpace:'pre-wrap'}}>{user.bio}</pre>
            </div>
          )}
        </div>
        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </footer>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedPanel, setSelectedPanel] = useState('overview');

  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(null);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState(null);

  // Reports state
  const [selectedReport, setSelectedReport] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const loadUsers = async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      setUserError(err.response?.data?.message || err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await api.get('/admin/events');
      setEvents(res.data || []);
    } catch (err) {
      setEventsError(err.response?.data?.message || err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadGroups = async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const res = await api.get('/admin/groups');
      setGroups(res.data || []);
    } catch (err) {
      setGroupsError(err.response?.data?.message || err.message || 'Failed to load groups');
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data || []);
    } catch (err) {
      setReportsError(err.response?.data?.message || err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const loadContactMessages = async () => {
    setContactLoading(true);
    setContactError(null);
    try {
      const res = await api.get('/admin/contact-messages');
      setContactMessages(res.data || []);
    } catch (err) {
      setContactError(err.response?.data?.message || err.message || 'Failed to load contact messages');
      setContactMessages([]);
    } finally {
      setContactLoading(false);
    }
  };

  const loadReport = async (reportType) => {
    setSelectedReport(reportType);
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await api.get(`/admin/reports/${reportType}`);
      setReportData(res.data);
    } catch (err) {
      setReportError(err.response?.data?.message || err.message || 'Failed to load report');
      setReportData(null);
    } finally {
      setReportLoading(false);
    }
  };

  const resolveContactMessage = async (m) => {
    try {
      await api.patch(`/admin/contact-messages/${m._id || m.id}/resolve`);
      await loadContactMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not resolve message');
    }
  };

  useEffect(() => {
    // preload overview counts by fetching stats could be added later
    loadUsers();
  }, []);

  const handleApprove = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id || u.id}/approve`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not approve user');
    }
  };

  const handleToggleBlock = async (u) => {
    const want = u.blocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${want} ${u.email}?`)) return;
    try {
      await api.patch(`/admin/users/${u._id || u.id}/${want}`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || `Could not ${want} user`);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${u._id || u.id}`);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete user');
    }
  };

  const handleChangeRole = async (u) => {
    const newRole = window.prompt('Enter new role (admin/mod/user):', u.role || 'user');
    if (!newRole) return;
    try {
      await api.patch(`/admin/users/${u._id || u.id}/role`, { role: newRole });
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not change role');
    }
  };

  // Events handlers
  const approveEvent = async (e) => {
    try {
      await api.patch(`/admin/events/${e._id || e.id}/approve`);
      await loadEvents();
    } catch (err) { alert(err.response?.data?.message || 'Could not approve event'); }
  };

  const deleteEvent = async (e) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/admin/events/${e._id || e.id}`); await loadEvents(); } catch (err) { alert('Could not delete event'); }
  };

  const deleteEventAndCreator = async (e) => {
    const creator = e.created_by;
    const creatorLabel = creator?.email || creator?.full_name || 'this user';
    if (!window.confirm(`Delete this event AND the user who created it (${creatorLabel})? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/events/${e._id || e.id}/with-creator`);
      await Promise.all([loadEvents(), loadUsers()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete event and creator');
    }
  };

  // Groups handlers
  const toggleBlockGroup = async (g) => {
    const want = g.blocked ? 'unblock' : 'block';
    if (!window.confirm(`${want} group ${g.name}?`)) return;
    try {
      await api.patch(`/admin/groups/${g._id || g.id}/${want}`);
      await loadGroups();
    } catch (err) { alert('Could not update group'); }
  };

  const deleteGroupAndCreator = async (g) => {
    const creator = g.created_by;
    const creatorLabel = creator?.email || creator?.full_name || 'this user';
    if (!window.confirm(`Delete this group AND the user who created it (${creatorLabel})? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/groups/${g._id || g.id}/with-creator`);
      await Promise.all([loadGroups(), loadUsers()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete group and creator');
    }
  };

  // Reports handlers
  const resolveReport = async (r) => {
    try { await api.patch(`/admin/reports/${r._id || r.id}/resolve`); await loadReports(); } catch (err) { alert('Could not resolve report'); }
  };

  return (
    <>
      <TopNavbar />
      <div className="admin-page">
        <section className="admin-hero">
          <div className="admin-grid">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-header">
                <h2>Admin</h2>
                <p className="muted">Dashboard</p>
              </div>
              <nav className="admin-nav">
                <button className={selectedPanel === 'overview' ? 'active' : ''} onClick={() => setSelectedPanel('overview')}>Overview</button>
                <button className={selectedPanel === 'users' ? 'active' : ''} onClick={() => { setSelectedPanel('users'); loadUsers(); }}>Users</button>
                <button className={selectedPanel === 'events' ? 'active' : ''} onClick={() => { setSelectedPanel('events'); loadEvents(); }}>Events</button>
                <button className={selectedPanel === 'groups' ? 'active' : ''} onClick={() => { setSelectedPanel('groups'); loadGroups(); }}>Groups</button>
                <button className={selectedPanel === 'reports' ? 'active' : ''} onClick={() => { setSelectedPanel('reports'); loadReports(); }}>Reports</button>
                <button className={selectedPanel === 'contactMessages' ? 'active' : ''} onClick={() => { setSelectedPanel('contactMessages'); loadContactMessages(); }}>Messages</button>
              </nav>
            </aside>

            <main className="admin-main">
              {selectedPanel === 'overview' && (
                <>
                  <h1>Overview</h1>
                  <p className="subtitle">Key metrics and quick actions</p>
                  <div className="overview-cards">
                    <div className="overview-card">
                      <h3>Users</h3>
                      <p>{users.length} loaded</p>
                      <button className="btn-primary" onClick={() => { setSelectedPanel('users'); loadUsers(); }}>Manage Users</button>
                    </div>
                    <div className="overview-card">
                      <h3>Events</h3>
                      <p>{events.length} loaded</p>
                      <button className="btn-primary" onClick={() => { setSelectedPanel('events'); loadEvents(); }}>Manage Events</button>
                    </div>
                    <div className="overview-card">
                      <h3>Groups</h3>
                      <p>{groups.length} loaded</p>
                      <button className="btn-primary" onClick={() => { setSelectedPanel('groups'); loadGroups(); }}>Manage Groups</button>
                    </div>
                    <div className="overview-card">
                      <h3>Reports</h3>
                      <p>{reports.length} loaded</p>
                      <button className="btn-primary" onClick={() => { setSelectedPanel('reports'); loadReports(); }}>View Reports</button>
                    </div>
                  </div>
                </>
              )}

              {selectedPanel === 'users' && (
                <>
                  <h1>User Management</h1>
                  <p className="subtitle">View, approve, block/unblock, change roles or delete users.</p>

                  {userLoading && <p>Loading users…</p>}
                  {userError && <p style={{ color: 'red' }}>{userError}</p>}

                  {!userLoading && users.length === 0 && !userError && (
                    <p>No users found.</p>
                  )}

                  {users.length > 0 && (
                    <div className="table-wrap">
                      <table className="users-table" style={{width:'100%'}}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Student ID</th>
                            <th>ID Image</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id || u.id}>
                              <td style={{fontSize:12, color:'#ccc'}}>{u._id}</td>
                              <td>{u.full_name || '—'}</td>
                              <td>{u.email}</td>
                              <td>{u.student_id || '—'}</td>
                              <td>
                                {resolveAssetUrl(u.id_image_url || u.id_verification?.file_path) ? (
                                  <img 
                                    src={resolveAssetUrl(u.id_image_url || u.id_verification?.file_path)} 
                                    alt="ID" 
                                    className="id-thumbnail"
                                    onClick={() => setSelectedUser(u)}
                                    title="Click to view full ID"
                                  />
                                ) : (
                                  <span className="no-id">No ID</span>
                                )}
                              </td>
                              <td>{u.role}</td>
                              <td>{u.blocked ? 'Blocked' : (u.status === 'approved' ? 'Approved' : 'Pending')}</td>
                              <td style={{textAlign:'right'}}>
                                <div className="action-buttons">
                                  <button className="btn-outline" onClick={() => setSelectedUser(u)}>View</button>
                                  <button className="btn-primary" onClick={() => handleApprove(u)}>Approve</button>
                                  <button className="btn-secondary" onClick={() => handleChangeRole(u)}>Role</button>
                                  <button className="btn-warning" onClick={() => handleToggleBlock(u)}>{u.blocked ? 'Unblock' : 'Block'}</button>
                                  <button className="btn-danger" onClick={() => handleDelete(u)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {selectedPanel === 'events' && (
                <>
                  <h1>Events</h1>
                  <p className="subtitle">Approve or remove submitted events, and moderate their creators.</p>
                  {eventsLoading && <p>Loading events…</p>}
                  {eventsError && <p style={{color:'red'}}>{eventsError}</p>}
                  {!eventsLoading && events.length === 0 && <p>No events found.</p>}
                  {events.length > 0 && (
                    <div className="table-wrap">
                      <table className="users-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Creator</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map(e => (
                            <tr key={e._id || e.id}>
                              <td style={{fontSize:12, color:'#ccc'}}>{e._id}</td>
                              <td>{e.title}</td>
                              <td>{e.date ? new Date(e.date).toLocaleString() : '—'}</td>
                              <td>{e.status}</td>
                              <td>
                                {e.created_by ? (
                                  <button
                                    type="button"
                                    className="link-button"
                                    onClick={() => setSelectedUser(e.created_by)}
                                  >
                                    {e.created_by.full_name || e.created_by.email || 'View creator'}
                                  </button>
                                ) : (
                                  <span className="muted">Unknown</span>
                                )}
                              </td>
                              <td style={{textAlign:'right'}}>
                                <div className="action-buttons">
                                  <button className="btn-primary" onClick={() => approveEvent(e)}>Approve</button>
                                  <button className="btn-danger" onClick={() => deleteEvent(e)}>Delete</button>
                                  <button className="btn-danger" onClick={() => deleteEventAndCreator(e)}>Delete + User</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {selectedPanel === 'groups' && (
                <>
                  <h1>Groups</h1>
                  <p className="subtitle">Manage groups: block/unblock or delete, and moderate their creators.</p>
                  {groupsLoading && <p>Loading groups…</p>}
                  {groupsError && <p style={{color:'red'}}>{groupsError}</p>}
                  {!groupsLoading && groups.length === 0 && <p>No groups found.</p>}
                  {groups.length > 0 && (
                    <div className="table-wrap">
                      <table className="users-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Creator</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groups.map(g => (
                            <tr key={g._id || g.id}>
                              <td style={{fontSize:12, color:'#ccc'}}>{g._id}</td>
                              <td>{g.name}</td>
                              <td>{g.description || '—'}</td>
                              <td>
                                {g.created_by ? (
                                  <button
                                    type="button"
                                    className="link-button"
                                    onClick={() => setSelectedUser(g.created_by)}
                                  >
                                    {g.created_by.full_name || g.created_by.email || 'View creator'}
                                  </button>
                                ) : (
                                  <span className="muted">Unknown</span>
                                )}
                              </td>
                              <td style={{textAlign:'right'}}>
                                <div className="action-buttons">
                                  <button className="btn-warning" onClick={() => toggleBlockGroup(g)}>{g.blocked ? 'Unblock' : 'Block'}</button>
                                  <button className="btn-danger" onClick={() => deleteGroupAndCreator(g)}>Delete + User</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {selectedPanel === 'reports' && (
                <>
                  <h1>Reports</h1>
                  <p className="subtitle">Review and resolve reports, or generate analytics.</p>
                  
                  {/* Report Generation Buttons */}
                  <div className="report-buttons-grid">
                    <button className="report-btn" onClick={() => loadReport('user-stats')}>
                      <span className="report-icon">👥</span>
                      <span className="report-label">User Statistics</span>
                      <span className="report-desc">User demographics, growth, status</span>
                    </button>
                    <button className="report-btn" onClick={() => loadReport('event-stats')}>
                      <span className="report-icon">📅</span>
                      <span className="report-label">Event Statistics</span>
                      <span className="report-desc">Events by status, attendees, upcoming</span>
                    </button>
                    <button className="report-btn" onClick={() => loadReport('group-stats')}>
                      <span className="report-icon">👥</span>
                      <span className="report-label">Group Statistics</span>
                      <span className="report-desc">Groups count, members, top groups</span>
                    </button>
                    <button className="report-btn" onClick={() => loadReport('activity')}>
                      <span className="report-icon">💬</span>
                      <span className="report-label">Activity Report</span>
                      <span className="report-desc">Messages, activity over time</span>
                    </button>
                    <button className="report-btn" onClick={() => loadReport('moderation')}>
                      <span className="report-icon">🛡️</span>
                      <span className="report-label">Moderation Report</span>
                      <span className="report-desc">Reports, resolution rate, trends</span>
                    </button>
                    <button className="report-btn" onClick={() => loadReport('engagement')}>
                      <span className="report-icon">📊</span>
                      <span className="report-label">Engagement Report</span>
                      <span className="report-desc">Connections, participation, top users</span>
                    </button>
                  </div>

                  {/* Report Results Display */}
                  {reportLoading && <p>Loading report…</p>}
                  {reportError && <p style={{color:'red'}}>{reportError}</p>}

                  {reportData && (
                    <div className="report-results">
                      {reportData.generatedAt && (
                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '20px' }}>
                          Report generated: {new Date(reportData.generatedAt).toLocaleString()}
                        </p>
                      )}

                      {/* User Stats */}
                      {reportData.totalUsers !== undefined && (
                        <div className="report-section">
                          <h2>User Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Total Users</h4>
                              <p className="stat-number">{reportData.totalUsers}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Blocked</h4>
                              <p className="stat-number">{reportData.blockedUsers || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (7d)</h4>
                              <p className="stat-number">{reportData.newUsersLast7Days || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (30d)</h4>
                              <p className="stat-number">{reportData.newUsersLast30Days || 0}</p>
                            </div>
                          </div>
                          <div className="stats-detail">
                            <h4>By Role</h4>
                            <pre>{JSON.stringify(reportData.byRole || {}, null, 2)}</pre>
                          </div>
                          <div className="stats-detail">
                            <h4>By Status</h4>
                            <pre>{JSON.stringify(reportData.byStatus || {}, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Event Stats */}
                      {reportData.totalEvents !== undefined && (
                        <div className="report-section">
                          <h2>Event Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Total Events</h4>
                              <p className="stat-number">{reportData.totalEvents}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Upcoming</h4>
                              <p className="stat-number">{reportData.upcomingEvents || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (7d)</h4>
                              <p className="stat-number">{reportData.newEventsLast7Days || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (30d)</h4>
                              <p className="stat-number">{reportData.newEventsLast30Days || 0}</p>
                            </div>
                          </div>
                          <div className="stats-detail">
                            <h4>By Status</h4>
                            <pre>{JSON.stringify(reportData.byStatus || {}, null, 2)}</pre>
                          </div>
                          {reportData.topEventsByAttendees?.length > 0 && (
                            <div className="stats-detail">
                              <h4>Top Events by Attendees</h4>
                              <ul>
                                {reportData.topEventsByAttendees.map((e, i) => (
                                  <li key={i}>{e.title} - {e.attendees?.length || 0} attendees</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Group Stats */}
                      {reportData.totalGroups !== undefined && (
                        <div className="report-section">
                          <h2>Group Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Total Groups</h4>
                              <p className="stat-number">{reportData.totalGroups}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Blocked</h4>
                              <p className="stat-number">{reportData.blockedGroups || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (7d)</h4>
                              <p className="stat-number">{reportData.newGroupsLast7Days || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>New (30d)</h4>
                              <p className="stat-number">{reportData.newGroupsLast30Days || 0}</p>
                            </div>
                          </div>
                          {reportData.topGroupsByMembers?.length > 0 && (
                            <div className="stats-detail">
                              <h4>Top Groups by Members</h4>
                              <ul>
                                {reportData.topGroupsByMembers.map((g, i) => (
                                  <li key={i}>{g.name} - {g.members?.length || 0} members</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Activity Stats */}
                      {reportData.directMessages && (
                        <div className="report-section">
                          <h2>Activity Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Direct Messages</h4>
                              <p className="stat-number">{reportData.directMessages.total}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Last 24h</h4>
                              <p className="stat-number">{reportData.directMessages.last24Hours}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Group Messages</h4>
                              <p className="stat-number">{reportData.groupMessages?.total || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Last 7d</h4>
                              <p className="stat-number">{reportData.groupMessages?.last7Days || 0}</p>
                            </div>
                          </div>
                          {reportData.topMessageSenders?.length > 0 && (
                            <div className="stats-detail">
                              <h4>Top Message Senders</h4>
                              <ul>
                                {reportData.topMessageSenders.map((u, i) => (
                                  <li key={i}>{u.userName || u.userEmail} - {u.messageCount} messages</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Moderation Stats */}
                      {reportData.totalReports !== undefined && (
                        <div className="report-section">
                          <h2>Moderation Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Total Reports</h4>
                              <p className="stat-number">{reportData.totalReports}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Resolved</h4>
                              <p className="stat-number">{reportData.resolvedCount || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Open</h4>
                              <p className="stat-number">{reportData.openCount || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Resolution Rate</h4>
                              <p className="stat-number">{reportData.resolutionRate || 0}%</p>
                            </div>
                          </div>
                          <div className="stats-detail">
                            <h4>By Status</h4>
                            <pre>{JSON.stringify(reportData.byStatus || {}, null, 2)}</pre>
                          </div>
                          <div className="stats-detail">
                            <h4>By Type</h4>
                            <pre>{JSON.stringify(reportData.byType || {}, null, 2)}</pre>
                          </div>
                        </div>
                      )}

                      {/* Engagement Stats */}
                      {reportData.connections && (
                        <div className="report-section">
                          <h2>Engagement Statistics</h2>
                          <div className="stats-grid">
                            <div className="stat-card">
                              <h4>Connections</h4>
                              <p className="stat-number">{reportData.connections.total}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Pending</h4>
                              <p className="stat-number">{reportData.connections.pending || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Contact Messages</h4>
                              <p className="stat-number">{reportData.contactMessages?.total || 0}</p>
                            </div>
                            <div className="stat-card">
                              <h4>Direct Messages</h4>
                              <p className="stat-number">{reportData.messages?.direct || 0}</p>
                            </div>
                          </div>
                          {reportData.topEventParticipants?.length > 0 && (
                            <div className="stats-detail">
                              <h4>Top Event Participants</h4>
                              <ul>
                                {reportData.topEventParticipants.map((u, i) => (
                                  <li key={i}>{u.userName || u.userEmail} - {u.eventsAttended} events</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {reportData.topGroupMembers?.length > 0 && (
                            <div className="stats-detail">
                              <h4>Top Group Members</h4>
                              <ul>
                                {reportData.topGroupMembers.map((u, i) => (
                                  <li key={i}>{u.userName || u.userEmail} - {u.groupsJoined} groups</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Moderation Reports Table */}
                  {!reportData && reports.length > 0 && (
                    <div className="table-wrap">
                      <table className="users-table">
                        <thead><tr><th>Target</th><th>Reason</th><th>Status</th><th style={{textAlign:'right'}}>Actions</th></tr></thead>
                        <tbody>
                          {reports.map(r => (
                            <tr key={r._id || r.id}>
                              <td>{r.targetType} — {r.targetId}</td>
                              <td>{r.reason || '—'}</td>
                              <td>{r.status}</td>
                              <td style={{textAlign:'right'}}>
                                <div className="action-buttons">
                                  <button className="btn-primary" onClick={() => resolveReport(r)}>Resolve</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!reportData && reports.length === 0 && !reportsLoading && (
                    <p>No moderation reports to display. Use the buttons above to generate analytics reports.</p>
                  )}
                </>
              )}

              {selectedPanel === 'contactMessages' && (
                <>
                  <h1>Messages</h1>
                  <p className="subtitle">Contact form messages sent to admins.</p>
                  {contactLoading && <p>Loading messages…</p>}
                  {contactError && <p style={{color:'red'}}>{contactError}</p>}
                  {!contactLoading && contactMessages.length === 0 && !contactError && <p>No messages yet.</p>}

                  {contactMessages.length > 0 && (
                    <div className="table-wrap">
                      <table className="users-table" style={{width:'100%'}}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactMessages.map((m) => (
                            <tr key={m._id || m.id}>
                              <td style={{whiteSpace:'nowrap'}}>{m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</td>
                              <td>{m.name || '—'}</td>
                              <td>{m.email || '—'}</td>
                              <td style={{maxWidth: 420}}>
                                <div style={{whiteSpace:'pre-wrap'}}>{m.body || ''}</div>
                              </td>
                              <td>{m.resolved ? 'Resolved' : 'Open'}</td>
                              <td style={{textAlign:'right'}}>
                                <div className="action-buttons">
                                  {!m.resolved && (
                                    <button className="btn-primary" onClick={() => resolveContactMessage(m)}>Resolve</button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

            </main>
          </div>
        </section>
      </div>
      <Footer />

      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </>
  );
}
