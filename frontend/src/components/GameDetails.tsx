import React, { useEffect, useRef, useState } from "react";
import Card from "./Card";
import "./GameDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import useAuthContext from "../hooks/useAuthContext";
interface Player {
    id: string;
    email: string;
    username: string;
    role: "player" | "captain1" | "captain2";
}

interface TeamPickingState {
    players: Player[];
    teams: {
        captain1: Player[];
        captain2: Player[];
    };
    currentTurn: "captain1" | "captain2";
}



const GameDetailsCard: React.FC = () => {
    const navigate = useNavigate()
    const [teamPickingState, setTeamPickingState] = useState<TeamPickingState | null>(null);
    const { id: gameId } = useParams()
    const socketRef = useRef<Socket | null>(null);
    const { state } = useAuthContext()


    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/games/teams-picking/${gameId}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    console.error("Failed to fetch game details");
                    return;
                }

                const data = await response.json();
                console.log(data)
                setTeamPickingState(data);
            } catch (error) {
                console.error("Error fetching game details:", error);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    useEffect(() => {

        const socket = io("http://localhost:4000");
        socketRef.current = socket;

        // Listen for team-updated events
        socket.on("team-updated", (data: TeamPickingState) => {
            console.log(data)
            setTeamPickingState(data);
        });

        socket.on("status-changed", (data: { gameId: string; status: string }) => {
            if (data.status === "ready" && data.gameId === gameId) {
                navigate("/"); // Redirect to home page
            }
        });


        return () => {
            socket.off("team-updated");
            socket.disconnect();
        };

    }, [])


    // Handle player click to pick a player
    const handlePlayerClick = (player: Player) => {
        console.log("dupaaaaa")
        if (!teamPickingState || player.role !== "player") return;

        console.log("dupa")

        socketRef.current?.emit("pick-player", {
            gameId,
            playerId: player.id,
            currentTurn,
            emittedBy: state.user?.id
        });
    };

    if (!teamPickingState) {
        return <div>Loading game details...</div>;
    }



    const { players, teams, currentTurn } = teamPickingState!;

    console.log(currentTurn)

    return (
        <Card className="GameDetailsCard">
            <div className="GameDetailsCard-captain">
                {teams.captain1.length > 0 ? (
                    <>
                        <h3>Captain 1</h3>
                        <ul>
                            {teams.captain1.map((player) => (
                                <li key={player.id}>{player.username} ({player.email})</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No players picked by Captain 1</p>
                )}
            </div>

            <div className="GameDetailsCard-players">
                <h3>Available Players</h3>
                <ul>
                    {players.map((player: any) => (
                        <li key={player.id} onClick={() => handlePlayerClick(player)}>
                            {player.username} ({player.email})
                        </li>
                    ))}
                </ul>
                <p>Current Turn: {currentTurn === "captain1" ? "Captain 1" : "Captain 2"}</p>
            </div>

            <div className="GameDetailsCard-captain">
                {teams.captain2.length > 0 ? (
                    <>
                        <h3>Captain 2</h3>
                        <ul>
                            {teams.captain2.map((player: any) => (
                                <li key={player.id}>{player.username} ({player.email})</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No players picked by Captain 2</p>
                )}
            </div>
        </Card>
    );
};

export default GameDetailsCard;