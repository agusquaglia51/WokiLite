import { prisma } from "../db/prismaClient";
import types from "../types/types";

type IdempotencyKeyDto = typeof types.IdempotencyKeyDto;

export class IdempotencyRepository {
  static async findByKey(key: string) {
    return prisma.idempotencyKey.findUnique({ where: { key } });
  }

  static async create(data: IdempotencyKeyDto) {
    return prisma.idempotencyKey.create({ data });
  }
}