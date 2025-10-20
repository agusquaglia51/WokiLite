import { Restaurant, Sector, Table } from "../types";

export class RestaurantService {
  static async fetchRestaurants(): Promise<Restaurant[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants`);
      if (!res.ok) throw new Error("Error fetching restaurants");
      return await res.json();
    } catch (error) {
      console.error("RestaurantService.fetchRestaurants failed:", error);
      throw error; 
    }
  }

  static async fetchRestaurant(id: string): Promise<Restaurant> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`);
      if (!res.ok) throw new Error("Error fetching restaurant");
      return await res.json();
    } catch (error) {
      console.error("RestaurantService.fetchRestaurant failed:", error);
      throw error;
    }
  }

  static async fetchSectors(restaurantId: string): Promise<Sector[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/sectors`);
      if (!res.ok) throw new Error("Error fetching sectors");
      return await res.json();
    } catch (error) {
      console.error("RestaurantService.fetchSectors failed:", error);
      throw error;
    }
  }

  static async fetchTables(restaurantId: string): Promise<Table[]> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/tables`);
      if (!res.ok) throw new Error("Error fetching tables");
      return await res.json();
    } catch (error) {
      console.error("RestaurantService.fetchTables failed:", error);
      throw error;
    }
  }
}
