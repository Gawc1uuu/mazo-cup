import React, { useState, useEffect } from "react";
import "./UpdateGameForm.css"; // Assuming you'll rename or update CreateGameForm.css
import { useNavigate, useParams } from "react-router-dom";

interface GameData {
    id: string;
    name: string;
    location: string;
    date: string; // Expecting ISO date string from API
}

const UpdateGameForm = () => {
    const navigate = useNavigate();
    const { id: gameId } = useParams<{ id: string }>(); // Get gameId from URL

    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [date, setDate] = useState<string>(""); // Stored as string compatible with datetime-local
    const [originalData, setOriginalData] = useState<Partial<GameData>>({});


    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Function to format ISO date string to datetime-local compatible string
    const formatDateForInput = (isoDate: string | undefined): string => {
        if (!isoDate) return "";
        try {
            const d = new Date(isoDate);
            // Check if date is valid
            if (isNaN(d.getTime())) {
                console.error("Invalid date received from API:", isoDate);
                return "";
            }
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return "";
        }
    };

    useEffect(() => {
        if (!gameId) {
            setError("No game ID provided.");
            setIsLoading(false);
            return;
        }

        const fetchGameData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // The GET /game/:id endpoint is public as per current backend code
                const response = await fetch(`http://localhost:4000/api/games/game/${gameId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.message || "Failed to fetch game data.");
                    setIsLoading(false);
                    return;
                }
                const gameData: GameData = await response.json();
                setName(gameData.name);
                setLocation(gameData.location);
                setDate(formatDateForInput(gameData.date));
                setOriginalData({
                    name: gameData.name,
                    location: gameData.location,
                    date: formatDateForInput(gameData.date)
                });

            } catch (err) {
                setError("An error occurred while fetching game data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [gameId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);


        const payload: Partial<GameData> = {};
        if (name !== originalData.name) payload.name = name;
        if (location !== originalData.location) payload.location = location;
        if (date !== originalData.date) payload.date = date;


        if (Object.keys(payload).length === 0) {
            setSuccess("No changes detected to update.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/api/games/update/${gameId}`, {
                method: "PATCH", // Use PATCH for updates
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload), // Send only name, location, date
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "Failed to update the game.");
                return;
            }

            const result = await response.json();
            setSuccess("Game updated successfully!");
            // Update originalData to reflect successful update
            setOriginalData({ name: result.name, location: result.location, date: formatDateForInput(result.date) });
            setTimeout(() => {
                setSuccess(null);
                // Optionally navigate or clear form
                navigate("/waiting-games");
            }, 2000);
        } catch (error) {
            setError("An error occurred while updating the game.");
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="LoadingState">Loading game data...</div>;
    }

    return (
        <form className="CreateGame-form" onSubmit={handleSubmit}>
            <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Game name"
                className="CreateGame-input"
                required
            />
            <input
                onChange={(e) => setLocation(e.target.value)}
                value={location}
                type="text"
                placeholder="Location"
                className="CreateGame-input"
                required
            />
            <input
                onChange={(e) => setDate(e.target.value)}
                value={date}
                type="datetime-local"
                placeholder="Date and time"
                className="CreateGame-input"
                required
            />
            <button className="CreateGame-button" type="submit">
                Update game
            </button>
            {success && <div className="SuccessDialog">{success}</div>}
            {error && <div className="ErrorDialog">{error}</div>}
        </form >
    );
};

export default UpdateGameForm;


