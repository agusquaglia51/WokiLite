import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const data = [
    {
      restaurant: {
        id: 'R2',
        name: 'La Parrilla del Puerto',
        timezone: 'America/Argentina/Buenos_Aires',
        shifts: [
          { start: '11:30', end: '15:30' },
          { start: '19:30', end: '00:00' },
        ],
        createdAt: new Date('2025-09-08T00:00:00-03:00'),
        updatedAt: new Date('2025-09-08T00:00:00-03:00'),
      },
      sectors: [
        { id: 'S3', restaurantId: 'R2', name: 'Indoor Hall' },
        { id: 'S4', restaurantId: 'R2', name: 'Patio Grill' },
      ],
      tables: [
        { id: 'T6', sectorId: 'S3', name: 'Table 1', minSize: 2, maxSize: 2 },
        { id: 'T7', sectorId: 'S3', name: 'Table 2', minSize: 4, maxSize: 6 },
        { id: 'T8', sectorId: 'S4', name: 'Table 3', minSize: 2, maxSize: 4 },
        { id: 'T9', sectorId: 'S4', name: 'Table 4', minSize: 6, maxSize: 8 },
      ],
    },
    {
      restaurant: {
        id: 'R3',
        name: 'Café del Lago',
        timezone: 'America/Santiago',
        shifts: [
          { start: '08:00', end: '12:00' },
          { start: '16:00', end: '21:00' },
        ],
        createdAt: new Date('2025-09-08T00:00:00-03:00'),
        updatedAt: new Date('2025-09-08T00:00:00-03:00'),
      },
      sectors: [
        { id: 'S5', restaurantId: 'R3', name: 'Lake View' },
        { id: 'S6', restaurantId: 'R3', name: 'Coffee Bar' },
      ],
      tables: [
        { id: 'T10', sectorId: 'S5', name: 'Table 1', minSize: 2, maxSize: 2 },
        { id: 'T11', sectorId: 'S5', name: 'Table 2', minSize: 2, maxSize: 4 },
        { id: 'T12', sectorId: 'S6', name: 'Bar Table 1', minSize: 1, maxSize: 2 },
        { id: 'T13', sectorId: 'S6', name: 'Bar Table 2', minSize: 1, maxSize: 2 },
      ],
    },
    {
      restaurant: {
        id: 'R4',
        name: 'Pasta & Vino',
        timezone: 'Europe/Rome',
        shifts: [
          { start: '12:00', end: '15:00' },
          { start: '19:00', end: '23:30' },
        ],
        createdAt: new Date('2025-09-08T00:00:00-03:00'),
        updatedAt: new Date('2025-09-08T00:00:00-03:00'),
      },
      sectors: [
        { id: 'S7', restaurantId: 'R4', name: 'Salón Principal' },
        { id: 'S8', restaurantId: 'R4', name: 'Terraza Mediterránea' },
      ],
      tables: [
        { id: 'T14', sectorId: 'S7', name: 'Mesa 1', minSize: 2, maxSize: 2 },
        { id: 'T15', sectorId: 'S7', name: 'Mesa 2', minSize: 4, maxSize: 6 },
        { id: 'T16', sectorId: 'S8', name: 'Mesa 3', minSize: 2, maxSize: 4 },
        { id: 'T17', sectorId: 'S8', name: 'Mesa 4', minSize: 6, maxSize: 8 },
      ],
    },
  ];

  
  for (const item of data) {
  
    await prisma.restaurant.upsert({
      where: { id: item.restaurant.id },
      update: {},
      create: item.restaurant,
    });

    
    for (const sector of item.sectors) {
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

    
    for (const table of item.tables) {
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

    console.log(`✅ Seed inserted for restaurant ${item.restaurant.name}`);
  }

  console.log('🌱 All seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
