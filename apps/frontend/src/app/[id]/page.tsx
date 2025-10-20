"use client";

import React, { useEffect, useState } from "react";
import { Restaurant, Sector, Table } from "../types";
import { RestaurantService } from "../services/restaurant.service";
import { useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import { getImageUrl } from "../utils";
// @ts-ignore: Ignore missing type declarations for css side-effect import
import "react-datepicker/dist/react-datepicker.css";
import { ReservationService } from "../services/reservation.service";

interface ReservationPayload {
  restaurantId: string;
  sectorId: string;
  partySize: number;
  startDateTimeISO: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
}

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const { id } = params as { id: string };

  const fetchData = async () => {
    try {
      const restaurant = await RestaurantService.fetchRestaurant(id);
      setRestaurant(restaurant);

      const sectors = await RestaurantService.fetchSectors(id);
      setSectors(sectors);

      const tables = await RestaurantService.fetchTables(id);
      setTables(tables);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!selectedDate) {
        throw new Error("Debe seleccionar una fecha y hora");
      }

      const payload: ReservationPayload = {
        restaurantId: id,
        sectorId: selectedSector,
        partySize,
        startDateTimeISO: selectedDate.toISOString(),
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        notes: formData.notes,
      };

      const reservation = await ReservationService.createReservation(payload);

      setSuccess(true);
      setFormData({ name: "", phone: "", email: "", notes: "" });
      setSelectedDate(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) {
    return <div className="p-4">Cargando restaurante...</div>;
  }

  const handleSelectTable = (tableId: string, partySize: number) => {
    setSelectedTable(tableId);
    setPartySize(partySize);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">{restaurant.name}</h1>

      <img
        alt={restaurant.name}
        src={getImageUrl(restaurant.id) || "/default.jpeg"}
        className="h-60 w-full object-cover rounded-sm"
      />

     
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Horarios de atencion</h2>
        <div className="flex flex-wrap gap-2">
          {restaurant.shifts?.map((shift, index) => {
            const shiftLabel = `${shift.start} - ${shift.end}`;
            return (
              <div key={index} className="px-4 py-2 rounded-lg border">
                {shiftLabel}
              </div>
            );
          })}
        </div>
      </section>

     
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Sectores</h2>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector.id)}
              className={`px-4 py-2 rounded-lg border ${
                selectedSector === sector.id
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-400"
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>
      </section>

      
      {selectedSector && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Mesas en {sectors.find((s) => s.id === selectedSector)?.name}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {tables
              .filter((t) => t.sectorId === selectedSector)
              .map((table) => (
                <div
                  key={table.id}
                  className={`border rounded-lg p-3 text-sm ${
                    selectedTable === table.id
                      ? "bg-green-600 text-white"
                      : "hover:bg-green-400"
                  } `}
                  onClick={() => handleSelectTable(table.id, table.maxSize)}
                >
                  <p className="font-medium">{table.name}</p>
                  <p>
                    Capacidad: {table.minSize} - {table.maxSize} personas
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      
      <section className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Hacer una reserva</h2>
        <form onSubmit={handleReserve} className="flex flex-col gap-3">
          <div className="flex flex-col">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Seleccioná fecha y hora"
              className="border rounded-lg p-2 w-full"
              wrapperClassName="w-full"
              minDate={new Date()}
            />
          </div>

          <input
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border rounded-lg p-2"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="border rounded-lg p-2"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border rounded-lg p-2"
            required
          />
          <textarea
            placeholder="Notas adicionales"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="border rounded-lg p-2"
          />

          <button
            type="submit"
            disabled={loading || !selectedSector || !selectedDate}
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            }`}
          >
            {loading ? "Enviando..." : "Confirmar reserva"}
          </button>

          {success && (
            <p className="text-green-600">✅ Reserva creada con éxito</p>
          )}
          {error && <p className="text-red-600">❌ {error}</p>}
        </form>
      </section>
    </div>
  );
}
