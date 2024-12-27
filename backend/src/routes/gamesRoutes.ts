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


        const [newGame] = await db.insert(GamesTable).values({
            name,
            location,
            date,
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



export default router;