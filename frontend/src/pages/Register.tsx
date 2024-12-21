import React from "react";
import Card from "../components/Card";
import RegisterForm from "../components/RegisterForm";
import logo from "../assets/mazocup.png"
import "./Register.css"


const Register = () => {
    return (
        <Card className='Register-card'>
            <div className='Register-container'>
                <div className='Register-form'>
                    <RegisterForm />
                </div>
                <div className='Register-divider'></div>
                <div className='Register-image'>
                    <img className="Register-logo" src={logo.toString()} alt="Logo" />
                </div>
            </div>
        </Card>
    )
}

export default Register;