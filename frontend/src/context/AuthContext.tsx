import React, { createContext, ReactNode, useEffect, useReducer, useState } from 'react'

interface Props {
    children: ReactNode
}

export interface AuthState {
    user: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        token: string
    } | null;
}

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string
}

export type AuthAction =
    | { type: "LOGIN"; payload: User }
    | { type: "LOGOUT" };

export interface AuthContextType {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>({
    state: {
        user: null
    },
    dispatch: () => { },
    isLoading: true
})
const authReducer = (state: AuthState, action: AuthAction) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("user", JSON.stringify(action.payload))
            return {
                user: action.payload
            };
        case "LOGOUT":
            localStorage.removeItem("user")
            return {
                user: null
            }
        default: {
            return {
                ...state
            }
        }
    }
}

const AuthContextProvider = ({ children }: Props) => {

    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const user = localStorage.getItem("user")

        if (user) {
            dispatch({ type: "LOGIN", payload: JSON.parse(user) });
        }

        setIsLoading(false)

    }, [])

    return (
        <AuthContext.Provider value={{ state, dispatch, isLoading }}>{children}</AuthContext.Provider>
    )
}

export default AuthContextProvider;