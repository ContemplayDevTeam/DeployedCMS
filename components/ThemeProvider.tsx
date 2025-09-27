'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, themes, getThemeFromEmail, applyTheme } from '../lib/themes'

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
    const newTheme = getThemeFromEmail(email)
    setTheme(newTheme)
    setCurrentThemeName(newTheme.name.toLowerCase())

    // Apply theme to DOM
    applyTheme(newTheme)

    // Store in localStorage for persistence
    localStorage.setItem('user_email', email)
    localStorage.setItem('theme_name', newTheme.name.toLowerCase())

    console.log(`🎨 Theme switched to: ${newTheme.name} for email: ${email}`)
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email')
    const savedTheme = localStorage.getItem('theme_name')

    if (savedEmail) {
      setEmailTheme(savedEmail)
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