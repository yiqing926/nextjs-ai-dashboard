import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL missing');

  // 1. 创建原生的 pg 连接池
  const pool = new Pool({ connectionString });
  // 2. 包装成 Prisma 7 认可的适配器
  const adapter = new PrismaPg(pool);

  // 3. 直接喂给构造函数，满足 client 引擎的所有幻想
  prismaInstance = new PrismaClient({
    adapter,
    log: ['error']
  });
}

export const db = prismaInstance;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;