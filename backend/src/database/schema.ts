import { boolean, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

const statusEnum = pgEnum("status", ["waiting", "picking_teams", "ready"]);


export const UserTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow()
})

export const GamesTable = pgTable("games", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    date: timestamp("date").notNull(),
    createdBy: uuid("created_by").references(() => UserTable.id).notNull(),
    status: varchar("status", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});


export const PlayersTable = pgTable("players", {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id").references(() => GamesTable.id).notNull(),
    userId: uuid("user_id").references(() => UserTable.id).notNull(),
    role: varchar("role", { length: 255 }).notNull(),
    joinedAt: timestamp("joined_at").defaultNow(),
});
