import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, Image, Dimensions, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme, BorderRadius, Spacing } from '../theme';

interface ImageCarouselProps {
  images: string[];
  height?: number;
  borderRadius?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  style?: ViewStyle;
  onImagePress?: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ImageCarousel({
  images,
  height = 280,
  borderRadius = BorderRadius.xl,
  autoPlay = true,
  autoPlayInterval = 4000,
  style,
  onImagePress,
}: ImageCarouselProps) {
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemWidth = SCREEN_WIDTH - Spacing['2xl'] * 2;

  const startAutoPlay = useCallback(() => {
    if (!autoPlay || images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, images.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startAutoPlay]);

  if (!images.length) return null;

  return (
    <View style={[{ height }, style]}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
          setActiveIndex(idx);
        }}
        onScrollBeginDrag={() => {
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onScrollEndDrag={() => startAutoPlay()}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onImagePress?.(index)}
            style={{ width: itemWidth, height }}
          >
            <Image
              source={{ uri: item }}
              style={{ width: itemWidth, height, borderRadius }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? colors.primary : colors.surfaceContainerHighest,
                  width: i === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});
