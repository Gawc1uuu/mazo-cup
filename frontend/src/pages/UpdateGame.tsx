import React from 'react'
import "./UpdateGame.css"
import Card from '../components/Card'
import UpdateGameForm from '../components/UpdateGameForm'

const UpdateGame = () => {
    return (
        <div className='CreateGame'>
            <Card className='CreateGame-card'>
                <div className='CreateGame-container'>
                    <UpdateGameForm />
                </div>
            </Card>
        </div>
    )
}

export default UpdateGame