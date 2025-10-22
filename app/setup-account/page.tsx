'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { DynamicLogo } from '@/components/DynamicLogo'

function SetupAccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [workspaceCode, setWorkspaceCode] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    // Get the email and workspace code from URL params or localStorage
    const emailParam = searchParams.get('email')
    const workspaceParam = searchParams.get('workspace')

    if (emailParam) {
      setInviteEmail(emailParam)
      setEmail(emailParam)
    } else {
      // Try to get from localStorage (if they just accepted invite)
      const storedEmail = localStorage.getItem('uploader_email')
      if (storedEmail) {
        setInviteEmail(storedEmail)
        setEmail(storedEmail)
      }
    }

    if (workspaceParam) {
      setWorkspaceCode(workspaceParam)
    } else {
      const storedWorkspace = localStorage.getItem('theme_password')
      if (storedWorkspace) {
        setWorkspaceCode(storedWorkspace)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!password) {
      setError('Please enter a password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/setup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          workspaceCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup account')
      }

      // Store user data
      localStorage.setItem('uploader_email', email)
      if (data.userId) {
        localStorage.setItem('uploader_userId', data.userId)
      }
      localStorage.setItem('uploader_action', 'account_setup_complete')
      localStorage.setItem('uploader_timestamp', new Date().toISOString())

      // Redirect to upload page
      router.push('/upload')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`
    }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ backgroundColor: theme.colors.accent }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ backgroundColor: theme.colors.surface }}
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <motion.div
              className="mb-6 relative inline-flex"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DynamicLogo size="lg" />
              <motion.div
                className="absolute -inset-2 rounded-full opacity-30"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: theme.colors.accent,
                  borderRightColor: theme.colors.accent
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.background }}>
              Complete Your Profile
            </h1>
            <p className="text-lg opacity-80" style={{ color: theme.colors.background }}>
              Set up your email and password for future logins
            </p>
          </div>

          {/* Setup Form Card */}
          <motion.div
            className="backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-opacity-20"
            style={{
              backgroundColor: `${theme.colors.background}15`,
              borderColor: theme.colors.background,
              boxShadow: `0 25px 50px -12px ${theme.colors.secondary}40`
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: theme.colors.background }}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: `${theme.colors.background}30`,
                    borderColor: `${theme.colors.background}40`,
                    color: theme.colors.background
                  }}
                  disabled={!!inviteEmail}
                  required
                />
                {inviteEmail && (
                  <p className="mt-1 text-xs opacity-70" style={{ color: theme.colors.background }}>
                    Email from your invitation
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: theme.colors.background }}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: `${theme.colors.background}30`,
                    borderColor: `${theme.colors.background}40`,
                    color: theme.colors.background
                  }}
                  required
                />
                <p className="mt-1 text-xs opacity-70" style={{ color: theme.colors.background }}>
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: theme.colors.background }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: `${theme.colors.background}30`,
                    borderColor: `${theme.colors.background}40`,
                    color: theme.colors.background
                  }}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: `${theme.colors.error}20` }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm" style={{ color: theme.colors.background }}>
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 border-2 border-transparent rounded-full mr-2"
                      style={{ borderTopColor: theme.colors.background }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Setting up...
                  </span>
                ) : (
                  'Complete Setup'
                )}
              </button>

              {/* Info Text */}
              <p className="text-center text-sm opacity-70" style={{ color: theme.colors.background }}>
                This password will be used for all future logins to your workspace
              </p>
            </form>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}

export default function SetupAccount() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SetupAccountContent />
    </Suspense>
  )
}
