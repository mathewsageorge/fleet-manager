'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateIncident, useCars, useUsers } from '@/lib/queries/incidents'
import { notifications } from '@/lib/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { AlertCircle, Car, User, Calendar, MapPin, Camera } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'

interface IncidentFormProps {
  initialData?: any
  isEditing?: boolean
}

export function IncidentForm({ initialData, isEditing = false }: IncidentFormProps) {
  const router = useRouter()
  const { data: cars } = useCars()
  const { data: users } = useUsers()
  const createMutation = useCreateIncident()

  const [formData, setFormData] = useState({
    carId: initialData?.carId || '',
    reportedById: initialData?.reportedById || 1, // Default to first user
    title: initialData?.title || '',
    description: initialData?.description || '',
    severity: initialData?.severity || 'LOW',
    type: initialData?.type || 'OTHER',
    location: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    occurredAt: initialData?.occurredAt ? new Date(initialData.occurredAt).toISOString().slice(0, 16) : '',
    estimatedCost: initialData?.estimatedCost || '',
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

    try {
      const submitData = {
        ...formData,
        carId: parseInt(formData.carId as string),
        reportedById: formData.reportedById,
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
      
      router.push('/fleetmanager/incidents')
    } catch (error) {
      console.error('Failed to create incident:', error)
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
              <Select
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="ACCIDENT">Accident</option>
                <option value="BREAKDOWN">Breakdown</option>
                <option value="THEFT">Theft</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="MAINTENANCE_ISSUE">Maintenance Issue</option>
                <option value="TRAFFIC_VIOLATION">Traffic Violation</option>
                <option value="FUEL_ISSUE">Fuel Issue</option>
                <option value="OTHER">Other</option>
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
            <Select
              value={formData.carId}
              onChange={(e) => handleChange('carId', e.target.value)}
              className={errors.carId ? 'border-red-500' : ''}
            >
              <option value="">Select a vehicle</option>
              {cars?.map((car: any) => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model} ({car.licensePlate})
                </option>
              ))}
            </Select>
            {errors.carId && <p className="text-sm text-red-500 mt-1">{errors.carId}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Reported By</label>
            <Select
              value={formData.reportedById}
              onChange={(e) => handleChange('reportedById', parseInt(e.target.value))}
            >
              {users?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">When did this occur? *</label>
            <Input
              type="datetime-local"
              value={formData.occurredAt}
              onChange={(e) => handleChange('occurredAt', e.target.value)}
              className={errors.occurredAt ? 'border-red-500' : ''}
            />
            {errors.occurredAt && <p className="text-sm text-red-500 mt-1">{errors.occurredAt}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Address or description of location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="Optional GPS coordinate"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="Optional GPS coordinate"
              />
            </div>
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
          <div>
            <label className="text-sm font-medium">Estimated Cost ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => handleChange('estimatedCost', e.target.value)}
              placeholder="Optional estimated repair/replacement cost"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="flex-1"
        >
          {createMutation.isPending ? 'Creating...' : isEditing ? 'Update Incident' : 'Create Incident'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
