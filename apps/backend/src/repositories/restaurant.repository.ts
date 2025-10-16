import { prisma } from '../db/prismaClient.ts';
import types from '../types/types.ts';

type Restaurant = typeof types.Restaurant;

export class RestaurantRepository {
  static async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) return null;

    return {
      ...restaurant,
      shifts: restaurant.shifts as any,
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    };
  }

  static async findAll(): Promise<Restaurant[] | null>{
    const restaurantList = await prisma.restaurant.findMany();

    if (!restaurantList) return null;

    return restaurantList.map(r => ({
      ...r,
      shifts: r.shifts as any,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

  }


  static async create(data: Restaurant): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.create({
      data: {
        id: data.id,
        name: data.name,
        timezone: data.timezone,
        shifts: data.shifts as any,
      },
    });


    return {
      ...restaurant,
      shifts: restaurant.shifts as any,
      createdAt: restaurant.createdAt.toISOString(),
      updatedAt: restaurant.updatedAt.toISOString(),
    };
  }
}