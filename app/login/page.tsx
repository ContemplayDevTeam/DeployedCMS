'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '../../components/ThemeProvider'
import { DynamicLogo } from '../../components/DynamicLogo'
import { ThemeSwitcher } from '../../components/ThemeSwitcher'

export default function Login() {
  const router = useRouter()
  const { theme, setEmailTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Update theme when email changes
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      setEmailTheme(formData.email)
    }
  }, [formData.email, setEmailTheme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user data
      localStorage.setItem('uploader_email', formData.email)
      localStorage.setItem('uploader_userId', data.userId)
      localStorage.setItem('uploader_action', 'login')
      localStorage.setItem('uploader_timestamp', new Date().toISOString())

      // Set theme based on email
      setEmailTheme(formData.email)

      router.push('/upload')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`
    }}>
      <ThemeSwitcher />

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
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: theme.colors.text }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
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
            <motion.h2
              className="text-4xl font-bold mb-2"
              style={{ color: theme.colors.background }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p
              className="text-lg opacity-90"
              style={{ color: theme.colors.background }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Enter your email to continue your journey
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            className="backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-opacity-20"
            style={{
              backgroundColor: `${theme.colors.background}15`,
              borderColor: theme.colors.background,
              boxShadow: `0 25px 50px -12px ${theme.colors.secondary}40`
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  className="p-4 rounded-xl text-sm font-medium border"
                  style={{
                    backgroundColor: `${theme.colors.error}20`,
                    color: theme.colors.error,
                    borderColor: theme.colors.error
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-3" style={{ color: theme.colors.background }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full px-4 py-4 pl-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4"
                    style={{
                      borderColor: `${theme.colors.background}30`,
                      backgroundColor: `${theme.colors.background}90`,
                      color: theme.colors.text,
                      focusRingColor: `${theme.colors.accent}40`
                    }}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.colors.accent
                      e.target.style.boxShadow = `0 0 0 4px ${theme.colors.accent}40`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${theme.colors.background}30`
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.text }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg relative overflow-hidden group"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.background,
                  boxShadow: `0 10px 25px -5px ${theme.colors.accent}60`
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 15px 35px -5px ${theme.colors.accent}80`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${theme.colors.accent}60`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-2 border-transparent rounded-full"
                        style={{ borderTopColor: theme.colors.background, borderRightColor: theme.colors.background }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            {/* Footer Links */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <p className="text-sm" style={{ color: theme.colors.background }}>
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold transition-all duration-300 hover:underline"
                  style={{ color: theme.colors.accent }}
                >
                  Create one here
                </Link>
              </p>
              <div className="mt-4 pt-4 border-t border-opacity-20" style={{ borderColor: theme.colors.background }}>
                <Link
                  href="/"
                  className="text-sm font-medium transition-all duration-300 hover:underline"
                  style={{ color: theme.colors.background }}
                >
                  ← Back to Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 