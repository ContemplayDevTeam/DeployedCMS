"use client"

import Link from "next/link"
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <Disclosure as="nav" className="sticky top-0 z-50 border-b shadow-sm" style={{ backgroundColor: '#e2775c', borderColor: '#f05d43' }}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 justify-between">
              {/* Logo and main navigation */}
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#42504d' }}>
                        <span className="font-bold text-sm text-white">AQ</span>
                      </div>
                      <motion.div
                        className="absolute -inset-1 rounded-lg opacity-60"
                        style={{
                          border: '2px solid transparent',
                          borderTopColor: '#4A5555',
                          borderRightColor: '#4A5555'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>
                    <span className="hidden font-bold sm:block text-white">
                      AirTable Queue
                    </span>
                  </Link>
                </div>

                {/* Desktop navigation */}
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: '#42504d' }}
                  >
                    Upload
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: '#42504d' }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/landing"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: '#42504d' }}
                  >
                    Features
                  </Link>
                </div>
              </div>

              {/* Right side - Auth buttons */}
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#42504d' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md hover:opacity-90"
                  style={{ color: '#FFFFFF', backgroundColor: '#f05d43' }}
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset"
                  style={{ color: '#42504d', '--tw-ring-color': '#42504d' } as React.CSSProperties}>
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
            <div className="space-y-1 pb-3 pt-2" style={{ backgroundColor: '#d96b4f' }}>
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
                href="/landing"
                className="block py-2 pl-3 pr-4 text-base font-medium transition-colors hover:opacity-80"
                style={{ color: '#42504d' }}
              >
                Features
              </Disclosure.Button>
            </div>
            <div className="border-t pb-3 pt-4" style={{ borderColor: '#f05d43', backgroundColor: '#d96b4f' }}>
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
                  style={{ color: '#FFFFFF' }}
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