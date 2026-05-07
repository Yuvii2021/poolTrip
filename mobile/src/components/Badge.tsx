import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'glass' | 'status';
  status?: 'confirmed' | 'pending' | 'rejected' | 'cancelled';
  style?: ViewStyle;
}

export default function Badge({ children, variant = 'glass', status, style }: BadgeProps) {
  const { colors, isDark } = useTheme();

  if (variant === 'status' && status) {
    const statusColors: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: colors.successContainer, text: colors.statusConfirmed },
      pending: { bg: colors.warningContainer, text: colors.statusPending },
      rejected: { bg: colors.errorContainer, text: colors.statusRejected },
      cancelled: { bg: colors.surfaceContainerHigh, text: colors.statusCancelled },
    };
    const sc = statusColors[status];

    return (
      <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderRadius: BorderRadius.full }, style]}>
        <Text style={[Typography.labelSm, { color: sc.text, textTransform: 'uppercase', fontWeight: '700' }]}>
          {children}
        </Text>
      </View>
    );
  }

  // Glassmorphism badge
  return (
    <View
      style={[
        styles.glassBadge,
        {
          backgroundColor: isDark ? 'rgba(6,14,32,0.7)' : 'rgba(255,255,255,0.7)',
          borderRadius: BorderRadius.md,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(34,42,61,0.3)' : 'rgba(255,255,255,0.3)',
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[Typography.labelMd, { color: colors.onSurface }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glassBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
});
