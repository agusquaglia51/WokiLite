import express from "express";
import { ReservationService } from "../services/reservation.service.js";
import { reservationSchema } from "../schemas/reservationSchema.js";
import { logger } from "../logger.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const startTime = Date.now();
  try {
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      logger.warn({
        operation: 'create_reservation',
        outcome: 'missing_idempotency_key'
      }, 'Missing idempotency key');

      return res.status(400).json({ 
        error: "bad_request",
        detail: "Missing Idempotency-Key header" 
      });
    }

    const body = reservationSchema.parse(req.body);

    logger.info({
      restaurantId: body.restaurantId,
      sectorId: body.sectorId,
      partySize: body.partySize,
      startDateTimeISO: body.startDateTimeISO,
      idempotencyKey,
      operation: 'create_reservation'
    }, 'Attempting to create reservation');

    const reservation = await ReservationService.createReservation(
      body,
      idempotencyKey
    );

    if (!reservation) {
      logger.error({
        idempotencyKey,
        operation: 'create_reservation',
        outcome: 'null_reservation'
      }, 'Reservation service returned null');

      return res.status(500).json({ message: "Internal server error" });
    }

    const durationMs = Date.now() - startTime;

    logger.info({
      reservationId: reservation.id,
      restaurantId: reservation.restaurantId,
      sectorId: reservation.sectorId,
      tableIds: reservation.tableIds,
      partySize: reservation.partySize,
      durationMs,
      operation: 'create_reservation',
      outcome: 'success'
    }, 'Reservation created successfully');

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

    const durationMs = Date.now() - startTime;
    if (error.message.includes("No hay mesas disponibles")) {
      logger.warn({
        error: error.message,
        durationMs,
        operation: 'create_reservation',
        outcome: 'no_capacity'
      }, 'No capacity available');
      
      return res.status(409).json({
        error: "no_capacity",
        detail: error.message,
      });
    }
    if (error.message.includes("fuera del horario")) {
      logger.warn({
        error: error.message,
        durationMs,
        operation: 'create_reservation',
        outcome: 'outside_service_window'
      }, 'Outside service window');
      
      return res.status(422).json({
        error: "outside_service_window",
        detail: error.message,
      });
    }

    logger.error({
      error: error.message,
      stack: error.stack,
      durationMs,
      operation: 'create_reservation',
      outcome: 'error'
    }, 'Error creating reservation');

    next(error);
  }
});

router.delete("/:id", async(req, res) => {
  const startTime = Date.now();
  try {
    const {id} = req.params

    logger.info({ reservationId: id }, 'Attempting to cancel reservation');

    const reservation = await ReservationService.cancelReservation(id)
    if(!reservation){
      return res.status(404).json({message:"No se encontro la reservacion que desea cancelar"})
    }

    const durationMs = Date.now() - startTime;

    logger.info({
      reservationId: id,
      restaurantId: reservation.restaurantId,
      sectorId: reservation.sectorId,
      tableIds: reservation.tableIds,
      partySize: reservation.partySize,
      startDateTimeISO: reservation.startDateTimeISO,
      customerName: reservation.customer.name,
      durationMs,
      operation: 'cancel_reservation',
      outcome: 'success'
    }, 'Reservation cancelled successfully');

    return res.status(204).send();
  }catch(err){
    const durationMs = Date.now() - startTime;
    
    logger.error({
      reservationId: req.params.id,
      error: err instanceof Error ? err.message : 'Unknown error',
      durationMs,
      operation: 'cancel_reservation',
      outcome: 'error'
    }, 'Error cancelling reservation');

    res.status(500).json({ 
      error: "internal_error",
      detail: "Error cancelling reservation" 
    });
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
    res.status(500).json({
      error: "internal_error",
      detail: "Something went wrong",
    });
  }
});


export default router;