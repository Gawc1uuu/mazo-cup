import React, { useState } from "react";
import "./LoginForm.css";
import useAuthContext from "../hooks/useAuthContext";

const LoginForm = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [checked, setChecked] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { dispatch } = useAuthContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Reset error state before submission

        try {
            const res = await fetch("http://localhost:4000/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    checked,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "Failed to login.");
                return;
            }

            const data = await res.json();
            dispatch({ type: "LOGIN", payload: data });
            setEmail("");
            setPassword("");
            setChecked(false);
        } catch (err) {
            setError("An error occurred while logging in.");
        }
    };

    return (
        <form className="LoginForm" onSubmit={handleSubmit}>
            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="example@email.com"
                className="LoginForm-input"
                required
            />
            <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="password"
                className="LoginForm-input"
                required
            />
            <button className="LoginForm-button">Login</button>
            {error && <div className="ErrorDialog">{error}</div>}
        </form>
    );
};

export default LoginForm;
