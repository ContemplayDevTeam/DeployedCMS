'use client'

import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import { DynamicLogo } from './DynamicLogo'

const demoEmails = [
  'user@example.com',
  'test@demo.org',
  'sample@test.net'
]

export function ThemeSwitcher() {
  const { theme, setEmailTheme, currentThemeName } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full shadow-lg transition-all hover:scale-105"
        style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
        title="Switch Theme"
      >
        🎨
      </button>

      {isOpen && (
        <div
          className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-4 min-w-80 border"
          style={{ borderColor: theme.colors.border }}
        >
          <h3 className="font-semibold mb-3 text-center" style={{ color: theme.colors.text }}>
            Theme Preview
          </h3>

          <div className="flex items-center justify-center mb-4">
            <DynamicLogo size="md" />
            <div className="ml-3">
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {theme.name} Theme
              </div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                {theme.description}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
              Try different email formats:
            </p>

            {demoEmails.map((email) => (
              <button
                key={email}
                onClick={() => setEmailTheme(email)}
                className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {email}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <p className="text-xs text-center" style={{ color: theme.colors.textSecondary }}>
              Current: {currentThemeName}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}