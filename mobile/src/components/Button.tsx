import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { colors, isDark } = useTheme();

  const sizeStyles: Record<string, { height: number; paddingHorizontal: number; text: any }> = {
    sm: { height: 40, paddingHorizontal: Spacing.lg, text: Typography.titleSm },
    md: { height: 52, paddingHorizontal: Spacing['2xl'], text: Typography.titleMd },
    lg: { height: 58, paddingHorizontal: Spacing['3xl'], text: Typography.titleMd },
  };

  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    const gradientColors: [string, string] = isDark
      ? [colors.primary, colors.primaryContainer]
      : [colors.primary, colors.primaryContainer];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={isDisabled ? [colors.outline, colors.outline] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            { height: s.height, paddingHorizontal: s.paddingHorizontal, borderRadius: BorderRadius.full },
            isDisabled && { opacity: 0.5 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <>
              {icon}
              <Text style={[s.text, { color: colors.onPrimary, marginLeft: icon ? 8 : 0 }]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    secondary: {
      bg: colors.surfaceContainerHigh,
      text: colors.primary,
    },
    ghost: {
      bg: 'transparent',
      text: colors.primary,
    },
    danger: {
      bg: colors.errorContainer,
      text: colors.error,
    },
  };

  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: BorderRadius.full,
          backgroundColor: v.bg,
        },
        isDisabled && { opacity: 0.5 },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[s.text, { color: v.text, marginLeft: icon ? 8 : 0 }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
