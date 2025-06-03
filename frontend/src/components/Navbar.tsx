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
                <div className="Navbar-navigation">
                    {!AuthState.user && <>
                        <Link to="/login" className='Navbar-AuthButton'>Zaloguj</Link>
                        <Link to="/register" className='Navbar-AuthButton'>Stwórz konto</Link>
                    </>
                    }
                    {AuthState.user &&
                        <>
                            <p>Witaj, {AuthState.user.firstName}</p>
                            <Link className="Navbar-link" to="/ready">Moje mecze</Link>
                            <Link className="Navbar-link" to="/create-game">Stwórz grę</Link>
                            <Link className="Navbar-link" to="/waiting-games">Dołącz do gry</Link>
                            <Link className="Navbar-link" to="/teams-picking">Wybieranie druzyn</Link>
                            <button onClick={logout} className="Navbar-AuthButton">Wyloguj</button>
                        </>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar