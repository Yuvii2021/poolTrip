import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showVerified?: boolean;
  style?: ViewStyle;
}

export default function Avatar({ uri, name, size = 48, showVerified = false, style }: AvatarProps) {
  const { colors } = useTheme();

  const initial = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.primaryFixed,
            },
          ]}
        >
          <Text style={[Typography.titleMd, { color: colors.primary, fontSize: size * 0.38 }]}>
            {initial}
          </Text>
        </View>
      )}
      {showVerified && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primary,
              borderColor: colors.surfaceContainerLowest,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              right: 0,
              bottom: 0,
            },
          ]}
        >
          <Text style={{ color: colors.onPrimary, fontSize: size * 0.16, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
