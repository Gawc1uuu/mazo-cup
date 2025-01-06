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

function App() {

  const { state: AuthState } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="Routes-container">
          <Routes>
            <Route path="/login" element={!AuthState.user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!AuthState.user ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/waiting-games" element={<WaitingGame />} />
            <Route path="/create-game" element={<CreateGame />} />
            <Route path="/teams-picking" element={<MyTeamsPicking />} />
            <Route path="/teams-picking/:id" element={<TeamsPicking />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
