// src/pages/Messaging.jsx
import "../styles/Messaging.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default function Messaging() {
  const { user } = useAuth();
  const myId = user?._id || user?.id || null;

  // Helper to resolve asset URLs
  const resolveAssetUrl = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return `${BACKEND_ORIGIN}${value}`;
    return `${BACKEND_ORIGIN}/${value}`;
  };

  // Helper to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Handle both absolute URLs and relative paths
    if (filePath.startsWith('http')) return filePath;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}${filePath}`;
  };

  // Helper to get file name from path
  const getFileName = (filePath) => {
    if (!filePath) return 'File';
    return filePath.split('/').pop() || 'File';
  };

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);

  const [activeOtherUserId, setActiveOtherUserId] = useState(null);
  const activeConversation = useMemo(
    () => conversations.find((c) => String(c.other_user_id) === String(activeOtherUserId)) || null,
    [conversations, activeOtherUserId]
  );

  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState(null);

  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const loadConversations = async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data || []);
    } catch (err) {
      setConversations([]);
      setConversationsError(err.response?.data?.message || err.message || 'Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadThread = async (otherUserId) => {
    if (!otherUserId) {
      setThread([]);
      return;
    }
    setThreadLoading(true);
    setThreadError(null);
    try {
      const res = await api.get(`/messages/thread/${otherUserId}`);
      setThread(res.data || []);
      // mark messages in this thread as read for current user
      try {
        await api.post(`/messages/thread/${otherUserId}/read`);
      } catch (e) {
        // non-critical, ignore
      }
    } catch (err) {
      setThread([]);
      setThreadError(err.response?.data?.message || err.message || 'Failed to load messages');
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    loadThread(activeOtherUserId);
  }, [activeOtherUserId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError(null);

    const email = String(searchEmail || '').trim();
    if (!email) {
      setSearchError('Enter an email to search');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await api.get(`/users/search`, { params: { email } });
      const found = res.data?.user;
      const otherId = found?._id || found?.id;
      if (!otherId) {
        setSearchError('User not found');
        return;
      }

      setActiveOtherUserId(otherId);

      setConversations((prev) => {
        const exists = prev.some((c) => String(c.other_user_id) === String(otherId));
        if (exists) return prev;
        return [
          {
            other_user_id: otherId,
            other_user: found,
            last_message_body: '',
            last_message_at: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    } catch (err) {
      setSearchError(err.response?.data?.message || err.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSend = async () => {
    setSendError(null);
    const clean = String(draft || '').trim();
    if (!activeOtherUserId) {
      setSendError('Select a conversation first');
      return;
    }
    if (!clean && !selectedFile) return;

    setSendLoading(true);
    try {
      const formData = new FormData();
      formData.append('to', activeOtherUserId);
      if (clean) formData.append('body', clean);
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.post('/messages/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDraft('');
      setSelectedFile(null);
      if (res.data) {
        setThread((prev) => [...prev, res.data]);
      }
      await loadConversations();
    } catch (err) {
      setSendError(err.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="messaging-page">
        <section className="messaging-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="messaging-container">
            <h1>Messaging</h1>
            <p className="subtitle">Connect and chat with students across campuses</p>

            <div className="messaging-layout">
              <div className="messaging-sidebar">
                <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="email"
                      placeholder="Search by email to start chat"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      disabled={searchLoading}
                      style={{
                        flex: 1,
                        padding: '0.9rem 1rem',
                        background: 'rgba(40,40,40,0.95)',
                        border: '1px solid rgba(255,255,0,0.25)',
                        borderRadius: 14,
                        color: '#fff',
                      }}
                    />
                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={searchLoading}
                      style={{ padding: '0.9rem 1.1rem', whiteSpace: 'nowrap' }}
                    >
                      {searchLoading ? 'Searching…' : 'Start'}
                    </button>
                  </div>
                  {searchError && (
                    <div style={{ marginTop: 10, color: '#ff4d4d', fontSize: 13 }}>{searchError}</div>
                  )}
                </form>

                {conversationsLoading && <p style={{ padding: '1rem', color: '#aaa' }}>Loading…</p>}
                {conversationsError && <p style={{ padding: '1rem', color: '#ff4d4d' }}>{conversationsError}</p>}

                {!conversationsLoading && !conversationsError && conversations.length === 0 && (
                  <p style={{ padding: '1rem', color: '#aaa' }}>No conversations yet.</p>
                )}

                {conversations.map((c) => {
                  const isActive = String(c.other_user_id) === String(activeOtherUserId);
                  const title = c.other_user?.full_name || c.other_user?.email || 'Unknown user';
                  const preview = c.last_message_body || '';
                  const profilePictureUrl = resolveAssetUrl(c.other_user?.profile_picture);
                  return (
                    <div
                      key={c.other_user_id}
                      className={`conversation ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveOtherUserId(c.other_user_id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                      {profilePictureUrl ? (
                        <img 
                          src={profilePictureUrl} 
                          alt={title}
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            flexShrink: 0
                          }}
                        >
                          {(title || 'U').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '15px' }}>{title}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</p>
                      </div>
                      {c.has_unread && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ffaa00',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="messaging-main">
                <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {activeOtherUserId && activeConversation?.other_user && (
                    <>
                      {(() => {
                        const profilePictureUrl = resolveAssetUrl(activeConversation.other_user.profile_picture);
                        const displayName = activeConversation.other_user?.full_name || activeConversation.other_user?.email || 'Unknown user';
                        const bio = activeConversation.other_user?.bio || '';
                        return (
                          <>
                            {profilePictureUrl ? (
                              <img 
                                src={profilePictureUrl} 
                                alt={displayName}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: 'rgba(255,255,0,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  color: '#fff'
                                }}
                              >
                                {(displayName || 'U').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: 0, fontSize: '16px' }}>
                                {displayName}
                              </h3>
                              {bio && (
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {bio}
                                </p>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                  {!activeOtherUserId && (
                    <h3>Messaging</h3>
                  )}
                </div>
                <div className="chat-messages">
                  {!activeOtherUserId && (
                    <p className="placeholder">Select a conversation to start messaging</p>
                  )}

                  {activeOtherUserId && threadLoading && (
                    <p className="placeholder">Loading messages…</p>
                  )}

                  {activeOtherUserId && threadError && (
                    <p className="placeholder" style={{ color: '#ff4d4d' }}>{threadError}</p>
                  )}

                  {activeOtherUserId && !threadLoading && !threadError && thread.length === 0 && (
                    <p className="placeholder">No messages yet. Say hi!</p>
                  )}

                  {activeOtherUserId && !threadLoading && !threadError && thread.length > 0 && (
                    <div>
                      {thread.map((m) => {
                        const fromId = m.from?._id || m.from;
                        const isMine = myId && String(fromId) === String(myId);
                        const fileUrl = getFileUrl(m.file_path);
                        return (
                          <div
                            key={m._id}
                            style={{
                              display: 'flex',
                              justifyContent: isMine ? 'flex-end' : 'flex-start',
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                maxWidth: '70%',
                                background: isMine ? 'rgba(255,255,0,0.15)' : 'rgba(255,255,255,0.08)',
                                padding: '10px 12px',
                                borderRadius: 14,
                                color: '#fff',
                                border: '1px solid rgba(255,255,0,0.12)'
                              }}
                            >
                              {m.body && <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{m.body}</div>}
                              {fileUrl && (
                                <div style={{ marginTop: m.body ? '8px' : 0 }}>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '8px 12px',
                                      background: 'rgba(255,255,255,0.1)',
                                      borderRadius: 8,
                                      color: '#fff',
                                      textDecoration: 'none',
                                      fontSize: 13,
                                      border: '1px solid rgba(255,255,255,0.2)',
                                    }}
                                  >
                                    <span style={{ fontSize: 16 }}>📎</span>
                                    <span style={{ 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      maxWidth: '200px'
                                    }}>
                                      {getFileName(m.file_path)}
                                    </span>
                                  </a>
                                </div>
                              )}
                              <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                                {m.created_at ? new Date(m.created_at).toLocaleString() : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder={activeOtherUserId ? 'Type a message...' : 'Select a conversation first'}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!activeOtherUserId || sendLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <input
                    type="file"
                    id="file-upload-messaging"
                    style={{ display: 'none' }}
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    accept="*/*"
                  />
                  <label
                    htmlFor="file-upload-messaging"
                    style={{
                      cursor: 'pointer',
                      marginRight: '10px',
                      fontSize: '20px',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Attach file"
                  >
                    📎
                  </label>
                  {selectedFile && (
                    <span style={{ fontSize: '12px', color: '#aaa', marginRight: '10px' }}>
                      {selectedFile.name}
                    </span>
                  )}
                  <button
                    className="btn-primary send-btn"
                    onClick={handleSend}
                    disabled={!activeOtherUserId || sendLoading}
                    type="button"
                  >
                    {sendLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>

                {sendError && (
                  <p style={{ color: '#ff4d4d', margin: '0 1.5rem 1.5rem', textAlign: 'center' }}>{sendError}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}