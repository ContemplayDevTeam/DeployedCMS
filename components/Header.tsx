"use client"

import Link from "next/link"
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeProvider'
import { DynamicLogo } from './DynamicLogo'
import { NotificationBell } from './NotificationBell'
import { useState, useEffect } from 'react'

export function Header() {
  const { theme } = useTheme()
  const [storedEmail, setStoredEmail] = useState<string>('')

  useEffect(() => {
    // Check localStorage on mount and set up listener for changes
    const checkEmail = () => {
      const saved = localStorage.getItem('uploader_email')
      setStoredEmail(saved || '')
    }

    checkEmail()

    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', checkEmail)

    // Listen for custom event when email is saved in same tab
    window.addEventListener('emailSaved', checkEmail)

    // Poll localStorage every second to catch changes
    const interval = setInterval(checkEmail, 1000)

    return () => {
      window.removeEventListener('storage', checkEmail)
      window.removeEventListener('emailSaved', checkEmail)
      clearInterval(interval)
    }
  }, [])
  return (
    <Disclosure as="nav" className="sticky top-0 z-50 border-b shadow-sm" style={{ backgroundColor: theme.name === 'Homegrown National Park' ? '#f8f5ec' : theme.colors.primary, borderColor: theme.colors.accent }}>
      {({ open }) => (
        <>
          <div className={`${theme.name === 'Homegrown National Park' ? 'w-full' : 'mx-auto max-w-7xl'} px-4 sm:px-6 lg:px-8`}>
            <div className="flex h-14 items-center">
              {/* Logo - Left aligned */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-2">
                  <DynamicLogo />
                  {theme.name !== 'Homegrown National Park' && (
                    <span className="hidden font-bold sm:block" style={{ color: theme.colors.text }}>
                      Experience Queue
                    </span>
                  )}
                </Link>
              </div>

              {/* Center navigation - Desktop only */}
              <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:items-center lg:space-x-4 xl:space-x-8">
                <Link
                  href="/upload"
                  className="inline-flex items-center px-2 xl:px-3 py-1 text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: theme.colors.text }}
                >
                  Upload
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-2 xl:px-3 py-1 text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: theme.colors.text }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/bank"
                  className="inline-flex items-center px-2 xl:px-3 py-1 text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: theme.colors.text }}
                >
                  Image Bank
                </Link>
                <Link
                  href="/landing"
                  className="inline-flex items-center px-2 xl:px-3 py-1 text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: theme.colors.text }}
                >
                  Features
                </Link>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openShareModal')
                    window.dispatchEvent(event)
                  }}
                  className="inline-flex items-center space-x-1 px-2 xl:px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 whitespace-nowrap rounded"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Right side - Notifications & Auth buttons */}
              <div className="hidden lg:flex lg:items-center lg:space-x-2 xl:space-x-4">
                {storedEmail && <NotificationBell />}
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ color: '#42504d' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-lg px-3 xl:px-4 py-2 text-sm font-medium transition-all hover:shadow-md hover:opacity-90 whitespace-nowrap"
                  style={{ color: theme.colors.background, backgroundColor: theme.colors.accent }}
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="flex-1 flex justify-end lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset"
                  style={{ color: theme.colors.text, '--tw-ring-color': theme.colors.text } as React.CSSProperties}
                  suppressHydrationWarning>
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2" style={{ backgroundColor: theme.colors.surface }}>
              <Disclosure.Button
                as={Link}
                href="/upload"
                className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                style={{ color: '#42504d' }}
              >
                Upload
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href="/dashboard"
                className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                style={{ color: '#42504d' }}
              >
                Dashboard
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href="/bank"
                className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                style={{ color: '#42504d' }}
              >
                Image Bank
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href="/landing"
                className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                style={{ color: '#42504d' }}
              >
                Features
              </Disclosure.Button>
              <Disclosure.Button
                as="button"
                onClick={() => {
                  const event = new CustomEvent('openShareModal')
                  window.dispatchEvent(event)
                }}
                className="flex items-center space-x-2 py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80 w-full"
                style={{ color: '#42504d' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </Disclosure.Button>
            </div>
            <div className="border-t pb-3 pt-4" style={{ borderColor: theme.colors.accent, backgroundColor: theme.colors.surface }}>
              <div className="space-y-1">
                <Disclosure.Button
                  as={Link}
                  href="/login"
                  className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                  style={{ color: '#42504d' }}
                >
                  Sign In
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  href="/signup"
                  className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                  style={{ color: theme.colors.background }}
                >
                  Get Started
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}