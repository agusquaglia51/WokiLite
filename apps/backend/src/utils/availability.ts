import dayjs from "dayjs";
import { Reservation, Table } from "../types/types.js";

  export const findAvailableTables = (
    allTables: Table[],
    occupiedTableIds: Set<string>,
    partySize: number
  ): string[] => {
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

  export const getOccupiedTables = (
    reservations: Reservation[],
    startTime: string,
    endTime: string
  ): Set<string> =>{
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