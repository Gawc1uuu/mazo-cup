import React from 'react'
import "./Footer.css"
import FooterLinkItem from './FooterLinkItem'
import copyrightSVG from "../assets/copyright.svg"
import facebookSVG from "../assets/facebook-icon.svg"
import githubSVG from "../assets/github-icon.svg"
import linkedinSVG from "../assets/linkedin-icon.svg"
import { Link } from 'react-router-dom'

const supportLinks = [
    { id: 'kontakt', name: 'Kontakt' },
    { id: 'faq', name: 'FAQ' },
    { id: 'regulamin', name: 'Regulamin' },
    { id: 'wsparcie', name: 'Wsparcie' },
    { id: 'polityka', name: 'Polityka Prywatności' }
];

const companyLinks = [
    { id: 'misja', name: 'Misja' },
    { id: 'spolecznosc', name: 'Społeczność' },
    { id: 'wydarzenia', name: 'Wydarzenia' },
    { id: 'partnerzy', name: 'Partnerzy' },
    { id: 'o-nas', name: 'O nas' }
];

const Footer = () => {
    return (
        <div className="Footer">
            <div className='footer-container'>
                <div className='footer-links'>
                    {supportLinks.map((link) => (
                        <FooterLinkItem key={link.id} name={link.name} />
                    ))}
                </div>
                <div className='footer-middle'>
                    <div className='footer-author'>
                        <h2>Jakub Gawlik</h2>
                        <img src={copyrightSVG.toString()} alt='copyright icon' className='copyright-icon' />
                    </div>
                    <div className='footer-icons'>
                        <a href='https://github.com/Gawc1uuu' target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
                            <img src={githubSVG.toString()} alt='Ikona GitHub' className='social-icon' />
                        </a>
                        <a href='https://www.facebook.com/' target="_blank" rel="noopener noreferrer" aria-label="Facebook Profile">
                            <img src={facebookSVG.toString()} alt='Ikona Facebook' className='social-icon' />
                        </a>
                        <a href='https://www.linkedin.com/' target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
                            <img src={linkedinSVG.toString()} alt='Ikona LinkedIn' className='social-icon' />
                        </a>
                    </div>
                </div>
                <div className='footer-links'>
                    {companyLinks.map((link) => (
                        <FooterLinkItem key={link.id} name={link.name} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Footer