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
  customer: Customer;
  notes?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}


export interface AvailabilityQuery {
  restaurantId: string;
  sectorId: string;
  date: string;
  partySize: string;
}