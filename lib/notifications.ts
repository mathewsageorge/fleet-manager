// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: Date
  read: boolean
  data?: any
}

// Notification store
class NotificationStore {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  // Add a new notification
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(newNotification)
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    this.notify()

    // Show browser notification if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      })
    }

    return newNotification
  }

  // Mark notification as read
  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    this.notify()
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }))
    this.notify()
  }

  // Get all notifications
  getAll() {
    return [...this.notifications]
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  // Clear all notifications
  clear() {
    this.notifications = []
    this.notify()
  }
}

// Create global notification store
export const notificationStore = new NotificationStore()

// Helper functions for common notification types
export const notifications = {
  // New incident created
  newIncident: (incident: any) => {
    notificationStore.add({
      title: 'New Incident Reported',
      message: `Incident "${incident.title}" has been reported and requires attention.`,
      type: 'warning',
      data: { incidentId: incident.id }
    })
  },

  // Incident status changed
  statusChanged: (incident: any, oldStatus: string, newStatus: string) => {
    notificationStore.add({
      title: 'Incident Status Updated',
      message: `Incident "${incident.title}" status changed from ${oldStatus} to ${newStatus}.`,
      type: 'info',
      data: { incidentId: incident.id }
    })
  },

  // Incident assigned
  incidentAssigned: (incident: any, assignee: any) => {
    notificationStore.add({
      title: 'Incident Assigned',
      message: `Incident "${incident.title}" has been assigned to ${assignee.name}.`,
      type: 'info',
      data: { incidentId: incident.id }
    })
  },

  // Critical incident
  criticalIncident: (incident: any) => {
    notificationStore.add({
      title: 'Critical Incident Alert',
      message: `Critical incident "${incident.title}" requires immediate attention.`,
      type: 'error',
      data: { incidentId: incident.id }
    })
  },

  // Incident resolved
  incidentResolved: (incident: any) => {
    notificationStore.add({
      title: 'Incident Resolved',
      message: `Incident "${incident.title}" has been successfully resolved.`,
      type: 'success',
      data: { incidentId: incident.id }
    })
  },

  // New comment added
  newComment: (incident: any, comment: any) => {
    notificationStore.add({
      title: 'New Comment Added',
      message: `New comment added to incident "${incident.title}".`,
      type: 'info',
      data: { incidentId: incident.id }
    })
  },

  // System notification
  system: (title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    notificationStore.add({
      title,
      message,
      type
    })
  }
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }
  return false
}
