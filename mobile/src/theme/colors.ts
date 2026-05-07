export const LightColors = {
  // Primary - Trust Blue
  primary: '#0040a1',
  primaryContainer: '#0056d2',
  onPrimary: '#ffffff',
  primaryFixed: '#d6e3ff',
  onPrimaryFixed: '#001b3e',
  onPrimaryContainer: '#001b3e',

  // Secondary - Warm Coral/Orange (CTAs, urgency)
  secondary: '#ae3115',
  secondaryContainer: '#ffdad1',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#3b0800',

  // Tertiary
  tertiary: '#6b5778',
  tertiaryContainer: '#f3daff',
  onTertiary: '#ffffff',

  // Surface Hierarchy (Tonal Layering)
  surface: '#f8f9fa',
  surfaceDim: '#d8dade',
  surfaceBright: '#f8f9fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f3f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHigh: '#e6e7e9',
  surfaceContainerHighest: '#e0e2e4',

  // On Surface
  onSurface: '#191c1d',
  onSurfaceVariant: '#43474e',

  // Outline
  outline: '#73777f',
  outlineVariant: '#c3c6d6',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',

  // Success
  success: '#1b6f3c',
  successContainer: '#a3f5b7',

  // Warning
  warning: '#7c5800',
  warningContainer: '#ffdea6',

  // Inverse
  inverseSurface: '#2e3133',
  inverseOnSurface: '#eff1f3',
  inversePrimary: '#adc6ff',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#1a2138',

  // Misc
  backdrop: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  // Status
  statusConfirmed: '#1b6f3c',
  statusPending: '#7c5800',
  statusRejected: '#ba1a1a',
  statusCancelled: '#73777f',

  // WhatsApp
  whatsapp: '#25D366',
};

export const DarkColors = {
  // Primary - Neon blue on deep black
  primary: '#8fb7ff',
  primaryContainer: '#2f6de0',
  onPrimary: '#001838',
  primaryFixed: '#d6e3ff',
  onPrimaryFixed: '#001b3e',
  onPrimaryContainer: '#d6e3ff',

  // Secondary - Soft Coral
  secondary: '#ffb59c',
  secondaryContainer: '#862200',
  onSecondary: '#5f1500',
  onSecondaryContainer: '#ffdad1',

  // Tertiary
  tertiary: '#d6bee5',
  tertiaryContainer: '#533f5f',
  onTertiary: '#3b2948',

  // Surface Hierarchy (Near-black tonal)
  surface: '#000000',
  surfaceDim: '#000000',
  surfaceBright: '#16181d',
  surfaceContainerLowest: '#080a0f',
  surfaceContainerLow: '#0e1117',
  surfaceContainer: '#141822',
  surfaceContainerHigh: '#1b2030',
  surfaceContainerHighest: '#242a3c',

  // On Surface
  onSurface: '#f3f5ff',
  onSurfaceVariant: '#b6bdcf',

  // Outline
  outline: '#7f8798',
  outlineVariant: '#343b4d',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Success
  success: '#a3f5b7',
  successContainer: '#005225',

  // Warning
  warning: '#ffdea6',
  warningContainer: '#5b4300',

  // Inverse
  inverseSurface: '#f0f3ff',
  inverseOnSurface: '#1b1d24',
  inversePrimary: '#2f6de0',

  // Scrim & Shadow
  scrim: '#000000',
  shadow: '#000000',

  // Misc
  backdrop: 'rgba(0, 0, 0, 0.82)',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  // Status
  statusConfirmed: '#a3f5b7',
  statusPending: '#ffdea6',
  statusRejected: '#ffb4ab',
  statusCancelled: '#8d909a',

  // WhatsApp
  whatsapp: '#25D366',
};

export type ColorScheme = typeof LightColors;
