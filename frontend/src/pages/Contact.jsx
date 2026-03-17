import "../styles/Contact.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useState } from "react";
import api from "../utils/api";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanBody = String(body || "").trim();

    if (!cleanName || !cleanEmail || !cleanBody) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/messages/contact', {
        name: cleanName,
        email: cleanEmail,
        body: cleanBody,
      });
      setSuccess(res.data?.message || 'Message sent');
      setName("");
      setEmail("");
      setBody("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="contact-page">
        <section className="contact-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="contact-container">
            <h1>Get in Touch</h1>
            <p className="subtitle">We'd love to hear from you!</p>

            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <textarea
                placeholder="Your Message"
                rows="6"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              ></textarea>

              {error && <p style={{ color: "#ff4d4d", marginTop: 12, textAlign: 'center' }}>{error}</p>}
              {success && <p style={{ color: "#8fffa1", marginTop: 12, textAlign: 'center' }}>{success}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div className="contact-info">
              <p>📧 support@campusconnect.app</p>
              <p>🌍 Instagram: @campusconnect</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}