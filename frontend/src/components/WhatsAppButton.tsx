import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppButton.module.css';

export const WhatsAppButton = () => {
  const phoneNumber = '917454985109';
  const message = 'Hi! I am interested in booking a trip with PoolMyTrips.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappButton}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={24} />
      <span className={styles.tooltip}>Chat with us</span>
    </a>
  );
};
