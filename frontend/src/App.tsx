import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css"
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import useAuthContext from "./hooks/useAuthContext";

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
            <Route path="/" element={AuthState.user ? <Dashboard /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
