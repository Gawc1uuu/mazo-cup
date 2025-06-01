import React from 'react'
import linkSvg from '../assets/external-link.svg'
import "./Footer.css"


interface FooterLinkItemProps {
    name: string;
}

const FooterLinkItem = ({ name }: FooterLinkItemProps) => {
    return (
        <div className='footer-link-item'>
            <p>{name}</p>
            <img src={linkSvg.toString()} alt='Link icon' className='link-icon' />
        </div>
    )
}

export default FooterLinkItem