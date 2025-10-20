'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '../../components/ThemeProvider'
import { DynamicLogo } from '../../components/DynamicLogo'

export default function ForgotPassword() {
  const { theme, setEmailTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Update theme based on email
  useEffect(() => {
    if (email && email.includes('@')) {
      setEmailTheme(email)
    }
  }, [email, setEmailTheme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`
      }}>
        <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="mb-6 relative inline-flex"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DynamicLogo size="lg" />
              </motion.div>
            </div>

            <motion.div
              className="backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-opacity-20 text-center"
              style={{
                backgroundColor: `${theme.colors.background}15`,
                borderColor: theme.colors.background,
                boxShadow: `0 25px 50px -12px ${theme.colors.secondary}40`
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: theme.colors.accent }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.background }}>
                Check Your Email
              </h2>
              <p className="text-lg opacity-90 mb-6" style={{ color: theme.colors.background }}>
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm opacity-70 mb-6" style={{ color: theme.colors.background }}>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
              >
                Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
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
            <motion.h2
              className="text-4xl font-bold mb-2"
              style={{ color: theme.colors.background }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Forgot Password?
            </motion.h2>
            <motion.p
              className="text-lg opacity-90"
              style={{ color: theme.colors.background }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              No worries, we&apos;ll send you reset instructions
            </motion.p>
          </div>

          {/* Form */}
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
                      color: theme.colors.text
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
              >
                <div className="relative flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-2 border-transparent rounded-full"
                        style={{ borderTopColor: theme.colors.background, borderRightColor: theme.colors.background }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Send Reset Link</span>
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
              <Link
                href="/login"
                className="text-sm font-medium transition-all duration-300 hover:underline"
                style={{ color: theme.colors.background }}
              >
                ← Back to Login
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
