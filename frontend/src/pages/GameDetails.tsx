import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import "./GameDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import useAuthContext from "../hooks/useAuthContext";
import { ClipLoader } from "react-spinners";

interface Player {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
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
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)


    useEffect(() => {
        const fetchGameDetails = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(`http://localhost:4000/api/games/teams-picking/${gameId}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    setIsLoading(false)
                    const errData = await response.json();
                    console.log("dupaaaaa")

                    console.log(errData)
                    setError(errData.message || "Failed to fetch game details");
                    return;
                }

                const data = await response.json();
                setTeamPickingState(data);
                setIsLoading(false)
            } catch (error) {
                setError("An error occurred while fetching game details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    useEffect(() => {

        const socket = io("http://localhost:4000");
        socketRef.current = socket;

        // Listen for team-updated events
        socket.on("team-updated", (data: TeamPickingState) => {
            // Aktualizacja stanu komponentu w czasie rzeczywistym
            setTeamPickingState(data);
        });

        socket.on("status-changed", (data: { gameId: string; status: string }) => {
            // Reakcja na zmianę statusu meczu (np. przekierowanie)
            if (data.status === "ready" && data.gameId === gameId) {
                navigate("/");
            }
        });


        return () => {
            // Czyszczenie subskrypcji, aby uniknąć wycieków pamięci
            socket.off("team-updated");
            socket.disconnect();
        };

    }, [])


    // Handle player click to pick a player
    const handlePlayerClick = (player: Player) => {
        if (!teamPickingState || player.role !== "player") return;


        socketRef.current?.emit("pick-player", {
            gameId,
            playerId: player.id,
            currentTurn: teamPickingState.currentTurn,
            emittedBy: state.user?.id
        });
    };

    if (isLoading || !teamPickingState) {
        return (
            <div className="GameDetails-loading">
                <ClipLoader size={50} color="#E78121" />
                <p>Loading game details...</p>
            </div>
        );
    }



    return (
        <Card className="GameDetailsCard">
            {error && <div className="ErrorDialog">{error}</div>}
            <div className="GameDetailsCard-captain">
                {teamPickingState.teams.captain1.length > 0 ? (
                    <>
                        <h3>Captain 1</h3>
                        <ul>
                            {teamPickingState.teams.captain1.map((player) => (
                                <li key={player.id}>{player.email}</li>
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
                    {teamPickingState.players.map((player: Player) => (
                        <li key={player.id} onClick={() => handlePlayerClick(player)}>
                            {`${player.firstName} ${player.lastName}`}
                        </li>
                    ))}
                </ul>
                <p>Current Turn: {teamPickingState.currentTurn === "captain1" ? teamPickingState.teams.captain1[0].firstName : teamPickingState.teams.captain2[0].firstName}</p>
            </div>

            <div className="GameDetailsCard-captain">
                {teamPickingState.teams.captain2.length > 0 ? (
                    <>
                        <h3>Captain 2</h3>
                        <ul>
                            {teamPickingState.teams.captain2.map((player: any) => (
                                <li key={player.id}>{`${player.firstName} ${player.lastName}`}</li>
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