import dayjs from "dayjs";
import { CreateReservationDto } from "../schemas/reservationSchema.ts";
import {prisma} from "../db/prismaClient.ts";
import { TableRepository } from "../repositories/table.repository.ts";
import { ReservationRepository } from "../repositories/reservation.repository.ts";
import {  Reservation, ReservationDto, Table } from "../types/types.ts";
import { getOccupiedTables, findAvailableTables } from "../utils/availability.ts";
import { RestaurantRepository } from "../repositories/restaurant.repository.ts";
import { isWithinShifts } from "../utils/time.ts";

export class ReservationService {

  static async getReservationsBySectorAndDate(
    restaurantId: string,
    sectorId: string,
    date: string
  ): Promise<ReservationDto[]> {
    const reservations = await ReservationRepository.findBySector(
      restaurantId,
      sectorId,
      date
    );

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
      },
      notes: r.notes ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }



  static async createReservation(data: CreateReservationDto, idempotencyKey: string): Promise<any | null> {

    const {customer, ...rest} = data;

    const existingKey = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
     
      const existingReservation = await prisma.reservation.findUnique({
        where: { id: existingKey.reservationId },
      });

      if (existingReservation) {
        
        return existingReservation;
      }
    }

    
    const restaurant = await RestaurantRepository.findById(data.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const startDateTime = new Date(data.startDateTimeISO);
    if (!isWithinShifts(startDateTime, restaurant.shifts as any)) {
      throw new Error("Reserva fuera del horario de servicio");
    }


    const tables = (await TableRepository.findManyBySector(data.sectorId)).map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    if (tables.length === 0) {
      throw new Error("No hay mesas disponibles en este sector");
    }

    const reservations = (await ReservationRepository.findBySector(
      data.restaurantId,
      data.sectorId, 
      data.startDateTimeISO
    )).map((r) => ({
      ...r,
      notes: r.notes ?? undefined,
      status: r.status as Reservation["status"],
      startDateTimeISO: r.startDateTimeISO.toISOString(),
      endDateTimeISO: r.endDateTimeISO.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    if(!reservations && !tables){
      return null;
    }

    const endDateTimeISO = dayjs(data.startDateTimeISO)
      .add(90, "minute")
      .toISOString();

    const occupiedTables = getOccupiedTables(
      reservations,
      data.startDateTimeISO,
      endDateTimeISO
    );

    const availableTableIds = findAvailableTables(
      tables,
      occupiedTables,
      data.partySize
    );

    if (availableTableIds.length === 0) {
      throw new Error(
        `No hay mesas disponibles para ${data.partySize} personas en el horario solicitado`
      );
    }
    
    const reservationData = {
      ...rest,
      tableIds: [availableTableIds[0]!],
      endDateTimeISO,
      status: "CONFIRMED",
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
    };

    
    return await prisma.$transaction(async (tx) => {

      const doubleCheckKey = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (doubleCheckKey) {
        const existingReservation = await tx.reservation.findUnique({
          where: { id: doubleCheckKey.reservationId },
        });
        return existingReservation;
      }
      
    
      const reservation = await tx.reservation.create({
        data: reservationData,
      });
      
      
      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          reservationId: reservation.id,
        },
      });

      return reservation;
    });
  }

  static async cancelReservation(id: string){
    const reservation = await ReservationRepository.cancelReservation(id);

    if (!reservation) {
      return null;
    }

    return {
      id: reservation.id,
      restaurantId: reservation.restaurantId,
      sectorId: reservation.sectorId,
      tableIds: reservation.tableIds,
      partySize: reservation.partySize,
      startDateTimeISO: reservation.startDateTimeISO.toISOString(),
      endDateTimeISO: reservation.endDateTimeISO.toISOString(),
      status: reservation.status as Reservation["status"],
      customer: {
        name: reservation.customerName,
        email: reservation.customerEmail,
        phone: reservation.customerPhone,
      },
      notes: reservation.notes ?? undefined,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };
  }

  static async getReservationsByDay(restaurantId: string, date: string, sectorId?: string): Promise<ReservationDto[]>{
    const reservations = await ReservationRepository.findByDay(restaurantId, sectorId, date);

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
      },
      notes: r.notes ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}