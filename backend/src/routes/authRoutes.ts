import express, { Request, Response } from "express"

const router = express.Router();

router.post("/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log(email)
    console.log(password)

    res.json({ message: "Login successful" });
})


router.post("/register", (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    console.log(email)


    res.send("rehister route")
})



export default router;