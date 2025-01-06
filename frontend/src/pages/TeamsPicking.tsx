import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TeamsPicking.css";
import { Player } from "../context/GamesContext";
import useAuthContext from "../hooks/useAuthContext"; // Assuming you have a hook for auth context

const TeamsPicking = () => {
    const { id: gameId } = useParams(); // Game ID from the route
    const navigate = useNavigate();
    const { state: authState } = useAuthContext(); // Current user's info

    const [players, setPlayers] = useState<Player[]>([]);
    const [team1, setTeam1] = useState<Player[]>([]);
    const [team2, setTeam2] = useState<Player[]>([]);
    const [captain1, setCaptain1] = useState<Player | null>(null);
    const [captain2, setCaptain2] = useState<Player | null>(null);
    const [currentCaptain, setCurrentCaptain] = useState(1); // 1 or 2 to toggle picking turn

    useEffect(() => {
        // Fetch game details, including captains and players
        const fetchGameDetails = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/games/teams-picking/${gameId}`);
                const data = await response.json();

                console.log(data);

                setPlayers(data.players.filter((player: Player) => player.role !== "captain"));
                const captains = data.players.filter((player: Player) => player.role === "captain");

                if (captains.length === 2) {
                    setCaptain1(captains[0]);
                    setCaptain2(captains[1]);
                }
            } catch (error) {
                console.error("Failed to fetch game details:", error);
            }
        };

        fetchGameDetails();
    }, [gameId]);

    const handlePickPlayer = (playerId: string) => {
        const pickedPlayer = players.find((player) => player.id === playerId);
        if (!pickedPlayer) return;

        if (currentCaptain === 1) {
            setTeam1((prev) => [...prev, pickedPlayer]);
            setCurrentCaptain(2); // Toggle to Captain 2's turn
        } else {
            setTeam2((prev) => [...prev, pickedPlayer]);
            setCurrentCaptain(1); // Toggle to Captain 1's turn
        }

        setPlayers((prev) => prev.filter((player) => player.id !== playerId));
    };

    const handleFinalizeTeams = async () => {
        try {
            await fetch(`http://localhost:4000/api/games/finalize-teams`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId,
                    team1: team1.map((player) => player.id),
                    team2: team2.map((player) => player.id),
                }),
            });

            navigate(`/dashboard`); // Redirect to the dashboard or game-ready screen
        } catch (error) {
            console.error("Failed to finalize teams:", error);
        }
    };

    const isCurrentUserCaptain = () => {
        if (currentCaptain === 1 && authState.user?.id === captain1?.id) return true;
        if (currentCaptain === 2 && authState.user?.id === captain2?.id) return true;
        return false;
    };

    return (
        <div className="teams-picking">
            <h1>Team Selection</h1>
            <div className="teams-container">
                <div className="team">
                    <h2>Captain 1: {captain1?.username}</h2>
                    <div className="team-players">
                        {team1.map((player) => (
                            <p key={player.id}>{player.username}</p>
                        ))}
                    </div>
                </div>

                <div className="available-players">
                    <h2>Available Players</h2>
                    {players.map((player) => (
                        <button
                            key={player.id}
                            onClick={() => handlePickPlayer(player.id)}
                            disabled={!isCurrentUserCaptain()}
                        >
                            {player.username}
                        </button>
                    ))}
                </div>

                <div className="team">
                    <h2>Captain 2: {captain2?.username}</h2>
                    <div className="team-players">
                        {team2.map((player) => (
                            <p key={player.id}>{player.username}</p>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleFinalizeTeams}
                disabled={players.length > 0}
                className="finalize-button"
            >
                Finalize Teams
            </button>
        </div>
    );
};

export default TeamsPicking;
