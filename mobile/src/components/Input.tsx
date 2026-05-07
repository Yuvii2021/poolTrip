import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: { label: string; onPress: () => void };
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightAction,
  isPassword = false,
  containerStyle,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || rightAction) && (
        <View style={styles.labelRow}>
          {label && (
            <Text style={[Typography.labelMd, { color: colors.onSurfaceVariant, textTransform: 'uppercase' }]}>
              {label}
            </Text>
          )}
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress}>
              <Text style={[Typography.labelMd, { color: colors.primary }]}>{rightAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceContainerHighest,
            borderRadius: BorderRadius.sm,
            borderBottomWidth: 2,
            borderBottomColor: focused ? colors.primary : 'transparent',
          },
          error && { borderBottomColor: colors.error },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          placeholderTextColor={colors.onSurfaceVariant}
          style={[
            styles.input,
            Typography.bodyLg,
            { color: colors.onSurface },
            leftIcon ? { paddingLeft: 0 } : undefined,
          ]}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.iconRight}>
            {showPassword ? (
              <EyeOff size={20} color={colors.onSurfaceVariant} />
            ) : (
              <Eye size={20} color={colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[Typography.bodySm, { color: colors.error, marginTop: 4 }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
  },
  iconLeft: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  iconRight: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
});
