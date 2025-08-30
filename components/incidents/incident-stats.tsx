'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useIncidentStats } from '@/lib/queries/incidents'
import { AlertTriangle, Clock, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

export function IncidentStats() {
  const { data: stats, isLoading } = useIncidentStats()

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Loading...</CardTitle>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="h-6 w-12 sm:h-8 sm:w-16 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-2 w-16 sm:h-3 sm:w-24 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  // Calculate trends (mock data for demo - you could add actual trend calculation)
  const calculateTrend = (value: number) => {
    const trend = Math.random() > 0.5 ? 'up' : 'down'
    const percentage = Math.floor(Math.random() * 20) + 1
    return { trend, percentage }
  }

  // Calculate essential metrics
  const resolutionRate = stats.total > 0 
    ? Math.round(((stats.byStatus.RESOLVED || 0) + (stats.byStatus.CLOSED || 0)) / stats.total * 100)
    : 0

  const metrics = [
    {
      title: 'Total Incidents',
      value: stats.total,
      description: 'All time incidents',
      icon: AlertTriangle,
      trend: calculateTrend(stats.total),
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Open Incidents',
      value: stats.openIncidents,
      description: 'Pending & In Progress',
      icon: Clock,
      trend: calculateTrend(stats.openIncidents),
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Resolution Rate',
      value: `${resolutionRate}%`,
      description: 'Successfully resolved',
      icon: CheckCircle,
      trend: calculateTrend(resolutionRate),
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100 text-green-600',
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-500 text-white'
      case 'CLOSED': return 'bg-gray-500 text-white'
      case 'IN_PROGRESS': return 'bg-blue-500 text-white'
      case 'PENDING': return 'bg-yellow-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Essential Metrics */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={metric.title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02] overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${metric.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                {metric.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-full ${metric.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <metric.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="flex items-end justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground mb-1 leading-tight">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {metric.description}
                  </p>
                </div>
                <div className="flex items-center text-xs ml-2 flex-shrink-0">
                  {metric.trend.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={metric.trend.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {metric.trend.percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Issues Highlight */}
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-600" />
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <span className="leading-tight">Critical Issues Alert</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 gap-3 sm:gap-0">
            <div className="flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-red-700 leading-tight">
                {stats.bySeverity.CRITICAL || 0}
              </div>
              <p className="text-xs sm:text-sm text-red-600 leading-tight">
                Critical incidents requiring immediate attention
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm font-medium text-red-700">
                {stats.total > 0 ? Math.round(((stats.bySeverity.CRITICAL || 0) / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-red-500">of total incidents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="shadow-md border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <span className="leading-tight">Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={status} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Badge className={`${getStatusColor(status)} border-0 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0`}>
                      {status.replace('_', ' ')}
                    </Badge>
                    <span className="font-medium text-sm sm:text-base">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[2rem] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="shadow-md border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-600" />
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <span className="leading-tight">Severity Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={severity} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <Badge className={`${getSeverityColor(severity)} border-0 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0`}>
                      {severity}
                    </Badge>
                    <span className="font-medium text-sm sm:text-base">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          severity === 'CRITICAL' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                          severity === 'HIGH' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          severity === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-green-400 to-green-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[2rem] text-right">
                      {percentage}%
                    </span>
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
