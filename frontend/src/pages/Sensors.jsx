// src/Sensors.js
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AddSensorModal from "./modals/AddSensorModal";
import SensorDetailModal from "./modals/SensorDetailModal";

export default function Sensors( {onLogout} ) {
  const [sensors, setSensors] = useState([]);
  const [error, setError] = useState("");
  const [selectedSensor, setSelectedSensor] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("page_size")) || 10);

  const [total, setTotal] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);

  // Update URL to match query / filters
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (page !== 1) params.page = page;
    if (pageSize !== 10) params.page_size = pageSize;
    setSearchParams(params);
  }, [query, page, pageSize, setSearchParams]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams({
        q: query,
        page: page,
        page_size: pageSize
      });

      try {
        // const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const res = await fetch(`http://localhost:8000/api/sensors/?${params}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });

        const data = await res.json();

        setSensors(data);
        setTotal(data.count);
      } catch (err) {
        console.error(err);
        setError("Failed to load sensors");
      }
    }
    load();
  }, [query, page, pageSize]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  // if (!sensors.length) return <p>Loading sensors...</p>;

  return (
    <div>
      <h2>Sensors</h2>

      <button onClick={onLogout} className="logout-btn">Logout</button>

      <div className="sensor-table-container">
        {/* Search bar, add sensor button, filter bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => { setPage(1); setQuery(e.target.value); }}
            style={{ padding: "0.5rem", width: "30%" }}
          />

            <button
              className="add-sensor-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add Sensor
          </button>

          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 25, 50].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>

        {/* Table for displaying sensors */}
        <table className="sensor-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Model</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
              <tr key={sensor.id}>
                <td>{sensor.name}</td>
                <td>{sensor.description? sensor.description : "-"}</td>
                <td>{sensor.model}</td>
                <td>
                  <button onClick={() => setSelectedSensor(sensor)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddSensorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSensorAdded={(newSensor) => setSensors((prev) => [...prev, newSensor])}
      />

      <SensorDetailModal 
        sensor={selectedSensor} 
        onClose={() => setSelectedSensor(null)} 
      />

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "1rem" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
        <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
