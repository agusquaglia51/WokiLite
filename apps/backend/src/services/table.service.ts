import { TableRepository } from "../repositories/table.repository";
import { Table } from "../types/types";

export class TableService  {
  static async getTablesBySector(sectorId: string): Promise<Table[]> {
    
    const tables = await TableRepository.findManyBySector(sectorId);
    
    return tables.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  }
}