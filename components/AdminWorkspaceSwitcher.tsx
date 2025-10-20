'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'

interface Workspace {
  code: string
  name: string
  theme: string
}

export function AdminWorkspaceSwitcher() {
  const { setPasswordTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('')

  useEffect(() => {
    const checkAdmin = async () => {
      const email = localStorage.getItem('uploader_email')
      if (!email) return

      try {
        const response = await fetch('/api/admin/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await response.json()
        setIsAdmin(data.isAdmin)

        if (data.isAdmin) {
          // Get workspaces
          const wsResponse = await fetch('/api/admin/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })
          const wsData = await wsResponse.json()
          setWorkspaces(wsData.workspaces || [])

          // Get current workspace
          const current = localStorage.getItem('theme_password') || 'admin'
          setCurrentWorkspace(current)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    checkAdmin()
  }, [])

  const switchWorkspace = (code: string) => {
    setCurrentWorkspace(code)
    localStorage.setItem('theme_password', code)
    setPasswordTheme(code)
    setIsOpen(false)

    // Refresh page to apply theme
    window.location.reload()
  }

  if (!isAdmin) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>Admin: {currentWorkspace}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Switch Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.code}
                  onClick={() => switchWorkspace(ws.code)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    currentWorkspace === ws.code
                      ? 'bg-purple-100 text-purple-900 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{ws.name}</div>
                  <div className="text-xs text-gray-500">{ws.code}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
