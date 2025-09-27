// Email-based theme configuration
//
// 🎨 ADDING NEW THEMES - FUTURE REFERENCE:
//
// 1. Add new theme to `themes` object below
// 2. Update `getThemeFromEmail()` function with domain matching logic
// 3. Update `shouldAutoProcess()` in upload/page.tsx if auto-processing needed
// 4. Test with ThemeSwitcher component
//
// Theme structure:
// - colors: 11 required color properties (see Theme interface)
// - logo: icon (emoji/letter), bgColor, textColor, shape, optional gradient
// - description: user-friendly description
//
// Email domain matching examples:
// - domain.endsWith('.edu') → Academic
// - domain.includes('bank') → Financial
// - techDomains.includes(domain) → Tech
//

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
  logo: {
    icon: string           // Single letter or symbol for icon
    bgColor: string        // Background color for logo
    textColor: string      // Text color for logo
    shape: 'circle' | 'square' | 'rounded' | 'hexagon'
    gradient?: string      // Optional gradient background
  }
  description: string
}

export const themes: Record<string, Theme> = {
  // Academic institutions (.edu)
  academic: {
    name: 'Academic',
    colors: {
      primary: '#1e40af',      // Deep blue
      secondary: '#3730a3',    // Indigo
      accent: '#dc2626',       // Red accent
      background: '#f8fafc',   // Light gray
      surface: '#ffffff',      // White
      text: '#1e293b',         // Dark gray
      textSecondary: '#64748b', // Medium gray
      border: '#e2e8f0',       // Light border
      success: '#059669',      // Green
      warning: '#d97706',      // Orange
      error: '#dc2626'         // Red
    },
    logo: {
      icon: '🎓',
      bgColor: '#1e40af',
      textColor: '#ffffff',
      shape: 'circle'
    },
    description: 'Classic academic theme with professional blues'
  },

  // Corporate/Business (.com, .corp, .biz)
  corporate: {
    name: 'Corporate',
    colors: {
      primary: '#059669',      // Professional green
      secondary: '#047857',    // Darker green
      accent: '#0891b2',       // Cyan accent
      background: '#f9fafb',   // Off-white
      surface: '#ffffff',      // White
      text: '#111827',         // Nearly black
      textSecondary: '#6b7280', // Gray
      border: '#d1d5db',       // Light gray border
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Amber
      error: '#ef4444'         // Red
    },
    logo: {
      icon: '💼',
      bgColor: '#059669',
      textColor: '#ffffff',
      shape: 'rounded'
    },
    description: 'Professional corporate green theme'
  },

  // Government (.gov, .mil)
  government: {
    name: 'Government',
    colors: {
      primary: '#1f2937',      // Dark gray
      secondary: '#374151',    // Medium gray
      accent: '#b91c1c',       // Red accent
      background: '#f3f4f6',   // Light gray
      surface: '#ffffff',      // White
      text: '#111827',         // Dark
      textSecondary: '#4b5563', // Gray
      border: '#d1d5db',       // Border gray
      success: '#065f46',      // Dark green
      warning: '#92400e',      // Dark amber
      error: '#991b1b'         // Dark red
    },
    logo: {
      icon: '🏛️',
      bgColor: '#1f2937',
      textColor: '#ffffff',
      shape: 'square'
    },
    description: 'Serious government theme with dark grays'
  },

  // Tech companies (google, microsoft, apple, etc.)
  tech: {
    name: 'Tech',
    colors: {
      primary: '#7c3aed',      // Purple
      secondary: '#5b21b6',    // Deep purple
      accent: '#06b6d4',       // Cyan
      background: '#fafafa',   // Near white
      surface: '#ffffff',      // White
      text: '#18181b',         // Near black
      textSecondary: '#71717a', // Zinc gray
      border: '#e4e4e7',       // Zinc border
      success: '#22c55e',      // Green
      warning: '#eab308',      // Yellow
      error: '#ef4444'         // Red
    },
    logo: {
      icon: '⚡',
      bgColor: '#7c3aed',
      textColor: '#ffffff',
      shape: 'hexagon',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)'
    },
    description: 'Modern tech theme with purple and cyan'
  },

  // Healthcare (.med, hospital, health)
  healthcare: {
    name: 'Healthcare',
    colors: {
      primary: '#0369a1',      // Medical blue
      secondary: '#075985',    // Darker blue
      accent: '#059669',       // Medical green
      background: '#f0f9ff',   // Very light blue
      surface: '#ffffff',      // White
      text: '#0c4a6e',         // Dark blue
      textSecondary: '#0e7490', // Medium blue
      border: '#bae6fd',       // Light blue border
      success: '#059669',      // Green
      warning: '#ea580c',      // Orange
      error: '#dc2626'         // Red
    },
    logo: {
      icon: '⚕️',
      bgColor: '#0369a1',
      textColor: '#ffffff',
      shape: 'circle'
    },
    description: 'Calming healthcare theme with medical blues'
  },

  // Creative/Design agencies
  creative: {
    name: 'Creative',
    colors: {
      primary: '#ec4899',      // Pink
      secondary: '#be185d',    // Deep pink
      accent: '#f59e0b',       // Orange accent
      background: '#fefcf8',   // Warm white
      surface: '#ffffff',      // White
      text: '#78350f',         // Warm brown
      textSecondary: '#a16207', // Amber brown
      border: '#fed7aa',       // Warm border
      success: '#65a30d',      // Lime green
      warning: '#ea580c',      // Orange
      error: '#dc2626'         // Red
    },
    logo: {
      icon: '🎨',
      bgColor: '#ec4899',
      textColor: '#ffffff',
      shape: 'rounded',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)'
    },
    description: 'Vibrant creative theme with pink and orange'
  },

  // Default theme
  default: {
    name: 'Default',
    colors: {
      primary: '#8FA8A8',      // Original teal
      secondary: '#4A5555',    // Original dark teal
      accent: '#f05d43',       // Original orange
      background: '#FFFFFF',   // White
      surface: '#D0DADA',      // Original light teal
      text: '#4A5555',         // Dark teal
      textSecondary: '#6B7280', // Gray
      border: '#42504d',       // Original border
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Amber
      error: '#ef4444'         // Red
    },
    logo: {
      icon: 'C',
      bgColor: '#8FA8A8',
      textColor: '#ffffff',
      shape: 'rounded'
    },
    description: 'Original app theme'
  }
}

