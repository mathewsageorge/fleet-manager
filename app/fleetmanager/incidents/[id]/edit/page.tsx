'use client'

import { useIncidentDetail, useUpdateIncident } from '@/lib/queries/incidents'
import { notifications } from '@/lib/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IncidentForm } from '@/components/incidents/incident-form'
import { ArrowLeft, Edit, Clock, Activity } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

interface Incident {
  id: number
  title: string
  description: string
  status: string
  severity: string
  type: string
  occurredAt: string
  reportedAt: string
  updatedAt: string
  location?: string
  latitude?: number
  longitude?: number
  estimatedCost?: number
  actualCost?: number
  resolutionNotes?: string
  resolvedAt?: string
  images?: string[]
  car: {
    make: string
    model: string
    licensePlate: string
  }
  reportedBy: {
    id: number
    name: string
    email: string
  }
  assignedTo?: {
    id: number
    name: string
    email: string
  }
  assignedToId?: number
  updates?: any[]
}

export default function EditIncidentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const { data: incident, isLoading } = useIncidentDetail(resolvedParams.id)
  const updateMutation = useUpdateIncident()
  const [editComment, setEditComment] = useState('')
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [updateMessage, setUpdateMessage] = useState('')

  const handleUpdateIncident = async (formData: any) => {
    if (!incident) return

    // Reset any previous states
    setUpdateStatus('idle')
    setUpdateMessage('')

    // Set loading state
    setUpdateStatus('loading')
    setUpdateMessage('Updating incident...')

    try {
      // Cast incident to proper type to avoid TypeScript errors
      const typedIncident = incident as Incident

      // Prepare update data
      const updateData: any = {
        title: formData.title !== typedIncident.title ? formData.title : undefined,
        description: formData.description !== typedIncident.description ? formData.description : undefined,
        severity: formData.severity !== typedIncident.severity ? formData.severity : undefined,
        status: formData.status !== typedIncident.status ? formData.status : undefined,
        assignedToId: formData.assignedToId !== typedIncident.assignedToId?.toString() ? (formData.assignedToId && formData.assignedToId !== '' ? parseInt(formData.assignedToId) : null) : undefined,
        estimatedCost: formData.estimatedCost !== typedIncident.estimatedCost?.toString() ? (formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined) : undefined,
        actualCost: formData.actualCost !== typedIncident.actualCost?.toString() ? (formData.actualCost ? parseFloat(formData.actualCost) : undefined) : undefined,
        resolutionNotes: formData.resolutionNotes !== typedIncident.resolutionNotes ? formData.resolutionNotes : undefined,
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key]
        }
      })

      if (Object.keys(updateData).length === 0 && !editComment.trim()) {
        setUpdateStatus('error')
        setUpdateMessage('No changes detected. Please modify at least one field.')

        // Clear message after 3 seconds
        setTimeout(() => {
          setUpdateStatus('idle')
          setUpdateMessage('')
        }, 3000)
        return
      }

      const updatedIncident = await updateMutation.mutateAsync({
        id: resolvedParams.id,
        data: updateData
      })

      // Add edit comment if provided
      if (editComment.trim()) {
        const editUpdate = await fetch(`/api/incidents/${resolvedParams.id}/updates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: editComment.trim(),
            updateType: 'COMMENT',
            userId: 1, // TODO: Get from session
          }),
        })

        if (editUpdate.ok) {
          const editLog = await editUpdate.json()
          notifications.newComment(updatedIncident, editLog)
        }
      }

      // Send notification for incident update
      notifications.incidentUpdated(updatedIncident)

      // Show success message
      setUpdateStatus('success')
      setUpdateMessage('Incident updated successfully!')

      // Navigate back after a brief delay to show success message
      setTimeout(() => {
        window.location.href = `/fleetmanager/incidents/${resolvedParams.id}`
      }, 1500)
    } catch (error) {
      console.error('Failed to update incident:', error)
      setUpdateStatus('error')
      setUpdateMessage('Failed to update incident. Please try again.')

      // Clear error message after 5 seconds
      setTimeout(() => {
        setUpdateStatus('idle')
        setUpdateMessage('')
      }, 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/fleetmanager/incidents/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading incident...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/fleetmanager/incidents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Incident not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/fleetmanager/incidents/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Edit Incident
            </h2>
            <p className="text-muted-foreground">{(incident as Incident).title} (#{(incident as Incident).id})</p>
          </div>
        </div>
      </div>

      {/* Current Status Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{(incident as Incident).status.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Severity</p>
              <p className="text-sm text-muted-foreground">{(incident as Incident).severity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{(incident as Incident).type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {new Date((incident as Incident).updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Comment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe the changes you're making (optional)
            </label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="e.g., Updated severity due to new information, corrected location details..."
              className="w-full p-3 border rounded-md resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This comment will be added to the incident's update log to track what changes were made.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <IncidentForm
        initialData={incident as Incident}
        isEditing={true}
        onSubmit={handleUpdateIncident}
        isSubmitting={updateStatus === 'loading'}
      />

      {/* Status Message Below Form */}
      {updateMessage && (
        <Card className={`border-l-4 ${
          updateStatus === 'success'
            ? 'border-l-green-500 bg-green-50'
            : updateStatus === 'error'
            ? 'border-l-red-500 bg-red-50'
            : 'border-l-blue-500 bg-blue-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {updateStatus === 'loading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {updateStatus === 'success' && (
                <div className="text-green-600 font-medium text-lg">✓</div>
              )}
              {updateStatus === 'error' && (
                <div className="text-red-600 font-medium text-lg">✗</div>
              )}
              <p className={`text-sm font-medium ${
                updateStatus === 'success'
                  ? 'text-green-800'
                  : updateStatus === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {updateMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
