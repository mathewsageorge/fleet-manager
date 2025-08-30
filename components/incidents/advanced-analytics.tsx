'use client'

import { useIncidentStats } from '@/lib/queries/incidents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react'

export function AdvancedAnalytics() {
  const { data: stats, isLoading } = useIncidentStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for main metrics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-md">
              <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Loading skeleton for secondary metrics */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-md">
              <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400" />
              <CardHeader className="pb-3">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Calculate additional metrics
  const totalCost = (stats.bySeverity.CRITICAL || 0) * 5000 + 
                   (stats.bySeverity.HIGH || 0) * 2000 + 
                   (stats.bySeverity.MEDIUM || 0) * 800 + 
                   (stats.bySeverity.LOW || 0) * 200

  const resolutionRate = stats.total > 0 
    ? Math.round(((stats.byStatus.RESOLVED || 0) + (stats.byStatus.CLOSED || 0)) / stats.total * 100)
    : 0



  // Mock trends for demonstration
  const generateTrend = () => ({
    trend: Math.random() > 0.5 ? 'up' : 'down',
    percentage: Math.floor(Math.random() * 25) + 1
  })

  const essentialMetrics = [
    {
      title: 'Total Incidents',
      value: stats.total,
      description: 'All time incidents',
      icon: AlertTriangle,
      trend: generateTrend(),
      color: 'from-indigo-500 to-purple-600',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Open Incidents',
      value: stats.openIncidents,
      description: 'Currently active incidents',
      icon: Clock,
      trend: generateTrend(),
      color: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      description: 'Successfully resolved',
      icon: CheckCircle,
      trend: generateTrend(),
      color: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100 text-green-600',
    },
    {
      title: 'Estimated Total Cost',
      value: `$${totalCost.toLocaleString()}`,
      description: 'Based on severity levels',
      icon: DollarSign,
      trend: generateTrend(),
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Critical Issues',
      value: stats.bySeverity.CRITICAL || 0,
      description: 'High priority incidents',
      icon: Shield,
      trend: generateTrend(),
      color: 'from-red-500 to-pink-600',
      iconBg: 'bg-red-100 text-red-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Essential Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {essentialMetrics.map((metric) => (
          <Card key={metric.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-[1.02] overflow-hidden relative">
            <div className={`h-1 bg-gradient-to-r ${metric.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${metric.iconBg} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <div className="flex items-center text-xs">
                  {metric.trend.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={metric.trend.trend === 'up' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {metric.trend.percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Enhanced Distribution Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'RESOLVED': return { bg: 'bg-green-500', gradient: 'from-green-400 to-green-600' }
                  case 'CLOSED': return { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' }
                  case 'IN_PROGRESS': return { bg: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' }
                  case 'PENDING': return { bg: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' }
                  default: return { bg: 'bg-gray-400', gradient: 'from-gray-300 to-gray-500' }
                }
              }
              const colors = getStatusColor(status)
              return (
                <div key={status} className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${colors.bg} text-white border-0 text-xs font-medium px-3 py-1 shadow-sm`}>
                        {status.replace('_', ' ')}
                      </Badge>
                      <span className="font-semibold text-lg">{count}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground min-w-[2.5rem] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-600" />
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              const getSeverityColors = (sev: string) => {
                switch (sev) {
                  case 'CRITICAL': return { bg: 'bg-red-500', gradient: 'from-red-400 to-red-600' }
                  case 'HIGH': return { bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' }
                  case 'MEDIUM': return { bg: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' }
                  case 'LOW': return { bg: 'bg-green-500', gradient: 'from-green-400 to-green-600' }
                  default: return { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600' }
                }
              }
              const colors = getSeverityColors(severity)
              return (
                <div key={severity} className="p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/40 hover:to-muted/60 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${colors.bg} text-white border-0 text-xs font-medium px-3 py-1 shadow-sm`}>
                        {severity}
                      </Badge>
                      <span className="font-semibold text-lg">{count}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground min-w-[2.5rem] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>


    </div>
  )
}