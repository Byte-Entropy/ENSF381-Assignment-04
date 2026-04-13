// src/pages/FlavorsPage.js
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlavorCatalog from "../components/FlavorCatalog";
import OrderList from "../components/OrderList";

function FlavorsPage() {
  const [order, setOrder] = useState([]);
  const [status, setStatus] = useState(null);

  const userId = localStorage.getItem("userId");

  const loadCart = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`http://localhost:5000/cart?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setOrder(data.cart || []);
      } else {
        setStatus({ type: "error", message: data.message || "Failed to load cart" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error while loading cart" });
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToOrder = async (flavor) => {
    const existing = order.find((item) => item.flavorId === flavor.id);

    try {
      let response;

      if (!existing) {
        response = await fetch("http://localhost:5000/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(userId), flavorId: flavor.id }),
        });
      } else {
        response = await fetch("http://localhost:5000/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(userId),
            flavorId: flavor.id,
            quantity: existing.quantity + 1,
          }),
        });
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus({ type: "success", message: data.message });
        loadCart();
      } else {
        setStatus({ type: "error", message: data.message || "Failed to update cart" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error while updating cart" });
    }
  };

  const removeFromOrder = async (flavorId) => {
    try {
      const response = await fetch("http://localhost:5000/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), flavorId }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus({ type: "success", message: data.message });
        loadCart();
      } else {
        setStatus({ type: "error", message: data.message || "Failed to remove item" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error while removing item" });
    }
  };

  const placeOrder = async () => {
    try {
      const response = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId) }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus({ type: "success", message: data.message });
        loadCart();
      } else {
        setStatus({ type: "error", message: data.message || "Failed to place order" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error while placing order" });
    }
  };

  return (
    <div className="flavors-page">
      <Header />
      {status && (
        <p className={status.type === "success" ? "success-message" : "error-message"}>
          {status.message}
        </p>
      )}
      <div className="content">
        <FlavorCatalog addToOrder={addToOrder} />
        <OrderList order={order} removeFromOrder={removeFromOrder} />
      </div>
      <div className="order-actions">
        <button onClick={placeOrder} disabled={order.length === 0}>
          Place Order
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default FlavorsPage;