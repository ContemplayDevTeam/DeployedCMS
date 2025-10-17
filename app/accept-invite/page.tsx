'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '../../components/ThemeProvider'
import { DynamicLogo } from '../../components/DynamicLogo'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setPasswordTheme } = useTheme()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing your invitation...')
  const [email, setEmail] = useState('')
  const [workspaceCode, setWorkspaceCode] = useState('')

  useEffect(() => {
    const acceptInvite = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Invalid invitation link. No token provided.')
        return
      }

      try {
        const response = await fetch(`/api/invite/accept?token=${token}`, {
          method: 'GET',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to accept invitation')
        }

        // Store user data
        localStorage.setItem('uploader_email', data.email)
        localStorage.setItem('uploader_userId', data.userId)
        localStorage.setItem('theme_password', data.workspaceCode)
        localStorage.setItem('uploader_action', 'invite_accepted')
        localStorage.setItem('uploader_timestamp', new Date().toISOString())

        // Apply workspace theme
        setPasswordTheme(data.workspaceCode)

        setEmail(data.email)
        setWorkspaceCode(data.workspaceCode)
        setStatus('success')
        setMessage('Welcome! Let\'s complete your profile setup.')

        // Redirect to setup-account page after 2 seconds
        setTimeout(() => {
          router.push(`/setup-account?email=${encodeURIComponent(data.email)}&workspace=${encodeURIComponent(data.workspaceCode)}`)
        }, 2000)

      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Failed to accept invitation')
      }
    }

    acceptInvite()
  }, [searchParams, router, setPasswordTheme])

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
          </div>

          {/* Status Card */}
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
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                {status === 'processing' && (
                  <motion.div
                    className="w-16 h-16 border-4 border-transparent rounded-full"
                    style={{ borderTopColor: theme.colors.accent, borderRightColor: theme.colors.accent }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                {status === 'success' && (
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.accent }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.error }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Message */}
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.background }}>
                  {status === 'processing' && 'Processing Invitation'}
                  {status === 'success' && 'Welcome Aboard!'}
                  {status === 'error' && 'Oops!'}
                </h2>
                <p className="text-lg opacity-90" style={{ color: theme.colors.background }}>
                  {message}
                </p>
              </div>

              {/* Success Details */}
              {status === 'success' && (
                <motion.div
                  className="pt-4 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-sm" style={{ color: theme.colors.background }}>
                    <p className="opacity-80 mb-1">Email:</p>
                    <p className="font-semibold">{email}</p>
                  </div>
                  <div className="text-sm" style={{ color: theme.colors.background }}>
                    <p className="opacity-80 mb-1">Workspace Code:</p>
                    <p className="font-mono font-semibold">{workspaceCode}</p>
                  </div>
                  <p className="text-sm opacity-70 pt-2" style={{ color: theme.colors.background }}>
                    Redirecting to account setup...
                  </p>
                </motion.div>
              )}

              {/* Error Actions */}
              {status === 'error' && (
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: `${theme.colors.background}30`, color: theme.colors.background }}
                  >
                    Back to Home
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AcceptInvite() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
