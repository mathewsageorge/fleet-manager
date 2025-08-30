'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Car, AlertTriangle, BarChart3, Menu, X, Plus } from 'lucide-react'
import { NotificationBell } from '@/components/ui/notification-bell'
import { Providers } from '../providers'

const navigation = [
  {
    name: 'Analytics',
    href: '/fleetmanager/incidents/stats',
    icon: BarChart3,
    description: 'Metrics and insights',
  },
  {
    name: 'Incidents',
    href: '/fleetmanager/incidents',
    icon: AlertTriangle,
    description: 'Incident management',
  },
]

export default function FleetManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and title */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Fleet Manager
                    </h1>
                    <p className="text-xs text-muted-foreground">Vehicle Management System</p>
                  </div>
                </div>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-white/60 hover:shadow-md'
                      )}
                    >
                      <item.icon className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700',
                        'group-hover:scale-110'
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <NotificationBell />
                
                {/* Report New Incident Button */}
                <Button 
                  asChild 
                  className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                >
                  <Link href="/fleetmanager/incidents/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Incident
                  </Link>
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <div>
                        <div>{item.name}</div>
                        <div className={cn(
                          'text-xs',
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
                
                {/* Mobile Report Incident Button */}
                <Button 
                  asChild 
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href="/fleetmanager/incidents/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Report New Incident
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main content area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar - Simplified */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Navigation</h3>
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-white/60 hover:shadow-md'
                        )}
                      >
                        <item.icon className={cn(
                          'h-5 w-5 transition-transform duration-200',
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700',
                          'group-hover:scale-110'
                        )} />
                        <div>
                          <div>{item.name}</div>
                          <div className={cn(
                            'text-xs',
                            isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'
                          )}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Providers>
  )
}
