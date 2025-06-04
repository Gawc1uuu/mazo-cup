import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import useAuthContext from '../hooks/useAuthContext'; // Removed as authState was not used
import Card from '../components/Card'; // Assuming Card component exists
import PlayerComponent from '../components/Player'; // Assuming PlayerComponent exists
import { ClipLoader } from 'react-spinners';
import './ReadyGame.css'; // Updated CSS file name

// Assuming herb images are in ../assets relative to this component
// If your assets path is different, please adjust these imports.
import herb1Img from '../assets/herb-1.png';
import herb2Img from '../assets/herb-2.png';
import herb3Img from '../assets/herb-3.png';
import herb4Img from '../assets/herb-4.png';
import herb5Img from '../assets/herb-5.png';
import herb6Img from '../assets/herb-6.png';
import { Player } from '../types/types';

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];



interface ReadyGameState {
    id: string;
    name: string;
    location: string;
    date: string;
    status: string;
    players: Player[]; // This might not be directly used if teams are already formed and detailed
    teams: {
        captain1: Player[];
        captain2: Player[];
    };
    team1Picture: string;
    team2Picture: string;
}

const ReadyGame = () => {
    const [readyGameState, setReadyGameState] = useState<ReadyGameState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id: gameId } = useParams();
    // const { state: authState } = useAuthContext(); // authState not used

    const [captain1HerbSrc, setCaptain1HerbSrc] = useState<string | null>(null);
    const [captain2HerbSrc, setCaptain2HerbSrc] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:4000/api/games/ready/${gameId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    setError(errData.message || 'Failed to fetch game details');
                    // console.error('Failed to fetch game details'); // Error state handles this
                    return;
                }
                const data = await response.json();
                setReadyGameState(data);
            } catch (error) {
                console.error('Error fetching game details:', error);
                setError('An error occurred while fetching game details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    useEffect(() => {
        if (readyGameState) { // Check if game state is loaded
            const getRandomHerb = (): string => {
                return herbImages[Math.floor(Math.random() * herbImages.length)] as unknown as string;
            };

            if (!captain1HerbSrc) {
                setCaptain1HerbSrc(getRandomHerb());
            }
            if (!captain2HerbSrc) {
                setCaptain2HerbSrc(getRandomHerb());
            }
        }
    }, [readyGameState, captain1HerbSrc, captain2HerbSrc]);


    if (isLoading) {
        return (
            <div className="ReadyGame-loading">
                <ClipLoader size={50} color="#E78121" />
                <p>Loading game details...</p>
            </div>
        );
    }

    if (error) {
        return <div className="ErrorDialog ReadyGame-error">{error}</div>;
    }

    if (!readyGameState) {
        // This case should ideally be covered by isLoading or error state
        return <div>Game details not found.</div>;
    }

    // Determine captain names - assuming the first player in the captain's team array is the captain
    // And assuming Player interface has username (or adapt to firstName, lastName if available)
    const captain1Name = readyGameState.teams.captain1.find(p => p.role === 'captain1')?.username || "Captain 1";
    const captain2Name = readyGameState.teams.captain2.find(p => p.role === 'captain2')?.username || "Captain 2";


    return (
        <Card className="ReadyGameCard">
            <div className="ReadyGameCard-content">
                <div className="ReadyGameCard-captain">
                    {<img src={readyGameState.team1Picture ?? captain1HerbSrc} alt="Captain 1 Herb" className="captain-herb-image" />}
                    {readyGameState.teams.captain1.length > 0 ? (
                        <ul>
                            {readyGameState.teams.captain1.map((player) => (
                                <PlayerComponent key={player.id} player={player} />
                            ))}
                        </ul>
                    ) : (
                        <p>Team 1 has no players.</p>
                    )}
                </div>

                {/* Game Info Section (Middle Column) */}
                <div className="ReadyGameCard-info-display">
                    <h2 className="ReadyGameCard-title">{readyGameState.name}</h2>
                    <p className="ReadyGameCard-info"><strong>Lokalizacja:</strong> {readyGameState.location}</p>
                    <p className="ReadyGameCard-info"><strong>Data:</strong> {new Date(readyGameState.date).toLocaleString()}</p>

                </div>

                {/* Captain 2 Section */}
                <div className="ReadyGameCard-captain">
                    {<img src={readyGameState.team2Picture ?? captain1HerbSrc} alt="Captain 2 Herb" className="captain-herb-image" />}
                    {readyGameState.teams.captain2.length > 0 ? (
                        <ul>
                            {readyGameState.teams.captain2.map((player) => (
                                <PlayerComponent key={player.id} player={player} />
                            ))}
                        </ul>
                    ) : (
                        <p>Team 2 has no players.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ReadyGame;