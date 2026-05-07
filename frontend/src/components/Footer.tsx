import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, MapPin, Phone, Mail, 
  Facebook, Instagram, Twitter, Youtube,
  Send, CheckCircle2, Loader2
} from 'lucide-react';
import { subscribeAPI } from '../services/api';
import styles from './Footer.module.css';


export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;

    try {
      setSubscribing(true);
      setResult(null);
      const res = await subscribeAPI.subscribe(email.trim());
      setResult({ type: 'success', message: res.message });
      setEmail('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setResult({ type: 'error', message: msg });
    } finally {
      setSubscribing(false);
    }
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
            {result?.type === 'success' ? (
              <div className={styles.subscribeSuccess}>
                <CheckCircle2 size={20} />
                <span>{result.message}</span>
              </div>
            ) : (
              <div>
                <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setResult(null); }}
                      required
                      disabled={subscribing}
                    />
                  </div>
                  <button type="submit" className={styles.subscribeBtn} disabled={subscribing}>
                    {subscribing ? (
                      <><Loader2 size={16} className={styles.spinIcon} /> Subscribing...</>
                    ) : (
                      <>Subscribe <Send size={16} /></>
                    )}
                  </button>
                </form>
                {result?.type === 'error' && (
                  <p className={styles.subscribeError}>{result.message}</p>
                )}
              </div>
            )}
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
                  <span>Pool</span><span className={styles.accent}>MyTrips</span>
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
                <a href="mailto:pooltrip7@gmail.com" className={styles.contactItem}>
                  <Mail size={18} />
                  <span>pooltrip7@gmail.com</span>
                </a>
                <a href="tel:+917454985109" className={styles.contactItem}>
                  <Phone size={18} />
                  <span>+91 74549 85109</span>
                </a>
                <div className={styles.contactItem}>
                  <MapPin size={18} />
                  <span>Panchkula, Haryana, India 134112</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className={styles.container}>
          <p>© Copyright {new Date().getFullYear()} PoolMyTrips. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
