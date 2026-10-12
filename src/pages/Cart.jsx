import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";
import QuantityStepper from "../components/QuantityStepper";
import { IconTrash, IconCart, IconArrowRight, IconTruck, IconLock } from "../components/Icons";

const COUPONS = {
  WELCOME10: { code: "WELCOME10", type: "percent", value: 10, label: "10% off" },
  SAVE20: { code: "SAVE20", type: "fixed", value: 20, label: "$20 off" },
};

export default function Cart() {
  const {
    cartDetailed, subtotal, discount, shipping, tax, total,
    setQty, removeFromCart, coupon, applyCoupon, clearCoupon, notify,
  } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const apply = (e) => {
    e.preventDefault();
    const found = COUPONS[code.trim().toUpperCase()];
    if (found) {
      applyCoupon(found);
      notify(`Coupon ${found.code} applied — ${found.label}`);
      setCode("");
    } else {
      notify("Invalid coupon code", "error");
    }
  };

  if (cartDetailed.length === 0) {
    return (
      <div className="container page empty empty--lg">
        <span className="empty__icon"><IconCart size={48} /></span>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Let's change that!</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs"><Link to="/">Home</Link> <span>/</span> <span>Cart</span></nav>
      <h1 className="page__title">Shopping Cart</h1>
      <p className="page__sub">{cartDetailed.length} item{cartDetailed.length !== 1 ? "s" : ""} in your cart</p>

      <div className="cart">
        <div className="cart__items">
          {cartDetailed.map((it) => (
            <div className="cart-item" key={it.key}>
              <Link to={`/product/${it.product.slug}`} className="cart-item__img">
                <img src={it.product.images[0]} alt={it.product.name} />
              </Link>
              <div className="cart-item__info">
                <span className="cart-item__brand">{it.product.brand}</span>
                <Link to={`/product/${it.product.slug}`} className="cart-item__title">{it.product.name}</Link>
                <div className="cart-item__variant">
                  {it.color && <span className="dot" style={{ background: it.color }} />}
                  {it.size && <span>Size: {it.size}</span>}
                  {it.product.colors.length > 0 && <span>Colour selected</span>}
                </div>
                <div className="cart-item__mobile-price">{formatCurrency(it.product.price)}</div>
              </div>
              <div className="cart-item__qty">
                <QuantityStepper
                  value={it.qty}
                  onChange={(q) => setQty(it.key, q)}
                  max={it.product.stock}
                  size="sm"
                />
              </div>
              <div className="cart-item__price">{formatCurrency(it.lineTotal)}</div>
              <button className="icon-btn icon-btn--danger" onClick={() => removeFromCart(it.key)} aria-label="Remove item">
                <IconTrash size={18} />
              </button>
            </div>
          ))}

          <div className="cart__actions">
            <Link to="/shop" className="btn btn--ghost">← Continue shopping</Link>
            <button className="btn btn--ghost" onClick={() => navigate("/wishlist")}>View wishlist</button>
          </div>
        </div>

        <aside className="cart__summary">
          <h3>Order Summary</h3>

          <form className="coupon" onSubmit={apply}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              aria-label="Coupon code"
            />
            <button className="btn btn--dark" type="submit">Apply</button>
          </form>
          <p className="coupon__hint">Try <code>WELCOME10</code> or <code>SAVE20</code></p>

          {coupon && (
            <div className="coupon__applied">
              <span>🎟️ {coupon.code} — {coupon.label}</span>
              <button onClick={clearCoupon} aria-label="Remove coupon">×</button>
            </div>
          )}

          <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          {discount > 0 && <div className="summary-row summary-row--discount"><span>Discount</span><strong>-{formatCurrency(discount)}</strong></div>}
          <div className="summary-row">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong>
          </div>
          <div className="summary-row"><span>Tax (8%)</span><strong>{formatCurrency(tax)}</strong></div>
          <div className="summary-row summary-row--total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>

          {shipping > 0 && (
            <div className="summary-note">
              <IconTruck size={16} /> Add {formatCurrency(100 - (subtotal - discount))} more for free shipping
            </div>
          )}

          <button className="btn btn--primary btn--block btn--lg" onClick={() => navigate("/checkout")}>
            Proceed to checkout <IconArrowRight size={18} />
          </button>
          <div className="summary-secure"><IconLock size={14} /> Secure SSL checkout</div>
        </aside>
      </div>
    </div>
  );
}
