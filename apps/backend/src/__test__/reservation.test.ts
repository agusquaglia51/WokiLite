import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import { ReservationService } from '../services/reservation.service.js';
import { CreateReservationDto } from '../schemas/reservationSchema.js';

dotenv.config();

const prisma = new PrismaClient();

describe('WokiLite Reservation System - Core Tests', () => {
  beforeAll(async () => {
    await prisma.restaurant.upsert({
      where: { id: 'TEST_R1' },
      update: {},
      create: {
        id: 'TEST_R1',
        name: 'Test Restaurant',
        timezone: 'America/Argentina/Buenos_Aires',
        shifts: [
          { start: '12:00', end: '16:00' },
          { start: '20:00', end: '23:45' },
        ],
      },
    });

    await prisma.sector.upsert({
      where: { id: 'TEST_S1' },
      update: {},
      create: {
        id: 'TEST_S1',
        restaurantId: 'TEST_R1',
        name: 'Test Sector',
      },
    });

    await prisma.table.upsert({
      where: { id: 'TEST_T1' },
      update: {},
      create: {
        id: 'TEST_T1',
        sectorId: 'TEST_S1',
        name: 'Test Table 1',
        minSize: 2,
        maxSize: 4,
      },
    });
  });

  beforeEach(async () => {
    await prisma.reservation.deleteMany({
      where: { restaurantId: 'TEST_R1' },
    });
    await prisma.idempotencyKey.deleteMany({});
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({
      where: { restaurantId: 'TEST_R1' },
    });
    await prisma.idempotencyKey.deleteMany({});
    await prisma.table.deleteMany({ where: { id: 'TEST_T1' } });
    await prisma.sector.deleteMany({ where: { id: 'TEST_S1' } });
    await prisma.restaurant.deleteMany({ where: { id: 'TEST_R1' } });
    await prisma.$disconnect();
  });

  it('should handle concurrent reservations correctly - one succeeds, other fails', async () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const startTime = `${tomorrow}T20:00:00-03:00`;

    const reservationData: CreateReservationDto = {
      restaurantId: 'TEST_R1',
      sectorId: 'TEST_S1',
      partySize: 4,
      startDateTimeISO: startTime,
      customer: {
        name: 'Concurrent Test User',
        phone: '+54 9 11 1234-5678',
        email: 'concurrent@test.com',
      },
      notes: 'Concurrency test',
    };

    const results = await Promise.allSettled([
      ReservationService.createReservation(reservationData, 'concurrent-key-1'),
      ReservationService.createReservation(reservationData, 'concurrent-key-2'),
    ]);

    const successResults = results.filter((r) => r.status === 'fulfilled');
    const failedResults = results.filter((r) => r.status === 'rejected');

    expect(successResults).toHaveLength(1);
    expect(failedResults).toHaveLength(1);

    const successReservation = (successResults[0] as PromiseFulfilledResult<any>).value;
    expect(successReservation).toHaveProperty('id');
    expect(successReservation).toHaveProperty('tableIds');
    expect(successReservation.tableIds).toContain('TEST_T1');
    expect(successReservation.status).toBe('CONFIRMED');

    const failedReason = (failedResults[0] as PromiseRejectedResult).reason;
    expect(failedReason.message).toMatch(/No hay mesas disponibles/i);

    const reservationsInDb = await prisma.reservation.count({
      where: {
        restaurantId: 'TEST_R1',
        sectorId: 'TEST_S1',
        startDateTimeISO: new Date(startTime),
        status: 'CONFIRMED',
      },
    });
    expect(reservationsInDb).toBe(1);
  }, 30000);

  it('should handle idempotency correctly - same key returns same reservation', async () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const startTime = `${tomorrow}T20:30:00-03:00`;

    const reservationData: CreateReservationDto = {
      restaurantId: 'TEST_R1',
      sectorId: 'TEST_S1',
      partySize: 2,
      startDateTimeISO: startTime,
      customer: {
        name: 'Idempotency Test User',
        phone: '+54 9 11 8765-4321',
        email: 'idempotency@test.com',
      },
      notes: 'Idempotency test',
    };

    const idempotencyKey = 'idempotency-test-key-123';

    const reservation1 = await ReservationService.createReservation(
      reservationData,
      idempotencyKey
    );
    expect(reservation1).toBeDefined();
    expect(reservation1.id).toBeDefined();

    const reservation2 = await ReservationService.createReservation(
      reservationData,
      idempotencyKey
    );
    expect(reservation2).toBeDefined();

    expect(reservation1.id).toBe(reservation2.id);
    expect(reservation1.tableIds).toEqual(reservation2.tableIds);
    expect(reservation1.customerEmail).toBe(reservation2.customerEmail);

    const createdAt1 = new Date(reservation1.createdAt).getTime();
    const createdAt2 = new Date(reservation2.createdAt).getTime();
    const updatedAt1 = new Date(reservation1.updatedAt).getTime();
    const updatedAt2 = new Date(reservation2.updatedAt).getTime();
    
    expect(createdAt1).toBe(createdAt2);
    expect(updatedAt1).toBe(updatedAt2);

    const reservationsInDb = await prisma.reservation.count({
      where: {
        restaurantId: 'TEST_R1',
        startDateTimeISO: new Date(startTime),
        status: 'CONFIRMED',
      },
    });
    expect(reservationsInDb).toBe(1);

    const idempotencyKeys = await prisma.idempotencyKey.count({
      where: { key: idempotencyKey },
    });
    expect(idempotencyKeys).toBe(1);
  }, 30000);

  it('should allow adjacent reservations (end-exclusive boundary)', async () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const firstStartTime = `${tomorrow}T20:00:00-03:00`;
    const firstReservationData: CreateReservationDto = {
      restaurantId: 'TEST_R1',
      sectorId: 'TEST_S1',
      partySize: 3,
      startDateTimeISO: firstStartTime,
      customer: {
        name: 'First Customer',
        phone: '+54 9 11 1111-1111',
        email: 'first@test.com',
      },
    };

    const secondStartTime = `${tomorrow}T21:30:00-03:00`;
    const secondReservationData: CreateReservationDto = {
      restaurantId: 'TEST_R1',
      sectorId: 'TEST_S1',
      partySize: 2,
      startDateTimeISO: secondStartTime,
      customer: {
        name: 'Second Customer',
        phone: '+54 9 11 2222-2222',
        email: 'second@test.com',
      },
    };

    const reservation1 = await ReservationService.createReservation(
      firstReservationData,
      'boundary-test-key-1'
    );
    expect(reservation1).toBeDefined();
    expect(reservation1.status).toBe('CONFIRMED');
    
    const start1 = new Date(reservation1.startDateTimeISO);
    const end1 = new Date(reservation1.endDateTimeISO);
    const duration1Minutes = (end1.getTime() - start1.getTime()) / (1000 * 60);
    expect(duration1Minutes).toBe(90);

    const reservation2 = await ReservationService.createReservation(
      secondReservationData,
      'boundary-test-key-2'
    );
    expect(reservation2).toBeDefined();
    expect(reservation2.status).toBe('CONFIRMED');

    expect(reservation1.tableIds).toEqual(['TEST_T1']);
    expect(reservation2.tableIds).toEqual(['TEST_T1']);

    const reservationsInDb = await prisma.reservation.findMany({
      where: {
        restaurantId: 'TEST_R1',
        sectorId: 'TEST_S1',
        status: 'CONFIRMED',
      },
      orderBy: { startDateTimeISO: 'asc' },
    });

    expect(reservationsInDb).toHaveLength(2);
    expect(reservationsInDb[0]?.id).toBe(reservation1.id);
    expect(reservationsInDb[1]?.id).toBe(reservation2.id);

    const firstEnd = new Date(reservationsInDb[0]!.endDateTimeISO);
    const secondStart = new Date(reservationsInDb[1]!.startDateTimeISO);
    
    const timeDiff = Math.abs(firstEnd.getTime() - secondStart.getTime());
    expect(timeDiff).toBeLessThanOrEqual(1000);

    const noOverlap = firstEnd <= secondStart;
    expect(noOverlap).toBe(true);
  }, 30000);
});
