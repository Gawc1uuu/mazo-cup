import express, { Request, Response } from "express"
import { db } from "../database/db";
import { GamesTable, PlayersTable, UserTable } from "../database/schema";
import { eq, and, desc } from "drizzle-orm"
import dotenv from "dotenv";
import { emitPlayerJoined, emitStatusChanged } from "../socket/socket";
import authMiddleware from "../middleware/auth";
dotenv.config()

const router = express.Router();


router.post("/create", authMiddleware, async (req, res) => {
    const { name, location, date, createdBy, team1Pic, team2Pic } = req.body;
    try {

        console.log("elo", name, location, date, createdBy, team1Pic, team2Pic);
        const localDate = new Date(date); // Parse local datetime


        const [newGame] = await db.insert(GamesTable).values({
            name,
            location,
            date: localDate,
            status: "waiting",
            createdBy,
            team1Picture: team1Pic,
            team2Picture: team2Pic
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
            .orderBy(desc(GamesTable.createdAt))
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
                    id: row.player.id,
                    username: row.user.username,
                    email: row.user.email,
                    role: row.player.role,
                    userId: row.user.id
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

        const [existingPlayer] = await db
            .select()
            .from(PlayersTable)
            .where(and(eq(PlayersTable.gameId, game.id), eq(PlayersTable.userId, userId)));

        if (existingPlayer) {
            res.status(400).json({ message: "User has already joined this game" });
            return;
        }

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
                userId: UserTable.id
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
                    .set({ role: "captain1", team: "captain1" })
                    .where(eq(PlayersTable.id, captain1.id));

                await trx.update(PlayersTable)
                    .set({ role: "captain2", team: "captain2" })
                    .where(eq(PlayersTable.id, captain2.id));
            });

            // Update game status to "picking_teams"
            await db.update(GamesTable)
                .set({ status: "picking_teams" })
                .where(eq(GamesTable.id, game.id));

            await db.update(GamesTable)
                .set({ currentTurn: "captain1" })
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


        const gameDetails = game.reduce((acc: any, row: any) => {
            // Initialize the game object if not already set
            if (!acc[row.game.id]) {
                acc[row.game.id] = {
                    players: [], // Players not yet assigned to a team
                    teams: { captain1: [], captain2: [] }, // Players assigned to teams
                    currentTurn: row.game.currentTurn, // Current turn
                    team1Picture: row.game.team1Picture,
                    team2Picture: row.game.team2Picture,
                };
            }

            if (row.player && row.user) {
                const player = {
                    id: row.user.id,
                    username: row.user.username,
                    email: row.user.email,
                    firstName: row.user.firstName,
                    lastName: row.user.lastName,
                    role: row.player.role,
                    team: row.player.team, // Include team assignment
                };

                // Assign captains to their respective teams based on role
                if (row.player.role === "captain1") {
                    acc[row.game.id].teams.captain1.push(player);
                } else if (row.player.role === "captain2") {
                    acc[row.game.id].teams.captain2.push(player);
                }
                // Assign other players based on the team field
                else if (player.team === "captain1") {
                    acc[row.game.id].teams.captain1.push(player);
                } else if (player.team === "captain2") {
                    acc[row.game.id].teams.captain2.push(player);
                } else {
                    acc[row.game.id].players.push(player);
                }
            }

            return acc;
        }, {});

        // Flatten the result to send the first game details (if there's only one game by ID)
        res.status(200).json(gameDetails[id] || {});
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Something went wrong" })
        return;
    }
})


router.get("/ready", async (req, res) => {
    try {
        const { userId } = req.query;

        if (typeof userId !== 'string') {
            res.status(400).json({ message: "Invalid userId" });
            return
        }

        const readyGames = await db
            .select()
            .from(GamesTable)
            .orderBy(desc(GamesTable.createdAt))
            .innerJoin(PlayersTable, eq(GamesTable.id, PlayersTable.gameId))
            .where(
                and(
                    eq(GamesTable.status, "ready"), // Filter games with "ready" status
                    eq(PlayersTable.userId, userId) // Filter by userId
                )
            );


        const gameDetails = readyGames.map((row) => ({
            id: row.games.id,
            name: row.games.name,
            location: row.games.location,
            date: row.games.date,
            createdBy: row.games.createdBy,
            status: row.games.status,
            currentTurn: row.games.currentTurn,
            createdAt: row.games.createdAt,
            team1Picture: row.games.team1Picture,
            team2Picture: row.games.team2Picture
        }));


        res.status(200).json(gameDetails)
        return
    } catch (error) {
        res.status(500).json({ messsage: "Something went wrong" })
        return
    }
})


