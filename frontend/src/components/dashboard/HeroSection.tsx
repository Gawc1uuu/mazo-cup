import React from 'react'
import "./HeroSection.css"
import useAuthContext from '../../hooks/useAuthContext'
import { Link } from 'react-router-dom'


const HeroSection = () => {
    const { state } = useAuthContext()
    return (
        <div className='hero-section'>
            <div className='hero-overlay'></div>
            <div className='hero-content'>
                <h1>
                    <span className='hero-span'>Łączmy</span> pasje, <span className='hero-span'>grajmy</span> razem!
                </h1>
                <p>Spotkaj się na boisku, ciesz się ruchem i buduj niesamowite znajomości. Piłka dla każdego!</p>
                <Link to={state.user ? '/waiting-games' : '/login'}>
                    <button>Dołącz do nas</button>
                </Link>
            </div>
        </div>
    )
}

export default HeroSection