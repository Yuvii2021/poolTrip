import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, MapPin, Phone, Mail, 
  Facebook, Instagram, Twitter, Youtube,
  Send
} from 'lucide-react';
import styles from './Footer.module.css';


export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <h3>Your Travel Journey Starts Here</h3>
              <p>Sign up and we'll send the best deals to you</p>
            </div>
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.subscribeBtn}>
                Subscribe <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand Column */}
            <div className={styles.brandColumn}>
              <Link to="/" className={styles.footerLogo}>
                <div className={styles.logoIcon}>
                  <Compass size={24} />
                </div>
                <span className={styles.logoText}>
                  <span>Pool</span><span className={styles.accent}>Trip</span>
                </span>
              </Link>
              <p className={styles.brandDescription}>
                Discover amazing trips or share your own adventures. Connect with fellow 
                travelers, pool resources, and explore incredible destinations together.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="#" className={styles.socialLink} aria-label="Youtube">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className={styles.contactColumn}>
              <h4 className={styles.columnTitle}>Contact Us</h4>
              <div className={styles.contactList}>
                <a href="mailto:support@pooltrip.in" className={styles.contactItem}>
                  <Mail size={18} />
                  <span>support@pooltrip.in</span>
                </a>
                <a href="tel:+919876543210" className={styles.contactItem}>
                  <Phone size={18} />
                  <span>+91 98765 43210</span>
                </a>
                <div className={styles.contactItem}>
                  <MapPin size={18} />
                  <span>Mumbai, Maharashtra, India 400001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className={styles.container}>
          <p>© Copyright {new Date().getFullYear()} PoolTrip. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
