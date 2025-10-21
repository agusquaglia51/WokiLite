import { Sector } from "@prisma/client";
import {prisma} from "../db/prismaClient.js";



export class SectorRepository {
  static async findById(id: string): Promise<Sector | null>{
    const sector = await prisma.sector.findUnique({
          where: { id },
        });
    
    if (!sector) return null;
    
    return sector;
  }

  static async findManyByRestaurant(restaurantId: string): Promise<Sector[]> {
    const sectors = await prisma.sector.findMany({ where: { restaurantId }});

    return sectors
  }
}