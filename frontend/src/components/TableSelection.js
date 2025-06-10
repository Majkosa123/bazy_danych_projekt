import React, { useState, useEffect } from "react";
import { getAvailableTables } from "../api/deliveryApi";

function TableSelection({ selectedTable, onTableSelect }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setLoading(true);
        const response = await getAvailableTables();
        setTables(response.data);
      } catch (err) {
        setError("Nie udało się załadować dostępnych stolików.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, []);

  const containerStyle = {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
  };

  const gridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "15px",
  };

  const cardStyle = {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    padding: "10px 15px",
    cursor: "pointer",
    minWidth: "140px",
    textAlign: "left",
  };

  const selectedCardStyle = {
    ...cardStyle,
    backgroundColor: "#ffbc0d",
    borderColor: "#db0007",
    color: "#000",
  };

  const numberStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
  };

  const detailStyle = {
    fontSize: "12px",
    marginBottom: "2px",
  };

  const statusStyle = {
    fontSize: "11px",
    marginTop: "5px",
    color: "#666",
  };

  if (loading) return <div>Ładowanie stolików...</div>;
  if (error)
    return <div style={{ color: "red", padding: "10px" }}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>
        Wybierz stolik:
      </h3>
      <div style={gridStyle}>
        {tables.map((table) => (
          <div
            key={table.id}
            style={selectedTable === table.id ? selectedCardStyle : cardStyle}
            onClick={() => onTableSelect(table.id)}
            onMouseEnter={(e) => {
              if (selectedTable !== table.id) {
                e.target.style.backgroundColor = "#f0f0f0";
                e.target.style.borderColor = "#999";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTable !== table.id) {
                e.target.style.backgroundColor = "#f9f9f9";
                e.target.style.borderColor = "#ddd";
              }
            }}
          >
            <div style={numberStyle}>Stolik {table.number}</div>
            <div style={detailStyle}>Miejsca: {table.capacity}</div>
            <div style={detailStyle}>Lokalizacja: {table.location}</div>
            <div style={statusStyle}>Dostępny</div>
          </div>
        ))}
      </div>
      {tables.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          Brak dostępnych stolików. Spróbuj ponownie za chwilę.
        </div>
      )}
    </div>
  );
}

export default TableSelection;
