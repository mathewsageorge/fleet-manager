'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIncident, useCars, useUsers } from '@/lib/queries/incidents'
import { notifications } from '@/lib/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Car, User, Calendar, MapPin, Camera } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { LocationPicker } from '@/components/ui/location-picker'

interface IncidentFormProps {
  initialData?: any
  isEditing?: boolean
  onSubmit?: (formData: any) => void
  isSubmitting?: boolean
}

interface Car {
  id: number
  make: string
  model: string
  licensePlate: string
}

interface User {
  id: number
  name: string
  email: string
}

export function IncidentForm({ initialData, isEditing = false, onSubmit, isSubmitting = false }: IncidentFormProps) {
  const router = useRouter()
  const { data: cars } = useCars()
  const { data: users } = useUsers()
  const createMutation = useCreateIncident()

  // State for feedback management
  const [createStatus, setCreateStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [createMessage, setCreateMessage] = React.useState('')

  const typedCars = cars as Car[]
  const typedUsers = users as User[]

  const [formData, setFormData] = useState({
    carId: initialData?.carId?.toString() || '',
    reportedById: initialData?.reportedById?.toString() || '1', // Default to first user
    assignedToId: initialData?.assignedToId?.toString() || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    severity: initialData?.severity || 'LOW',
    status: initialData?.status || 'PENDING',
    type: initialData?.type || 'OTHER',
    location: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    occurredAt: initialData?.occurredAt ? new Date(initialData.occurredAt).toISOString().slice(0, 16) : '',
    estimatedCost: initialData?.estimatedCost || '',
    actualCost: initialData?.actualCost || '',
    resolutionNotes: initialData?.resolutionNotes || '',
    images: initialData?.images || [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImagesChange = (images: string[]) => {
    handleChange('images', images)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.carId) newErrors.carId = 'Vehicle is required'
    if (!formData.title) newErrors.title = 'Title is required'
    if (!formData.description) newErrors.description = 'Description is required'
    if (!formData.occurredAt) newErrors.occurredAt = 'Incident date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (isEditing && onSubmit) {
      // Use custom submit handler for editing
      onSubmit(formData)
      return
    }

    // Handle incident creation with feedback
    setCreateStatus('loading')
    setCreateMessage('Creating incident...')

    try {
      const submitData = {
        ...formData,
        carId: parseInt(formData.carId as string),
        reportedById: parseInt(formData.reportedById as string),
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost as string) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude as string) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude as string) : undefined,
        images: formData.images,
      }

      const newIncident = await createMutation.mutateAsync(submitData)

      // Send notification based on severity
      if (submitData.severity === 'CRITICAL') {
        notifications.criticalIncident(newIncident)
      } else {
        notifications.newIncident(newIncident)
      }

      // Show success message
      setCreateStatus('success')
      setCreateMessage('Incident created successfully!')

      // Navigate after a brief delay
      setTimeout(() => {
        router.push('/fleetmanager/incidents')
      }, 1500)
    } catch (error) {
      console.error('Failed to create incident:', error)
      setCreateStatus('error')
      setCreateMessage('Failed to create incident. Please try again.')

      // Clear error message after 5 seconds
      setTimeout(() => {
        setCreateStatus('idle')
        setCreateMessage('')
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief description of the incident"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of what happened"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCIDENT">Accident</SelectItem>
                  <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                  <SelectItem value="THEFT">Theft</SelectItem>
                  <SelectItem value="VANDALISM">Vandalism</SelectItem>
                  <SelectItem value="MAINTENANCE_ISSUE">Maintenance Issue</SelectItem>
                  <SelectItem value="TRAFFIC_VIOLATION">Traffic Violation</SelectItem>
                  <SelectItem value="FUEL_ISSUE">Fuel Issue</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle & Personnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Vehicle *</label>
            <Select value={formData.carId} onValueChange={(value) => handleChange('carId', value)}>
              <SelectTrigger className={errors.carId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {typedCars && typedCars.map((car: Car) => (
                  <SelectItem key={car.id} value={car.id.toString()}>
                    {car.make} {car.model} ({car.licensePlate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carId && <p className="text-sm text-red-500 mt-1">{errors.carId}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Reported By</label>
            <Select value={formData.reportedById} onValueChange={(value) => handleChange('reportedById', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typedUsers && typedUsers.map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div>
              <label className="text-sm font-medium">Assigned To</label>
              <Select value={formData.assignedToId} onValueChange={(value) => handleChange('assignedToId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {typedUsers && typedUsers.map((user: User) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-4">
          <div>
            <label className="text-sm font-medium">When did this occur? *</label>
            <Input
              type="datetime-local"
              value={formData.occurredAt}
              onChange={(e) => handleChange('occurredAt', e.target.value)}
              className={`w-full ${errors.occurredAt ? 'border-red-500' : ''}`}
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            />
            {errors.occurredAt && <p className="text-sm text-red-500 mt-1">{errors.occurredAt}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              📅 Tap to select date and time
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <LocationPicker
              value={{
                location: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude
              }}
              onChange={(locationData) => {
                handleChange('location', locationData.location)
                handleChange('latitude', locationData.latitude)
                handleChange('longitude', locationData.longitude)
              }}
              placeholder="Search for incident location or use current location"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Incident Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImagesChange={handleImagesChange}
            maxImages={5}
            existingImages={formData.images as string[]}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Upload photos of the incident, vehicle damage, or relevant documentation (max 5 images, 5MB each)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Estimated Cost (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => handleChange('estimatedCost', e.target.value)}
                  placeholder="Optional estimated repair/replacement cost in ₹"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Cost (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.actualCost}
                  onChange={(e) => handleChange('actualCost', e.target.value)}
                  placeholder="Actual repair/replacement cost in ₹"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Estimated Cost (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', e.target.value)}
                placeholder="Optional estimated repair/replacement cost in ₹"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Resolution & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                value={formData.resolutionNotes}
                onChange={(e) => handleChange('resolutionNotes', e.target.value)}
                placeholder="Describe how the incident was resolved..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={createMutation.isPending || isSubmitting}
          className="flex-1"
        >
          {(createMutation.isPending || isSubmitting)
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Incident' : 'Create Incident')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          {isEditing ? 'Cancel Edit' : 'Cancel'}
        </Button>
      </div>

      {/* Status Message Below Form - Only for creation */}
      {!isEditing && createMessage && (
        <Card className={`border-l-4 ${
          createStatus === 'success'
            ? 'border-l-green-500 bg-green-50'
            : createStatus === 'error'
            ? 'border-l-red-500 bg-red-50'
            : 'border-l-blue-500 bg-blue-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {createStatus === 'loading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {createStatus === 'success' && (
                <div className="text-green-600 font-medium text-lg">✓</div>
              )}
              {createStatus === 'error' && (
                <div className="text-red-600 font-medium text-lg">✗</div>
              )}
              <p className={`text-sm font-medium ${
                createStatus === 'success'
                  ? 'text-green-800'
                  : createStatus === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {createMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
