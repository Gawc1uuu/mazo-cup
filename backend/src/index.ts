import express from 'express';
import cors from "cors";
import authRouter from "./routes/authRoutes"
import gamesRouter from "./routes/gamesRoutes"
import { createServer } from "http"
import { Server } from "socket.io"
import { setupWebSocket } from './socket/socket';


const app = express();

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
})


app.use(cors())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.text())
app.use("/api/user", authRouter)
app.use("/api/games", gamesRouter)


setupWebSocket(server);

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});