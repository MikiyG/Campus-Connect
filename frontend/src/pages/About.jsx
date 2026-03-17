import "../styles/About.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <TopNavbar />
      <div className="about-page">
        <section className="about-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="about-container">
            <h1>About Campus Connect</h1>
            <p className="lead">
              We’re building the ultimate student network — where learning meets community.
            </p>
            <div className="about-content">
              <p>
                Founded in 2025, Campus Connect was born from a simple idea: <strong>students thrive when they’re connected</strong>.
                Whether you’re looking for study partners, career advice, event updates, or just someone to grab coffee with — we’ve got you.
              </p>
              <p>
                Our platform is 100% student-focused, safe, and designed to help you get the most out of your university years.
              </p>
              <div className="mission">
                <h2>Our Mission</h2>
                <p className="quote">
                  “To empower every student to learn better, connect deeper, and grow faster — together.”
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}