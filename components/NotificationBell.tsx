"use client"

import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

interface Notification {
  id: string
  userEmail: string
  type: 'image_published' | 'image_failed' | 'queue_completed' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedImageId?: string
  relatedImageUrl?: string
}

export function NotificationBell() {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    const email = localStorage.getItem('uploader_email')
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/notifications?email=${encodeURIComponent(email)}&unreadOnly=false`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const email = localStorage.getItem('uploader_email')
    if (!email) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, markAllAsRead: true })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'image_published':
        return '✅'
      case 'image_failed':
        return '❌'
      case 'queue_completed':
        return '🎉'
      case 'system':
        return 'ℹ️'
      default:
        return '🔔'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg transition-colors hover:bg-opacity-20 hover:bg-white"
        style={{ color: theme.colors.text }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 text-xs flex items-center justify-center rounded-full font-bold"
            style={{ backgroundColor: theme.colors.error, color: 'white' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden flex flex-col"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
          >
            <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: theme.colors.border }}>
              <h3 className="font-semibold" style={{ color: theme.colors.text }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ color: theme.colors.accent }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center" style={{ color: theme.colors.textSecondary }}>
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && markAsRead(notification.id!)}
                    className="p-3 border-b cursor-pointer transition-colors hover:bg-opacity-50 hover:bg-white"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: notification.read ? 'transparent' : `${theme.colors.accent}10`
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm" style={{ color: theme.colors.text }}>
                            {notification.title}
                          </p>
                          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                          {notification.message}
                        </p>
                        {notification.relatedImageUrl && (
                          <img
                            src={notification.relatedImageUrl}
                            alt="Related"
                            className="mt-2 rounded max-w-full h-20 object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
