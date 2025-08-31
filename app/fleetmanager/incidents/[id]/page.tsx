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
      {/* Mobile Optimized Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/fleetmanager/incidents">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight truncate">{typedIncident.title}</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Incident #{typedIncident.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${getStatusColor(typedIncident.status)} text-xs`}>
            {typedIncident.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getSeverityColor(typedIncident.severity)} text-xs`}>
            {typedIncident.severity}
          </Badge>
          <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
            <Link href={`/fleetmanager/incidents/${resolvedParams.id}/edit`}>
              <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Incident Details */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <h4 className="font-medium text-sm md:text-base">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{typedIncident.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <h4 className="font-medium flex items-center gap-1 md:gap-2 text-sm md:text-base">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  Occurred At
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formatDateTime(typedIncident.occurredAt)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Reported At</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formatDateTime(typedIncident.reportedAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm md:text-base">Type</h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                {typedIncident.type.replace('_', ' ')}
              </p>
            </div>

            {typedIncident.location && (
              <div>
                <h4 className="font-medium flex items-center gap-1 md:gap-2 text-sm md:text-base">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  Location
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground break-words">{typedIncident.location}</p>
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
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-base md:text-lg">Vehicle & Personnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div>
              <h4 className="font-medium text-sm md:text-base">Vehicle</h4>
              <p className="text-xs md:text-sm text-muted-foreground break-words">
                {typedIncident.car.make} {typedIncident.car.model} ({typedIncident.car.licensePlate})
              </p>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-1 md:gap-2 text-sm md:text-base">
                <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                Reported By
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground break-words">
                {typedIncident.reportedBy.name}
                <br />
                <span className="text-xs text-muted-foreground">({typedIncident.reportedBy.email})</span>
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm md:text-base">Assigned To</h4>
              <p className="text-xs md:text-sm text-muted-foreground break-words">
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
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-1 md:gap-2 text-base md:text-lg">
                <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                Cost Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {typedIncident.estimatedCost && (
                <div>
                  <h4 className="font-medium text-sm md:text-base">Estimated Cost</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">
                    {formatCurrency(typedIncident.estimatedCost)}
                  </p>
                </div>
              )}
              {typedIncident.actualCost && (
                <div>
                  <h4 className="font-medium text-sm md:text-base">Actual Cost</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">
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
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-1 md:gap-2 text-base md:text-lg">
                <ImageIcon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                Incident Photos ({typedIncident.images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {typedIncident.images.map((imageUrl: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border shadow-sm">
                    <Image
                      src={imageUrl}
                      alt={`Incident photo ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 md:mt-4 text-center">
                Tap any image to view full size
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resolution */}
        {(typedIncident.resolutionNotes || typedIncident.actualCost || typedIncident.status === 'RESOLVED') && (
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-base md:text-lg">Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {typedIncident.resolutionNotes && (
                <div>
                  <h4 className="font-medium text-sm md:text-base">Resolution Notes</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{typedIncident.resolutionNotes}</p>
                </div>
              )}
              {typedIncident.actualCost && (
                <div>
                  <h4 className="font-medium text-sm md:text-base">Actual Cost</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-medium">
                    {formatCurrency(typedIncident.actualCost)}
                  </p>
                </div>
              )}
              {typedIncident.resolvedAt && (
                <div>
                  <h4 className="font-medium text-sm md:text-base">Resolution Date</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {formatDateTime(typedIncident.resolvedAt)}
                  </p>
                </div>
              )}
              {typedIncident.status === 'RESOLVED' && !typedIncident.resolvedAt && (
                <div>
                  <p className="text-xs md:text-sm text-green-600 font-medium">✓ This incident has been resolved</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Updates/Comments Section */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-1 md:gap-2 text-base md:text-lg">
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            Updates & Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or update..."
              rows={3}
              className="text-sm resize-none"
            />
            <Button
              onClick={handleAddComment}
              disabled={!comment.trim() || addCommentMutation.isPending}
              size="sm"
              className="w-full sm:w-auto h-9 md:h-10 text-sm"
            >
              {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>

          {/* Updates List */}
          <div className="space-y-2 md:space-y-3">
            {typedIncident.updates?.map((update: any) => (
              <div key={update.id} className="border rounded-lg p-3 md:p-4">
                <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                  <div className="flex-1">
                    <p className="text-sm md:text-base leading-relaxed">{update.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {update.updateType.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {update.user.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 md:mt-0 md:ml-4 flex-shrink-0">
                    {formatDateTime(update.createdAt)}
                  </span>
                </div>
              </div>
            ))}

            {(!typedIncident.updates || typedIncident.updates.length === 0) && (
              <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
                No updates yet. Be the first to add a comment!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
