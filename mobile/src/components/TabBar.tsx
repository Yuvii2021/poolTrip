import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ViewStyle } from 'react-native';
import { useTheme, Typography, Spacing } from '../theme';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
}

export default function TabBar({ tabs, activeKey, onTabPress, style }: TabBarProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={style}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            onPress={() => onTabPress(tab.key)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.primary : colors.surfaceContainerHigh,
                borderRadius: 9999,
              },
            ]}
          >
            <Text
              style={[
                Typography.labelLg,
                { color: isActive ? colors.onPrimary : colors.onSurfaceVariant },
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.surfaceContainer,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.labelSm,
                    { color: isActive ? colors.onPrimary : colors.onSurfaceVariant },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    marginRight: Spacing.sm,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
});
