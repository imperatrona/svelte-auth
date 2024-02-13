import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export const sqlite = new Database("./data/data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
