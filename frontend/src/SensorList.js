// src/Sensors.js
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://web:8000/api";

/*
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
}
*/

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [error, setError] = useState("");
  const [selectedSensor, setSelectedSensor] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // const [query, setQuery] = useState("");
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get("page_size")) || 10);

  const [total, setTotal] = useState(0);

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

      /*
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };
      */

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

        // const data = await apiFetch("/sensors/");
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
  if (!sensors.length) return <p>Loading sensors...</p>;

  return (
    <div>
      <h2>Sensors</h2>

      <div className="sensor-table-container">
        <h2>Sensors</h2>

        {/* Filter bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search sensors..."
            value={query}
            onChange={(e) => { setPage(1); setQuery(e.target.value); }}
            style={{ padding: "0.5rem", width: "60%" }}
          />

          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 25, 50].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>

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

            {selectedSensor && (
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
                  maxWidth: '500px',
                  width: '90%'
                }}>
                  <h2>{selectedSensor.name}</h2>
                  <p><strong>Model:</strong> {selectedSensor.model}</p>
                  <p><strong>Description:</strong> {selectedSensor.description}</p>
                  <button onClick={() => setSelectedSensor(null)}>Close</button>
                </div>
              </div>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "1rem" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
        <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
