import React, { useEffect, useRef } from 'react'
import "./WaitingGame.css"
import useGamesContext from '../hooks/useGamesContext'
import Card from '../components/Card'
import useAuthContext from '../hooks/useAuthContext'
import { Player } from '../context/GamesContext'
import { io, Socket } from 'socket.io-client'

const WaitingGame = () => {

    const { state, dispatch } = useGamesContext()
    const { state: AuthState } = useAuthContext()
    const socketRef = useRef<Socket | null>(null); // Ref to hold the socket instance


    useEffect(() => {

        const getAllWaitingGames = async () => {
            try {

                const response = await fetch("http://localhost:4000/api/games/all-waiting", {
                    method: "GET"
                })

                if (!response.ok) {
                    console.log("something went wrong")
                }

                const data = await response.json()

                dispatch({ type: "SET_GAMES", payload: data.games })


            } catch (error) {
                console.error(error)
            }
        }


        getAllWaitingGames()

    }, [dispatch])

    useEffect(() => {
        // Initialize socket connection only once
        if (!socketRef.current) {
            socketRef.current = io("http://localhost:4000"); // Replace with your backend URL
        }

        const socket = socketRef.current;

        // Listen for the `player-joined` event
        socket.on("player-joined", (data: { gameId: string; player: Player }) => {

            console.log("dupa", data.gameId)
            dispatch({
                type: "JOIN_GAME",
                payload: {
                    gameId: data.gameId,
                    player: data.player,
                },
            });
        });

        socket.on("status-changed", (data: { gameId: string; status: string }) => {
            if (data.status === "picking_teams") {
                dispatch({
                    type: "STATUS_CHANGE",
                    payload: data.gameId,
                });
            }
        });

        // Cleanup function to remove listeners and disconnect socket
        return () => {
            socket.off("status-changed");
            socket.off("player-joined"); // Remove specific listener
            socket.disconnect(); // Disconnect the socket connection
            socketRef.current = null; // Clear the ref
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
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
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
            id: AuthState.user?.id!, // Replace with the actual current player ID
            email: AuthState.user?.email!, // Replace with current player details
            username: AuthState.user?.username!,
            role: "player",
        };

        console.log(AuthState.user)

        try {
            const response = await fetch(`http://localhost:4000/api/games/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: player.id, gameId }),
            });

            if (!response.ok) {
                console.error("Failed to join the game");
                return;
            }

            const data = await response.json();
            console.log("Joined game:", data);
        } catch (error) {
            console.error("Error while joining the game:", error);
        }
    };



    return (
        <div className='WaitingGames'>
            {state.games.map(game => (
                <Card key={game.id} className='GameCard'>
                    <div className='GameCard-container'>
                        <h3>{game.location}</h3>
                        <p>Location {game.location}</p>
                        <p>Date {formatDate(game.date)}</p>
                        <p>status {game.status}</p>
                        <p>Players count {`${game.players?.length}/6`}</p>
                        <button className="WaitingGame-button" onClick={() => joinGame(game.id)}>Join Game</button>
                        {/* <button className="WaitingGame-button" onClick={() => joinGame(game.id)} disabled={game.players?.some((p) => p.id === AuthState.user?.id)}>Join Game</button> */}
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default WaitingGame