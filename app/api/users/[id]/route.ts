import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        incidentsReported: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            car: true,
          },
        },
        incidentsAssigned: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            car: true,
          },
        },
        _count: {
          select: {
            incidentsReported: true,
            incidentsAssigned: true,
            incidentUpdates: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { email, name, role } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email already exists (if being updated)
      if (email !== existingUser.email) {
        const duplicateEmail = await prisma.user.findUnique({
          where: { email },
        })

        if (duplicateEmail) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          )
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        name,
        role,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        incidentsReported: true,
        incidentsAssigned: true,
        incidentUpdates: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has associated incidents
    if (existingUser.incidentsReported.length > 0 || existingUser.incidentsAssigned.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with associated incidents' },
        { status: 400 }
      )
    }

    // Delete incident updates first
    await prisma.incidentUpdate.deleteMany({
      where: { userId: id },
    })

    // Delete the user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}


