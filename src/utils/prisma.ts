import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Create a single Prisma client instance extended with Accelerate
const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;