import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'test' ? [] : ['error', 'warn'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();
