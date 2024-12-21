import React, { useState } from 'react'
import "./RegisterForm.css"

const RegisterForm = () => {
    const [email, setEmail] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [checked, setChecked] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email)
        console.log(password)
        console.log(checked)

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