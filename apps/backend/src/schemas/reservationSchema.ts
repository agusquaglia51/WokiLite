import { z } from "zod";

export const reservationSchema = z.object({
  restaurantId: z.string(),
  sectorId: z.string(),
  partySize: z.number().int().positive(),
  startDateTimeISO: z.string().datetime({ offset: true }),
  notes: z.string().optional(),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }),
});

export type CreateReservationDto = z.infer<typeof reservationSchema>;
