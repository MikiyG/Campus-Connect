// src/pages/Groups.jsx
import "../styles/Groups.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Groups() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || null;

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

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    privacy: "public",
  });
  const [creating, setCreating] = useState(false);

  const [activeGroupId, setActiveGroupId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get("/groups"),
        api.get("/groups/mine"),
      ]);
      setGroups(allRes.data || []);
      setMyGroups(myRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load groups"
      );
      setGroups([]);
      setMyGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const loadMessages = async (groupId) => {
    if (!groupId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const res = await api.get(`/groups/${groupId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      setMessages([]);
      setMessagesError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load messages"
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(activeGroupId);
  }, [activeGroupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await api.post("/groups", {
        name: form.name,
        description: form.description,
        privacy: form.privacy,
      });
      setForm({ name: "", description: "", privacy: "public" });
      await loadGroups();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not create group"
      );
    } finally {
      setCreating(false);
    }
  };

  const isMember = (group) => {
    if (!userId || !Array.isArray(group.members)) return false;
    return group.members.some((id) => String(id) === String(userId));
  };

  const toggleJoin = async (group) => {
    if (!userId) return;
    const member = isMember(group);
    
    // Don't allow joining private groups directly
    if (!member && group.privacy === 'private') {
      alert('This is a private group. Only added members can join.');
      return;
    }
    
    try {
      const url = `/groups/${group._id || group.id}/${member ? "leave" : "join"}`;
      const res = await api.post(url);
      const updated = res.data;
      setGroups((prev) =>
        prev.map((g) =>
          String(g._id || g.id) === String(updated._id || updated.id)
            ? updated
            : g
        )
      );
      setMyGroups((prev) => {
        const exists = prev.some(
          (g) => String(g._id || g.id) === String(updated._id || updated.id)
        );
        if (!member && !exists) {
          return [updated, ...prev];
        }
        if (member) {
          return prev.filter(
            (g) => String(g._id || g.id) !== String(updated._id || updated.id)
          );
        }
        return prev.map((g) =>
          String(g._id || g.id) === String(updated._id || updated.id)
            ? updated
            : g
        );
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not update membership"
      );
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm("Delete this group? This cannot be undone.")) return;
    try {
      await api.delete(`/groups/${group._id || group.id}`);
      if (activeGroupId && String(activeGroupId) === String(group._id || group.id)) {
        setActiveGroupId(null);
        setMessages([]);
      }
      await loadGroups();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not delete group"
      );
    }
  };

  const handleSendMessage = async () => {
    if (!activeGroupId) return;
    const clean = String(draft || "").trim();
    if (!clean && !selectedFile) return;
    setSending(true);
    try {
      let res;
      
      if (selectedFile) {
        // Use FormData when sending a file
        const formData = new FormData();
        if (clean) formData.append('body', clean);
        formData.append('file', selectedFile);
        
        res = await api.post(`/groups/${activeGroupId}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSelectedFile(null);
      } else {
        // Send regular text message
        res = await api.post(`/groups/${activeGroupId}/messages`, {
          body: clean,
        });
      }
      
      setDraft("");
      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Could not send message"
      );
    } finally {
      setSending(false);
    }
  };

  const handlePrivacyChange = async (group, newPrivacy) => {
    try {
      const res = await api.put(`/groups/${group._id || group.id}/privacy`, {
        privacy: newPrivacy
      });
      const updated = res.data;
      
      // Update groups in state
      setGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
      setMyGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Could not update group privacy"
      );
    }
  };

  const handleAddMember = async (group) => {
    if (!memberEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }
    
    setAddingMember(true);
    try {
      // First find the user by email
      const searchRes = await api.get(`/users/search`, { params: { email: memberEmail.trim() } });
      const userToAdd = searchRes.data.user;
      
      if (!userToAdd) {
        alert('User not found or profile is private');
        return;
      }
      
      // Add the member to the group
      const res = await api.post(`/groups/${group._id || group.id}/add-member`, {
        memberId: userToAdd._id || userToAdd.id
      });
      
      const updated = res.data;
      
      // Update groups in state
      setGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
      setMyGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
      
      setMemberEmail('');
      alert('Member added successfully!');
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Could not add member"
      );
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (group, memberToRemove) => {
    if (!window.confirm(`Remove ${memberToRemove.full_name || memberToRemove.email} from the group?`)) {
      return;
    }
    
    try {
      const res = await api.delete(`/groups/${group._id || group.id}/remove-member/${memberToRemove._id || memberToRemove.id}`);
      const updated = res.data;
      
      // Update groups in state
      setGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
      setMyGroups(prev => prev.map(g => 
        String(g._id || g.id) === String(updated._id || updated.id) ? updated : g
      ));
      
      alert('Member removed successfully!');
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Could not remove member"
      );
    }
  };

  const renderGroupCard = (group) => {
    const creator = group.created_by;
    const mine =
      creator &&
      userId &&
      String(creator._id || creator.id) === String(userId);
    const member = isMember(group);
    const isPrivate = group.privacy === 'private';

    const memberCount = Array.isArray(group.members)
      ? group.members.length
      : 0;

    return (
      <div
        className={`group-card ${
          String(activeGroupId) === String(group._id || group.id)
            ? "group-card-active"
            : ""
        }`}
        key={group._id || group.id}
        onClick={() => setActiveGroupId(group._id || group.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3>
              {group.name}
              {isPrivate && (
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '12px', 
                  color: '#ff6b6b',
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  🔒 Private
                </span>
              )}
            </h3>
            {group.description && <p className="desc">{group.description}</p>}
            <p className="group-meta">
              Members: <span>{memberCount}</span>
            </p>
            {creator && (
              <p className="group-meta">
                Created by{" "}
                <span>
                  {creator.full_name || creator.email || "Unknown user"}
                </span>
              </p>
            )}
          </div>
          {mine && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <select
                value={group.privacy || 'public'}
                onChange={(e) => handlePrivacyChange(group, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff'
                }}
              >
                <option value="public">🌐 Public</option>
                <option value="private">🔒 Private</option>
              </select>
              {isPrivate && (
                <button
                  className="btn-outline small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMemberManagement(showMemberManagement === group._id ? null : group._id);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#fff'
                  }}
                >
                  👥 Manage Members
                </button>
              )}
            </div>
          )}
        </div>
        <div className="group-actions">
          <button
            className="btn-primary small"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleJoin(group);
            }}
            disabled={!member && isPrivate}
          >
            {member ? "Leave Group" : isPrivate ? "Private Group" : "Join Group"}
          </button>
          {mine && (
            <button
              className="btn-danger small"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGroup(group);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMemberManagement = (group) => {
    if (showMemberManagement !== group._id) return null;
    
    return (
      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff' }}>
          Manage Members - {group.name}
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="Enter email to add member"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <button
              className="btn-primary small"
              onClick={() => handleAddMember(group)}
              disabled={addingMember}
              style={{
                padding: '6px 12px',
                fontSize: '12px'
              }}
            >
              {addingMember ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
        
        {Array.isArray(group.members) && group.members.length > 0 && (
          <div>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>
              Current Members ({group.members.length}):
            </h5>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {group.members.map((member, index) => {
                const memberName = member.full_name || member.email || `Member ${index + 1}`;
                const isCreator = group.created_by && String(group.created_by._id || group.created_by) === String(member._id || member);
                
                return (
                  <div
                    key={member._id || member.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#fff' }}>
                      {memberName} {isCreator && '(Creator)'}
                    </span>
                    {!isCreator && (
                      <button
                        className="btn-danger small"
                        onClick={() => handleRemoveMember(group, member)}
                        style={{
                          padding: '2px 6px',
                          fontSize: '10px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const activeGroup =
    groups.find(
      (g) => String(g._id || g.id) === String(activeGroupId)
    ) || null;

  return (
    <>
      <TopNavbar />
      <div className="groups-page">
        <section className="groups-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="groups-container">
            <h1>Student Groups</h1>
            <p className="subtitle">
              Create and join study groups, clubs, and communities across campuses.
            </p>

            <div className="groups-layout">
              <div className="groups-left">
                <h2>Create a Group</h2>
                <p className="muted">
                  Start a new community for your course, hobby, or club.
                </p>
                <form className="group-form" onSubmit={handleCreate}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Group name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="What is this group about? (optional)"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  <div className="form-row">
                    <label className="form-label">Group Privacy</label>
                    <select
                      name="privacy"
                      value={form.privacy}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        marginBottom: '16px'
                      }}
                    >
                      <option value="public">🌐 Public - Anyone can see and join</option>
                      <option value="private">🔒 Private - Only added members can see and join</option>
                    </select>
                  </div>
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={creating}
                  >
                    {creating ? "Creating…" : "Create Group"}
                  </button>
                </form>

                <h2 style={{ marginTop: "2.5rem" }}>My Groups</h2>
                <p className="muted">
                  Groups you are a member of.
                </p>
                {loading && <p>Loading groups…</p>}
                {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}
                {!loading && !error && (
                  <div className="groups-grid">
                    {myGroups.length === 0 && (
                      <p style={{ color: "#ccc" }}>
                        You have not joined any groups yet.
                      </p>
                    )}
                    {myGroups.map((g) => (
                      <div key={g._id || g.id}>
                        {renderGroupCard(g)}
                        {renderMemberManagement(g)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="groups-right">
                <h2>All Groups</h2>
                {loading && <p>Loading groups…</p>}
                {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}
                {!loading && !error && (
                  <div className="groups-grid">
                    {groups.length === 0 && (
                      <p style={{ color: "#ccc" }}>
                        No groups yet. Be the first to create one!
                      </p>
                    )}
                    {groups.map((g) => (
                      <div key={g._id || g.id}>
                        {renderGroupCard(g)}
                        {renderMemberManagement(g)}
                      </div>
                    ))}
                  </div>
                )}

                <div className="group-chat-panel">
                  <h2>Group Chat</h2>
                  {!activeGroup && (
                    <p className="muted">
                      Select a group to view and send messages.
                    </p>
                  )}
                  {activeGroup && (
                    <>
                      <p className="muted">
                        Chat in <strong>{activeGroup.name}</strong>
                      </p>
                      <div className="group-chat-messages">
                        {messagesLoading && (
                          <p className="placeholder">Loading messages…</p>
                        )}
                        {messagesError && (
                          <p
                            className="placeholder"
                            style={{ color: "#ff4d4d" }}
                          >
                            {messagesError}
                          </p>
                        )}
                        {!messagesLoading &&
                          !messagesError &&
                          messages.length === 0 && (
                            <p className="placeholder">
                              No messages yet. Say hi to the group!
                            </p>
                          )}
                        {!messagesLoading &&
                          !messagesError &&
                          messages.length > 0 && (
                            <div>
                              {messages.map((m) => {
                                const from = m.from || {};
                                const fromId = from._id || m.from;
                                const mine =
                                  userId &&
                                  String(fromId) === String(userId);
                                const fileUrl = getFileUrl(m.file_path);
                                return (
                                  <div
                                    key={m._id}
                                    style={{
                                      display: "flex",
                                      justifyContent: mine
                                        ? "flex-end"
                                        : "flex-start",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <div
                                      style={{
                                        maxWidth: "75%",
                                        background: mine
                                          ? "rgba(255,255,0,0.15)"
                                          : "rgba(255,255,255,0.08)",
                                        padding: "10px 12px",
                                        borderRadius: 14,
                                        color: "#fff",
                                        border:
                                          "1px solid rgba(255,255,0,0.12)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#aaa",
                                          marginBottom: 4,
                                        }}
                                      >
                                        {from.full_name ||
                                          from.email ||
                                          (mine ? "You" : "Member")}
                                      </div>
                                      {m.body && (
                                        <div
                                          style={{
                                            fontSize: 14,
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {m.body}
                                        </div>
                                      )}
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
                                      <div
                                        style={{
                                          fontSize: 11,
                                          color: "#888",
                                          marginTop: 4,
                                        }}
                                      >
                                        {m.created_at
                                          ? new Date(
                                              m.created_at
                                            ).toLocaleString()
                                          : ""}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                      <div className="group-chat-input">
                        <input
                          type="text"
                          placeholder={
                            activeGroup
                              ? "Type a message..."
                              : "Select a group first"
                          }
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          disabled={!activeGroup || sending}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <input
                          type="file"
                          id="file-upload-groups"
                          style={{ display: 'none' }}
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          accept="*/*"
                        />
                        <label
                          htmlFor="file-upload-groups"
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
                          type="button"
                          disabled={!activeGroup || sending}
                          onClick={handleSendMessage}
                        >
                          {sending ? "Sending…" : "Send"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}