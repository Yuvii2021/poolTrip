import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { useTheme, Typography, Spacing } from '../theme';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon || <PackageOpen size={64} color={colors.outlineVariant} />}
      <Text style={[Typography.headlineSm, { color: colors.onSurface, marginTop: Spacing.xl, textAlign: 'center' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: Spacing.sm, textAlign: 'center' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['4xl'],
  },
});
