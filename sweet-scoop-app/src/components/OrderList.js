// src/components/OrderList.js
import React from "react";
import OrderItem from "./OrderItem";

function OrderList({ order, removeFromOrder }) {

  const totalPrice = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
    <h3>Your Order</h3>
    <div className="order-list">
      
      {order.length === 0 && <p>No items in your order.</p>}
      {order.map((item) => (
<OrderItem key={item.flavorId} item={item} removeFromOrder={removeFromOrder} />      ))}
      {order.length > 0 && <h4>Total: ${totalPrice.toFixed(2)}</h4>}
    </div>
    </>
  );
}

export default OrderList;