import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, Mail, MapPin, Clock, Send, 
  MessageCircle, Calendar, Users
} from 'lucide-react';
import styles from './ContactPage.module.css';

export const ContactPage = () => {
  const supportWhatsApp = '917454985109';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    destination: '',
    date: '',
    people: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const enquiryLines = [
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      formData.email ? `Email: ${formData.email}` : '',
      formData.destination ? `Destination: ${formData.destination}` : '',
      formData.date ? `Departure: ${formData.date}` : '',
      formData.people ? `People: ${formData.people}` : '',
      formData.message ? `Message: ${formData.message}` : '',
    ].filter(Boolean);

    const message = `Hi PoolMyTrips team, I want to plan a trip.\n\n${enquiryLines.join('\n')}`;
    const whatsappUrl = `https://wa.me/${supportWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    alert('Thanks! We opened WhatsApp with your enquiry details.');
    setFormData({
      name: '',
      phone: '',
      email: '',
      destination: '',
      date: '',
      people: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src="https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1920" 
            alt="Contact Us"
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.badge}>
              <MessageCircle size={14} /> Get in Touch
            </span>
            <h1>Contact Us</h1>
            <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* Contact Info */}
            <motion.div
              className={styles.contactInfo}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Let's Talk</h2>
              <p>
                Ready to plan your next adventure? Contact us through any of the following 
                methods and our team will get back to you within 24 hours.
              </p>

              <div className={styles.contactCards}>
                <a href="tel:+917454985109" className={styles.contactCard}>
                  <div className={styles.contactIcon}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3>Call Us</h3>
                    <span>+91 74549 85109</span>
                  </div>
                </a>

                <a href="mailto:pooltrip7@gmail.com" className={styles.contactCard}>
                  <div className={styles.contactIcon}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3>Email Us</h3>
                    <span>pooltrip7@gmail.com</span>
                  </div>
                </a>

                <a 
                  href="https://wa.me/917454985109" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.contactCard}
                >
                  <div className={styles.contactIcon} style={{ background: '#25D36615', color: '#25D366' }}>
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3>WhatsApp</h3>
                    <span>Chat with us</span>
                  </div>
                </a>

                <div className={styles.contactCard}>
                  <div className={styles.contactIcon}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3>Working Hours</h3>
                    <span>Mon - Sat: 9AM - 8PM</span>
                  </div>
                </div>
              </div>

              <div className={styles.officeInfo}>
                <h3><MapPin size={18} /> Our Office</h3>
                <p>
                  PoolMyTrips Adventures<br />
                  Panchkula, Haryana<br />
                  India 134112
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className={styles.contactForm}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>Plan Your Travel</h2>
              <p>Fill in the details and we'll help you plan the perfect trip.</p>

              <form onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Contact Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="destination">
                      <MapPin size={14} /> Place of Travel *
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      placeholder="Where do you want to go?"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="date">
                      <Calendar size={14} /> Date of Departure
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="people">
                    <Users size={14} /> No. of People
                  </label>
                  <select
                    id="people"
                    name="people"
                    value={formData.people}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3-5">3-5 People</option>
                    <option value="6-10">6-10 People</option>
                    <option value="10+">10+ People</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Additional Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your travel plans..."
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Send size={18} />
                  Submit Inquiry
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9772!2d72.8362!3d19.1136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA2JzQ5LjAiTiA3MsKwNTAnMTAuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        />
      </section>
    </div>
  );
};
