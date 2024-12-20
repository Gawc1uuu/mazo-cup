import { ReactNode } from 'react'
import "./Card.css"

interface Props {
    children: ReactNode;
}

const Card = ({ children }: Props) => {
    return (
        <div className="Card">{children}</div>
    )
}

export default Card