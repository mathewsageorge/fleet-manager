'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AUTH_CONFIG, validateAdminPassword } from '@/lib/auth-config'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
}

export function PasswordModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Administrator Access Required",
  description = "Please enter the administrator password to access settings."
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  // Using configuration from auth-config.ts
  const MAX_ATTEMPTS = AUTH_CONFIG.MAX_LOGIN_ATTEMPTS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call delay for security
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (validateAdminPassword(password)) {
      setIsLoading(false)
      setPassword('')
      setAttempts(0)
      setError('')
      onSuccess()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setIsLoading(false)
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Too many failed attempts. Please try again later.')
        setTimeout(() => {
          setAttempts(0)
          setError('')
        }, AUTH_CONFIG.LOCKOUT_DURATION)
      } else {
        setError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
      }
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setPassword('')
      setError('')
      setAttempts(0)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Administrator Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={cn(
                  "pr-10",
                  error && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                disabled={isLoading || attempts >= MAX_ATTEMPTS}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password.trim() || attempts >= MAX_ATTEMPTS}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Access Settings'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Security Notice:</p>
              <p className="mt-1">Only authorized administrators should access these settings. Unauthorized changes may affect system operations.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
