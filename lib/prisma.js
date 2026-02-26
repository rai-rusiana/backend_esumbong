import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from '@neondatabase/serverless';
import pkg from "@prisma/client";
import ws from 'ws';

const { PrismaClient } = pkg;
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL_NEON;
const adapter = new PrismaNeon({ connectionString });

// Reuse Prisma globally for serverless
const prisma = global.prisma || new PrismaClient({ adapter });

// Always assign to global in production too
if (!global.prisma) global.prisma = prisma;

export default prisma;
