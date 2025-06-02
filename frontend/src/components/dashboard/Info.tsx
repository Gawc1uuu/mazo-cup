import React from 'react'
import DashboardHeader from './DashboardHeader'
import "./Info.css"
import infoImg1 from "../../assets/info-img-2.png"
import infoImg2 from "../../assets/info-img-1.png"
import vectorSVG from "../../assets/vector.svg"

const Info = () => {
    return (
        <div className='info'>
            <div className='info-container'>
                <DashboardHeader title='Sport dla wszystkich' />
                <div className='info-content'>
                    <div className='info-content-first'>
                        <img src={infoImg1.toString()} alt='people playing football' />
                        <div className='info-content-text'>
                            <h2>Lorem ipsum</h2>
                            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam, adipisci atque nostrum blanditiis dicta animi tempora dolor eligendi doloremque ab consequuntur mollitia ut quo aspernatur quasi, ea perferendis voluptatum fuga?</p>
                            <button>
                                Czytaj więcej
                                <img src={vectorSVG.toString()} alt='right arrow' />
                            </button>
                        </div>
                    </div>
                    <div className='info-content-first'>
                        <div className='info-content-text-second'>
                            <h2>Lorem ipsum</h2>
                            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam, adipisci atque nostrum blanditiis dicta animi tempora dolor eligendi doloremque ab consequuntur mollitia ut quo aspernatur quasi, ea perferendis voluptatum fuga?</p>
                            <button>
                                Zagraj
                                <img src={vectorSVG.toString()} alt='right arrow' />
                            </button>
                        </div>
                        <img src={infoImg2.toString()} alt='people playing football' />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Info