router.get("/ready/:id", async (req, res) => {
    const { id } = req.params;

    try {
        console.log(id);

        // Fetch game details by ID with related players and user data
        const game = await db
            .select({
                game: GamesTable,
                player: PlayersTable,
                user: UserTable,
            })
            .from(GamesTable)
            .leftJoin(PlayersTable, eq(PlayersTable.gameId, GamesTable.id))
            .leftJoin(UserTable, eq(UserTable.id, PlayersTable.userId))
            .where(and(eq(GamesTable.id, id), eq(GamesTable.status, "ready")));

        const gameDetails = game.reduce((acc: any, row: any) => {
            // Initialize the game object if not already set
            if (!acc[row.game.id]) {
                acc[row.game.id] = {
                    id: row.game.id,
                    name: row.game.name,
                    location: row.game.location,
                    date: row.game.date,
                    status: row.game.status,
                    players: [], // List of all players
                    teams: { captain1: [], captain2: [] }, // Players assigned to teams
                    team1Picture: row.game.team1Picture,
                    team2Picture: row.game.team2Picture,
                };
            }

            if (row.player && row.user) {
                const player = {
                    id: row.user.id,
                    username: row.user.username,
                    email: row.user.email,
                    firstName: row.user.firstName,
                    lastName: row.user.lastName,
                    role: row.player.role,
                    team: row.player.team, // Include team assignment
                };

                // Assign captains and players to their respective teams or the player pool
                if (row.player.role === "captain1") {
                    acc[row.game.id].teams.captain1.push(player);
                } else if (row.player.role === "captain2") {
                    acc[row.game.id].teams.captain2.push(player);
                } else if (player.team === "captain1") {
                    acc[row.game.id].teams.captain1.push(player);
                } else if (player.team === "captain2") {
                    acc[row.game.id].teams.captain2.push(player);
                } else {
                    acc[row.game.id].players.push(player);
                }
            }

            return acc;
        }, {});

        // Flatten the result to send the first game details (if there's only one game by ID)
        res.status(200).json(gameDetails[id] || {});
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
        return;
    }
});

router.delete("/delete/:id", async (req: any, res: any) => {
    const { id: gameId } = req.params;

    try {
        // Step 1: Find the game by ID
        const [gameToDelete] = await db
            .select()
            .from(GamesTable)
            .where(eq(GamesTable.id, gameId));

        if (!gameToDelete) {
            return res.status(404).json({ message: "Game not found." });
        }

        if (gameToDelete.status !== "waiting") {
            return res.status(400).json({
                message: `Game cannot be deleted. Its status is "${gameToDelete.status}", not "waiting".`
            });
        }


        await db.transaction(async (trx) => {
            // Delete associated players from PlayersTable
            await trx.delete(PlayersTable).where(eq(PlayersTable.gameId, gameId));

            // Delete the game from GamesTable
            await trx.delete(GamesTable).where(eq(GamesTable.id, gameId));
        });

        res.status(200).json({ message: `Game with ID ${gameId} and all associated players deleted successfully.` });
        return;

    } catch (error) {
        console.error(`Error deleting game with ID ${gameId}:`, error);
        return res.status(500).json({ message: "Failed to delete game. Something went wrong." });
    }
});



router.patch("/update/:id", async (req: any, res: any) => {
    const { id: gameId } = req.params;
    const { name, location, date } = req.body; // Only these fields are expected for update



    try {
        const [gameToUpdate] = await db
            .select()
            .from(GamesTable)
            .where(eq(GamesTable.id, gameId));

        if (!gameToUpdate) {
            return res.status(404).json({ message: "Game not found." });
        }


        if (gameToUpdate.status !== "waiting") {
            return res.status(400).json({
                message: `Game details can only be updated if the status is "waiting". Current status: "${gameToUpdate.status}".`
            });
        }

        const [updatedGame] = await db
            .update(GamesTable)
            .set({
                name,
                location,
                date
            })
            .where(eq(GamesTable.id, gameId))
            .returning();


        return res.status(200).json(updatedGame);

    } catch (error) {
        console.error(`Error updating game with ID ${gameId}:`, error);
        res.status(500).json({ message: "Failed to update game. Something went wrong." });
    }
});

router.get("/game/:id", async (req: any, res: any) => {
    const { id: gameId } = req.params;

    try {
        const [game] = await db
            .select({
                id: GamesTable.id,
                name: GamesTable.name,
                location: GamesTable.location,
                date: GamesTable.date,
            })
            .from(GamesTable)
            .where(eq(GamesTable.id, gameId));

        if (!game) {
            return res.status(404).json({ message: "Game not found." });
        }

        return res.status(200).json(game);

    } catch (error) {
        console.error(`Error fetching game with ID ${gameId}:`, error);
        res.status(500).json({ message: "Failed to fetch game. Something went wrong." });
    }
});





export default router;