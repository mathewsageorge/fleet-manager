// Administrator Authentication Configuration
// IMPORTANT: Change this password in production and store it securely!

export const AUTH_CONFIG = {
  // Administrator password - CHANGE THIS IN PRODUCTION!
  ADMIN_PASSWORD: 'admin1234',
  
  // Security settings
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 30000, // 30 seconds in milliseconds
  
  // Session settings
  SESSION_KEY: 'settings_authenticated',
  SESSION_DURATION: 3600000, // 1 hour in milliseconds
}

// Function to validate administrator password
export function validateAdminPassword(password: string): boolean {
  return password === AUTH_CONFIG.ADMIN_PASSWORD
}

// Function to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const authStatus = sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY)
  if (authStatus !== 'true') return false
  
  // Check if session has expired
  const sessionTime = sessionStorage.getItem(`${AUTH_CONFIG.SESSION_KEY}_time`)
  if (sessionTime) {
    const sessionTimestamp = parseInt(sessionTime)
    const currentTime = Date.now()
    if (currentTime - sessionTimestamp > AUTH_CONFIG.SESSION_DURATION) {
      // Session expired, clear it
      sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY)
      sessionStorage.removeItem(`${AUTH_CONFIG.SESSION_KEY}_time`)
      return false
    }
  }
  
  return true
}

// Function to set authentication session
export function setAuthenticated(): void {
  if (typeof window === 'undefined') return
  
  sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, 'true')
  sessionStorage.setItem(`${AUTH_CONFIG.SESSION_KEY}_time`, Date.now().toString())
}

// Function to clear authentication session
export function clearAuthentication(): void {
  if (typeof window === 'undefined') return
  
  sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY)
  sessionStorage.removeItem(`${AUTH_CONFIG.SESSION_KEY}_time`)
}

