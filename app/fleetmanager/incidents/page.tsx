
import { IncidentsTable } from '@/components/incidents/incidents-table'
import { AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Report New Incident Button - Always visible */}
        <Button
          asChild
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 border-0 w-full sm:w-auto"
        >
          <Link href="/fleetmanager/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            Report New Incident
          </Link>
        </Button>
      </div>

      <IncidentsTable />
    </div>
  )
}
