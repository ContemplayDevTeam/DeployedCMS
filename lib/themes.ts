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
  },

  // Homegrown National Park theme
  homegrownnationalpark: {
    name: 'Homegrown National Park',
    colors: {
      primary: '#e8d0a9',      // Warm cream
      secondary: '#5e8770',    // Forest green
      accent: '#8B2635',       // Burgundy for buttons
      background: '#fefcfa',   // Off-white background
      surface: '#f5f1eb',      // Light cream surface
      text: '#3a4a3e',         // Dark forest green
      textSecondary: '#6b7c6e', // Medium forest green
      border: '#d4c4a8',       // Muted cream border
      success: '#5e8770',      // Forest green for success
      warning: '#e8d0a9',      // Warm cream for warnings
      error: '#c67c5c'         // Earthy red for errors
    },
    logo: {
      icon: '/HNPlogo.png',    // Actual HNP logo image
      bgColor: 'transparent',  // No background
      textColor: '#ffffff',    // White text
      shape: 'square'          // No rounded corners
    },
    description: 'Earthy national park theme with natural colors'
  }
}

export function getThemeFromPassword(password: string): Theme {
  if (!password) return themes.default

  // Map passwords to themes
  const themePasswords: Record<string, Theme> = {
    'hnp2024': themes.homegrownnationalpark,
    'homegrown': themes.homegrownnationalpark,
    // Add more password mappings here
  }

  const theme = themePasswords[password.toLowerCase()]
  return theme || themes.default
}

export function getThemeFromEmail(email: string): Theme {
  if (!email) return themes.default

  const domain = email.toLowerCase().split('@')[1]
  if (!domain) return themes.default

  // Homegrown National Park theme
  if (domain === 'homegrownnationalpark.org') {
    return themes.homegrownnationalpark
  }

  // Add your custom themes here
  // Example:
  // if (domain.endsWith('.example.com')) {
  //   return themes.yourCustomTheme
  // }

  return themes.default
}

// Test function to get theme by URL parameter for demo purposes
export function getThemeForTesting(email: string, testTheme?: string): Theme {
  // Check for test parameter first (for demo purposes)
  if (testTheme && themes[testTheme]) {
    return themes[testTheme]
  }

  // Fall back to email-based theme detection
  return getThemeFromEmail(email)
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