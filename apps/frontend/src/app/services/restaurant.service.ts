import { Restaurant, Sector, Table } from "../types";

export class RestaurantService  {
  static async fetchRestaurants(): Promise<Restaurant[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants`,{
      cache: "no-store",
      method: "GET",
      
    });
    if (!res.ok) throw new Error("Error fetching restaurants");
    return res.json();
  }

  static async fetchRestaurant(id: string): Promise<Restaurant> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${id}`,{
      method: "GET",
      
    });
    if (!res.ok) throw new Error("Error fetching restaurant");
    return res.json();
  }

  static async fetchSectors(restaurantId: string): Promise<Sector[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/sectors`,{
      method: "GET",
      
    });
    if (!res.ok) throw new Error("Error fetching sectors");
    return res.json();
  }

  static async fetchTables(restaurantId: string): Promise<Table[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/tables`,{
      method: "GET",
      
    });
    if (!res.ok) throw new Error("Error fetching tables");
    return res.json();
  }
};
