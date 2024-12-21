import React, { useContext } from 'react'
import { AuthContext, AuthContextType } from '../context/AuthContext'

const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("Auth context is undefined")
    }

    return context;
}

export default useAuthContext