import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cars - Get all cars
export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(cars)
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    )
  }
}

// POST /api/cars - Create a new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { make, model, year, licensePlate, vin, color, status } = body

    // Validate required fields
    if (!make || !model || !year || !licensePlate) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, licensePlate' },
        { status: 400 }
      )
    }

    // Check if license plate already exists
    const existingCar = await prisma.car.findUnique({
      where: { licensePlate },
    })

    if (existingCar) {
      return NextResponse.json(
        { error: 'Car with this license plate already exists' },
        { status: 409 }
      )
    }

    // Check if VIN already exists (if provided)
    if (vin) {
      const existingVin = await prisma.car.findUnique({
        where: { vin },
      })

      if (existingVin) {
        return NextResponse.json(
          { error: 'Car with this VIN already exists' },
          { status: 409 }
        )
      }
    }

    const car = await prisma.car.create({
      data: {
        make,
        model,
        year,
        licensePlate,
        vin,
        color,
        status: status || 'ACTIVE',
      },
    })

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error('Error creating car:', error)
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    )
  }
}
