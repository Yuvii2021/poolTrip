import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme, Typography, Spacing } from '../theme';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ message, fullScreen = true }: LoadingSpinnerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: colors.surface }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[Typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: Spacing.md }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  fullScreen: {
    flex: 1,
  },
});
