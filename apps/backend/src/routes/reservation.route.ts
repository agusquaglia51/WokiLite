import express from "express";
import { ReservationService } from "../services/reservation.service.ts";
import { reservationSchema } from "../schemas/reservationSchema.ts";

const router = express.Router();

router.post("/create", async (req, res, next) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      return res.status(400).json({ error: "Missing Idempotency-Key header" });
    }


    console.log("body",req.body);
    console.log("estoy entrando1");
    const body = reservationSchema.parse(req.body);


    const reservation = await ReservationService.createReservation(
      body,
      idempotencyKey
    );

    res.json(reservation);
  } catch (error) {
    next(error);
  }
});

export default router;