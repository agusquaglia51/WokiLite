import { SectorRepository } from "../repositories/sector.repository.js";
import { Sector } from "../types/types.js";

export class SectorService {

  static async getById(id: string): Promise<Sector | null>{
    const sector = await SectorRepository.findById(id);

    if (!sector) return null;

    return {
      ...sector,
      createdAt: sector.createdAt.toISOString(),
      updatedAt: sector.updatedAt.toISOString(),
    };
  }

  static async getByRestaurantId(restaurantId: string): Promise<Sector[]> {
    const sectors =  await SectorRepository.findManyByRestaurant(restaurantId);
    return sectors.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  }


}