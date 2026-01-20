export const theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',
    secondary: '#EC4899',
    secondaryDark: '#DB2777',
    success: '#10B981',
    successLight: '#34D399',
    danger: '#EF4444',
    dangerLight: '#F87171',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    background: '#0F172A',
    backgroundLight: '#1E293B',
    backgroundCard: '#1E293B',
    surface: '#334155',
    surfaceLight: '#475569',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    white: '#FFFFFF',
    black: '#000000',
    
    // Cores para categorias de despesas
    categories: {
      agua: '#3B82F6',
      energia: '#FBBF24',
      internet: '#8B5CF6',
      alimentacao: '#10B981',
      transporte: '#F97316',
      saude: '#EC4899',
      educacao: '#06B6D4',
      lazer: '#A855F7',
      outros: '#64748B',
      // Categorias de receita
      salario: '#10B981',
      deposito: '#3B82F6',
      extra: '#F59E0B',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
