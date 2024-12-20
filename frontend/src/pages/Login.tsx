import React from 'react'
import Card from '../components/Card'
import LoginForm from '../components/LoginForm'
import logo from "../assets/mazocup.png"
import "./Login.css"

const Login = () => {
    return (
        <Card className='Login-card'>
            <div className='Login-container'>
                <div className='Login-form'>
                    <LoginForm />
                </div>
                <div className='Login-divider'></div>
                <div className='Login-image'>
                    <img className="Login-logo" src={logo.toString()} alt="Logo" />
                </div>
            </div>
        </Card>
    )
}

export default Login