import React, { useMemo } from 'react';
import './Player.css';
import { Player } from '../types/types';

import ballSVG from "../assets/ball-icon.svg";
import fieldSVG from "../assets/field-icon.svg";
import bootSVG from "../assets/boot-icon.svg";

// Import player images
import playerImg1 from '../assets/player-img-1.png';
import playerImg2 from '../assets/player-img-2.png';
import playerImg3 from '../assets/player-img-3.png';
import playerImg4 from '../assets/player-img-4.png';
import playerImg5 from '../assets/player-img-5.jpeg';
import playerImg6 from '../assets/player-img-6.jpeg';

const playerImages = [
    playerImg1,
    playerImg2,
    playerImg3,
    playerImg4,
    playerImg5,
    playerImg6,
];

interface PlayerStatSet {
    goals: number;
    matchesPlayed: number;
    assists: number;
}

const predefinedPlayerStats: PlayerStatSet[] = [
    { goals: 120, matchesPlayed: 32, assists: 21 }, // Jak Szczepan Borowski z obrazka
    { goals: 12, matchesPlayed: 53, assists: 2 },   // Jak Maksymilian Kwiatkowski
    { goals: 15, matchesPlayed: 121, assists: 30 }, // Jak Leonard Wojciechowski
    { goals: 5, matchesPlayed: 10, assists: 1 },     // Młody talent, mało gier
    { goals: 88, matchesPlayed: 150, assists: 45 },  // Doświadczony strzelec
    { goals: 30, matchesPlayed: 90, assists: 60 },   // Świetny rozgrywający
    { goals: 2, matchesPlayed: 75, assists: 5 },    // Solidny obrońca, mało goli
    { goals: 205, matchesPlayed: 300, assists: 80 }, // Legenda klubu
    { goals: 45, matchesPlayed: 60, assists: 15 },   // Skuteczny napastnik
    { goals: 0, matchesPlayed: 5, assists: 0 },      // Debiutant
    { goals: 67, matchesPlayed: 110, assists: 22 },
    { goals: 9, matchesPlayed: 25, assists: 18 },
];


interface PlayerComponentInterface {
    player: Player;
    onPlayerClick?: (player: Player) => void;
}

const PlayerComponent = ({ player, onPlayerClick }: PlayerComponentInterface) => {
    const selectedImage = useMemo(() => {
        if (!player || typeof player.id === 'undefined') {
            const randomIndex = Math.floor(Math.random() * playerImages.length);
            return playerImages[randomIndex];
        }

        let hash = 0;
        if (typeof player.id === 'string') {
            for (let i = 0; i < player.id.length; i++) {
                hash = (hash << 5) - hash + player.id.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }
        } else if (typeof player.id === 'number') {
            hash = player.id;
        }

        const imageIndex = Math.abs(hash) % playerImages.length;
        return playerImages[imageIndex];
    }, [player]);

    const selectedStats = useMemo(() => {
        if (!player || typeof player.id === 'undefined') {
            const randomIndex = Math.floor(Math.random() * predefinedPlayerStats.length);
            return predefinedPlayerStats[randomIndex];
        }

        let hash = 0;
        // Using a slightly different hashing input by adding a constant string
        // to potentially get different distribution for stats than for images,
        // though for simple modulo it might not always matter much.
        // You could also use a different hashing algorithm or seed if needed.
        const idString = String(player.id) + "stats_seed"; // ensure string for charCodeAt
        for (let i = 0; i < idString.length; i++) {
            hash = (hash << 5) - hash + idString.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }

        const statsIndex = Math.abs(hash) % predefinedPlayerStats.length;
        return predefinedPlayerStats[statsIndex];
    }, [player]);


    const handleClick = () => {
        if (onPlayerClick) {
            onPlayerClick(player);
        }
    };

    return (
        <div
            className={`player ${onPlayerClick ? 'clickable' : ''}`}
            onClick={handleClick}
            tabIndex={onPlayerClick ? 0 : undefined}
            role={onPlayerClick ? "button" : undefined}
        >
            <div className='player-personal'>
                <img
                    src={selectedImage.toString()}
                    alt={`Player ${player.firstName || 'Unknown'}`}
                    className='player-image'
                />
                <div className='player-name'>{player.firstName + " " + player.lastName || 'Player Name'}</div>
            </div>
            <div className='player-stats'>
                <div className='single-stat'>
                    <img
                        src={ballSVG.toString()} // Placeholder or actual SVG path
                        alt="Goals icon"
                        className="stat-icon"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/20x20/ff0000/FFFFFF?text=Err'; }}
                    />
                    <p>{selectedStats.goals}</p>
                </div>
                <div className='single-stat'>
                    <img
                        src={fieldSVG.toString()} // Placeholder or actual SVG path
                        alt="Matches played icon"
                        className="stat-icon"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/20x20/ff0000/FFFFFF?text=Err'; }}
                    />
                    <p>
                        {selectedStats.matchesPlayed}
                    </p>
                </div>
                <div className='single-stat'>
                    <img
                        src={bootSVG.toString()} // Placeholder or actual SVG path
                        alt="Assists icon"
                        className="stat-icon"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/20x20/ff0000/FFFFFF?text=Err'; }}
                    />
                    <p>
                        {selectedStats.assists}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PlayerComponent;