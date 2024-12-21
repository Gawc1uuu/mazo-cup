import "./Navbar.css"
import logo from "../assets/mazocup.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className='Navbar'>
            <div className="Navbar-container">
                <div className="Navbar-Logo">
                    <img src={logo.toString()} alt="App Logo" />
                </div>
                {/* buttons div */}
                <div className="Navbar-navigation">
                    <Link to="/login" className='Navbar-AuthButton'>Login</Link>
                    <Link to="/register" className='Navbar-AuthButton'>Register</Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar