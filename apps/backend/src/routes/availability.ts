import express from "express";
import { RestaurantRepository } from "../repository/restaurantRepository.ts";
import { SectorRepository } from "../repository/sectorRepository.ts";
import { doIntervalsOverlap, generateTimeSlots } from "../utils/time.ts";
import { ReservationRepository } from "../repository/reservationRepository.ts";
import dayjs from "dayjs";
import { TableRepository } from "../repository/tableRepository.ts";
import types from "../types/types.ts";


type Table = typeof types.Table; 

const router = express.Router();

// GET /availability?restaurantId=R1&sectorId=S1&date=2025-09-08&partySize=4

router.get("/availability", async (req ,res) => {

  try{

    const { restaurantId, sectorId, date, partySize } = req.query as {
      restaurantId: string;
      sectorId: string;
      date: string;
      partySize: string;
    };

    if (!restaurantId || !sectorId || !date || !partySize) {
      return res.status(400).json({
        error: 'bad_request',
        detail: 'Missing required parameters: restaurantId, sectorId, date, partySize'
      });
    }

    const restaurant = await RestaurantRepository.findById(restaurantId);
    const sector = await SectorRepository.findById(sectorId);
    const party = parseInt(partySize);

    if (!restaurant) {
      return res.status(404).json({ error: 'not_found', detail: 'Restaurant not found' });
    }
    if (!sector) {
      return res.status(404).json({ error: 'not_found', detail: 'Sector not found' });
    }
    if (isNaN(party) || party < 1) {
      return res.status(400).json({ error: 'bad_request', detail: 'Invalid partySize' });
    }

    const shifts = restaurant.shifts || [{ start: "00:00", end: "23:59" }];

    const allTimeSlots = generateTimeSlots(date, restaurant.timezone, shifts)

    const reservations = await ReservationRepository.findBySector(restaurant.id,sector.id, date)

    const tables = await TableRepository.findManyBySector(sector.id);

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

    res.status(200).json({
      slotMinutes,
      durationMinutes,
      slots,
    });

  }catch(err){
    console.error(err);
    res.status(500).json({ error: "internal_error", detail: "Something went wrong" });
  }

}
);

export default router;