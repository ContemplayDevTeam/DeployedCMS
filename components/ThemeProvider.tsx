'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, themes, getThemeForTesting, getThemeFromPassword, applyTheme } from '../lib/themes'

interface ThemeContextType {
  theme: Theme
  setEmailTheme: (email: string) => void
  setPasswordTheme: (password: string) => void
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

  const setPasswordTheme = (password: string) => {
    const newTheme = getThemeFromPassword(password)
    setTheme(newTheme)
    // Normalize theme name: remove spaces and lowercase to match theme keys
    const normalizedThemeName = newTheme.name.toLowerCase().replace(/\s+/g, '')
    setCurrentThemeName(normalizedThemeName)

    // Apply theme to DOM
    applyTheme(newTheme)

    // Store in localStorage for persistence
    localStorage.setItem('theme_password', password)
    localStorage.setItem('theme_name', normalizedThemeName)

    console.log(`🎨 Theme switched to: ${newTheme.name} via workspace code`)
  }

  const setEmailTheme = (email: string) => {
    // Check for URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search)
    const testTheme = urlParams.get('theme')

    const newTheme = getThemeForTesting(email, testTheme || undefined)
    setTheme(newTheme)
    // Normalize theme name: remove spaces and lowercase to match theme keys
    const normalizedThemeName = newTheme.name.toLowerCase().replace(/\s+/g, '')
    setCurrentThemeName(normalizedThemeName)

    // Apply theme to DOM
    applyTheme(newTheme)

    // Store in localStorage for persistence
    localStorage.setItem('user_email', email)
    localStorage.setItem('theme_name', normalizedThemeName)

    const themeSource = testTheme ? `(test parameter: ${testTheme})` : '(email-based)'
    console.log(`🎨 Theme switched to: ${newTheme.name} for email: ${email} ${themeSource}`)
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('theme_password')
    const savedEmail = localStorage.getItem('user_email')
    const savedTheme = localStorage.getItem('theme_name')

    // Check for URL parameter override for testing
    const urlParams = new URLSearchParams(window.location.search)
    const testTheme = urlParams.get('theme')

    // Priority: password > email > test URL > saved theme
    if (savedPassword) {
      setPasswordTheme(savedPassword)
    } else if (savedEmail) {
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
    <ThemeContext.Provider value={{ theme, setEmailTheme, setPasswordTheme, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  )
}