
// SensorDetailModal.jsx
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SensorDetailModal({ sensor, onClose }) {
  const [readings, setReadings] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sensor) return;

    // Reset state
    setDateFrom("");
    setDateTo("");
    setReadings([]);

    fetchReadings();
  }, [sensor]);

  async function fetchReadings() {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams();
      if (dateFrom) params.append("timestamp_from", dateFrom);
      if (dateTo) params.append("timestamp_to", dateTo);

      try {
        const res = await fetch(`http://localhost:8000/api/sensors/${sensor.id.toString()}/readings/?${params.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // Set values of datetime inputs
        setDateFrom(data[0].timestamp.slice(0, 16));
        setDateTo(data[data.length - 1].timestamp.slice(0, 16));

        setReadings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

  function AddReading() {
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [timestamp, setTimestamp] = useState("");

    useEffect(() => {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const localISOString = local.toISOString().slice(0, 16);
      setTimestamp(localISOString);
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("access_token");

      try {
        const res = await fetch(`http://localhost:8000/api/sensors/${sensor.id}/readings/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ temperature, humidity, timestamp }),
        });

        if (!res.ok) throw new Error("Failed to add reading");
        await fetchReadings(); // Refresh readings after adding
        setTemperature("");
        setHumidity("");

        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const localISOString = local.toISOString().slice(0, 16);
        setTimestamp(localISOString);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginBottom: "0.5rem" }}>Add Reading</h3>
        <div style={fieldRow}>
          <label style={fieldLabel}>
            Temp (°C):
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <label style={fieldLabel}>
            Humidity (%):
            <input
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <label style={fieldLabel}>
            Timestamp:
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
          <button type="submit" style={submitStyle}>Add</button>
        </div>
      </form>
    );
  }

  const formStyle = {
    marginTop: "1rem",
    marginBottom: "1rem",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#f9f9f9"
  };

  const fieldRow = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem"
  };

  const fieldLabel = {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem"
  };

  const inputStyle = {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "0.9rem",
    marginTop: "0.25rem",
    width: "120px"
  };

  const submitStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem"
  };

  if (!sensor) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2>{sensor.name}</h2>
        <p><strong>Model:</strong> {sensor.model}</p>
        <p><strong>Description:</strong> {sensor.description}</p>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            From: <input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label style={{ marginLeft: "1rem" }}>
            To: <input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <button className="update-date-btn" onClick={() => fetchReadings()}>Update</button>
        </div>

        {loading ? (
          <p>Loading readings...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
            dataKey="timestamp"

            interval={Math.ceil(readings.length / 4)}
            tickFormatter={(ts) => {
                const d = new Date(ts);
                const yy = String(d.getUTCFullYear()).slice(2);
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const min = String(d.getUTCMinutes()).padStart(2, '0');
                return [`${yy}-${mm}-${dd} | ${hh}:${min}`];
            }}
            />
            <YAxis yAxisId="left" label={{ value: "°C", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "%", angle: 90, position: "insideRight" }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temperature (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" name="Humidity (%)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        <AddReading />

        <button onClick={onClose} style={{ marginTop: "1rem" }}>Close</button>
      </div>
    </div>
  );
}
