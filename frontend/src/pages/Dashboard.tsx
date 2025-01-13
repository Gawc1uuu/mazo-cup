import { useEffect, useState } from "react"
import useAuthContext from "../hooks/useAuthContext"
import useGamesContext from "../hooks/useGamesContext"
import Card from "../components/Card"
import "./Dashboard.css"
import { Link } from "react-router-dom"
import { ClipLoader } from "react-spinners"

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


const Dashboard = () => {
    const { state: AuthState } = useAuthContext()
    const { state, dispatch } = useGamesContext()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchAllReadyGames = async () => {
            setIsLoading(true);
            setError(null); // Reset error state

            try {
                const res = await fetch(`http://localhost:4000/api/games/ready?userId=${AuthState.user?.id}`, { method: "GET" });

                if (!res.ok) {
                    const errorData = await res.json();
                    setError(errorData.message || "Failed to fetch games.");
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();
                dispatch({ type: "SET_GAMES", payload: data });
            } catch (err) {
                setError("An error occurred while fetching games.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllReadyGames();
    }, [dispatch]);


    if (isLoading) {
        return (
            <div className="Dashboard-loading">
                <ClipLoader size={50} color="#E78121" />
                <p>Loading games...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ErrorDialog">
                <p>{error}</p>
            </div>
        );
    }


    return (
        <div className='Dasboard-container'>
            {state.games.map((game) => (
                <Card key={game.id} className="GameCard">
                    <div className="GameCard-container">
                        <h3>{game.name}</h3>
                        <p>Location: {game.location}</p>
                        <p>Date: {formatDate(game.date)}</p>

                        <button className="Dashboard-button">
                            <Link to={`/ready/${game.id}`}>
                                See details
                            </Link>
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default Dashboard