import express, { Request, Response } from "express"
import { db } from "../database/db";
import { UserTable } from "../database/schema";
import { eq } from "drizzle-orm"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config()

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const [existingUser] = await db.select().from(UserTable).where(eq(UserTable.email, email));

        if (!existingUser) {
            res.status(404).json({ message: "User not found" })
        }

        const isValidPassword = await bcrypt.compare(password, existingUser.password);

        if (!isValidPassword) {
            res.status(401).json({ message: "Bad password" })
        }
        const token = jwt.sign({ userId: existingUser.id }, process.env.SECRET!, { expiresIn: "7d" })

        res.status(200).json({ id: existingUser.id, email: existingUser.email, username: existingUser.username, token })
        return;
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})


router.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const [existingUser] = await db.select().from(UserTable).where(eq(UserTable.email, email));

        console.log(existingUser)

        if (existingUser) {
            res.status(400).json({ message: "User with that email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        console.log(hashedPassword)

        const [newUser] = await db.insert(UserTable).values({
            email,
            password: hashedPassword,
            username
        }).returning();

        console.log(newUser)

        const token = jwt.sign({ userId: newUser.id }, process.env.SECRET!, { expiresIn: "7d" });

        // Respond with the new user details and the token
        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            token

        });
        return;
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Someting went wrong", error })
    }
});



export default router;