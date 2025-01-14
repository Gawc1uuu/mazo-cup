import React, { createContext, Dispatch, ReactNode, useReducer } from 'react'

export type Player = {
    id: string;
    email: string;
    username: string;
    role: "player" | "captain";
    userId?: string;
}

export type Game = {
    id: string,
    location: string,
    date: string,
    name: string,
    createdBy: string,
    createdAt: string,
    status: "waiting" | "picking_teams" | "ready",
    players?: Player[];
}

type GameAction = { type: "SET_GAMES", payload: Game[] } | { type: "ADD_GAME", payload: Game } | { type: "DELETE_GAME", payload: string } | { type: "UPDATE_GAME", payload: Game } | { type: "JOIN_GAME", payload: { gameId: string, player: Player } } | { type: "STATUS_CHANGE", payload: string }

type GameState = {
    games: Game[]
}

const initialState: GameState = {
    games: []
}

const gamesReducer = (state: GameState, action: GameAction) => {
    switch (action.type) {
        case "SET_GAMES": {
            console.log("dupa")
            console.log(action.payload)
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
        case "JOIN_GAME": {
            return {
                games: state.games.map((game) => {
                    if (game.id === action.payload.gameId) {
                        const players = game.players || [];
                        console.log("Existing players:", players);
                        console.log("New player:", action.payload.player);

                        const isPlayerInTheGame = game.players?.some((p) => p.id === action.payload.player.userId)
                        console.log(isPlayerInTheGame)
                        if (isPlayerInTheGame) {
                            console.log("player is already in the game")
                            return game;
                        }


                        const updatedPlayers = [...players, action.payload.player];
                        console.log("Updated players:", updatedPlayers);

                        return {
                            ...game,
                            players: updatedPlayers
                        }

                    }
                    return game;
                }),
            };
        }
        case "STATUS_CHANGE":
            return {
                games: state.games.filter((game) => game.id !== action.payload),
            };
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