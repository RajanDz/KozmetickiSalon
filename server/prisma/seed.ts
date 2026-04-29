import { PrismaClient, Role, DayOfWeek } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salon.com' },
    update: {},
    create: {
      email: 'admin@salon.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'Salon',
      role: Role.ADMIN,
    },
  })

  // Zaposleni 1
  const emp1User = await prisma.user.upsert({
    where: { email: 'ana@salon.com' },
    update: {},
    create: {
      email: 'ana@salon.com',
      passwordHash: await bcrypt.hash('pass123', 10),
      firstName: 'Ana',
      lastName: 'Petrović',
      phone: '0641234567',
      role: Role.CLIENT,
    },
  })

  const employee1 = await prisma.employee.upsert({
    where: { userId: emp1User.id },
    update: {},
    create: {
      userId: emp1User.id,
      bio: 'Specijalist za frizure i bojenje kose.',
    },
  })

  // Radno vreme za zaposlenog 1 (pon–pet 09:00–17:00)
  const workdays: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ]

  for (const day of workdays) {
    await prisma.workingHours.upsert({
      where: { employeeId_dayOfWeek: { employeeId: employee1.id, dayOfWeek: day } },
      update: {},
      create: {
        employeeId: employee1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    })
  }

  // Usluge
  const usluge = [
    { name: 'Šišanje',          durationMin: 30,  price: 1200 },
    { name: 'Bojenje kose',     durationMin: 90,  price: 3500 },
    { name: 'Manikir',          durationMin: 45,  price: 1500 },
    { name: 'Tretman lica',     durationMin: 60,  price: 2500 },
    { name: 'Depilacija nogu',  durationMin: 60,  price: 2000 },
  ]

  for (const u of usluge) {
    const service = await prisma.service.upsert({
      where: { id: u.name }, // privremeno — u produkciji koristiti slug
      update: {},
      create: { ...u, price: u.price },
    })

    await prisma.employeeService.upsert({
      where: { employeeId_serviceId: { employeeId: employee1.id, serviceId: service.id } },
      update: {},
      create: { employeeId: employee1.id, serviceId: service.id },
    })
  }

  // Test klijent
  await prisma.user.upsert({
    where: { email: 'klijent@test.com' },
    update: {},
    create: {
      email: 'klijent@test.com',
      passwordHash: await bcrypt.hash('test123', 10),
      firstName: 'Marko',
      lastName: 'Nikolić',
      phone: '0651234567',
      role: Role.CLIENT,
    },
  })

  console.log('Seed uspešan.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
