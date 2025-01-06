import React, { createContext, Dispatch, ReactNode, useReducer } from 'react'

export type Game = {
    id: string,
    location: string,
    date: string,
    name: string,
    createdBy: string,
    createdAt: string,
    status: "waiting" | "picking_teams" | "ready"
}

type GameAction = { type: "SET_GAMES", payload: Game[] } | { type: "ADD_GAME", payload: Game } | { type: "DELETE_GAME", payload: string } | { type: "UPDATE_GAME", payload: Game }

type GameState = {
    games: Game[]
}

const initialState: GameState = {
    games: []
}

const gamesReducer = (state: GameState, action: GameAction) => {
    switch (action.type) {
        case "SET_GAMES": {
            return { games: action.payload }
        }
        case "ADD_GAME": {
            return { games: [...state.games, action.payload] };
        }
        case "DELETE_GAME": {
            return { games: state.games.filter((game) => game.id != action.payload) }
        }
        case "UPDATE_GAME": {
            return {
                games: state.games.map((game) => (
                    game.id === action.payload.id ? { ...game, ...action.payload } : game
                ))
            }
        }
        default:
            throw new Error(`Unhandled action type: ${action}`);
    }
}

type GameContextType = {
    state: GameState,
    dispatch: Dispatch<GameAction>
}

export const gamesContext = createContext<GameContextType | undefined>(undefined)

const GamesContextProvider = ({ children }: { children: ReactNode }) => {

    const [state, dispatch] = useReducer(gamesReducer, initialState)

    return (
        <gamesContext.Provider value={{ state, dispatch }}>
            {children}
        </gamesContext.Provider>
    )
}

export default GamesContextProvider