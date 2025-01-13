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
                    <Link to="/">
                        <img src={logo.toString()} alt="App Logo" />
                    </Link>
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
                            <p>Hello, {AuthState.user.email}</p>
                            <Link className="Navbar-link" to="/create-game">Create Game</Link>
                            <Link className="Navbar-link" to="/waiting-games">Join Game</Link>
                            <Link className="Navbar-link" to="/teams-picking">Pick Teams</Link>
                            <button onClick={logout} className="Navbar-AuthButton">Logout</button>
                        </>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar