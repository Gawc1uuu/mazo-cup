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

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from React app
    methods: ['GET', 'POST'],       // Allowed HTTP methods
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});


server.listen(4000, () => {
  console.log('Server is running on port 4000');
});