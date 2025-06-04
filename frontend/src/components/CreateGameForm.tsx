import React, { useState } from "react";
import "./CreateGameForm.css";
import { useNavigate } from "react-router-dom";
import herb1Img from "../assets/herb-1.png";
import herb2Img from "../assets/herb-2.png";
import herb3Img from "../assets/herb-3.png";
import herb4Img from "../assets/herb-4.png";
import herb5Img from "../assets/herb-5.png";
import herb6Img from "../assets/herb-6.png";

const herbImages = [herb1Img, herb2Img, herb3Img, herb4Img, herb5Img, herb6Img];

const getRandomHerb = () => herbImages[Math.floor(Math.random() * herbImages.length)];


const CreateGameForm = () => {
    const navigate = useNavigate();

    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const userInfo = localStorage.getItem("user");
        if (!userInfo) {
            setError("You are not authorized. Please log in.");
            return;
        }
        const parsedUser = JSON.parse(userInfo);

        try {
            const response = await fetch("http://localhost:4000/api/games/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${parsedUser.token}`
                },
                body: JSON.stringify({
                    name,
                    location,
                    date,
                    createdBy: parsedUser.id,
                    team1Pic: getRandomHerb().toString(),
                    team2Pic: getRandomHerb().toString()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "Failed to create the game.");
                return;
            }

            const result = await response.json();
            setSuccess("Game created successfully!");
            setTimeout(() => navigate("/waiting-games"), 2000);
        } catch (error) {
            setError("An error occurred while creating the game.");
            console.error(error);
        }
    };

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
                Create game
            </button>
            {success && <div className="SuccessDialog">{success}</div>}
            {error && <div className="ErrorDialog">{error}</div>}
        </form>
    );
};

export default CreateGameForm;
