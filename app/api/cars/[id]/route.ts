import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cars/[id] - Get a specific car
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        incidents: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        carReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    )
  }
}

// PUT /api/cars/[id] - Update a car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { make, model, year, licensePlate, vin, color, status } = body

    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id },
    })

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Check if license plate already exists (if being updated)
    if (licensePlate && licensePlate !== existingCar.licensePlate) {
      const duplicateLicense = await prisma.car.findUnique({
        where: { licensePlate },
      })

      if (duplicateLicense) {
        return NextResponse.json(
          { error: 'Car with this license plate already exists' },
          { status: 409 }
        )
      }
    }

    // Check if VIN already exists (if being updated)
    if (vin && vin !== existingCar.vin) {
      const duplicateVin = await prisma.car.findUnique({
        where: { vin },
      })

      if (duplicateVin) {
        return NextResponse.json(
          { error: 'Car with this VIN already exists' },
          { status: 409 }
        )
      }
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        make,
        model,
        year,
        licensePlate,
        vin,
        color,
        status,
      },
    })

    return NextResponse.json(updatedCar)
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    )
  }
}

// DELETE /api/cars/[id] - Delete a car
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid car ID' },
        { status: 400 }
      )
    }

    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id },
      include: {
        incidents: true,
        carReadings: true,
      },
    })

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    // Check if car has associated incidents
    if (existingCar.incidents.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete car with associated incidents' },
        { status: 400 }
      )
    }

    // Delete car readings first
    await prisma.carReading.deleteMany({
      where: { carId: id },
    })

    // Delete the car
    await prisma.car.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Car deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    )
  }
}


