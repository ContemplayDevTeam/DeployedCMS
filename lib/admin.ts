// Admin utilities - NEVER expose admin status to client
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ben@contemplay.ai'

/**
 * Check if an email is an admin (server-side only)
 * NEVER send this to the client
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

/**
 * List of all available workspaces for admin
 * Add more workspace codes here as needed
 */
export const AVAILABLE_WORKSPACES = [
  { code: 'homegrown', name: 'Homegrown National Park', theme: 'homegrownnationalpark' },
  { code: 'default', name: 'Default Theme', theme: 'default' },
]

/**
 * Get admin email (server-side only)
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL
}
