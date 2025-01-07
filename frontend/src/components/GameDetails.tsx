import React, { useEffect, useState } from "react";
import Card from "./Card";
import "./GameDetails.css";
import { useParams } from "react-router-dom";

interface Player {
    id: string;
    email: string;
    username: string;
    role: "player" | "captain";
}

interface Game {
    id: string;
    location: string;
    date: string;
    name: string;
    createdBy: string;
    createdAt: string;
    status: "waiting" | "picking_teams" | "ready";
    players?: Player[];
}



const GameDetailsCard: React.FC = () => {
    const [gameData, setGameData] = useState<Game | null>(null);
    const { id: gameId } = useParams()

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
                setGameData(data);
            } catch (error) {
                console.error("Error fetching game details:", error);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    if (!gameData) {
        return <div>Loading game details...</div>;
    }

    const captains = gameData.players?.filter((player) => player.role === "captain") || [];
    const players = gameData.players?.filter((player) => player.role === "player") || [];

    return (
        <Card className="GameDetailsCard">
            <div className="GameDetailsCard-captain">
                {captains[0] ? (
                    <div>
                        <h3>Captain 1</h3>
                        <p>{captains[0].username}</p>
                        <p>{captains[0].email}</p>
                    </div>
                ) : (
                    <p>No captain assigned</p>
                )}
            </div>

            <div className="GameDetailsCard-players">
                <h3>Players</h3>
                <ul>
                    {players.map((player) => (
                        <li key={player.id}>
                            {player.username} ({player.email})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="GameDetailsCard-captain">
                {captains[1] ? (
                    <div>
                        <h3>Captain 2</h3>
                        <p>{captains[1].username}</p>
                        <p>{captains[1].email}</p>
                    </div>
                ) : (
                    <p>No captain assigned</p>
                )}
            </div>
        </Card>
    );
};

export default GameDetailsCard;
