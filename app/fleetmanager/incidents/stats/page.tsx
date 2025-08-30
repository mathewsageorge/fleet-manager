import { AdvancedAnalytics } from '@/components/incidents/advanced-analytics'
import { BarChart3 } from 'lucide-react'

export default function IncidentStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          Fleet Analytics
        </h2>
        <p className="text-muted-foreground mt-2">
          Essential metrics and insights for vehicle incident management.
        </p>
      </div>

      <AdvancedAnalytics />
    </div>
  )
}
