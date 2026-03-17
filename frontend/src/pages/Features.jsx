import "../styles/Features.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";

export default function Features() {
  return (
    <>
      <TopNavbar />
      <div className="features-page">
        <section className="features-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="features-container">
            <h1>Why Join Campus Connect?!</h1>
            <p className="subtitle">
              Campus Connect is your gateway to a vibrant student community where you can network, collaborate, and grow. Whether you're seeking academic support, social connections, or career opportunities, our platform empowers you to make the most of your campus experience.
            </p>

            <div className="features-grid">
              <div className="feature-card">
                <h3>🤝 Networking with Peers</h3>
                <p>Connect with classmates, seniors, and students from other departments.<br />Share resources, study tips, and experiences.</p>
              </div>
              <div className="feature-card">
                <h3>📚 Academic Collaboration</h3>
                <p>Form study groups or project teams.<br />Exchange notes, assignments, or past exam questions.<br />Ask and answer subject-specific questions quickly.</p>
              </div>
              <div className="feature-card">
                <h3>📖 Access to Resources</h3>
                <p>Find information about courses, events, and campus activities.<br />Access student-run content like tutorials, guides, or e-books.</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Opportunities & Events</h3>
                <p>Stay updated on workshops, competitions, and internships.<br />Get alerts about campus clubs, events, or job fairs.</p>
              </div>
              <div className="feature-card">
                <h3>🎉 Social & Community Building</h3>
                <p>Build friendships in a safe, student-centered environment.<br />Discuss common interests like hobbies, sports, or tech.</p>
              </div>
              <div className="feature-card">
                <h3>💼 Career & Skill Development</h3>
                <p>Connect with alumni for mentorship.<br />Discover opportunities for skill-building like coding contests, hackathons, or online courses.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}