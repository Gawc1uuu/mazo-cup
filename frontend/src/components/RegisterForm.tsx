import React, { useState } from "react";
import "./RegisterForm.css";
import useAuthContext from "../hooks/useAuthContext";

const RegisterForm = () => {
    const { dispatch } = useAuthContext();
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [checked, setChecked] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Reset error state before submission

        // Validate that the checkbox is checked
        if (!checked) {
            setError("You must agree to the processing of your personal data.");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    username,
                    firstName,
                    lastName,
                    password,
                    checked,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "Registration failed.");
                return;
            }

            const user = await res.json();
            dispatch({ type: "LOGIN", payload: user });

            // Reset form fields
            setEmail("");
            setUsername("");
            setFirstName("")
            setLastName("")
            setPassword("");
            setChecked(false);
        } catch (err) {
            setError("An error occurred during registration.");
        }
    };

    return (
        <form className="RegisterForm" onSubmit={handleSubmit}>

            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="E-mail"
                className="RegisterForm-input"
                required
            />
            <input
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                type="text"
                placeholder="Nazwa uzytkownika"
                className="RegisterForm-input"
                required
            />
            <input
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                type="text"
                placeholder="Imię"
                className="RegisterForm-input"
                required
            />
            <input
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                type="text"
                placeholder="Nazwisko"
                className="RegisterForm-input"
                required
            />
            <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Hasło"
                className="RegisterForm-input"
                required
            />
            <label className="RegisterForm-checkbox">
                <input type="checkbox" checked={checked} onChange={handleChange} />
                Zgadam się na przetwarzanie moich danych
            </label>
            <button className="RegisterForm-button" type="submit">
                Zarejestruj
            </button>
            <div className="RegisterForm-error-container">
                {error && <div className="ErrorDialog">{error}</div>}
            </div>
        </form>
    );
};

export default RegisterForm;
