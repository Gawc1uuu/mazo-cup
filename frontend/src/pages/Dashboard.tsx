import React, { useEffect } from 'react'
import { io } from "socket.io-client";



const Dashboard = () => {

    useEffect(() => {

        const socket = io("http://localhost:4000", {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, [])

    return (
        <div>Dashboard</div>
    )
}

export default Dashboard