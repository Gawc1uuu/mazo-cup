import { Server } from "socket.io";
import { GamesTable, PlayersTable, UserTable } from "../database/schema";
import { db } from "../database/db";
import { eq } from "drizzle-orm";

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

        socket.on("pick-player", async (data: { gameId: string; currentTurn: string; }) => {
            console.log("dupaaaa")
            const { gameId, currentTurn } = data;

            try {
                // Update the turn
                const [game] = await db
                    .select()
                    .from(GamesTable)
                    .where(eq(GamesTable.id, gameId));

                console.log(game.currentTurn)
                console.log(currentTurn)

                if (game.currentTurn !== currentTurn) {
                    socket.emit("error", { message: "It's not your turn" });
                    return;
                }

                const nextTurn = game.currentTurn === "captain1" ? "captain2" : "captain1";
                await db.update(GamesTable)
                    .set({ currentTurn: nextTurn })
                    .where(eq(GamesTable.id, gameId));

                // Emit updated game state
                const updatedGame = await fetchGameDetails(gameId);
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
    }, {});
};