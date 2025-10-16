import { prisma } from "../db/prismaClient.ts";
import dayjs from "dayjs";
import types from "../types/types.ts";

type Reservation = typeof types.Reservation;
type ReservationDto = typeof types.ReservationDto;

export class ReservationRepository {

  static async findById(id: string): Promise<Reservation | null> {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return null;

    return {
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      status: reservation.status as Reservation["status"], 
      startDateTimeISO: reservation.startDateTimeISO.toISOString(),
      endDateTimeISO: reservation.endDateTimeISO.toISOString(),
      notes: reservation.notes ?? undefined,
    };
  }

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

  

  static async createReservation(data: ReservationDto){
    const endDateTimeISO = dayjs(data.startDateTimeISO).add(90,"minute").toISOString();

    const reservation = await prisma.reservation.create({
      data: {
        id: data.id,
        restaurantId: data.restaurantId,
        sectorId: data.sectorId,
        tableIds: data.tableIds, 
        partySize: data.partySize,
        startDateTimeISO: new Date(data.startDateTimeISO),
        endDateTimeISO,
        status: "CONFIRMED",
        customerName: data.customer.name,
        customerEmail: data.customer.email,
        customerPhone: data.customer.phone,
        notes: data.notes ?? null,
      }
    })

    return reservation;
  }
}
