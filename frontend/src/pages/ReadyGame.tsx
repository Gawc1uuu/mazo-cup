import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';
import './ReadyGame.css';

interface Player {
    id: string;
    email: string;
    username: string;
    role: "player" | "captain1" | "captain2";
}

interface ReadyGameState {
    id: string;
    name: string;
    location: string;
    date: string;
    status: string;
    players: Player[];
    teams: {
        captain1: Player[];
        captain2: Player[];
    };
}

const ReadyGame = () => {
    const [readyGameState, setReadyGameState] = useState<ReadyGameState | null>(null);
    const { id: gameId } = useParams();
    const { state: authState } = useAuthContext();

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/games/ready/${gameId}`);
                if (!response.ok) {
                    console.error('Failed to fetch game details');
                    return;
                }
                const data = await response.json();
                setReadyGameState(data);
            } catch (error) {
                console.error('Error fetching game details:', error);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    if (!readyGameState) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ReadyGame-container">
            <div className='ReadyGame-info-container'>
                <h1 className="ReadyGame-title">{readyGameState.name}</h1>
                <p className="ReadyGame-info">Location: {readyGameState.location}</p>
                <p className="ReadyGame-info">Date: {new Date(readyGameState.date).toLocaleString()}</p>
                <p className="ReadyGame-info">Status: {readyGameState.status}</p>
            </div>

            <div className="ReadyGame-teams">
                <div className="Team Team-left">
                    <h2>Team Captain 1</h2>
                    <ul>
                        {readyGameState.teams.captain1.map((player) => (
                            <li key={player.id}>
                                <p><strong>{player.username}</strong> ({player.role})</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="Team Team-right">
                    <h2>Team Captain 2</h2>
                    <ul>
                        {readyGameState.teams.captain2.map((player) => (
                            <li key={player.id}>
                                <p><strong>{player.username}</strong> ({player.role})</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReadyGame;
