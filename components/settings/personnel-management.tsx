'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Users, Search, Mail, User } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface Personnel {
  id: number
  email: string
  name: string
  role: 'DRIVER' | 'FLEET_MANAGER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  _count: {
    incidentsReported: number
    incidentsAssigned: number
  }
}

interface PersonnelFormData {
  email: string
  name: string
  role: 'DRIVER' | 'FLEET_MANAGER' | 'ADMIN'
}

export function PersonnelManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const queryClient = useQueryClient()

  // Fetch personnel
  const { data: personnel = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/api/users'),
  })

  // Create personnel mutation
  const createPersonnelMutation = useMutation({
    mutationFn: (data: PersonnelFormData) => apiClient.post('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
      setEditingPersonnel(null)
    },
  })

  // Update personnel mutation
  const updatePersonnelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PersonnelFormData }) =>
      apiClient.put(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
      setEditingPersonnel(null)
    },
  })

  // Delete personnel mutation
  const deletePersonnelMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Filter personnel
  const filteredPersonnel = personnel.filter((person: Personnel) => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || person.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const handleSubmit = (data: PersonnelFormData) => {
    if (editingPersonnel) {
      updatePersonnelMutation.mutate({ id: editingPersonnel.id, data })
    } else {
      createPersonnelMutation.mutate(data)
    }
  }

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this person?')) {
      deletePersonnelMutation.mutate(id)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'FLEET_MANAGER': return 'bg-blue-100 text-blue-800'
      case 'DRIVER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'FLEET_MANAGER': return 'Fleet Manager'
      case 'DRIVER': return 'Driver'
      default: return role
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading personnel...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error loading personnel</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold">Personnel ({filteredPersonnel.length})</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="DRIVER">Drivers</SelectItem>
              <SelectItem value="FLEET_MANAGER">Fleet Managers</SelectItem>
              <SelectItem value="ADMIN">Administrators</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => {
              setEditingPersonnel(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Personnel
          </Button>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map((person: Personnel) => (
          <Card key={person.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <CardDescription className="text-sm flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {person.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getRoleColor(person.role)}>
                  {getRoleLabel(person.role)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Incidents Reported:</span>
                  <span className="font-medium">{person._count.incidentsReported}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incidents Assigned:</span>
                  <span className="font-medium">{person._count.incidentsAssigned}</span>
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t">
                  Added: {new Date(person.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(person)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(person.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No personnel found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || roleFilter !== 'ALL' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first team member'
            }
          </p>
          {!searchTerm && roleFilter === 'ALL' && (
            <Button
              onClick={() => {
                setEditingPersonnel(null)
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Personnel
            </Button>
          )}
        </div>
      )}

      {/* Personnel Form Modal */}
      {isModalOpen && (
        <PersonnelFormModal
          personnel={editingPersonnel}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPersonnel(null)
          }}
          isLoading={createPersonnelMutation.isPending || updatePersonnelMutation.isPending}
        />
      )}
    </div>
  )
}

// Personnel Form Modal Component
function PersonnelFormModal({ 
  personnel, 
  onSubmit, 
  onClose, 
  isLoading 
}: { 
  personnel: Personnel | null
  onSubmit: (data: PersonnelFormData) => void
  onClose: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<PersonnelFormData>({
    name: personnel?.name || '',
    email: personnel?.email || '',
    role: personnel?.role || 'DRIVER',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {personnel ? 'Edit Personnel' : 'Add New Personnel'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role *
              </label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                  <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              >
                {isLoading ? 'Saving...' : (personnel ? 'Update Personnel' : 'Add Personnel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
