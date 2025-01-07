import { Server } from "socket.io";

let io: any; // WebSocket instance

export const setupWebSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Replace with your frontend URL
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: any) => {
        console.log("A user connected");

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
};

export const emitPlayerJoined = (data: { gameId: string, player: any }) => {
    if (io) {
        io.emit("player-joined", data);
    }
};


export const emitStatusChanged = (data: { gameId: string; status: string }) => {
    if (io) {
        io.emit("status-changed", data);
    }
};