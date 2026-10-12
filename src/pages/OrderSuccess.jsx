import { Link, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency, formatDate } from "../utils/format";
import { IconCheck, IconTruck, IconArrowRight } from "../components/Icons";

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id) || orders[0];

  if (!order) {
    return (
      <div className="container page empty empty--lg">
        <h2>Order not found</h2>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="success">
        <span className="success__icon"><IconCheck size={44} /></span>
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>{order.id}</strong> has been placed successfully. A confirmation email has been sent to <strong>{order.email}</strong>.</p>

        <div className="success__card">
          <div className="success__head">
            <div>
              <span>Order number</span>
              <strong>{order.id}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{formatDate(order.date)}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className="pill pill--processing">{order.status}</strong>
            </div>
          </div>

          <div className="success__track">
            {["Confirmed", "Packed", "Shipped", "Delivered"].map((s, i) => (
              <div className={`track-step ${i === 0 ? "is-done" : ""}`} key={s}>
                <span className="track-step__dot">{i === 0 ? <IconCheck size={14} /> : i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="success__items">
            {order.items.map((it) => (
              <div className="success__item" key={it.id + (it.size || "")}>
                <img src={it.image} alt="" />
                <div>
                  <strong>{it.name}</strong>
                  <span>Qty {it.qty}{it.size ? ` • Size ${it.size}` : ""}</span>
                </div>
                <span>{formatCurrency(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="success__addr">
            <span><IconTruck size={16} /> Shipping to</span>
            <p>{order.address}</p>
            <span>Payment method</span>
            <p>{order.payment}</p>
            {order.transactionId && (
              <>
                <span>Transaction ID</span>
                <p><code className="txn-code">{order.transactionId}</code></p>
              </>
            )}
          </div>
        </div>

        <div className="success__actions">
          <Link to="/shop" className="btn btn--primary btn--lg">Continue shopping <IconArrowRight size={18} /></Link>
          <Link to="/account?tab=orders" className="btn btn--ghost btn--lg">View my orders</Link>
        </div>
      </div>
    </div>
  );
}
