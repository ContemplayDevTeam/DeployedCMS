'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
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
        throw new Error(data.error || 'Signup failed')
      }

      // Store user data
      localStorage.setItem('uploader_email', formData.email)
      localStorage.setItem('uploader_userId', data.userId)
      localStorage.setItem('uploader_action', 'signup')
      localStorage.setItem('uploader_timestamp', new Date().toISOString())

      router.push('/upload')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
    <div className="min-h-screen" style={{ backgroundColor: '#8FA8A8' }}>
      {/* Navbar */}
      <header className="backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b" style={{ backgroundColor: '#8FA8A8', borderColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4A5555' }}>
              <span className="font-bold text-sm" style={{ color: '#D0DADA' }}>C</span>
            </div>

          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-medium transition-colors"
              style={{ color: '#D0DADA' }}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#D0DADA', backgroundColor: '#4A5555' }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#4A5555' }}>
              Get Started
            </h2>
            <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
              Enter your email to get started
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-sm" style={{ backgroundColor: '#D0DADA' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#4A5555' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                  style={{ borderColor: '#8FA8A8', backgroundColor: '#FFFFFF', color: '#4A5555' }}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-hover font-medium"
                style={{ backgroundColor: '#8FA8A8', color: '#FFFFFF' }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-transparent rounded-full spinner mx-auto" style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}></div>
                ) : (
                  'Get Started'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-medium transition-colors" style={{ color: '#8FA8A8' }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 