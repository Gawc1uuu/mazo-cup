import React, { useState } from 'react'
import "./CreateGameForm.css"
import { useNavigate } from 'react-router-dom';

const CreateGameForm = () => {
    const navigate = useNavigate()

    const [name, setName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [date, setDate] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        const userInfo = localStorage.getItem("user");
        if (!userInfo) {
            throw new Error("Not authorized")
            return;
        }

        console.log(userInfo)

        const parsedUser = JSON.parse(userInfo);

        console.log(parsedUser)

        console.log(name)
        console.log(location)
        console.log(date)

        try {

            const response = await fetch("http://localhost:4000/api/games/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    location,
                    date,
                    createdBy: parsedUser.id
                })
            })

            if (!response.ok) {
                console.log("error")
                throw new Error("Something went wrong");
            }

            const result = await response.json();

            console.log(result)

            navigate("/")

        } catch (error) {
            console.error(error)
        }

    }

    return (
        <form className='CreateGame-form' onSubmit={handleSubmit}>
            <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='name' className='CreateGame-input' />
            <input onChange={(e) => setLocation(e.target.value)} value={location} type="text" placeholder='location' className='CreateGame-input' />
            <input onChange={(e) => setDate(e.target.value)} value={date} type='datetime-local' placeholder='datetime' className='CreateGame-input' />
            <button className='CreateGame-button'>Create game</button>
        </form>
    )
}

export default CreateGameForm