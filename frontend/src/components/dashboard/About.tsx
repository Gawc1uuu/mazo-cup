import React from 'react';
import "./About.css"; // Main CSS for the section and tiles
import Tile from './Tile'; // Import the new Tile component

// SVGs
import ballSVG from "../../assets/ball-icon.svg";
import timerSVG from "../../assets/timer-icon.svg";
import fieldSVG from "../../assets/field-icon.svg";
import bootSVG from "../../assets/boot-icon.svg";
import cupSVG from "../../assets/cup-icon.svg";
import starSVG from "../../assets/star-icon.svg"; // Corrected typo: startSVG -> starSVG

// Data for the tiles
const tileData = [
    {
        id: 1,
        title: "Zarejestrowani gracze",
        value: "9213",
        iconSrc: ballSVG.toString(),
        layoutType: "left",
        iconAlt: "ball icon"
    },
    {
        id: 2,
        title: "Mecze w tygodniu", // Changed title for clarity, assuming timer means matches played or time played
        value: "31904",
        iconSrc: timerSVG.toString(),
        layoutType: "middle",
        iconAlt: "timer icon"
    },
    {
        id: 3,
        title: "Ilość boisk",
        value: "420",
        iconSrc: fieldSVG.toString(),
        layoutType: "right",
        iconAlt: "field icon"
    },
    {
        id: 4,
        title: "Strzelone gole",
        value: "12321",
        iconSrc: bootSVG.toString(),
        layoutType: "left",
        iconAlt: "boot icon"
    },
    {
        id: 5,
        title: "Zorganizowane turnieje",
        value: "314",
        iconSrc: cupSVG.toString(),
        layoutType: "middle",
        iconAlt: "cup icon"
    },
    {
        id: 6,
        title: "Średnia ocena boisk",
        value: "4.71/5.0",
        iconSrc: starSVG.toString(), // Corrected typo: startSVG -> starSVG
        layoutType: "right",
        iconAlt: "star icon"
    }
];

const About = () => {
    return (
        <div className='about'>
            <div className='about-header'>
                <h1>
                    Fakty
                </h1>
                <div className='about-header-border'></div>
            </div>
            <div className='about-container'>

                <div className='tiles-container'>
                    {tileData.map(tile => (
                        <Tile
                            key={tile.id}
                            title={tile.title}
                            value={tile.value}
                            iconSrc={tile.iconSrc}
                            layoutType={tile.layoutType}
                            iconAlt={tile.iconAlt}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;