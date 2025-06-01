import React, { useEffect, useRef, useState } from "react";
import "./WaitingGame.css";
import useGamesContext from "../hooks/useGamesContext";
import Card from "../components/Card";
import useAuthContext from "../hooks/useAuthContext";
import { Player } from "../context/GamesContext";
import { io, Socket } from "socket.io-client";
import { ClipLoader } from "react-spinners";

const WaitingGame = () => {
    const { state, dispatch } = useGamesContext();
    const { state: AuthState } = useAuthContext();
    const socketRef = useRef<Socket | null>(null); // Ref to hold the socket instance
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const getAllWaitingGames = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:4000/api/games/all-waiting", {
                    method: "GET",
                });

                if (!response.ok) {
                    const errData = await response.json();
                    setError(errData.message || "Failed to fetch waiting games");
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                dispatch({ type: "SET_GAMES", payload: data.games });
            } catch (error) {
                setError("An error occurred while fetching waiting games");
            } finally {
                setIsLoading(false);
            }
        };

        getAllWaitingGames();
    }, [dispatch]);

    useEffect(() => {
        // Initialize socket connection only once
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:4000"); // Replace with your backend URL
        }

        const socket = socketRef.current;

        // Listen for the `player-joined` event
        socket.on("player-joined", (data: { gameId: string; player: Player }) => {
            console.log(data.player)
            dispatch({
                type: "JOIN_GAME",
                payload: {
                    gameId: data.gameId,
                    player: data.player,
                },
            });
        });

        // Listen for the `status-changed` event
        socket.on("status-changed", (data: { gameId: string; status: string }) => {
            dispatch({
                type: "STATUS_CHANGE",
                payload: data.gameId,
            });
        });

        // Cleanup function to remove listeners and disconnect socket
        return () => {
            socket.off("status-changed");
            socket.off("player-joined");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [dispatch]);

    const formatDate = (isoDate: any) => {
        const date = new Date(isoDate);

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfWeek = daysOfWeek[date.getDay()];

        const day = date.getDate();
        const ordinalSuffix = (n: any) => {
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        };

        const time = date.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();

        return `${day}${ordinalSuffix(day)} ${month} ${year}, ${dayOfWeek}, ${time}`;
    };

    const joinGame = async (gameId: string) => {
        const player: Player = {
            id: AuthState.user?.id!,
            email: AuthState.user?.email!,
            username: AuthState.user?.username!,
            role: "player",
            userId: AuthState.user?.id!
        };

        try {
            const response = await fetch(`http://localhost:4000/api/games/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: player.id, gameId }),
            });

            if (!response.ok) {
                const errData = await response.json();
                setError(errData.message || "Failed to join the game");
                return;
            }
            const data = await response.json();

            console.log("Joined game:", data);
        } catch (error) {
            setError("An error occurred while joining the game");
        }
    };

    if (isLoading) {
        return (
            <div className="WaitingGames-loading">
                <ClipLoader size={50} color="#E78121" />
                <p>Loading waiting games...</p>
            </div>
        );
    }


    return (
        <div className="WaitingGames">
            {error && <div className="WaitingGames-error">
                <p className="ErrorDialog">{error}</p>
            </div>}
            {state.games.map((game) => (
                <Card key={game.id} className="GameCard">
                    <div className="GameCard-container">
                        <h3>{game.location}</h3>
                        <p>Location {game.location}</p>
                        <p>Date {formatDate(game.date)}</p>
                        <p>Status {game.status}</p>
                        <p>Players count {`${game.players?.length}/6`}</p>
                        <button
                            className="WaitingGame-button"
                            onClick={() => joinGame(game.id)}
                            disabled={game.players?.some((p) => p.userId === AuthState.user?.id)}
                        >
                            Join Game
                        </button>
                    </div>
                    {success && (
                        <div className="WaitingGames-success">
                            <p className="SuccessDialog">{success}</p>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default WaitingGame;
