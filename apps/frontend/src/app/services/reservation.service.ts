import { Reservation, ReservationPayload, ReservationsByDay } from "../types";

export class ReservationService {
  static async createReservation(data: ReservationPayload): Promise<Reservation | null> {
    try{

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": crypto.randomUUID(),
            },
            body: JSON.stringify(data),
          }
        );
        return res.json();

    }catch(error){

      console.error("Error creating reservation:", error);
      throw error;

    }
  }

  static async getReservationsByDay(id:string, date:string, sectorId?:string): Promise<ReservationsByDay> {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/day?restaurantId=${id}&date=${date}${sectorId ? `&sectorId=${sectorId}` : ""
        }`
      );
      if (!res.ok) throw new Error("Error fetching reservations");
      return await res.json();
    } catch (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }
  }


  static async cancelReservation(id: string): Promise<void> {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Error deleting reservation");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      throw error;
    }
  }
}