export function getThemeFromEmail(email: string): Theme {
  if (!email) return themes.default

  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return themes.default

  // Academic institutions
  if (domain.endsWith('.edu') || domain.includes('university') || domain.includes('college')) {
    return themes.academic
  }

  // Government
  if (domain.endsWith('.gov') || domain.endsWith('.mil')) {
    return themes.government
  }

  // Tech companies
  const techDomains = ['google.com', 'microsoft.com', 'apple.com', 'meta.com', 'amazon.com', 'netflix.com', 'tesla.com', 'openai.com', 'anthropic.com']
  if (techDomains.some(tech => domain.includes(tech))) {
    return themes.tech
  }

  // Healthcare
  if (domain.includes('health') || domain.includes('medical') || domain.includes('hospital') || domain.endsWith('.med')) {
    return themes.healthcare
  }

  // Creative agencies
  if (domain.includes('design') || domain.includes('creative') || domain.includes('agency') || domain.includes('studio')) {
    return themes.creative
  }

  // Corporate (default for .com, .org, .net)
  if (domain.endsWith('.com') || domain.endsWith('.org') || domain.endsWith('.net') || domain.endsWith('.biz')) {
    return themes.corporate
  }

  return themes.default
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement

  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary)
  root.style.setProperty('--color-secondary', theme.colors.secondary)
  root.style.setProperty('--color-accent', theme.colors.accent)
  root.style.setProperty('--color-background', theme.colors.background)
  root.style.setProperty('--color-surface', theme.colors.surface)
  root.style.setProperty('--color-text', theme.colors.text)
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--color-border', theme.colors.border)
  root.style.setProperty('--color-success', theme.colors.success)
  root.style.setProperty('--color-warning', theme.colors.warning)
  root.style.setProperty('--color-error', theme.colors.error)
}