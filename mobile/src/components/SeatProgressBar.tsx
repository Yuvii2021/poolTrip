import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Spacing } from '../theme';

interface SeatProgressBarProps {
  total: number;
  available: number;
  height?: number;
  style?: ViewStyle;
}

export default function SeatProgressBar({ total, available, height = 6, style }: SeatProgressBarProps) {
  const { colors } = useTheme();
  const filled = total - available;
  const percentage = total > 0 ? (filled / total) * 100 : 0;

  return (
    <View style={[styles.track, { height, backgroundColor: colors.surfaceContainerHigh, borderRadius: height / 2 }, style]}>
      <View
        style={{
          height,
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: percentage > 80 ? colors.secondary : colors.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
