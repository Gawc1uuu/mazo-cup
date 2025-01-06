import React from 'react'
import Card from '../components/Card'
import "./CreateGame.css"
import CreateGameForm from '../components/CreateGameForm'

const CreateGame = () => {
    return (
        <div className='CreateGame'>
            <Card className='CreateGame-card'>
                <div className='CreateGame-container'>
                    <CreateGameForm />
                </div>
            </Card>
        </div>
    )
}

export default CreateGame