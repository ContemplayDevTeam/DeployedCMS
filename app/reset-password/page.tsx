'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import { DynamicLogo } from '@/components/DynamicLogo'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setEmailTheme } = useTheme()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [tokenValid, setTokenValid] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setTokenValid(false)
      setError('Invalid or missing reset token')
      return
    }

    // Decode token to get email and check expiry
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8')
      const [tokenEmail, timestamp] = decodedToken.split(':')

      if (!tokenEmail || !timestamp) {
        setTokenValid(false)
        setError('Invalid reset token format')
        return
      }

      // Check if token is expired (1 hour)
      const tokenAge = Date.now() - parseInt(timestamp)
      const oneHour = 60 * 60 * 1000
      if (tokenAge > oneHour) {
        setTokenValid(false)
        setError('Reset link has expired. Please request a new one.')
        return
      }

      setEmail(tokenEmail)
      setEmailTheme(tokenEmail)
    } catch (err) {
      console.error('Error decoding token:', err)
      setTokenValid(false)
      setError('Invalid reset token')
    }
  }, [searchParams, setEmailTheme])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: searchParams.get('token'),
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!tokenValid) {
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
              <DynamicLogo size="lg" />
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
                style={{ backgroundColor: theme.colors.error }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.background }}>
                Invalid Reset Link
              </h2>
              <p className="text-lg opacity-90 mb-6" style={{ color: theme.colors.background }}>
                {error}
              </p>
              <div className="flex flex-col space-y-3">
                <Link
                  href="/forgot-password"
                  className="inline-block px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: `${theme.colors.background}30`, color: theme.colors.background }}
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
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
              <DynamicLogo size="lg" />
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
                Password Reset Successful!
              </h2>
              <p className="text-lg opacity-90 mb-6" style={{ color: theme.colors.background }}>
                Your password has been updated. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
              >
                Go to Login Now
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
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.background }}>
              Reset Your Password
            </h1>
            <p className="text-lg opacity-80" style={{ color: theme.colors.background }}>
              Enter your new password for <strong>{email}</strong>
            </p>
          </div>

          {/* Form Card */}
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
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: theme.colors.background }}>
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
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
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
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
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </motion.div>

          {/* Footer Link */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/login"
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              style={{ color: theme.colors.background }}
            >
              ← Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
