import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppButton.module.css';

export const WhatsAppButton = () => {
  const phoneNumber = '919876543210';
  const message = 'Hi! I am interested in booking a trip with PoolTrip.';
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
