import { prisma } from "../db/prismaClient.ts";
import dayjs from "dayjs";
import types from "../types/types.ts";

type Reservation = typeof types.Reservation;

export class ReservationRepository {
  static async findBySector(
    restaurantId: string,
    sectorId: string,
    date: string
  ): Promise<Reservation[]> {
    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        sectorId,
        startDateTimeISO: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    return reservations.map((r) => ({
      id: r.id,
      restaurantId: r.restaurantId,
      sectorId: r.sectorId,
      tableIds: r.tableIds,
      partySize: r.partySize,
      startDateTimeISO: r.startDateTimeISO.toISOString(),
      endDateTimeISO: r.endDateTimeISO.toISOString(),
      status: r.status as Reservation["status"], 
      customer: {
        name: r.customerName,
        email: r.customerEmail,
        phone: r.customerPhone,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      },
      notes: r.notes ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
