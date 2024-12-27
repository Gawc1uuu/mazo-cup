import React, { useContext } from 'react'
import { gamesContext } from '../context/GamesContext'

const useGamesContext = () => {
    const ctx = useContext(gamesContext)
    if (!ctx) {
        throw new Error("Games context doesnt exist")
    }
    return ctx;
}

export default useGamesContext