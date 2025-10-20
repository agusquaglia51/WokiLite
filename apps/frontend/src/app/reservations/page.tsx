"use client";

import { useEffect, useState } from "react";
import { ReservationService } from "../services/reservation.service";
import {
  Reservation,
  ReservationItem,
  ReservationsByDay,
  Restaurant,
} from "../types";
import { RestaurantService } from "../services/restaurant.service";

export default function ReservationsPage() {
  const [date, setDate] = useState<string>("");
  const [sectorId, setSectorId] = useState<string>("");
  const [reservations, setReservations] = useState<ReservationsByDay>({
    date: "",
    items: [],
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      const data = await RestaurantService.fetchRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Error al cargar los restaurantes");
    }
  };

  const fetchReservations = async () => {
    if (!date || !selectedRestaurant) return;
    setLoading(true);
    setError(null);

    try {
      const data = await ReservationService.getReservationsByDay(
        selectedRestaurant,
        date,
        sectorId || undefined
      );
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    await ReservationService.cancelReservation(id);
    fetchReservations();
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (date && selectedRestaurant) fetchReservations();
  }, [selectedRestaurant, date, sectorId]);

  return (
    <section className="max-w-5xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        📅 Reservas por día
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 min-w-[200px]"
        >
          <option
            value=""
            className="border border-gray-300 rounded-lg p-2 min-w-[200px] bg-black"
          >
            Seleccionar restaurante
          </option>
          {restaurants.map((r) => (
            <option
              key={r.id}
              value={r.id}
              className="border border-gray-300 rounded-lg p-2 min-w-[200px] bg-black"
            >
              {r.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border border-gray-300 rounded-lg p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Sector ID (opcional)"
          className="border border-gray-300 rounded-lg p-2"
          value={sectorId}
          onChange={(e) => setSectorId(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {!loading && reservations.items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Cliente</th>
                <th className="p-2 text-left">Sector</th>
                <th className="p-2 text-left">Mesas</th>
                <th className="p-2 text-left">Personas</th>
                <th className="p-2 text-left">Inicio</th>
                <th className="p-2 text-left">Fin</th>
                <th className="p-2 text-left">Estado</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.items.map((r: ReservationItem) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.customer?.name}</td>
                  <td className="p-2">{r.sectorId}</td>
                  <td className="p-2">{r.tableIds.join(", ")}</td>
                  <td className="p-2">{r.partySize}</td>
                  <td className="p-2">
                    {new Date(r.start).toLocaleTimeString()}
                  </td>
                  <td className="p-2">
                    {new Date(r.end).toLocaleTimeString()}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        r.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : r.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`px-2 py-1 rounded text-sm bg-red-100 text-red-700 cursor-pointer`}
                      onClick={() => handleCancelReservation(r.id)}
                    >
                      Eliminar reservar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading &&
        date &&
        selectedRestaurant &&
        reservations.items.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No hay reservas para este día.
          </p>
        )}
    </section>
  );
}
