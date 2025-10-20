import { RestaurantRepository } from "../repositories/restaurant.repository";
import { Restaurant } from "../types/types";

export class RestaurantService {

  static async getRestaurantList(): Promise<Restaurant[] | null>{
    const restaurantList =  await RestaurantRepository.findAll();

     if (!restaurantList) return null;

    return restaurantList?.map((r) => ({
      ...r,
      shifts: r.shifts
      ? (r.shifts as { start: string; end: string }[])
      : undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  static async getRestaurant(id: string): Promise<Restaurant | null> {
    const restaurant = await RestaurantRepository.findById(id);

    if (!restaurant) return null;

   return {
    ...restaurant,
    shifts: restaurant.shifts
      ? (restaurant.shifts as { start: string; end: string }[])
      : undefined,
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
  };
  }
}