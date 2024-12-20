import { ReactNode } from 'react'
import "./Card.css"

interface Props {
    children: ReactNode;
    className?: string;
}

const Card = ({ children, className }: Props) => {
    const customClassNames = className ? `Card ${className}` : `Card`
    return (
        <div className={customClassNames}>{children}</div>
    )
}

export default Card