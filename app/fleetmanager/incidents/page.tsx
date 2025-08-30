import { IncidentsTable } from '@/components/incidents/incidents-table'
import { AlertTriangle } from 'lucide-react'

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          Incident Management
        </h2>
        <p className="text-muted-foreground mt-2">
          Monitor and manage vehicle incidents across your fleet.
        </p>
      </div>

      <IncidentsTable />
    </div>
  )
}
