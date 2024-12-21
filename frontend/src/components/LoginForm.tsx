import React, { useState } from 'react'
import "./LoginForm.css"
import useAuthContext from '../hooks/useAuthContext'

const LoginForm = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [checked, setChecked] = useState<boolean>(false)
    const { dispatch } = useAuthContext()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email)
        console.log(password)
        console.log(checked)

        const res = await fetch("http://localhost:4000/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Specify the correct content type
            },
            body: JSON.stringify({
                email,
                password,
                checked
            })
        })

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Registration failed:", errorData);
            return;
        }

        const data = await res.json()

        dispatch({ type: "LOGIN", payload: data })
        setEmail('')
        setPassword('')
        setChecked(false)
    }

    return (
        <form className='LoginForm' onSubmit={handleSubmit}>
            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="example@email.com"
                className='LoginForm-input'
            />
            <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="password"
                className='LoginForm-input'
            />
            <label className='LoginForm-checkbox'>
                <input type="checkbox" checked={checked} onChange={handleChange} />
                I agree for processing my personal data
            </label>
            <button className='LoginForm-button'>Login</button>
        </form>
    )
}

export default LoginForm