import React from 'react'
import Card from '../components/Card'
import LoginForm from '../components/LoginForm'
import logo from "../assets/mazocup.png"
import "./Login.css"

const Login = () => {
    return (
        <Card>
            <div>
                <LoginForm />
            </div>
            <div>
                <img className="Form-image" src={logo.toString()} alt="Logo" />
            </div>
        </Card>
    )
}

export default Login