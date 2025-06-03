import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import "./GameDetails.css"; // Ensure this path is correct
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import useAuthContext from "../hooks/useAuthContext";
import { ClipLoader } from "react-spinners";
import { Player } from "../types/types"; // Assuming this path is correct
import PlayerComponent from "../components/Player"; // Assuming this path is correct

import herb1Img from "../assets/herb-1.png";
import herb2Img from "../assets/herb-2.png";
import herb3Img from "../assets/herb-3.png";
import herb4Img from "../assets/herb-4.png";
import herb5Img from "../assets/herb-5.png";
import herb6Img from "../assets/herb-6.png";

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];

interface TeamPickingState {
    players: Player[];
    teams: {
        captain1: Player[];
        captain2: Player[];
    };
    currentTurn: "captain1" | "captain2";
}

const GameDetailsCard: React.FC = () => {
    const navigate = useNavigate();
    const [teamPickingState, setTeamPickingState] = useState<TeamPickingState | null>(null);
    const { id: gameId } = useParams();
    const socketRef = useRef<Socket | null>(null);
    const { state } = useAuthContext();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [captain1HerbSrc, setCaptain1HerbSrc] = useState<string | null>(null);
    const [captain2HerbSrc, setCaptain2HerbSrc] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:4000/api/games/teams-picking/${gameId}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    setIsLoading(false);
                    const errData = await response.json();
                    setError(errData.message || "Failed to fetch game details");
                    return;
                }

                const data = await response.json();
                setTeamPickingState(data);
                setIsLoading(false);
            } catch (error) {
                setError("An error occurred while fetching game details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    useEffect(() => {
        if (teamPickingState) {
            // Set random herbs once teamPickingState is loaded
            const getRandomHerb = (): string => {
                const selectedHerbAsset = herbImages[Math.floor(Math.random() * herbImages.length)];
                // Assert that selectedHerbAsset is a string at runtime.
                // 'unknown' is a safer intermediate step for assertion than 'any'.
                return selectedHerbAsset as unknown as string;
            };

            if (!captain1HerbSrc) {
                setCaptain1HerbSrc(getRandomHerb());
            }
            if (!captain2HerbSrc) {
                setCaptain2HerbSrc(getRandomHerb());
            }
        }
    }, [teamPickingState, captain1HerbSrc, captain2HerbSrc]);


    useEffect(() => {
        const socket = io("http://localhost:4000");
        socketRef.current = socket;

        socket.on("team-updated", (data: TeamPickingState) => {
            setTeamPickingState(data);
        });

        socket.on("status-changed", (data: { gameId: string; status: string }) => {
            if (data.status === "ready" && data.gameId === gameId) {
                navigate("/");
            }
        });

        return () => {
            socket.off("team-updated");
            socket.disconnect();
        };
    }, [gameId, navigate]);

    const handlePlayerClick = (player: Player) => {
        if (!teamPickingState || player.role !== "player" || !socketRef.current) return;

        // Determine if it's the current user's turn to pick for their team
        const currentUserIsCaptain1 = teamPickingState.teams.captain1.some(p => p.id === state.user?.id);
        const currentUserIsCaptain2 = teamPickingState.teams.captain2.some(p => p.id === state.user?.id);

        let canPick = false;
        if (teamPickingState.currentTurn === "captain1" && currentUserIsCaptain1) {
            canPick = true;
        } else if (teamPickingState.currentTurn === "captain2" && currentUserIsCaptain2) {
            canPick = true;
        }
        // Allow picking if user is one of the captains and it's their team's turn
        // Or, if you have a different logic for who can emit (e.g. any client can try, server validates)
        // For now, assuming only the designated captain for the current turn should pick.

        if (canPick) {
            socketRef.current?.emit("pick-player", {
                gameId,
                playerId: player.id,
                currentTurn: teamPickingState.currentTurn, // Server should validate this based on game state
                emittedBy: state.user?.id // Server should validate this is the correct captain
            });
        } else {
            // Optionally, provide feedback that it's not their turn or they are not the captain
            console.log("Not your turn or you are not the designated captain to pick.");
        }
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
            <div className="GameDetailsCard-content">
                {error && <div className="ErrorDialog">{error}</div>}
                {/* Captain 1 Section */}
                <div className="GameDetailsCard-captain">
                    {captain1HerbSrc && <img src={captain1HerbSrc} alt="Captain 1 Herb" className="captain-herb-image" />}
                    {teamPickingState.teams.captain1.length > 0 ? (
                        <>
                            {/* Optional: Display captain's name if needed, e.g., under the herb */}
                            {/* <p className="captain-name">{teamPickingState.teams.captain1[0].firstName} {teamPickingState.teams.captain1[0].lastName}</p> */}
                            <ul>
                                {teamPickingState.teams.captain1.map((player) => (
                                    <PlayerComponent key={player.id} player={player} />
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No players picked by Captain 1</p>
                    )}
                </div>

                {/* Available Players Section */}
                <div className="GameDetailsCard-players">
                    <ul>
                        {teamPickingState.players
                            .filter(p => p.role === 'player') // Only show players that can be picked
                            .map((player: Player) => (
                                <PlayerComponent key={player.id} player={player} onPlayerClick={handlePlayerClick} />
                            ))}
                    </ul>


                </div>

                {/* Captain 2 Section */}
                <div className="GameDetailsCard-captain">
                    {captain2HerbSrc && <img src={captain2HerbSrc} alt="Captain 2 Herb" className="captain-herb-image" />}
                    {teamPickingState.teams.captain2.length > 0 ? (
                        <>
                            {/* <p className="captain-name">{teamPickingState.teams.captain2[0].firstName} {teamPickingState.teams.captain2[0].lastName}</p> */}
                            <ul>
                                {teamPickingState.teams.captain2.map((player: Player) => ( // Added type Player
                                    <PlayerComponent key={player.id} player={player} />
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No players picked by Captain 2</p>
                    )}
                </div>
            </div>
            <div className="CurrentTurn-container">
                {teamPickingState.teams.captain1.length > 0 && teamPickingState.teams.captain2.length > 0 && (
                    <p className="current-turn-p">Teraz wybiera: {teamPickingState.currentTurn === "captain1"
                        ? `${teamPickingState.teams.captain1[0].firstName} ${teamPickingState.teams.captain1[0].lastName}`
                        : `${teamPickingState.teams.captain2[0].firstName} ${teamPickingState.teams.captain2[0].lastName}`
                    }</p>
                )}
            </div>
        </Card>
    );
};

export default GameDetailsCard;