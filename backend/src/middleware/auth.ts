import jwt, { JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from '../database/db';
import { UserTable } from '../database/schema';
import { Request, Response, NextFunction } from 'express';
dotenv.config()

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        console.log(req.headers)
        if (!authorization) {
            res.status(401).json({ message: "Unauthorized" })
        }

        const token = authorization!.split(" ")[1];

        const { userId } = jwt.verify(token, process.env.SECRET!) as JwtPayload;
        const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId))
        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "something went wrong" })
    }
}


export default authMiddleware;