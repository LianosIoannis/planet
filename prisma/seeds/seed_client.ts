import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import dotenv from "dotenv";
import { PrismaClient } from "../../generated/prisma/index.js";

dotenv.config();

const adapter = new PrismaBetterSQLite3({
	url: process.env.DATABASE_URL_SEED,
});

export const prisma = new PrismaClient({ adapter });
