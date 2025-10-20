export type ISODateTime = string; // e.g., "2025-09-08T20:00:00-03:00"

export interface Restaurant {
  id: string;
  name: string;
  timezone: string;                                // IANA
  shifts?: Array<{ start: string; end: string }>;  // "HH:mm"
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Sector {
  id: string;
  restaurantId: string;
  name: string;                                    // e.g., "Main Hall", "Terrace", "Bar"
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Table {
  id: string;
  sectorId: string;
  name: string;
  minSize: number;                                 // minimum party size
  maxSize: number;                                 // maximum party size
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type ReservationStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export interface Reservation {
  id: string;
  restaurantId: string;
  sectorId: string;
  tableIds: string[];                              // CORE: single table; BONUS: combinations
  partySize: number;
  startDateTimeISO: ISODateTime;
  endDateTimeISO: ISODateTime;
  status: ReservationStatus;                       // CORE uses CONFIRMED | CANCELLED
  customer?: Customer;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ReservationDto{
  id: string;
  restaurantId: string;
  sectorId: string;
  tableIds: string[];                              // CORE: single table; BONUS: combinations
  partySize: number;
  startDateTimeISO: ISODateTime;
  endDateTimeISO: ISODateTime;
  status: ReservationStatus;                       // CORE uses CONFIRMED | CANCELLED
  customer: Customer;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface IdempotencyKeyDto{
  key: string;
  reservationId: string;
  createdAt: ISODateTime;
}


export type ReservationPayload = Pick<
  Reservation,
  "restaurantId" | "sectorId" | "partySize" | "startDateTimeISO" | "notes"
> & {
  customer: Pick<Customer, "name" | "phone" | "email">;
};


export interface ReservationItem {
  id: string;
  sectorId: string;
  tableIds: string[];
  partySize: number;
  start: string; // ISO 8601 datetime string
  end: string;   // ISO 8601 datetime string
  status: "CONFIRMED" | "CANCELLED" | "PENDING"; // ajustá según tus estados
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationsByDay {
  date: string; // formato YYYY-MM-DD
  items: ReservationItem[];
}

const types = {
  Restaurant: {} as Restaurant,
  Sector: {} as Sector,
  Table: {} as Table,
  Customer: {} as Customer,
  Reservation: {} as Reservation,
  ReservationDto: {} as ReservationDto,
  IdempotencyKeyDto: {} as IdempotencyKeyDto,
};

export default types;
