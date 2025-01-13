import { Server } from "socket.io";
import { GamesTable, PlayersTable, UserTable } from "../database/schema";
import { db } from "../database/db";
import { and, eq, isNull, sql } from "drizzle-orm";

let io: any; // WebSocket instance

export const setupWebSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Replace with your frontend URL
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: any) => {
        console.log("A user connected");

        socket.on("pick-player", async (data: { gameId: string; currentTurn: string; playerId: string, emittedBy: string }) => {
            console.log("dupaaaa")
            const { gameId, currentTurn, playerId, emittedBy } = data;

            console.log(gameId)

            try {
                // Update the turn
                const [game] = await db
                    .select()
                    .from(GamesTable)
                    .where(eq(GamesTable.id, gameId));


                const [emitted] = await db
                    .select({
                        role: PlayersTable.role,
                        userId: PlayersTable.userId,
                    })
                    .from(PlayersTable)
                    .where(and(
                        eq(PlayersTable.gameId, gameId),
                        eq(PlayersTable.userId, emittedBy) // Ensure emittedBy matches
                    ));
                console.log("dupaaaa")


                console.log(emitted)


                if (emitted.role !== currentTurn) {
                    console.log("im here")
                    socket.emit("error", { message: "It's not your turn" });
                    return;
                }


                console.log(currentTurn)

                const nextTurn = game.currentTurn === "captain1" ? "captain2" : "captain1";

                console.log(playerId)
                console.log(gameId)

                const testPlayer = await db
                    .select()
                    .from(PlayersTable)
                    .where(and(
                        eq(PlayersTable.id, playerId),
                        eq(PlayersTable.gameId, gameId)
                    ));

                console.log(testPlayer);

                // TODO: change that to string
                await db
                    .update(PlayersTable)
                    .set({ team: currentTurn }) // Only assign if currentTurn is valid for the `team` column
                    .where(and(
                        eq(PlayersTable.userId, playerId),
                        eq(PlayersTable.gameId, gameId) // Use PlayersTable.gameId
                    ));


                await db.update(GamesTable)
                    .set({ currentTurn: nextTurn })
                    .where(eq(GamesTable.id, gameId));

                // Emit updated game state
                const updatedGame = await fetchGameDetails(gameId);

                console.log(updatedGame)

                const unassignedPlayers = await db
                    .select()
                    .from(PlayersTable)
                    .where(and(
                        eq(PlayersTable.gameId, gameId),
                        isNull(PlayersTable.team),
                        eq(PlayersTable.role, 'player') // Check for players without a team
                    ));

                console.log("unassigned player", unassignedPlayers)

                if (unassignedPlayers.length === 0) {
                    // Update game status to "ready"
                    await db.update(GamesTable).set({ status: "ready" }).where(eq(GamesTable.id, gameId));
                    io.emit("status-changed", { gameId, status: "ready" });
                }

                console.log(updatedGame)
                io.emit("team-updated", updatedGame[gameId]);
            } catch (error) {
                console.error("Error handling player pick:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};

export const emitPlayerJoined = (data: { gameId: string, player: any }) => {
    if (io) {
        io.emit("player-joined", data);
    }
};


export const emitStatusChanged = (data: { gameId: string; status: string }) => {
    if (io) {
        io.emit("status-changed", data);
    }
};

const fetchGameDetails = async (gameId: string) => {
    const game = await db
        .select({
            game: GamesTable,
            player: PlayersTable,
            user: UserTable,
        })
        .from(GamesTable)
        .leftJoin(PlayersTable, eq(GamesTable.id, PlayersTable.gameId))
        .leftJoin(UserTable, eq(UserTable.id, PlayersTable.userId))
        .where(eq(GamesTable.id, gameId));

    return game.reduce((acc: any, row: any) => {
        // Initialize the game object if not already set
        if (!acc[row.game.id]) {
            acc[row.game.id] = {
                players: [], // Players not yet assigned to a team
                teams: { captain1: [], captain2: [] }, // Players assigned to teams
                currentTurn: row.game.currentTurn, // Current turn
            };
        }

        if (row.player && row.user) {
            const player = {
                id: row.user.id,
                username: row.user.username,
                email: row.user.email,
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
};