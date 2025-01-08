import express, { Request, Response } from "express"
import { db } from "../database/db";
import { GamesTable, PlayersTable, UserTable } from "../database/schema";
import { eq, and } from "drizzle-orm"
import dotenv from "dotenv";
import { emitPlayerJoined, emitStatusChanged } from "../socket/socket";
import { isTemplateSpan } from "typescript";
dotenv.config()

const router = express.Router();


router.post("/create", async (req, res) => {
    const { name, location, date, createdBy } = req.body;
    try {

        console.log(name, location, date, createdBy);
        const localDate = new Date(date); // Parse local datetime

        console.log("Local Date:", localDate.toString()); // Local time


        const [newGame] = await db.insert(GamesTable).values({
            name,
            location,
            date: localDate,
            status: "waiting",
            createdBy
        }).returning()


        res.status(200).json(newGame);
        return;

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Cannot create game" })
    }
})

// get all waiting games
router.get("/all-waiting", async (req, res) => {
    try {
        const allWaitingGames = await db
            .select({
                game: GamesTable,
                player: PlayersTable,
                user: UserTable
            })
            .from(GamesTable)
            .leftJoin(PlayersTable, eq(GamesTable.id, PlayersTable.gameId))
            .leftJoin(UserTable, eq(PlayersTable.userId, UserTable.id))
            .where(eq(GamesTable.status, "waiting"));



        const result = allWaitingGames.reduce((acc: any, row: any) => {
            const gameId = row.game.id

            if (!acc[gameId]) {
                acc[gameId] = {
                    ...row.game,
                    players: []
                }
            }

            if (row.player && row.user) {
                acc[gameId].players.push({
                    id: row.user.id,
                    username: row.user.username,
                    email: row.user.email,
                    role: row.player.role,
                })
            }
            return acc;

        }, {})

        const data: any = Object.values(result);


        res.status(200).json({ games: data });
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Cannot get games" })
    }
})

router.post("/join", async (req, res) => {
    try {

        const { userId, gameId: id } = req.body;


        const [game] = await db.select().from(GamesTable).where(eq(
            GamesTable.id,
            id
        ))
        const players = await db.select().from(PlayersTable).where(eq(
            PlayersTable.gameId,
            game.id
        ))

        if (players.length >= 6) {
            res.status(400).json({ message: "Game is full" });
            return
        }

        // const [existingPlayer] = await db
        //     .select()
        //     .from(PlayersTable)
        //     .where(and(eq(PlayersTable.gameId, game.id), eq(PlayersTable.userId, userId)));

        // if (existingPlayer) {
        //     res.status(400).json({ message: "User has already joined this game" });
        //     return;
        // }

        const [newPlayer] = await db.insert(PlayersTable).values({
            gameId: game.id,
            userId,
            role: "player",
        }).returning();

        const [player] = await db
            .select({
                id: PlayersTable.id,
                email: UserTable.email,
                username: UserTable.username,
                role: PlayersTable.role,
            })
            .from(PlayersTable)
            .leftJoin(UserTable, eq(PlayersTable.userId, UserTable.id))
            .where(eq(PlayersTable.id, newPlayer.id));

        if (!player) {
            res.status(500).json({ message: "Failed to fetch player details" });
            return;
        }

        const updatedPlayerCount = players.length + 1;

        if (players.length + 1 === 6) {
            // Randomly assign two captains
            const allPlayers = [...players, newPlayer];
            const shuffledPlayers = allPlayers.sort(() => 0.5 - Math.random());
            const [captain1, captain2] = shuffledPlayers;

            // Update captains in PlayersTable
            await db.transaction(async (trx) => {
                await trx.update(PlayersTable)
                    .set({ role: "captain1" })
                    .where(eq(PlayersTable.id, captain1.id));

                await trx.update(PlayersTable)
                    .set({ role: "captain2" })
                    .where(eq(PlayersTable.id, captain2.id));
            });

            // Update game status to "picking_teams"
            await db.update(GamesTable)
                .set({ status: "picking_teams" })
                .where(eq(GamesTable.id, game.id));

            emitStatusChanged({ gameId: game.id, status: "picking_teams" });

        }


        emitPlayerJoined({ gameId: game.id, player: player });


        res.status(200).json(newPlayer)
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "something went wrong" })
    }
})

router.get("/teams-picking", async (req, res) => {
    try {
        const { userId } = req.query;

        if (typeof userId !== 'string') {
            res.status(400).json({ message: "Invalid userId" });
            return;
        }

        const pickingTeamsGames = await db
            .select({
                game: GamesTable,
                player: PlayersTable,
                user: UserTable,
            })
            .from(GamesTable)
            .leftJoin(PlayersTable, eq(GamesTable.id, PlayersTable.gameId))
            .leftJoin(UserTable, eq(PlayersTable.userId, UserTable.id))
            .where(and(eq(GamesTable.status, "picking_teams"), eq(PlayersTable.userId, userId)));

        const result = pickingTeamsGames.reduce((acc: any, row: any) => {
            const gameId = row.game.id;

            if (!acc[gameId]) {
                acc[gameId] = {
                    ...row.game,
                    players: [],
                };
            }

            if (row.player && row.user) {
                acc[gameId].players.push({
                    id: row.user.id,
                    username: row.user.username,
                    email: row.user.email,
                    role: row.player.role,
                });
            }

            return acc;
        }, {});

        const games = Object.values(result);

        res.status(200).json({ games });
    } catch (error) {
        console.error("Failed to fetch games:", error);
        res.status(500).json({ message: "Failed to fetch games" });
    }
});

router.get("/teams-picking/:id", async (req, res) => {
    const { id } = req.params;
    try {
        console.log(id)
        const game = await db.select({
            game: GamesTable,
            player: PlayersTable,
            user: UserTable
        }).from(GamesTable).leftJoin(PlayersTable, eq(PlayersTable.gameId, GamesTable.id))
            .leftJoin(UserTable, eq(UserTable.id, PlayersTable.userId))
            .where(eq(GamesTable.id, id))


        const gameDetails = game.reduce(
            (acc: any, row: any) => {
                // Ensure the game object is initialized in the accumulator
                if (!acc[row.game.id]) {
                    acc[row.game.id] = {
                        players: [],
                        teams: { captain1: [], captain2: [] },
                        currentTurn: row.game.currentTurn,
                    };
                }

                if (row.player && row.user) {
                    const player = {
                        id: row.user.id,
                        username: row.user.username,
                        email: row.user.email,
                        role: row.player.role,
                    };

                    if (row.player.role === "captain1") {
                        acc[row.game.id].teams.captain1.push(player);
                    } else if (row.player.role === "captain2") {
                        acc[row.game.id].teams.captain2.push(player);
                    } else {
                        acc[row.game.id].players.push(player);
                    }
                }

                return acc;
            },
            {}
        );

        // Flatten the result to send the first game details (if there's only one game by ID)
        res.status(200).json(gameDetails[id] || {});
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Something went wrong" })
        return;
    }
})





export default router;