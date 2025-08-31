'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Car, Search, Filter } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Car {
  id: number
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
  createdAt: string
  updatedAt: string
}

interface CarFormData {
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED'
}

export function CarsManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const queryClient = useQueryClient()

  // Fetch cars with optimized caching
  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ['cars'],
    queryFn: () => apiClient.get('/api/cars'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Create car mutation
  const createCarMutation = useMutation({
    mutationFn: (data: CarFormData) => apiClient.post('/api/cars', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      setIsModalOpen(false)
      setEditingCar(null)
    },
  })

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CarFormData }) =>
      apiClient.put(`/api/cars/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
      setIsModalOpen(false)
      setEditingCar(null)
    },
  })

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })

  // Filter cars
  const filteredCars = cars.filter((car: Car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || car.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleSubmit = (data: CarFormData) => {
    if (editingCar) {
      updateCarMutation.mutate({ id: editingCar.id, data })
    } else {
      createCarMutation.mutate(data)
    }
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this car?')) {
      deleteCarMutation.mutate(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      case 'RETIRED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded w-full sm:w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full sm:w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full sm:w-40 animate-pulse"></div>
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error loading cars</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters - Mobile Optimized */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
            <h3 className="text-base md:text-lg font-semibold">Fleet Vehicles ({filteredCars.length})</h3>
          </div>

          <Button
            onClick={() => {
              setEditingCar(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Add Vehicle</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-slate-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 md:pl-10 w-full text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 h-9 md:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cars Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredCars.map((car: Car) => (
          <Card key={car.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 md:pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-lg truncate">{car.make} {car.model}</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {car.year} • {car.licensePlate}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(car.status)} text-xs ml-2 flex-shrink-0`}>
                  {car.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-slate-600">
                {car.color && <div>Color: {car.color}</div>}
                {car.vin && <div className="truncate">VIN: {car.vin}</div>}
                <div className="text-xs text-slate-400 pt-1">
                  Added: {new Date(car.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-1 md:space-x-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(car)}
                  className="text-xs px-2 md:px-3 h-8"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(car.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 md:px-3 h-8"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No vehicles found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first vehicle'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Button
              onClick={() => {
                setEditingCar(null)
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Vehicle
            </Button>
          )}
        </div>
      )}

      {/* Car Form Modal */}
      {isModalOpen && (
        <CarFormModal
          car={editingCar}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCar(null)
          }}
          isLoading={createCarMutation.isPending || updateCarMutation.isPending}
        />
      )}
    </div>
  )
}

// Car Form Modal Component
function CarFormModal({ 
  car, 
  onSubmit, 
  onClose, 
  isLoading 
}: { 
  car: Car | null
  onSubmit: (data: CarFormData) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<CarFormData>({
    make: car?.make || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    licensePlate: car?.licensePlate || '',
    vin: car?.vin || '',
    color: car?.color || '',
    status: car?.status || 'ACTIVE',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
            {car ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Make *
                </label>
                <Input
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Model *
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year *
                </label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Color
                </label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                License Plate *
              </label>
              <Input
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                required
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                VIN
              </label>
              <Input
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                placeholder="Vehicle Identification Number"
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-9 md:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 md:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto h-9 md:h-10 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-9 md:h-10 text-sm"
              >
                {isLoading ? 'Saving...' : (car ? 'Update Vehicle' : 'Add Vehicle')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
