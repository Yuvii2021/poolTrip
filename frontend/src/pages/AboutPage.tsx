import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Award, Shield, MapPin, Heart, Compass,
  CheckCircle, ArrowRight, Star, Calendar
} from 'lucide-react';
import styles from './AboutPage.module.css';


const values = [
  { icon: <Heart size={24} />, title: 'Passion for Travel', description: 'We are driven by our love for exploration and creating memorable experiences.' },
  { icon: <Shield size={24} />, title: 'Safety First', description: 'Your safety is our top priority on every adventure we organize.' },
  { icon: <Users size={24} />, title: 'Community Focus', description: 'Building connections between travelers who share the same wanderlust.' },
  { icon: <Award size={24} />, title: 'Quality Service', description: 'Committed to delivering exceptional service at every step of your journey.' },
];

const team = [
  { name: 'Rahul Sharma', role: 'Founder & CEO', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Priya Patel', role: 'Head of Operations', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Amit Kumar', role: 'Lead Travel Expert', image: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { name: 'Sneha Reddy', role: 'Customer Success', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

export const AboutPage = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img 
            src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920" 
            alt="About Us"
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.badge}>
              <Compass size={14} /> About Us
            </span>
            <h1>Exploring Nature's Wonders</h1>
            <p>We're on a mission to make travel accessible, affordable, and unforgettable for everyone.</p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className={styles.storySection}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <motion.div
              className={styles.storyContent}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className={styles.sectionBadge}>Our Story</span>
              <h2>Things to do on a trip with PoolTrip</h2>
              <p>
                Thirsty for a new kind of travel experience? Have limited time but want to explore? 
                Walking in the midst of wilderness, finding glorious mountains enveloped with the 
                first rays of the sun, sitting on the highest peaks, climbing deep cut rock formations 
                and breathing in the fresh air while catching the sunrise.
              </p>
              <p>
                Since our inception, PoolTrip has provided travelers from across India a sense of 
                'oneness' with nature. Having organized more than 100 trips across the country, 
                choosing our adventures will make you come back for more.
              </p>
              <ul className={styles.checkList}>
                <li><CheckCircle size={18} /> Community-powered travel</li>
                <li><CheckCircle size={18} /> Expert local guides</li>
                <li><CheckCircle size={18} /> Safe and verified trips</li>
                <li><CheckCircle size={18} /> Best price guarantee</li>
              </ul>
              <Link to="/categories" className={styles.ctaBtn}>
                View All Tours <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div
              className={styles.storyImages}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600" 
                alt="Travel adventure"
                className={styles.storyImg1}
              />
              <img 
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400" 
                alt="Nature"
                className={styles.storyImg2}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Our Values</span>
            <h2>What Drives Us</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Our Team</span>
            <h2>Meet the Experts</h2>
            <p>The passionate people behind your adventures</p>
          </div>
          <div className={styles.teamGrid}>
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                className={styles.teamCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <span>{member.role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.ctaCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Ready to Start Your Adventure?</h2>
            <p>Join thousands of happy travelers and create unforgettable memories.</p>
            <div className={styles.ctaButtons}>
              <Link to="/" className={styles.ctaBtnPrimary}>
                Explore Trips <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className={styles.ctaBtnOutline}>
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
