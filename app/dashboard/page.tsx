'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

interface UserStats {
  email: string
  isVerified: boolean
  isPaid: boolean
  subscriptionTier: 'Free' | 'Basic' | 'Pro'
  totalUploads: number
  storageUsed: number
  lastActivity: string
  createdDate: string
  preferences: Record<string, unknown>
  planExpiry?: string
}

interface QueueStats {
  total: number
  pending: number
  processing: number
  published: number
  failed: number
  totalSize: number
  avgProcessingTime: number
}

export default function Dashboard() {
  const { theme } = useTheme()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    published: 0,
    failed: 0,
    totalSize: 0,
    avgProcessingTime: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [storedEmail, setStoredEmail] = useState<string>('')

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('uploader_email')
    if (email) {
      setStoredEmail(email)
      loadDashboardData(email)
    } else {
      setError('Please login first')
      setIsLoading(false)
    }

    // Listen for share modal event from Header
    const handleOpenShareModal = () => setShowShareModal(true)
    window.addEventListener('openShareModal', handleOpenShareModal)

    return () => {
      window.removeEventListener('openShareModal', handleOpenShareModal)
    }
  }, [])

  const loadDashboardData = async (email: string) => {
    setIsLoading(true)
    try {
      // Load user profile
      const profileResponse = await fetch('/api/airtable/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserStats(profileData.user)
      } else {
        throw new Error('Failed to load user profile')
      }

      // Load queue data
      const queueResponse = await fetch('/api/airtable/queue/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        const items = queueData.queueItems || []

        // Calculate queue statistics
        const stats = items.reduce((acc: QueueStats, item: { status: string; fileSize?: number; processingTime?: number }) => {
          acc.total++
          switch (item.status) {
            case 'queued': acc.pending++; break
            case 'processing': acc.processing++; break
            case 'published': acc.published++; break
            case 'failed': acc.failed++; break
          }
          acc.totalSize += item.fileSize || 0
          if (item.processingTime) {
            acc.avgProcessingTime = (acc.avgProcessingTime + item.processingTime) / 2
          }
          return acc
        }, { total: 0, pending: 0, processing: 0, published: 0, failed: 0, totalSize: 0, avgProcessingTime: 0 })

        setQueueStats(stats)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'Pro': return 'bg-purple-100 text-purple-800'
      case 'Basic': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#4A5555' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#4A5555' }}>
        <div className="text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <Link
            href="/login"
            className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#4A5555' }}>
      {/* Header */}
      <div className="border-b border-gray-600 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-300 mt-1">Welcome back, {userStats?.email}</p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/upload"
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upload Images
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Account Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(userStats?.subscriptionTier || 'Free')}`}>
                {userStats?.subscriptionTier}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${userStats?.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600">{userStats?.isVerified ? 'Verified' : 'Unverified'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${userStats?.isPaid ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                <span className="text-sm text-gray-600">{userStats?.isPaid ? 'Paid' : 'Free'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Uploads</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">{userStats?.totalUploads || 0}</div>
            <p className="text-sm text-gray-500">Images uploaded</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Used</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">{formatBytes(userStats?.storageUsed || 0)}</div>
            <p className="text-sm text-gray-500">Total storage</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Activity</h3>
            <div className="text-lg font-semibold text-gray-700 mb-2">
              {userStats?.lastActivity ? new Date(userStats.lastActivity).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-sm text-gray-500">Most recent</p>
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Queue Statistics</h3>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{queueStats.total}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">{queueStats.pending}</div>
              <div className="text-sm text-gray-500">Queued</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{queueStats.processing}</div>
              <div className="text-sm text-gray-500">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{queueStats.published}</div>
              <div className="text-sm text-gray-500">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">{queueStats.failed}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>

          {/* Progress Bar */}
          {queueStats.total > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Queue Progress</span>
                <span>{Math.round((queueStats.published / queueStats.total) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(queueStats.published / queueStats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* User Preferences */}
        {userStats?.preferences && Object.keys(userStats.preferences).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Preferences</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(userStats.preferences).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Workspace Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-md w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>Share Workspace</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
              Send an invitation email with a magic link. When they click it, they&apos;ll be automatically logged in with access to your workspace theme - no password needed!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Join our workspace to collaborate..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    if (!inviteEmail) return

                    try {
                      const response = await fetch('/api/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: inviteEmail,
                          message: inviteMessage,
                          workspaceCode: localStorage.getItem('theme_password'),
                          senderEmail: storedEmail
                        })
                      })

                      const data = await response.json()

                      if (response.ok) {
                        setInviteMessage('✓ Email invitation will be sent! (Email service not configured yet - invite link logged to console)')
                        console.log('📧 INVITE LINK:', data.inviteLink)
                        setTimeout(() => {
                          setShowShareModal(false)
                          setInviteEmail('')
                          setInviteMessage('')
                        }, 3000)
                      } else {
                        setInviteMessage('Error: ' + (data.error || 'Failed to send invite'))
                      }
                    } catch (error) {
                      console.error('Invite error:', error)
                      setInviteMessage('Error sending invite. Please try again.')
                    }
                  }}
                  disabled={!inviteEmail}
                  className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                >
                  Send Invitation Email
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false)
                    setInviteEmail('')
                    setInviteMessage('')
                  }}
                  className="px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}