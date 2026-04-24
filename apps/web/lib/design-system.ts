export const colors = {
  bgCanvas:      '#0B1220',
  bgSurface:     '#141E33',
  bgSurface2:    '#1A2642',
  borderSubtle:  '#1F2A45',
  borderDefault: '#2A3656',
  borderStrong:  '#3A4666',

  textPrimary:   '#F5F7FA',
  textSecondary: '#A8B1C2',
  textTertiary:  '#6B7489',
  textMuted:     '#4A5168',

  accentPrimary: '#FF671F',
  accentHover:   '#FF7A3D',
  accentMuted:   '#8B3A12',

  success:   '#4ADE80',
  warning:   '#FBBF24',
  danger:    '#F87171',
  info:      '#60A5FA',
  highlight: '#FFB37A',
} as const;

export const fontSize = {
  microlabel:     '0.6875rem',  // 11px — uppercase microlabels, letter-spacing 0.08em
  caption:        '0.8125rem',  // 13px — secondary body, captions
  body:           '0.9375rem',  // 15px — primary body, inputs
  cardTitle:      '1.0625rem',  // 17px — card titles, subsection headings
  sectionHeading: '1.375rem',   // 22px — page section headings
  pageTitle:      '2.125rem',   // 34px — page titles, hero numbers
  hero:           '3rem',       // 48px — landing hero only
} as const;

export const fontWeight = {
  body:   400,
  label:  500,
  strong: 600,
} as const;

export const borderRadius = {
  badge:   '4px',
  default: '6px',
  card:    '8px',
} as const;

export const spacing = {
  xs:  '0.5rem',
  sm:  '0.75rem',
  md:  '1rem',
  lg:  '1.5rem',
  xl:  '2rem',
  '2xl': '3rem',
} as const;

export const motion = {
  duration: '250ms',
  easing:   'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
