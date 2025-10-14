// src/App.js
import { useState } from "react";
import Login from "./Login";
import SensorList from "./SensorList";

export default function App() {
  // Set to true if access token exists
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));

  function handleLogout() {
    localStorage.removeItem("access_token");
    setLoggedIn(false);
  }

  return (
    // Show Login view or Sensors depending on loggedIn state
    <div style={{ padding: 20 }}>
      <h1>Sensor Dashboard</h1>
      {loggedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <SensorList />
        </>
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}
