import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css"
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import useAuthContext from "./hooks/useAuthContext";
import CreateGame from "./pages/CreateGame";
import WaitingGame from "./pages/WaitingGame";
import MyTeamsPicking from "./pages/MyTeamsPicking";
import TeamsPicking from "./pages/TeamsPicking";
import GameDetailsCard from "./pages/GameDetails";
import ReadyGame from "./pages/ReadyGame";

function App() {

  const { state: AuthState, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading spinner or placeholder
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="Routes-container">
          <Routes>
            <Route path="/login" element={!AuthState.user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!AuthState.user ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={AuthState.user ? <Dashboard /> : <Login />} />
            <Route path="/waiting-games" element={AuthState.user ? <WaitingGame /> : <Login />} />
            <Route path="/create-game" element={AuthState.user ? <CreateGame /> : <Login />} />
            <Route path="/teams-picking" element={AuthState.user ? <MyTeamsPicking /> : <Login />} />
            <Route path="/teams-picking/:id" element={AuthState.user ? <GameDetailsCard /> : <Login />} />
            <Route path="/ready/:id" element={AuthState.user ? <ReadyGame /> : <Login />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
