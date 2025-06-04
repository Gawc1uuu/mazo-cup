import React, { useEffect, useRef, useState } from "react";
import "./WaitingGame.css";
import useGamesContext from "../hooks/useGamesContext";
import Card from "../components/Card";
import useAuthContext from "../hooks/useAuthContext";
import { Player } // Assuming Player is correctly typed in GamesContext
    from "../context/GamesContext";
import { io, Socket } from "socket.io-client";
import { ClipLoader } from "react-spinners";

// Import herb images (ensure paths are correct)
import herb1Img from "../assets/herb-1.png";
import herb2Img from "../assets/herb-2.png";
import herb3Img from "../assets/herb-3.png";
import herb4Img from "../assets/herb-4.png";
import herb5Img from "../assets/herb-5.png";
import herb6Img from "../assets/herb-6.png";

import deleteIcon from "../assets/delete-icon.svg"
import updateIcon from "../assets/update-icon.svg"
import { useNavigate } from "react-router-dom";
import { translateGameStatus } from "../utils/mapGameStatus";

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];

// Helper function to get a random herb
const getRandomHerb = () => herbImages[Math.floor(Math.random() * herbImages.length)];

const WaitingGame = () => {
    const { state, dispatch } = useGamesContext();
    const { state: AuthState } = useAuthContext();
    const socketRef = useRef<Socket | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // Consider managing this state's lifecycle
    const navigate = useNavigate();

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
                    return; // Don't proceed further if error
                }

                const data = await response.json();
                console.log(data)
                // Ensure data.games exists, if not, provide an empty array or handle error
                dispatch({ type: "SET_GAMES", payload: data.games || [] });
            } catch (error) {
                console.error("Error fetching waiting games:", error); // Log the actual error
                setError("An error occurred while fetching waiting games");
            } finally {
                setIsLoading(false);
            }
        };

        getAllWaitingGames();
    }, [dispatch]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:4000");
        }
        const socket = socketRef.current;

        const handlePlayerJoined = (data: { gameId: string; player: Player }) => {
            // console.log("Player joined event data:", data);
            dispatch({
                type: "JOIN_GAME",
                payload: {
                    gameId: data.gameId,
                    player: data.player,
                },
            });
        };

        const handleStatusChanged = (data: { gameId: string; status: string }) => {
            // console.log("Status changed event data:", data);
            dispatch({
                type: "STATUS_CHANGE", // This action type should remove the game from waiting list
                payload: data.gameId,
            });
        };

        socket.on("player-joined", handlePlayerJoined);
        socket.on("status-changed", handleStatusChanged);

        return () => {
            socket.off("player-joined", handlePlayerJoined);
            socket.off("status-changed", handleStatusChanged);
            // It's often better to disconnect the socket when the component unmounts
            // if the socket is specific to this component's lifecycle.
            // If the socket is global or managed by a context, this might be different.
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [dispatch]);

    const formatDate = (isoDate: string) => { // Typed isoDate
        const date = new Date(isoDate);
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfWeek = daysOfWeek[date.getDay()];
        const day = date.getDate();
        const ordinalSuffix = (n: number) => { // Typed n
            if (n > 3 && n < 21) return "th";
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        const time = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear();
        return `${day}${ordinalSuffix(day)} ${month} ${year}, ${dayOfWeek}, ${time}`;
    };

    const joinGame = async (gameId: string) => {
        if (!AuthState.user) {
            setError("You must be logged in to join a game.");
            return;
        }
        // Construct player object carefully, ensuring all fields are present if non-nullable
        const player: Player = {
            id: AuthState.user.id, // Assumes id is non-null
            email: AuthState.user.email, // Assumes email is non-null
            username: AuthState.user.username, // Assumes username is non-null
            firstName: AuthState.user.firstName || "", // Provide default if potentially null
            lastName: AuthState.user.lastName || "", // Provide default if potentially null
            role: "player",
            userId: AuthState.user.id // Assumes userId is same as id
        };

        // Prevent multiple join attempts while one is in progress (optional)
        // setIsLoading(true); 
        // setError(null);
        // setSuccess(null);

        try {
            const response = await fetch(`http://localhost:4000/api/games/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: player.id, gameId }),
            });

            if (!response.ok) {
                const errData = await response.json();
                setError(errData.message || "Failed to join the game");
                return; // Important: return after setting error
            }
            // const data = await response.json(); // data might not be used directly if socket updates state
            // setSuccess("Successfully requested to join the game! Waiting for server confirmation."); 
            // The actual join confirmation comes via socket 'player-joined'
        } catch (error) {
            console.error("Error joining game:", error);
            setError("An error occurred while joining the game");
        } finally {
            // setIsLoading(false); // Reset loading if you set it at the start of joinGame
        }
    };

    if (isLoading && state.games.length === 0) { // Show loading only if no games are displayed yet
        return (
            <div className="WaitingGames-feedback-container"> {/* Centering container */}
                <ClipLoader size={50} color="#E78121" />
                <p>Loading waiting games...</p>
            </div>
        );
    }

    const handleDeleteGame = async (gameId: string) => {
        console.log("Delete game:", gameId);
        try {
            const response = await fetch(`http://localhost:4000/api/games/delete/${gameId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errData = await response.json();
                setError(errData.message || "Failed to join the game");
                return;
            }

            dispatch({ type: 'DELETE_GAME', payload: gameId })
        } catch (error) {
            console.error("Error joining game:", error);
            setError("An error occurred while joining the game");
        }
    };

    const handleUpdateGame = (gameId: string) => {
        navigate(`/games/update/${gameId}`);
    };

    return (
        <div className="WaitingGames-list-container">
            {error && (
                <div className="WaitingGames-feedback-container">
                    <p className="ErrorDialog">{error}</p>
                </div>
            )}
            {success && ( // Global success message
                <div className="WaitingGames-feedback-container">
                    <p className="SuccessDialog">{success}</p>
                </div>
            )}

            {state.games.length === 0 && !isLoading && !error && (
                <div className="WaitingGames-feedback-container">
                    <p className="WaitingGames-no-games">Brak meczy czekających na graczy.</p>
                </div>
            )}

            {state.games.map((game) => {
                const herbSrcLeft = getRandomHerb();
                const herbSrcRight = getRandomHerb();
                const isPlayerAlreadyInGame = game.players?.some((p) => p.userId === AuthState.user?.id);
                const isUserCreator = game.createdBy && AuthState.user && game.createdBy === AuthState.user.id;

                return (
                    <Card key={game.id} className="GameCard">
                        {isUserCreator && ( // Only show icons if the user is the creator
                            <div className="GameCard-icons-container">
                                <img
                                    src={updateIcon.toString()}
                                    alt="Update Game"
                                    className="GameCard-icon"
                                    onClick={() => handleUpdateGame(game.id)}
                                />
                                <img
                                    src={deleteIcon.toString()}
                                    alt="Delete Game"
                                    className="GameCard-icon GameCard-icon-delete"
                                    onClick={() => handleDeleteGame(game.id)}
                                />
                            </div>
                        )}
                        <div className="GameCard-decorated-content">
                            <img src={game.team1Picture ?? herbSrcLeft.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-left" />
                            <div className="GameCard-details-container">
                                <h3>{game.name || `Game at ${game.location}`}</h3>
                                <p><strong>Lokalizacja:</strong> {game.location}</p>
                                <p><strong>Data:</strong> {formatDate(game.date)}</p>
                                <p><strong>Status:</strong> <span className={`status-${game.status.toLowerCase()}`}>{translateGameStatus(game.status)}</span></p>
                                <p><strong>Gracze:</strong> {`${game.players?.length || 0}/6`}</p>
                                <button
                                    className="WaitingGame-button"
                                    onClick={() => joinGame(game.id)}
                                    disabled={isPlayerAlreadyInGame || game.players?.length! >= 6} // Disable if full or user already joined
                                >
                                    {isPlayerAlreadyInGame ? "Already Joined" : (game.players?.length! >= 6 ? "Game Full" : "Join Game")}
                                </button>
                            </div>
                            <img src={game.team2Picture ?? herbSrcRight.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-right" />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default WaitingGame;
