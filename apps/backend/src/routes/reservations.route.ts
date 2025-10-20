import express from "express";
import { ReservationService } from "../services/reservation.service.ts";
import { reservationSchema } from "../schemas/reservationSchema.ts";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      return res.status(400).json({ 
        error: "bad_request",
        detail: "Missing Idempotency-Key header" 
      });
    }

    const body = reservationSchema.parse(req.body);

    const reservation = await ReservationService.createReservation(
      body,
      idempotencyKey
    );

    if(!reservation){
      return res.status(500).json({message:"Internal server error"})
    }

    res.status(201).json({
      id: reservation.id,
      restaurantId: reservation.restaurantId,
      sectorId: reservation.sectorId,
      tableIds: reservation.tableIds,
      partySize: reservation.partySize,
      start: reservation.startDateTimeISO,
      end: reservation.endDateTimeISO,
      status: reservation.status,
      customer: {
        name: reservation.customerName,
        phone: reservation.customerPhone,
        email: reservation.customerEmail,
      },
      notes: reservation.notes || undefined,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    });
  } catch (error: any) {
    if (error.message.includes("No hay mesas disponibles")) {
      return res.status(409).json({
        error: "no_capacity",
        detail: error.message,
      });
    }
    if (error.message.includes("fuera del horario")) {
      return res.status(422).json({
        error: "outside_service_window",
        detail: error.message,
      });
    }
    next(error);
  }
});

router.put("/:id", async(req, res) => {
  try {
    const {id} = req.params
    const reservation = await ReservationService.cancelReservation(id)
    if(!reservation){
      return res.status(404).json({message:"No se encontro la reservacion que desea cancelar"})
    }
    return res.status(200).json(reservation);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"Internal server error"})
  }
});

router.get("/day", async (req, res) => {
  try {
    const { restaurantId, date, sectorId } = req.query as {
      restaurantId: string;
      date: string;
      sectorId?: string;
    };

    if (!restaurantId || !date) {
      return res.status(400).json({
        error: "bad_request",
        detail: "Missing required parameters: restaurantId, date",
      });
    }

    const reservations = await ReservationService.getReservationsByDay(
      restaurantId,
      date,
      sectorId
    );

    res.status(200).json({
      date,
      items: reservations.map((r) => ({
        id: r.id,
        sectorId: r.sectorId,
        tableIds: r.tableIds,
        partySize: r.partySize,
        start: r.startDateTimeISO,
        end: r.endDateTimeISO,
        status: r.status,
        customer: {
          name: r.customer!.name,
          phone: r.customer!.phone,
          email: r.customer!.email,
        },
        notes: r.notes,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_error",
      detail: "Something went wrong",
    });
  }
});


export default router;