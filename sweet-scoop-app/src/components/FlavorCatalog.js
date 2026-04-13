import React, { useState, useEffect } from "react";
import FlavorItem from "./FlavorItem";

function FlavorCatalog({ addToOrder }) {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/flavors");
        const data = await response.json();

        if (data.success && data.flavors) {
          setFlavors(data.flavors);
          setError(null);
        } else {
          setError("Failed to load flavors");
        }
      } catch (err) {
        console.error("Error fetching flavors:", err);
        setError("Connection error. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchFlavors();
  }, []);

  if (loading) {
    return <div><h2>Ice Cream Flavors</h2><p>Loading flavors...</p></div>;
  }

  if (error) {
    return <div><h2>Ice Cream Flavors</h2><p className="error-message">{error}</p></div>;
  }

  return (
    <>
      <h2>Ice Cream Flavors</h2>
      <div className="flavor-grid">
        {flavors.map((f) => (
          <FlavorItem key={f.id} flavor={f} addToOrder={addToOrder} />
        ))}
      </div>
    </>
  );
}

export default FlavorCatalog;