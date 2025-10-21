import express from "express";
import { doIntervalsOverlap, generateTimeSlots } from "../utils/time.ts";
import dayjs from "dayjs";
import { RestaurantService } from "../services/restaurant.service.ts";
import { SectorService } from "../services/sector.service.ts";
import { Table } from "../types/types.ts";
import { ReservationService } from "../services/reservation.service.ts";
import { TableService } from "../services/table.service.ts";


const router = express.Router();

// GET /availability?restaurantId=R1&sectorId=S1&date=2025-09-08&partySize=4

router.get("/", async (req ,res) => {
  const startTime = Date.now();
  try{

    const { restaurantId, sectorId, date, partySize } = req.query as {
      restaurantId: string;
      sectorId: string;
      date: string;
      partySize: string;
    };

    req.log.info({
      restaurantId,
      sectorId,
      date,
      partySize,
      operation: 'check_availability'
    }, 'Checking availability');

    if (!restaurantId || !sectorId || !date || !partySize) {
      req.log.warn({
        restaurantId,
        sectorId,
        date,
        partySize,
        operation: 'check_availability',
        outcome: 'bad_request'
      }, 'Missing required parameters');

      return res.status(400).json({
        error: 'bad_request',
        detail: 'Missing required parameters: restaurantId, sectorId, date, partySize'
      });
    }
    const restaurant = await RestaurantService.getRestaurant(restaurantId);

    const sector = await SectorService.getById(sectorId);

    const party = parseInt(partySize);

    if (!restaurant) {
      req.log.warn({
        restaurantId,
        operation: 'check_availability',
        outcome: 'restaurant_not_found'
      }, 'Restaurant not found');

      return res.status(404).json({ 
        error: 'not_found', 
        detail: 'Restaurant not found' 
      });
    }

    if (!sector) {
      req.log.warn({
        sectorId,
        operation: 'check_availability',
        outcome: 'sector_not_found'
      }, 'Sector not found');

      return res.status(404).json({ 
        error: 'not_found', 
        detail: 'Sector not found' 
      });
    }

    if (isNaN(party) || party < 1) {
      req.log.warn({
        partySize,
        operation: 'check_availability',
        outcome: 'invalid_party_size'
      }, 'Invalid party size');

      return res.status(400).json({ 
        error: 'bad_request', 
        detail: 'Invalid partySize' 
      });
    }

    const shifts = restaurant.shifts || [{ start: "00:00", end: "23:59" }];

    const allTimeSlots = generateTimeSlots(date, restaurant.timezone, shifts)

    const reservations = await ReservationService.getReservationsBySectorAndDate(restaurant.id,sector.id, date);

    const tables = await TableService.getTablesBySector(sector.id);

    const slotMinutes = 15;
    const durationMinutes = 90;

    
    const slots = await Promise.all(
      allTimeSlots.map(async (slotStart) => {
        const slotEnd = dayjs(slotStart).add(durationMinutes, "minute").toDate();

        const reservedTableIds = reservations
          .filter((r) =>
            doIntervalsOverlap(
              slotStart,
              slotEnd,
              new Date(r.startDateTimeISO),
              new Date(r.endDateTimeISO)
            )
          )
          .flatMap((r) => r.tableIds);

        const availableTables = tables.filter(
          (t) => !reservedTableIds.includes(t.id)
        );

        if (availableTables.length === 0) {
          return {
            start: dayjs(slotStart).format("YYYY-MM-DDTHH:mm:ssZ"),
            available: false,
            reason: "no_capacity",
          };
        }

        return {
          start: dayjs(slotStart).format("YYYY-MM-DDTHH:mm:ssZ"),
          available: true,
          tables: availableTables.map((t: Table) => t.name),
        };
      })
    );  

    const durationMs = Date.now() - startTime;
    const availableSlots = slots.filter(s => s.available).length;
    const totalSlots = slots.length;

    req.log.info({
      restaurantId,
      sectorId,
      date,
      partySize: party,
      totalSlots,
      availableSlots,
      durationMs,
      operation: 'check_availability',
      outcome: 'success'
    }, 'Availability checked successfully');

    res.status(200).json({
      slotMinutes,
      durationMinutes,
      slots,
    });

  }catch(err){
    res.status(500).json({ error: "internal_error", detail: "Something went wrong" });
  }

}
);

export default router;