import { Reservation } from "@prisma/client";
import { prisma } from "../db/prismaClient.ts";
import dayjs from "dayjs";


export class ReservationRepository {

  static async findById(id: string): Promise<Reservation | null> {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return null;

    return reservation;
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

    return reservations;
  }

  

  static async createReservation(data: Reservation): Promise<Reservation> {
    const endDateTimeISO = dayjs(data.startDateTimeISO).add(90,"minute").toISOString();

    const reservation = await prisma.reservation.create({
      data: {
        id: data.id,
        restaurantId: data.restaurantId,
        sectorId: data.sectorId,
        tableIds: data.tableIds, 
        partySize: data.partySize,
        startDateTimeISO: new Date(data.startDateTimeISO),
        endDateTimeISO: new Date(endDateTimeISO),
        status: "CONFIRMED",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail, 
        notes: data.notes ?? null,
      }
    })

    return reservation;
  }

  static async cancelReservation(id: string): Promise<Reservation | null> {
    try {
      const reservation = await prisma.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return reservation;
    } catch (error) {
      throw error; 
    }
  }

  static async findByDay(
  restaurantId: string,
  sectorId: string | undefined,
  date: string
  ): Promise<Reservation[]> {
    const startOfDay = dayjs(date).startOf("day").toDate();
    const endOfDay = dayjs(date).endOf("day").toDate();

    const whereClause: any = {
      restaurantId,
      startDateTimeISO: {
        gte: startOfDay,
        lt: endOfDay,
      },
    };

    if (sectorId) {
      whereClause.sectorId = sectorId;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: { startDateTimeISO: "asc" },
    });


    return reservations;
  }

}
