import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Sensors from "./pages/Sensors";
import Register from "./pages/Register";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"));

  const handleLogin = (newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/sensors" replace />}
        />
        <Route
          path="/register"
          element={!token ? <Register onRegister={handleLogin} /> : <Navigate to="/sensors" replace />}
        />
        <Route
          path="/sensors"
          element={token ? <Sensors onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? "/sensors" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}