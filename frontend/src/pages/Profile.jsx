 import "../styles/Profile.css";
import { useEffect, useMemo, useRef, useState } from "react";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveAssetUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${BACKEND_ORIGIN}${value}`;
  return `${BACKEND_ORIGIN}/${value}`;
}

// Cache-busting helper - appends version to force browser to reload image
function resolveAssetUrlWithCacheBusting(value, version) {
  if (!value) return null;
  const baseUrl = resolveAssetUrl(value);
  if (!baseUrl) return null;
  // Add version to prevent browser caching of old images
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${version}`;
}

export default function Profile() {
  const { user, login, logout } = useAuth();
  const token = user?.token;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState(null);
  
  // Version counter to force cache-busting when profile picture changes
  const [profilePictureVersion, setProfilePictureVersion] = useState(0);
  
  // Track if image successfully loaded
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [visibility, setVisibility] = useState("public");

  const fileInputRef = useRef(null);

  const profilePictureUrl = useMemo(() => {
    return resolveAssetUrl(profile?.profile_picture);
  }, [profile]);

  // Cache-busted URL that updates when profile changes to force browser reload
  const profilePictureUrlWithCacheBusting = useMemo(() => {
    return resolveAssetUrlWithCacheBusting(profile?.profile_picture, profilePictureVersion);
  }, [profile, profilePictureVersion]);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setImageError(false); // Reset image error when loading profile
    try {
      const res = await api.get("/users/me");
      const u = res.data?.user;
      setProfile(u);
      setFullName(u?.full_name || "");
      setBio(u?.bio || "");
      setLinkedin(u?.linkedin || "");
      setTwitter(u?.twitter || "");
      setInstagram(u?.instagram || "");
      setWebsite(u?.website || "");
      setInterests(Array.isArray(u?.interests) ? u.interests.join(", ") : (u?.interests || ""));
      setSkills(Array.isArray(u?.skills) ? u.skills.join(", ") : (u?.skills || ""));
      setVisibility(u?.profile_visibility || "public");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        full_name: fullName,
        bio,
        linkedin,
        twitter,
        instagram,
        website,
        interests,
        skills,
        profile_visibility: visibility,
      };

      const res = await api.patch("/users/me", payload);
      const updated = res.data?.user;
      setProfile(updated);

      if (token && updated) {
        login(updated, token);
      }

      setSuccess("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleUploadImage = async (file) => {
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");
    setImageError(false); // Reset image error when uploading new image

    try {
      const form = new FormData();
      form.append("profile_picture", file);

      const res = await api.post("/users/me/profile-picture", form);
      const updated = res.data?.user;
      setProfile(updated);
      
      // Increment version to force cache-busting and show new image
      setProfilePictureVersion(prev => prev + 1);

      if (token && updated) {
        login(updated, token);
      }

      setSuccess("Profile picture updated");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.delete("/users/me");
      setSuccess("Account deleted. Redirecting to home...");
      setTimeout(() => {
        // Clear auth state and redirect
        logout();
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="profile-page">
        <section className="profile-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="profile-container">
            <h1>Your Profile</h1>
            <p className="subtitle">Update your info and how others see you</p>

            {loading && <p>Loading…</p>}
            {error && <p className="profile-error">{error}</p>}
            {success && <p className="profile-success">{success}</p>}

            {!loading && (
              <div className="profile-grid">
                <div className="profile-card">
                  <div className="profile-picture-block">
                    <div className="profile-picture-wrap">
                      {profile?.profile_picture ? (
                        <img 
                          src={profilePictureUrlWithCacheBusting}
                          alt="Profile" 
                          className="profile-picture"
                          onLoad={(e) => {
                            setImageLoaded(true);
                            setImageError(false);
                            e.target.style.opacity = '1';
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            setImageLoaded(false);
                            setImageError(true);
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.3s' }}
                        />
                      ) : null}
                      <div 
                        className="profile-picture-placeholder"
                        style={{ display: (!profile?.profile_picture || imageError) ? 'flex' : 'none' }}
                      >
                        {(profile?.full_name || "U").slice(0, 1).toUpperCase()}
                      </div>
                    </div>

                    <div className="profile-picture-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handlePickImage}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Change Picture"}
                      </button>
                      {profilePictureUrlWithCacheBusting && (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => window.open(profilePictureUrlWithCacheBusting, "_blank", "noopener,noreferrer")}
                        >
                          View Full
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden-file"
                      onChange={(e) => handleUploadImage(e.target.files?.[0] || null)}
                    />

                    <div className="profile-mini">
                      <p className="profile-mini-name">{profile?.full_name || "—"}</p>
                      <p className="profile-mini-email">{profile?.email || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="profile-card profile-form-card">
                  <form className="profile-form" onSubmit={handleSave}>
                    <div className="form-row">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-textarea"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell people about yourself"
                        rows={4}
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-row">
                        <label className="form-label">LinkedIn</label>
                        <input
                          className="form-input"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="form-row">
                        <label className="form-label">Twitter</label>
                        <input
                          className="form-input"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="form-row">
                        <label className="form-label">Instagram</label>
                        <input
                          className="form-input"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="form-row">
                        <label className="form-label">Website</label>
                        <input
                          className="form-input"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://your-site.com"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-row">
                        <label className="form-label">Interests</label>
                        <input
                          className="form-input"
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                          placeholder="e.g. AI, Basketball, Startups"
                        />
                        <p className="hint">Separate with commas.</p>
                      </div>
                      <div className="form-row">
                        <label className="form-label">Skills</label>
                        <input
                          className="form-input"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="e.g. React, Node.js, Design"
                        />
                        <p className="hint">Separate with commas.</p>
                      </div>
                    </div>

                    <div className="form-row">
                      <label className="form-label">Profile Visibility</label>
                      <select
                        className="form-select"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                      >
                        <option value="public">Public</option>
                        <option value="university">University</option>
                        <option value="connections">Connections</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button className="btn-primary" type="submit" disabled={saving || uploading}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button className="btn-secondary" type="button" onClick={loadProfile} disabled={saving || uploading}>
                        Reload
                      </button>
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={loading || saving || uploading}
                      >
                        {loading ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
