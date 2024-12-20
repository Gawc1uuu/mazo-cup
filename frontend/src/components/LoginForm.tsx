import React from 'react'
import "./LoginForm.css"

const LoginForm = () => {
    return (
        <form>
            <div className='LoginForm-container'>
                <input
                    type="text"
                    placeholder="example@email.com"
                />
                <input
                    type="password"
                    placeholder="password"
                />
                <label>
                    <input type="checkbox" />
                    I agree for processing my personal data
                </label>
                <button>Login</button>
            </div>
        </form>
    )
}

export default LoginForm