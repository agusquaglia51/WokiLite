import dayjs from "dayjs";
import { CreateReservationDto } from "../schemas/reservationSchema.ts";
import {prisma} from "../db/prismaClient.ts";
import { TableRepository } from "../repositories/table.repository.ts";
import { ReservationRepository } from "../repositories/reservation.repository.ts";
import {  Reservation, Table } from "../types/types.ts";

export class ReservationService {

  private static findAvailableTables(
    allTables: Table[],
    occupiedTableIds: Set<string>,
    partySize: number
  ): string[] {
    const availableTables = allTables.filter(
      (table) =>
        !occupiedTableIds.has(table.id) &&
        table.minSize <= partySize &&
        table.maxSize >= partySize
    );

    if (availableTables.length === 0) {
      return []
    }
    
    availableTables.sort((a, b) => a.maxSize - b.maxSize);

    return availableTables.map(at => at.id);
  }

  private static getOccupiedTables(
    reservations: Reservation[],
    startTime: string,
    endTime: string
  ): Set<string> {
    const occupiedIds = new Set<string>();
    const newStart = dayjs(startTime);
    const newEnd = dayjs(endTime);

    for (const reservation of reservations) {
      if (reservation.status === "CANCELLED") {
        continue;
      }

      const resStart = dayjs(reservation.startDateTimeISO);
      const resEnd = dayjs(reservation.endDateTimeISO);

      const hasOverlap =
        newStart.isBefore(resEnd) && newEnd.isAfter(resStart);

      if (hasOverlap) {
        reservation.tableIds.forEach((id) => occupiedIds.add(id));
      }
    }

    return occupiedIds;
  }

  static async createReservation(data: CreateReservationDto,idempotencyKey: string) {

    const {customer, ...rest} = data;

    const tables = await TableRepository.findManyBySector(data.sectorId);

    if (tables.length === 0) {
      throw new Error("No hay mesas disponibles en este sector");
    }

    const reservations = await ReservationRepository.findBySector(data.restaurantId,data.sectorId, data.startDateTimeISO);


    const endDateTimeISO = dayjs(data.startDateTimeISO)
      .add(90, "minute")
      .toISOString();

    const occupiedTables = this.getOccupiedTables(
      reservations,
      data.startDateTimeISO,
      endDateTimeISO
    );

     const availableTableIds = this.findAvailableTables(
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

    console.log("estoy entrando2");

    return await prisma.$transaction(async (tx) => {
     
      const existingKey = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existingKey) {
        const existingReservation = await tx.reservation.findUnique({
          where: { id: existingKey.reservationId },
        });

        return existingReservation;
      }
      
      const reservation = await tx.reservation.create({
        data:reservationData ,
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
    return reservation;
  }
}