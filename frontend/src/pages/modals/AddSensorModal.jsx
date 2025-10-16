import React, { useState } from "react";

export default function AddSensorModal({ isOpen, onClose, onSensorAdded }) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://localhost:8000/api/sensors/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, model, description }),
      });

      if (!res.ok) {
        throw new Error("Failed to create sensor");
      }

      const newSensor = await res.json();
      onSensorAdded(newSensor);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Sensor</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Model:
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </label>
          <label>
            Description (optional):
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel">
              Cancel
            </button>
            <button type="submit" className="submit">
              Add Sensor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
