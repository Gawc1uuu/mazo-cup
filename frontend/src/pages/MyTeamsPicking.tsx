import React, { useEffect } from 'react'
import "./MyTeamsPicking.css"
import useAuthContext from '../hooks/useAuthContext'
import useGamesContext from '../hooks/useGamesContext'
import Card from '../components/Card'
import { ClipLoader } from 'react-spinners';
import herb1Img from "../assets/herb-1.png";
import herb2Img from "../assets/herb-2.png";
import herb3Img from "../assets/herb-3.png";
import herb4Img from "../assets/herb-4.png";
import herb5Img from "../assets/herb-5.png";
import herb6Img from "../assets/herb-6.png";
import { Link } from 'react-router-dom';
import { translateGameStatus } from '../utils/mapGameStatus'

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

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];

// Helper function to get a random herb
const getRandomHerb = () => herbImages[Math.floor(Math.random() * herbImages.length)];

const MyTeamsPicking = () => {

    const { state: AuthState } = useAuthContext()
    const { state, dispatch } = useGamesContext()

    useEffect(() => {

        const getAllWaitingGames = async () => {
            try {

                console.log(AuthState.user?.id)
                const response = await fetch(`http://localhost:4000/api/games/teams-picking?userId=${AuthState.user?.id}`, {
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


        if (AuthState.user?.id) {
            getAllWaitingGames();
        }

    }, [AuthState.user?.id])

    return (
        <div className="MyTeamsPicking">
            <div className="MyTeamsPicking-container">
                {state.games.length === 0 && (
                    <p className="AllReadyGames-no-games">Brak meczy w których bierzesz udział.</p>
                )}
                {state.games.map((game) => {
                    // Get two random herbs for each card
                    const herbSrcLeft = getRandomHerb();
                    const herbSrcRight = getRandomHerb();

                    return (
                        <Card key={game.id} className="GameCard">
                            <div className="GameCard-decorated-content">
                                <img src={game.team1Picture ?? herbSrcLeft.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-left" />
                                <div className="GameCard-details-container"> {/* Renamed from GameCard-container for clarity */}
                                    <h3>{game.name || `Game at ${game.location}`}</h3> {/* Display game name if available */}
                                    <p><strong>Location:</strong> {game.location}</p>
                                    <p><strong>Date:</strong> {formatDate(game.date)}</p>
                                    <p><strong>Status:</strong> <span className={`status-${game.status.toLowerCase()}`}>{translateGameStatus(game.status)}</span></p>
                                    <Link className='see-more-link' to={`/ready/${game.id}`}>Zobacz więcej</Link>
                                    {/* Assuming max players is 6. Adjust if this info comes from game data */}
                                </div>
                                <img src={game.team2Picture ?? herbSrcRight.toString()} alt="Decorative Herb" className="GameCard-herb GameCard-herb-right" />
                            </div>

                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default MyTeamsPicking