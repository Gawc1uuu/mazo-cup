import React, { useState } from 'react'
import "./RegisterForm.css"
import useAuthContext from '../hooks/useAuthContext'

const RegisterForm = () => {
    const { dispatch } = useAuthContext()
    const [email, setEmail] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [checked, setChecked] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email)
        console.log(password)
        console.log(checked)

        const res = await fetch("http://localhost:4000/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                username,
                password,
                checked
            })
        })

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Registration failed:", errorData);
            return;
        }

        const user = await res.json();


        dispatch({ type: "LOGIN", payload: user })


        setEmail('')
        setUsername('')
        setPassword('')
        setChecked(false)
    }

    return (
        <form className='RegisterForm' onSubmit={handleSubmit}>
            <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="example@email.com"
                className='RegisterForm-input'
            />
            <input
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                type="text"
                placeholder="username"
                className='RegisterForm-input'
            />

            <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="password"
                className='RegisterForm-input'
            />
            <label className='RegisterForm-checkbox'>
                <input type="checkbox" checked={checked} onChange={handleChange} />
                I agree for processing my personal data
            </label>
            <button className='RegisterForm-button'>Login</button>
        </form>
    )
}

export default RegisterForm