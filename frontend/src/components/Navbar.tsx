import "./Navbar.css"
import logo from "../assets/mazocup.svg";
import { Link } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import useLogout from "../hooks/useLogout";

const Navbar = () => {

    const { state: AuthState } = useAuthContext()
    const { logout } = useLogout()


    return (
        <nav className='Navbar'>
            <div className="Navbar-container">
                <div className="Navbar-Logo">
                    <img src={logo.toString()} alt="App Logo" />
                </div>
                {/* buttons div */}
                <div className="Navbar-navigation">
                    {!AuthState.user && <>
                        <Link to="/login" className='Navbar-AuthButton'>Login</Link>
                        <Link to="/register" className='Navbar-AuthButton'>Register</Link>
                    </>
                    }
                    {AuthState.user &&
                        <>
                            <Link className="Navbar-link" to="/create-game">Create Game</Link>
                            <Link className="Navbar-link" to="/waiting-games">Join Game</Link>
                            <button onClick={logout} className="Navbar-AuthButton">Logout</button>
                        </>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar