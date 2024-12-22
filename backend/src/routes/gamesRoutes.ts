import express from "express"
import { GamePlayersTable, GamesTable } from "../database/schema";
import { db } from "../database/db";
import { and, eq } from "drizzle-orm";

const router = express.Router();


router.post("/create", async (req, res) => {
    const { userId } = req.body;
    try {

        const [game] = await db.insert(GamesTable).values({}).returning();
        await db.insert(GamePlayersTable).values({
            gameId: game.id,
            playerId: userId,
        });

        res.status(201).json({ gameId: game.id })
        return


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong creating a game" })
    }
})

router.post("/:gameId/join", async (req, res) => {
    const { userId } = req.body;
    const { gameId } = req.params;
    try {

        const players = await db.select().from(GamePlayersTable).where(eq(GamePlayersTable.gameId, gameId))

        if (players.length >= 10) {
            res.status(400).json({ message: "game is full" })
            return;
        }

        const [game] = await db.select().from(GamesTable).where(eq(GamesTable.id, gameId));

        if (game.status !== "waiting") {
            res.status(400).json({ message: "Cannot join this game" })
            return;
        }

        await db.insert(GamePlayersTable).values({
            gameId,
            playerId: userId
        })

        res.status(200).json({ message: "Joined a game" })
        return;
    } catch (error) {
        res.status(500).json({ message: "Couldnt join a game" })
    }
})


router.post("/:gameId/start", async (req, res) => {
    const { gameId } = req.params;
    try {

        const players = await db.select().from(GamePlayersTable).where(eq(GamePlayersTable.gameId, gameId))
        if (players.length < 10) {
            res.status(400).json({ message: "Not enough players" })
            return;
        }

        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
        const captain1 = shuffledPlayers[0];
        const captain2 = shuffledPlayers[1];

        await db.transaction(async (tx) => {
            await tx.update(GamesTable).set({
                status: "picking_teams",
                capitain1Id: captain1.id,
                capitain2Id: captain2.id
            }).where(eq(GamesTable.id, gameId))

            await tx.update(GamePlayersTable).set({
                isCapitain: true
            }).where(and(
                eq(GamePlayersTable.id, captain1.id),
                eq(GamePlayersTable.gameId, gameId)
            ))
        })


        res.status(200).json({ message: "game started" })

    } catch (error) {
        res.status(500).json({ message: "Cannot start a game" })
    }
})