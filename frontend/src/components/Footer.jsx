import '../styles/Footer.css'
import { Facebook, Twitter, Instagram, Youtube,Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Get In Touch */}
        <div className="footer-section">
          <h3>Get in Touch</h3>
          <div className="contact-item"><Mail size={18} /> hello@campusconnect.com</div>
          <div className="contact-item"><Phone size={18} />+251 *******</div>
        </div>

        {/* Stay Connected - Socials */}
        <div className="footer-section">
          <h3>Stay Connected</h3>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" onClick={(e)=>e.preventDefault()}><Facebook size={22} /></a>
            <a href="#" aria-label="Twitter" onClick={(e)=>e.preventDefault()}><Twitter size={22} /></a>
            <a href="#" aria-label="Instagram" onClick={(e)=>e.preventDefault()}><Instagram size={22} /></a>
            <a href="#" aria-label="YouTube" onClick={(e)=>e.preventDefault()}><Youtube size={22} /></a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-section newsletter">
          <h3>Join Newsletter</h3>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit">Subscribe</button>
          </form>
          <p className="text-sm text-gray-400 mt-3">We respect your privacy. Unsubscribe anytime.</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 CampusConnect. All rights reserved. Made with <span className="heart">❤️</span> and lots of ⚡
      </div>
    </footer>
  )
}