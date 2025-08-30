import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@fleet.com' },
      update: {},
      create: {
        email: 'john.doe@fleet.com',
        name: 'John Doe',
        role: 'DRIVER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@fleet.com' },
      update: {},
      create: {
        email: 'jane.smith@fleet.com',
        name: 'Jane Smith',
        role: 'FLEET_MANAGER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.wilson@fleet.com' },
      update: {},
      create: {
        email: 'mike.wilson@fleet.com',
        name: 'Mike Wilson',
        role: 'DRIVER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@fleet.com' },
      update: {},
      create: {
        email: 'sarah.johnson@fleet.com',
        name: 'Sarah Johnson',
        role: 'ADMIN',
      },
    }),
  ])

  console.log('✅ Created users')

  // Create Cars
  const cars = await Promise.all([
    prisma.car.upsert({
      where: { licensePlate: 'ABC123' },
      update: {},
      create: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'KL-07-AB-1234',
        vin: '1234567890ABCDEF1',
        color: 'White',
        status: 'ACTIVE',
      },
    }),
    prisma.car.upsert({
      where: { licensePlate: 'XYZ789' },
      update: {},
      create: {
        make: 'Honda',
        model: 'Amaze',
        year: 2021,
        licensePlate: 'KL-07-CD-5678',
        vin: '1234567890ABCDEF2',
        color: 'Blue',
        status: 'ACTIVE',
      },
    }),
    prisma.car.upsert({
      where: { licensePlate: 'DEF456' },
      update: {},
      create: {
        make: 'Ford',
        model: 'Ecosport',
        year: 2023,
        licensePlate: 'KL-07-EF-9012',
        vin: '1234567890ABCDEF3',
        color: 'Black',
        status: 'ACTIVE',
      },
    }),
    prisma.car.upsert({
      where: { licensePlate: 'GHI789' },
      update: {},
      create: {
        make: 'Tata',
        model: 'Nexon',
        year: 2020,
        licensePlate: 'KL-07-GH-3456',
        vin: '1234567890ABCDEF4',
        color: 'Red',
        status: 'ACTIVE',
      },
    }),
    prisma.car.upsert({
      where: { licensePlate: 'TESLA999' },
      update: {},
      create: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2024,
        licensePlate: 'KL-07-TS-9999',
        vin: '1234567890ABCDEF5',
        color: 'Red',
        status: 'ACTIVE',
      },
    }),
  ])

  console.log('✅ Created cars')

  // Create Sample Incidents
  const incidents = await Promise.all([
    prisma.incident.create({
      data: {
        carId: cars[0].id,
        reportedById: users[0].id,
        assignedToId: users[1].id,
        title: 'Traffic Accident at Marine Drive',
        description: 'Vehicle rear-ended while waiting at Kaloor Junction traffic signal during evening rush hour. Minor bumper damage.',
        severity: 'LOW',
        status: 'RESOLVED',
        type: 'ACCIDENT',
        location: 'Marine Drive Junction, Kaloor, Kochi, Kerala',
        latitude: 9.9312,
        longitude: 76.2673,
        occurredAt: new Date('2024-01-15T14:30:00Z'),
        estimatedCost: 1200.00,
        actualCost: 1150.00,
        resolutionNotes: 'Bumper replaced, vehicle returned to service.',
        resolvedAt: new Date('2024-01-18T10:00:00Z'),
      },
    }),
    prisma.incident.create({
      data: {
        carId: cars[1].id,
        reportedById: users[2].id,
        assignedToId: users[1].id,
        title: 'Engine Overheating on NH66',
        description: 'Engine temperature gauge showed red while driving from Kochi to Thrissur on NH66. Vehicle towed to nearest service center.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        type: 'BREAKDOWN',
        location: 'NH66 Highway near Chalakudy, Kerala',
        occurredAt: new Date('2024-01-20T16:45:00Z'),
        estimatedCost: 2500.00,
      },
    }),
    prisma.incident.create({
      data: {
        carId: cars[2].id,
        reportedById: users[0].id,
        title: 'Flat Tire at Lulu Mall',
        description: 'Front right tire punctured by nail in Lulu Mall parking area. Vehicle unable to move, spare tire fitted.',
        severity: 'MEDIUM',
        status: 'PENDING',
        type: 'BREAKDOWN',
        location: 'Lulu Mall Parking, Edappally, Kochi, Kerala',
        occurredAt: new Date('2024-01-22T09:15:00Z'),
        estimatedCost: 150.00,
      },
    }),
    prisma.incident.create({
      data: {
        carId: cars[3].id,
        reportedById: users[2].id,
        assignedToId: users[3].id,
        title: 'Windshield Crack from Stone',
        description: 'Large crack on windshield caused by stone from truck while driving through Vytilla. Affects driver visibility significantly.',
        severity: 'MEDIUM',
        status: 'RESOLVED',
        type: 'MAINTENANCE_ISSUE',
        location: 'Vytilla Mobility Hub Area, Kochi, Kerala',
        occurredAt: new Date('2024-01-18T08:00:00Z'),
        estimatedCost: 300.00,
        actualCost: 275.00,
        resolutionNotes: 'Windshield replaced by approved vendor.',
        resolvedAt: new Date('2024-01-19T15:30:00Z'),
      },
    }),
    prisma.incident.create({
      data: {
        carId: cars[0].id,
        reportedById: users[0].id,
        title: 'Door Scratch at Forum Mall',
        description: 'Deep scratch on passenger side door, likely from shopping trolley or adjacent vehicle door. Paint damage visible.',
        severity: 'LOW',
        status: 'PENDING',
        type: 'VANDALISM',
        location: 'Forum Mall Parking, Maradu, Kochi, Kerala',
        occurredAt: new Date('2024-01-23T12:30:00Z'),
        estimatedCost: 400.00,
      },
    }),
  ])

  console.log('✅ Created incidents')

  // Create some incident updates
  await Promise.all([
    prisma.incidentUpdate.create({
      data: {
        incidentId: incidents[1].id,
        userId: users[1].id,
        message: 'Assigned to mechanic shop for diagnosis. Waiting for availability.',
        updateType: 'COMMENT',
      },
    }),
    prisma.incidentUpdate.create({
      data: {
        incidentId: incidents[1].id,
        userId: users[1].id,
        message: 'Towed to repair facility. Initial diagnosis suggests water pump failure.',
        updateType: 'COMMENT',
      },
    }),
    prisma.incidentUpdate.create({
      data: {
        incidentId: incidents[2].id,
        userId: users[1].id,
        message: 'Driver has been provided with spare vehicle. Tire replacement scheduled.',
        updateType: 'COMMENT',
      },
    }),
  ])

  console.log('✅ Created incident updates')
  console.log('🌱 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
