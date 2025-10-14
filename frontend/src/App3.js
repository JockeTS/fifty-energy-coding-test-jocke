import { useEffect, useState } from "react";
import "./App.css";

const apiUrl = process.env.REACT_APP_API_URL;

async function getSensors() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxODc2MDE4LCJpYXQiOjE3NjAzNDAwMTgsImp0aSI6IjllMDQ4MDAxOWI4YzQ4ZjA4Y2RiYjE0ZTY0YjRhZWNiIiwidXNlcl9pZCI6IjEifQ.D-jqyqFNrmtEHhDEDZQ5wT0k4woD623LJ3ZHCVi16Ug";
  
  const res = await fetch(`http://localhost:8000/api/sensors/`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return res.json();
}

function App() {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    getSensors()
      .then(data => setSensors(data))
      .catch(err => console.error("Failed to fetch sensors:", err));
  }, []);

  return (
    <div className="App">
      <h1>Sensors</h1>
      <pre>{JSON.stringify(sensors, null, 2)}</pre>
    </div>
  );
}

export default App;
