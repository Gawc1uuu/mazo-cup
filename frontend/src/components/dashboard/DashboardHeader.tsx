import React from 'react'
import "./DashboardHeader.css"

const DashboardHeader = ({ title }: { title: string }) => {
    return (
        <div className='dashboard-header'>
            <h1>
                {title}
            </h1>
            <div className='dashboard-header-border'></div>
        </div>
    )
}

export default DashboardHeader