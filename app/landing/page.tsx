'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../../components/ThemeProvider'

export default function Landing() {
  const router = useRouter()
  const { setEmailTheme, setPasswordTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Update theme based on email
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
          email: formData.email,
          password: formData.password || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user data
      localStorage.setItem('uploader_email', formData.email)
      if (data.workspaceCode) {
        localStorage.setItem('theme_password', data.workspaceCode)
        setPasswordTheme(data.workspaceCode)
      }
      localStorage.setItem('uploader_userId', data.userId)
      localStorage.setItem('uploader_action', 'login')
      localStorage.setItem('uploader_timestamp', new Date().toISOString())

      // Dispatch custom event to notify Header component
      window.dispatchEvent(new Event('emailSaved'))

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

  const features = [
    {
      title: "Easy Upload",
      description: "Simply drag and drop your product images to our queue."
    },
    {
      title: "Quick Publishing",
      description: "We'll publish your content professionally and efficiently."
    },
    {
      title: "Queue Management",
      description: "Track the status of your uploads in our organized queue."
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8FA8A8' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance" style={{ color: '#4A5555' }}>
              Upload, Queue, and
              <span style={{ color: '#f05d43' }}> Create</span>
            </h1>

            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: '#6B7280' }}>
              Upload your product images to our publishing queue. We&apos;ll handle the rest and get your content published quickly and professionally.
            </p>

            {/* Login Form */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="w-full sm:w-auto max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                      {error}
                    </div>
                  )}

                  {/* Email Input */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 text-lg border rounded-xl focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: '#e2775c', backgroundColor: '#F9FAFB', color: '#42504d' }}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    suppressHydrationWarning
                  />

                  {/* Password Input */}
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-6 py-4 text-lg border rounded-xl focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: '#e2775c', backgroundColor: '#F9FAFB', color: '#42504d' }}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    suppressHydrationWarning
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
                    className="w-full px-6 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-hover text-lg font-semibold"
                    style={{ backgroundColor: '#f05d43', color: '#FFFFFF' }}
                    suppressHydrationWarning
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-transparent rounded-full spinner mx-auto" style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}></div>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Forgot Password & Sign Up Links */}
                  <div className="flex justify-between items-center text-sm">
                    <Link href="/forgot-password" className="transition-colors hover:underline" style={{ color: '#f05d43' }}>
                      Forgot password?
                    </Link>
                    <Link href="/signup" className="transition-colors hover:underline" style={{ color: '#f05d43' }}>
                      Create account
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: '#939b7e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
              Simple and efficient publishing workflow
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5555' }}>
              Upload your images and let us handle the publishing process for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl shadow-sm card-hover" style={{ backgroundColor: '#D0DADA' }}>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#4A5555' }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: '#4A5555' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#4A5555' }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#D0DADA' }}>
            Ready to upload your images?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#D0DADA' }}>
            Start uploading your product images to our publishing queue
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 font-semibold rounded-lg transition-colors btn-hover"
              style={{ backgroundColor: '#D0DADA', color: '#4A5555' }}
              suppressHydrationWarning
            >
              Start Uploading Now
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-4 border-2 font-semibold rounded-lg transition-colors btn-hover"
              style={{ borderColor: '#D0DADA', color: '#D0DADA' }}
              suppressHydrationWarning
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8FA8A8' }}>
                  <span className="font-bold text-sm" style={{ color: '#D0DADA' }}>C</span>
                </div>
              </div>
              <p style={{ color: '#D0DADA' }}>
                Upload your product images to our publishing queue and let us handle the rest.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#D0DADA' }}>Company</h3>
              <ul className="space-y-2" style={{ color: '#D0DADA' }}>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>About</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Blog</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4" style={{ color: '#D0DADA' }}>Support</h3>
              <ul className="space-y-2" style={{ color: '#D0DADA' }}>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Help Center</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Contact</Link></li>
                <li><Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: '#8FA8A8', color: '#D0DADA' }}>
            <p>© {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
