import { SectorRepository } from "../repositories/sector.repository";
import { Sector } from "../types/types";

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