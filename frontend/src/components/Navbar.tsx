import "./Navbar.css"
import logo from "../assets/mazocup.svg";

const Navbar = () => {
    return (
        <nav className='Navbar'>
            <div className="Navbar-container">
                <div className="Navbar-Logo">
                    <img src={logo.toString()} alt="App Logo" />
                </div>
                {/* buttons div */}
                <div className="Navbar-navigation">
                    <button className='Navbar-AuthButton'>Login</button>
                    <button className='Navbar-AuthButton'>Register</button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar