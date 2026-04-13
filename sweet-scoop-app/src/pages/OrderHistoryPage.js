import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../StyleSheet.css";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setError("User not found. Please log in.");
          return;
        }

        const response = await fetch(`http://localhost:5000/orders?userId=${userId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setOrders(data.orders || []);
          setError(null);
        } else {
          setError(data.message || "Failed to load orders");
        }
      } catch (err) {
        setError("Failed to load orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="order-history-page">
      <Header />
      
      <main className="main-content">
        <h1>Order History</h1>
        
        {loading && <p>Loading orders...</p>}
        
        {error && <p className="error-message">{error}</p>}
        
        {!loading && orders.length === 0 && !error && (
          <p>You haven't placed any orders yet.</p>
        )}
        
        {orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.orderId} className="order-card">
                <h3>Order #{order.orderId}</h3>
                <p>Date: {order.timestamp}</p>
                <p>Total: ${order.total}</p>
                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default OrderHistoryPage;
