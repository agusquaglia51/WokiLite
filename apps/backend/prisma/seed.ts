import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data = {
    restaurant: {
      id: 'R1',
      name: 'Bistro Central',
      timezone: 'America/Argentina/Buenos_Aires',
      shifts: [
        { start: '12:00', end: '16:00' },
        { start: '20:00', end: '23:45' },
      ],
      createdAt: new Date('2025-09-08T00:00:00-03:00'),
      updatedAt: new Date('2025-09-08T00:00:00-03:00'),
    },
    sectors: [
      { id: 'S1', restaurantId: 'R1', name: 'Main Hall' },
      { id: 'S2', restaurantId: 'R1', name: 'Terrace' },
    ],
    tables: [
      { id: 'T1', sectorId: 'S1', name: 'Table 1', minSize: 2, maxSize: 2 },
      { id: 'T2', sectorId: 'S1', name: 'Table 2', minSize: 2, maxSize: 4 },
      { id: 'T3', sectorId: 'S1', name: 'Table 3', minSize: 2, maxSize: 4 },
      { id: 'T4', sectorId: 'S1', name: 'Table 4', minSize: 4, maxSize: 6 },
      { id: 'T5', sectorId: 'S2', name: 'Table 5', minSize: 2, maxSize: 2 },
    ],
  };

  // 1️⃣ Crear el restaurante
  await prisma.restaurant.upsert({
    where: { id: data.restaurant.id },
    update: {},
    create: data.restaurant,
  });

  // 2️⃣ Crear los sectores
  for (const sector of data.sectors) {
    await prisma.sector.upsert({
      where: { id: sector.id },
      update: {},
      create: {
        ...sector,
        createdAt: new Date('2025-09-08T00:00:00-03:00'),
        updatedAt: new Date('2025-09-08T00:00:00-03:00'),
      },
    });
  }

  // 3️⃣ Crear las mesas
  for (const table of data.tables) {
    await prisma.table.upsert({
      where: { id: table.id },
      update: {},
      create: {
        ...table,
        createdAt: new Date('2025-09-08T00:00:00-03:00'),
        updatedAt: new Date('2025-09-08T00:00:00-03:00'),
      },
    });
  }

  console.log('✅ Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
