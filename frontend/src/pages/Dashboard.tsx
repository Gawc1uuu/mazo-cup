import { useEffect } from "react"

const Dashboard = () => {

    useEffect(() => {
        const fetchAllReadyGames = async () => {
            const res = await fetch("http://localhost:4000/api/games/ready", { method: "GET" })
            if (!res.ok) {
                console.error(res)
                return
            }

            const data = await res.json()
            console.log(data)
        }
        fetchAllReadyGames()
    }, [])


    return (
        <div className='Dasboard-container'>
            <div>all ready games</div>
        </div>
    )
}

export default Dashboard