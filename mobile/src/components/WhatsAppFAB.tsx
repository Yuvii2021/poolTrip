import React from 'react';
import { TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Spacing } from '../theme';

export default function WhatsAppFAB() {
  const handlePress = () => {
    const phone = '919876543210';
    const message = encodeURIComponent('Hi, I need help with TravelHub');
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={handlePress}>
      <MessageCircle size={28} color="#ffffff" fill="#ffffff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Spacing['7xl'],
    right: Spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
});
