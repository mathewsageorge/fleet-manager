import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'
import { apiClient } from '../api-client'

export interface IncidentFilters {
  status?: string
  severity?: string
  carId?: number
  assignedToId?: number
  startDate?: string
  endDate?: string
  query?: string
  page?: number
  limit?: number
}

export interface IncidentStats {
  total: number
  byStatus: Record<string, number>
  bySeverity: Record<string, number>
  avgResolutionTime: number
  openIncidents: number
}

export interface CreateIncidentData {
  carId: number
  reportedById: number
  title: string
  description: string
  severity: string
  type: string
  location?: string
  latitude?: number
  longitude?: number
  occurredAt: string
  images?: string[]
  estimatedCost?: number
}

export interface UpdateIncidentData {
  title?: string
  description?: string
  severity?: string
  status?: string
  assignedToId?: number
  resolutionNotes?: string
  estimatedCost?: number
  actualCost?: number
}

// Query Functions
export const fetchIncidents = async (filters: IncidentFilters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  
  const endpoint = params.toString() ? `/incidents?${params}` : '/incidents'
  return apiClient.get(endpoint)
}

export const fetchIncidentDetail = async (id: string) => {
  return apiClient.get(`/incidents/${id}`)
}

export const fetchIncidentStats = async () => {
  return apiClient.get<IncidentStats>('/incidents/stats')
}

export const fetchCars = async () => {
  return apiClient.get('/cars')
}

export const fetchUsers = async () => {
  return apiClient.get('/users')
}

// Custom Hooks
export const useIncidents = (filters: IncidentFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => fetchIncidents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  })
}

export const useIncidentDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: () => fetchIncidentDetail(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export const useIncidentStats = () => {
  return useQuery({
    queryKey: queryKeys.incidents.stats(),
    queryFn: fetchIncidentStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCars = () => {
  return useQuery({
    queryKey: queryKeys.cars.list(),
    queryFn: fetchCars,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Mutations
export const useCreateIncident = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateIncidentData) => apiClient.post('/incidents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.stats() })
    },
  })
}

export const useUpdateIncident = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentData }) => 
      apiClient.put(`/incidents/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.stats() })
    },
  })
}

export const useAddIncidentComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      apiClient.post(`/incidents/${id}/updates`, { message: comment, updateType: 'COMMENT' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(variables.id) })
    },
  })
}

export function useExportIncidents() {
  return useMutation({
    mutationFn: async (filters: any) => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      
      const response = await fetch(`/api/incidents/export?${params.toString()}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `incidents-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })
}
