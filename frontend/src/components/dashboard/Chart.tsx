import React from 'react'
import "./Chart.css"
import DashboardHeader from './DashboardHeader'
import chartImg from "../../assets/chart-img.png"
const Chart = () => {
    return (
        <div className='chart'>
            <div className='chart-container'>
                <DashboardHeader title='Rośnij razem z nami!' />
                <div className='chart-content'>
                    <img src={chartImg.toString()} alt='chart image' />
                </div>
            </div>
        </div>
    )
}

export default Chart