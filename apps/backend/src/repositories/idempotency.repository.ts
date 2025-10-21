import { IdempotencyKey } from "@prisma/client";
import { prisma } from "../db/prismaClient.js";
import { IdempotencyKeyDto } from "../types/types.js";


export class IdempotencyRepository {
  static async findByKey(key: string): Promise<IdempotencyKey | null> {
    return prisma.idempotencyKey.findUnique({ where: { key } });
  }

  static async create(data: IdempotencyKeyDto): Promise<IdempotencyKey> {
    return prisma.idempotencyKey.create({ data });
  }
}