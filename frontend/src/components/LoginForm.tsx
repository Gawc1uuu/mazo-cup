import React, { useState } from 'react'
import "./LoginForm.css"

const LoginForm = () => {
    const [email, setEmail] = useState<string>('')
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