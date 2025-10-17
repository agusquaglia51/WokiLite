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

router.put("/cancel/:id", async(req, res) => {
  try {
    const {id} = req.params
    console.log('ID',id);
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

export default router;