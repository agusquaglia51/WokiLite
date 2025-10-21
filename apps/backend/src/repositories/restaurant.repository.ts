import { Restaurant } from '@prisma/client';
import { prisma } from '../db/prismaClient.js';

export class RestaurantRepository {
  static async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) return null;

    return restaurant;

  }

  static async findAll(): Promise<Restaurant[] | null>{
    const restaurantList = await prisma.restaurant.findMany();

    if (!restaurantList) return null;

    return restaurantList;

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


    return restaurant
  }
}