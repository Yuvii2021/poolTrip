import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme, Typography, BorderRadius, Spacing } from '../theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export default function OTPInput({ length = 6, value, onChange, style }: OTPInputProps) {
  const { colors } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText) return;

    const newDigits = [...digits];
    newDigits[index] = cleanText[cleanText.length - 1];
    const newValue = newDigits.join('');
    onChange(newValue);

    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      onChange(newDigits.join(''));
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputs.current[i] = ref; }}
          value={digits[i]}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          style={[
            styles.input,
            Typography.headlineMd,
            {
              backgroundColor: colors.surfaceContainerHighest,
              color: colors.onSurface,
              borderRadius: BorderRadius.md,
              borderBottomWidth: 2,
              borderBottomColor: digits[i] ? colors.primary : 'transparent',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  input: {
    width: 48,
    height: 56,
    textAlign: 'center',
  },
});
