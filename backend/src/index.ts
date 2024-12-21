import express from 'express';
const app = express();
import cors from "cors";
import authRouter from "./routes/authRoutes"

app.use(cors())
app.use(express.json())
app.use(express.urlencoded())
app.use(express.text())
app.use("/api/user", authRouter)

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});