import  types  from "../types/types.ts";
import {prisma} from "../db/prismaClient.ts";

type Sector = typeof types.Sector;

export class SectorRepository {
  static async findById(id: string): Promise<Sector | null>{
    const sector = await prisma.sector.findUnique({
          where: { id },
        });
    
    if (!sector) return null;
    
    return {
      ...sector,
      createdAt: sector.createdAt.toISOString(),
      updatedAt: sector.updatedAt.toISOString(),
    }
  }
}