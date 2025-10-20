import { Table } from "@prisma/client";
import {prisma} from "../db/prismaClient.ts";



export class TableRepository {

  static async findById(id: string): Promise<Table | null>{
    const table = await prisma.table.findUnique({
          where: { id },
        });
    
    if (!table) return null;
    
    return table;
  }

  static async findManyBySector(sectorId: string): Promise<Table[]> {
    const tables = await prisma.table.findMany({ where: { sectorId: sectorId }, include:{ sector: true }});

    return tables;
  }
}