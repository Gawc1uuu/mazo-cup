import { useEffect, useState } from "react"
import useAuthContext from "../hooks/useAuthContext"
import useGamesContext from "../hooks/useGamesContext"
import Card from "../components/Card"
import "./Dashboard.css"
import { Link } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import HeroSection from "../components/dashboard/HeroSection"
import About from "../components/dashboard/About"
import Info from "../components/dashboard/Info"

const formatDate = (isoDate: any) => {
    const date = new Date(isoDate);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[date.getDay()];

    const day = date.getDate();
    const ordinalSuffix = (n: any) => {
        if (n > 3 && n < 21) return "th";
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${day}${ordinalSuffix(day)} ${month} ${year}, ${dayOfWeek}, ${time}`;
};


const Dashboard = () => {



    return (
        <>
            <HeroSection />
            <About />
            <Info />
        </>
    )
}

export default Dashboard