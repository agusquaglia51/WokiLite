import types from "../types/types.ts";
import {prisma} from "../db/prismaClient.ts";

type Table = typeof types.Table;

export class TableRepository {
  static async findById(id: string): Promise<Table | null>{
    const table = await prisma.table.findUnique({
          where: { id },
        });
    
    if (!table) return null;
    
    return {
      ...table,
      createdAt: table.createdAt.toISOString(),
      updatedAt: table.updatedAt.toISOString(),
    }
  }

  static async findManyBySector(sectorId: string): Promise<Table[]> {
    const tables = await prisma.table.findMany({ where: { sectorId: sectorId } });

    return tables.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }
}