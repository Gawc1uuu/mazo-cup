import React, { useEffect, useState } from 'react';
import "./AllReadyGames.css";
import Card from '../components/Card';
import useGamesContext from '../hooks/useGamesContext';
import useAuthContext from '../hooks/useAuthContext';
// Make sure Player type is imported if game.players is used more extensively,
// though here it's just for game.players.length
// import { Player } from '../types/types'; 
import { ClipLoader } from 'react-spinners';
import herb1Img from "../assets/herb-1.png";
import herb2Img from "../assets/herb-2.png";
import herb3Img from "../assets/herb-3.png";
import herb4Img from "../assets/herb-4.png";
import herb5Img from "../assets/herb-5.png";
import herb6Img from "../assets/herb-6.png";
import { Link } from 'react-router-dom';

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];

// Helper function to get a random herb
const getRandomHerb = () => herbImages[Math.floor(Math.random() * herbImages.length)];

const AllReadyGames = () => {
    const { state, dispatch } = useGamesContext();
    const { state: AuthState } = useAuthContext();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null); // This state is set but never cleared in the original code. Consider managing its lifecycle.

    useEffect(() => {
        const getAllReadyGames = async () => { // Renamed for clarity, as it fetches 'ready' games
            setIsLoading(true);
            setError(null);

            try {
                // Assuming AuthState.user.id is defined when this component mounts.
                // Add a check for AuthState.user if necessary.
                if (!AuthState.user) {
                    setError("User not authenticated.");
                    setIsLoading(false);
                    return;
                }
                const response = await fetch(`http://localhost:4000/api/games/ready?userId=${AuthState.user.id}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    const errData = await response.json();
                    setError(errData.message || "Failed to fetch ready games");
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                // console.log(data) // Keep for debugging if needed
                dispatch({ type: "SET_GAMES", payload: data });
            } catch (error) {
                setError("An error occurred while fetching ready games");
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch if user is available to prevent calling API with undefined userId
        if (AuthState.user) {
            getAllReadyGames();
        } else {
            // Optionally, set loading to false if there's no user and no fetch will occur
            // Or display a message "Please log in to see games"
            setIsLoading(false);
        }
    }, [dispatch, AuthState.user]); // Added AuthState.user to dependency array

    const formatDate = (isoDate: string) => { // Typed isoDate as string
        const date = new Date(isoDate);

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfWeek = daysOfWeek[date.getDay()];

        const day = date.getDate();
        const ordinalSuffix = (n: number) => { // Typed n as number
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

    if (isLoading) {
        return (
            <div className="AllReadyGames-loading"> {/* Updated class name for consistency */}
                <ClipLoader size={50} color="#E78121" />
                <p>Loading ready games...</p>
            </div>
        );
    }

    return (
        <div className="AllReadyGames-container"> {/* Changed class from WaitingGames to AllReadyGames-container */}
            {error && (
                <div className="AllReadyGames-error">
                    <p className="ErrorDialog">{error}</p>
                </div>
            )}
            {state.games.length === 0 && !isLoading && !error && (
                <p className="AllReadyGames-no-games">Brak meczy w których bierzesz udział.</p>
            )}
            {state.games.map((game) => {
                // Get two random herbs for each card
                const herbSrcLeft = getRandomHerb();
                const herbSrcRight = getRandomHerb();

                return (
                    <Card key={game.id} className="GameCard">
                        <div className="GameCard-decorated-content">
                            <img src={herbSrcLeft.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-left" />
                            <div className="GameCard-details-container"> {/* Renamed from GameCard-container for clarity */}
                                <h3>{game.name || `Game at ${game.location}`}</h3> {/* Display game name if available */}
                                <p><strong>Location:</strong> {game.location}</p>
                                <p><strong>Date:</strong> {formatDate(game.date)}</p>
                                <p><strong>Status:</strong> <span className={`status-${game.status.toLowerCase()}`}>{game.status}</span></p>
                                <Link className='see-more-link' to={`/ready/${game.id}`}>Zobacz więcej</Link>
                                {/* Assuming max players is 6. Adjust if this info comes from game data */}
                            </div>
                            <img src={herbSrcRight.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-right" />
                        </div>
                        {success && ( // This success message is global to all cards if not reset.
                            <div className="AllReadyGames-success">
                                <p className="SuccessDialog">{success}</p>
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}

export default AllReadyGames;