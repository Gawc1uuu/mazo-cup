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
    status: varchar("status", { length: 50 }),
    capitain1Id: uuid("capitain1_id").references(() => UserTable.id),
    capitain2Id: uuid("capitain2_id").references(() => UserTable.id),
    createdAt: timestamp("createdAt").defaultNow()
})

export const GamePlayersTable = pgTable("game_players", {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id").references(() => GamesTable.id),
    playerId: uuid("player_id").references(() => UserTable.id),
    team: varchar("team", { length: 50 }).default("none"),
    isCapitain: boolean("is_captain").default(false)
})