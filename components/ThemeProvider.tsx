'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, themes, getThemeFromEmail, getThemeForTesting, applyTheme } from '../lib/themes'

interface ThemeContextType {
  theme: Theme
  setEmailTheme: (email: string) => void
  currentThemeName: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(themes.default)
  const [currentThemeName, setCurrentThemeName] = useState('default')

  const setEmailTheme = (email: string) => {
    // Check for URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search)
    const testTheme = urlParams.get('theme')

    const newTheme = getThemeForTesting(email, testTheme || undefined)
    setTheme(newTheme)
    setCurrentThemeName(newTheme.name.toLowerCase())

    // Apply theme to DOM
    applyTheme(newTheme)

    // Store in localStorage for persistence
    localStorage.setItem('user_email', email)
    localStorage.setItem('theme_name', newTheme.name.toLowerCase())

    const themeSource = testTheme ? `(test parameter: ${testTheme})` : '(email-based)'
    console.log(`🎨 Theme switched to: ${newTheme.name} for email: ${email} ${themeSource}`)
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email')
    const savedTheme = localStorage.getItem('theme_name')

    // Check for URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search)
    const testTheme = urlParams.get('theme')

    if (savedEmail) {
      setEmailTheme(savedEmail)
    } else if (testTheme && themes[testTheme]) {
      const loadedTheme = themes[testTheme]
      setTheme(loadedTheme)
      setCurrentThemeName(testTheme)
      applyTheme(loadedTheme)
      console.log(`🎨 Theme loaded from URL parameter: ${testTheme}`)
    } else if (savedTheme && themes[savedTheme]) {
      const loadedTheme = themes[savedTheme]
      setTheme(loadedTheme)
      setCurrentThemeName(savedTheme)
      applyTheme(loadedTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setEmailTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  )
}