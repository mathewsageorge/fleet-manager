'use client'

import { useIncidentDetail, useAddIncidentComment } from '@/lib/queries/incidents'
import { notifications } from '@/lib/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime, formatCurrency, getSeverityColor, getStatusColor } from '@/lib/utils'
import { ArrowLeft, MapPin, Clock, DollarSign, User, MessageSquare, Image as ImageIcon, Edit } from 'lucide-react'
import Image from 'next/image'
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
    name: string
    email: string
  }
  assignedTo?: {
    name: string
    email: string
  }
  updates?: any[]
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const { data: incident, isLoading } = useIncidentDetail(resolvedParams.id)
  const addCommentMutation = useAddIncidentComment()
  const [comment, setComment] = useState('')

  const handleAddComment = async () => {
    if (!comment.trim()) return
    
    try {
      const newComment = await addCommentMutation.mutateAsync({
        id: resolvedParams.id,
        comment: comment.trim()
      })
      setComment('')
      
      // Send notification for new comment
      if (typedIncident) {
        notifications.newComment(typedIncident, newComment)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  if (isLoading) {
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
            <CardTitle>Loading incident details...</CardTitle>
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

  const typedIncident = incident as Incident

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/fleetmanager/incidents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{typedIncident.title}</h2>
            <p className="text-muted-foreground">Incident #{typedIncident.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(typedIncident.status)}>
            {typedIncident.status.replace('_', ' ')}
          </Badge>
          <Badge className={getSeverityColor(typedIncident.severity)}>
            {typedIncident.severity}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/fleetmanager/incidents/${resolvedParams.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{typedIncident.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Occurred At
                </h4>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(typedIncident.occurredAt)}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Reported At</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(typedIncident.reportedAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium">Type</h4>
              <p className="text-sm text-muted-foreground">
                {typedIncident.type.replace('_', ' ')}
              </p>
            </div>

            {typedIncident.location && (
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <p className="text-sm text-muted-foreground">{typedIncident.location}</p>
                {typedIncident.latitude && typedIncident.longitude && (
                  <p className="text-xs text-muted-foreground">
                    GPS: {typedIncident.latitude}, {typedIncident.longitude}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle & Personnel */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Personnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Vehicle</h4>
              <p className="text-sm text-muted-foreground">
                {typedIncident.car.make} {typedIncident.car.model} ({typedIncident.car.licensePlate})
              </p>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Reported By
              </h4>
              <p className="text-sm text-muted-foreground">
                {typedIncident.reportedBy.name} ({typedIncident.reportedBy.email})
              </p>
            </div>

            <div>
              <h4 className="font-medium">Assigned To</h4>
              <p className="text-sm text-muted-foreground">
                {typedIncident.assignedTo
                  ? `${typedIncident.assignedTo.name} (${typedIncident.assignedTo.email})`
                  : 'Unassigned'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cost Information */}
        {(typedIncident.estimatedCost || typedIncident.actualCost) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typedIncident.estimatedCost && (
                <div>
                  <h4 className="font-medium">Estimated Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(typedIncident.estimatedCost)}
                  </p>
                </div>
              )}
              {typedIncident.actualCost && (
                <div>
                  <h4 className="font-medium">Actual Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(typedIncident.actualCost)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Images */}
        {typedIncident.images && typedIncident.images.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Incident Photos ({typedIncident.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {typedIncident.images.map((imageUrl: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={imageUrl}
                      alt={`Incident photo ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click on any image to view full size
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resolution */}
        {(typedIncident.resolutionNotes || typedIncident.actualCost || typedIncident.status === 'RESOLVED') && (
          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typedIncident.resolutionNotes && (
                <div>
                  <h4 className="font-medium">Resolution Notes</h4>
                  <p className="text-sm text-muted-foreground">{typedIncident.resolutionNotes}</p>
                </div>
              )}
              {typedIncident.actualCost && (
                <div>
                  <h4 className="font-medium">Actual Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(typedIncident.actualCost)}
                  </p>
                </div>
              )}
              {typedIncident.resolvedAt && (
                <div>
                  <h4 className="font-medium">Resolution Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(typedIncident.resolvedAt)}
                  </p>
                </div>
              )}
              {typedIncident.status === 'RESOLVED' && !typedIncident.resolvedAt && (
                <div>
                  <p className="text-sm text-green-600 font-medium">✓ This incident has been resolved</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Updates/Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Updates & Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or update..."
              rows={3}
            />
            <Button 
              onClick={handleAddComment}
              disabled={!comment.trim() || addCommentMutation.isPending}
              size="sm"
            >
              {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>

          {/* Updates List */}
          <div className="space-y-3">
            {typedIncident.updates?.map((update: any) => (
              <div key={update.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">{update.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {update.updateType.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {update.user.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(update.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {(!typedIncident.updates || typedIncident.updates.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No updates yet. Be the first to add a comment!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
