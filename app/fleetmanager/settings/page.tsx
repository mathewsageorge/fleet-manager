'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Car, Users, Settings as SettingsIcon, Lock, Shield } from 'lucide-react'
import { CarsManagement } from '@/components/settings/cars-management'
import { PersonnelManagement } from '@/components/settings/personnel-management'
import { PasswordModal } from '@/components/ui/password-modal'
import { isAuthenticated, setAuthenticated, clearAuthentication } from '@/lib/auth-config'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('vehicles')
  const [isAuthState, setIsAuthState] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const router = useRouter()

  // Check if user is authenticated on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      setIsAuthState(true)
    } else {
      setShowPasswordModal(true)
    }
  }, [])

  const handleAuthenticationSuccess = () => {
    setIsAuthState(true)
    setShowPasswordModal(false)
    setAuthenticated()
  }

  const handleAuthenticationClose = () => {
    setShowPasswordModal(false)
    // Redirect back to incidents page if user cancels authentication
    router.push('/fleetmanager/incidents')
  }

  const handleLogout = () => {
    clearAuthentication()
    setIsAuthState(false)
    setShowPasswordModal(true)
  }

  // Handle tab change with immediate visual feedback
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Show loading state while checking authentication
  if (!isAuthState && !showPasswordModal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-2 md:space-y-0">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-3 md:space-y-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Settings</h1>
              <div className="flex items-center space-x-2 px-2 py-1 md:px-3 bg-green-100 border border-green-200 rounded-full w-fit">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="text-xs md:text-sm font-medium text-green-700">Admin Access</span>
              </div>
            </div>
            <p className="text-sm md:text-base text-slate-600">
              Manage your fleet vehicles and personnel (Protected Access)
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-end md:space-x-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs md:text-sm"
              >
                <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="md:inline">Logout</span>
              </Button>
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Security Notice - Mobile Optimized */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 md:p-6 md:pt-6">
            <div className="flex items-start space-x-2 md:space-x-3">
              <Lock className="h-4 w-4 md:h-5 md:w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm md:text-base font-medium text-amber-800">Administrator Access Required</h3>
                <p className="text-xs md:text-sm text-amber-700 mt-1">
                  You are accessing settings with administrator privileges.
                  <span className="hidden md:inline"> All changes made here will affect the entire system. Please proceed with caution.</span>
                  <span className="md:hidden"> Changes affect entire system.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 md:p-2">
            <TabsTrigger
              value="vehicles"
              className="flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-150 py-2 md:py-3 text-xs md:text-sm"
            >
              <Car className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Vehicles</span>
              <span className="sm:hidden">Vehicles</span>
            </TabsTrigger>
            <TabsTrigger
              value="personnel"
              className="flex items-center justify-center space-x-1 md:space-x-2 transition-all duration-150 py-2 md:py-3 text-xs md:text-sm"
            >
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Personnel</span>
              <span className="sm:hidden">Personnel</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="vehicles"
            forceMount
            className={`space-y-6 transition-opacity duration-200 ${
              activeTab === 'vehicles' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Vehicle Management</span>
                </CardTitle>
                <CardDescription>
                  Add, edit, and manage your fleet vehicles. Track vehicle details, status, and maintenance history.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CarsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="personnel"
            forceMount
            className={`space-y-6 transition-opacity duration-200 ${
              activeTab === 'personnel' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Personnel Management</span>
                </CardTitle>
                <CardDescription>
                  Manage drivers, fleet managers, and administrators. Assign roles and track personnel information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonnelManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handleAuthenticationClose}
        onSuccess={handleAuthenticationSuccess}
        title="Administrator Access Required"
        description="Please enter the administrator password to access system settings. Only authorized administrators should proceed."
      />
    </>
  )
}

