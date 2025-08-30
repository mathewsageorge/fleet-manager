import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const carId = searchParams.get('carId')
    const assignedToId = searchParams.get('assignedToId')
    const query = searchParams.get('query')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (status) where.status = status
    if (severity) where.severity = severity
    if (carId) where.carId = parseInt(carId)
    if (assignedToId) where.assignedToId = parseInt(assignedToId)
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (startDate || endDate) {
      where.occurredAt = {}
      if (startDate) where.occurredAt.gte = new Date(startDate)
      if (endDate) where.occurredAt.lte = new Date(endDate)
    }

    // Fetch all incidents with related data
    const incidents = await prisma.incident.findMany({
      where,
      include: {
        car: true,
        reportedBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { reportedAt: 'desc' },
    })

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Title',
      'Description',
      'Status',
      'Severity',
      'Type',
      'Vehicle',
      'License Plate',
      'Reported By',
      'Assigned To',
      'Location',
      'Occurred At',
      'Reported At',
      'Estimated Cost',
      'Actual Cost',
      'Resolution Notes',
      'Resolved At',
    ]

    const csvRows = incidents.map(incident => [
      incident.id,
      `"${incident.title.replace(/"/g, '""')}"`,
      `"${incident.description.replace(/"/g, '""')}"`,
      incident.status,
      incident.severity,
      incident.type,
      `${incident.car.make} ${incident.car.model}`,
      incident.car.licensePlate,
      incident.reportedBy.name,
      incident.assignedTo?.name || '',
      incident.location || '',
      incident.occurredAt.toISOString(),
      incident.reportedAt.toISOString(),
      incident.estimatedCost || '',
      incident.actualCost || '',
      incident.resolutionNotes ? `"${incident.resolutionNotes.replace(/"/g, '""')}"` : '',
      incident.resolvedAt?.toISOString() || '',
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Set response headers for CSV download
    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', `attachment; filename="incidents-${new Date().toISOString().split('T')[0]}.csv"`)
    
    return response
  } catch (error) {
    console.error('Error exporting incidents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
