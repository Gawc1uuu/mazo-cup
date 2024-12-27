import express from 'express';
import cors from "cors";
import authRouter from "./routes/authRoutes"
import { createServer } from "http"
import { Server } from "socket.io"


const app = express();


app.use(cors())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.text())
app.use("/api/user", authRouter)



app.listen(4000, () => {
  console.log('Server is running on port 4000');
});