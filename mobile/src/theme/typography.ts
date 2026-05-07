import { TextStyle } from 'react-native';

// Font families — loaded via expo-font / @expo-google-fonts
export const FontFamily = {
  displayBlack: 'Epilogue_900Black',
  displayBold: 'Epilogue_700Bold',
  displaySemiBold: 'Epilogue_600SemiBold',
  displayMedium: 'Epilogue_500Medium',
  displayRegular: 'Epilogue_400Regular',

  bodyBold: 'Manrope_700Bold',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyMedium: 'Manrope_500Medium',
  bodyRegular: 'Manrope_400Regular',
  bodyLight: 'Manrope_300Light',
};

type TypographyVariant = Omit<TextStyle, 'color'>;

export const Typography: Record<string, TypographyVariant> = {
  // Display — Epilogue (Editorial/Inspiration voice)
  displayLg: {
    fontFamily: FontFamily.displayBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.72, // -0.02em
  },
  displayMd: {
    fontFamily: FontFamily.displayBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  displaySm: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.48,
  },

  // Headline — Epilogue
  headlineLg: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  headlineMd: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  headlineSm: {
    fontFamily: FontFamily.displayMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.18,
  },

  // Title — Manrope (Functional voice)
  titleLg: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  titleMd: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  titleSm: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },

  // Body — Manrope
  bodyLg: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  },

  // Label — Manrope
  labelLg: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMd: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSm: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
};
