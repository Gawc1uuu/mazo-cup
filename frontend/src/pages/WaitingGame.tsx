import React, { useEffect } from 'react'
import "./WaitingGame.css"
import useGamesContext from '../hooks/useGamesContext'
import Card from '../components/Card'

const WaitingGame = () => {

    const { state, dispatch } = useGamesContext()

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
                console.log(data)

                dispatch({ type: "SET_GAMES", payload: data.games })


            } catch (error) {
                console.error(error)
            }
        }


        getAllWaitingGames()

    }, [])

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


    return (
        <div className='WaitingGames'>
            {state.games.map(game => (
                <Card key={game.id} className='GameCard'>
                    <div className='GameCard-container'>
                        <h3>{game.name}</h3>
                        <p>Location {game.location}</p>
                        <p>Date {formatDate(game.date)}</p>
                        <p>status {game.status}</p>
                        <p>Players count</p>
                        <button className="WaitingGame-button">Join Game</button>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default WaitingGame