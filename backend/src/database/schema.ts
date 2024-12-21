import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const UserTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow()
}) 