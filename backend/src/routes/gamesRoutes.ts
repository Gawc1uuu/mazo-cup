import express, { Request, Response } from "express"
import { db } from "../database/db";
import { GamesTable, UserTable } from "../database/schema";
import { eq } from "drizzle-orm"
import dotenv from "dotenv";
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
        const allWaitingGames = await db.select().from(GamesTable).where(eq(
            GamesTable.status, "waiting"
        ))

        console.log(allWaitingGames)


        res.status(200).json({ games: allWaitingGames });
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Cannot get games" })
    }
})



export default router;