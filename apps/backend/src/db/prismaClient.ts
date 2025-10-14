import { PrismaClient } from '@prisma/client';

const prismaClient = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClient>;
}

export const prisma = globalThis.prisma ?? prismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
