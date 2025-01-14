import React, { useEffect } from 'react'
import "./MyTeamsPicking.css"
import useAuthContext from '../hooks/useAuthContext'
import useGamesContext from '../hooks/useGamesContext'
import Card from '../components/Card'
import { Link } from 'react-router-dom'

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

                console.log(data)

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
                {state.games.map((game) => (
                    <Card key={game.id} className="MyTeamsPicking-card">
                        <div className="MyTeamsPicking-card-container">
                            <h3>{game.name}</h3>
                            <p>Location: {game.location}</p>
                            <p>Date: {new Date(game.date).toLocaleString()}</p>
                            <Link to={`/teams-picking/${game.id}`}>
                                <button
                                    className="MyTeamsPicking-button"
                                >
                                    View Details
                                </button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default MyTeamsPicking