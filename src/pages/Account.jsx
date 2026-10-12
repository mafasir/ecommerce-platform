import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { getProductById } from "../data/products";
import { formatCurrency, formatDate } from "../utils/format";
import ProductCard from "../components/ProductCard";
import { IconUser, IconBag, IconHeart, IconShield, IconSun, IconMoon } from "../components/Icons";

const TABS = [
  { id: "profile", label: "Profile", icon: IconUser },
  { id: "orders", label: "Orders", icon: IconBag },
  { id: "wishlist", label: "Wishlist", icon: IconHeart },
  { id: "settings", label: "Settings", icon: IconShield },
];

export default function Account() {
  const { user, orders, wishlist, theme, toggleTheme, logout, notify } = useStore();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "profile";
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", phone: "" });

  if (!user) {
    return (
      <div className="container page empty empty--lg">
        <span className="empty__icon"><IconUser size={48} /></span>
        <h2>You're not signed in</h2>
        <p>Sign in to view your orders, wishlist and account settings.</p>
        <div className="empty__actions">
          <Link to="/login?redirect=/account" className="btn btn--primary btn--lg">Sign in</Link>
          <Link to="/register?redirect=/account" className="btn btn--ghost btn--lg">Create account</Link>
        </div>
      </div>
    );
  }

  const wishProducts = wishlist.map(getProductById).filter(Boolean);

  return (
    <div className="container page">
      <nav className="breadcrumbs"><Link to="/">Home</Link> <span>/</span> <span>Account</span></nav>

      <div className="account">
        <aside className="account__side">
          <div className="account__user">
            <span className="avatar avatar--lg">{user.name.charAt(0)}</span>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <nav className="account__nav">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`account__nav-btn ${tab === t.id ? "is-active" : ""}`}
                  onClick={() => setParams({ tab: t.id })}
                >
                  <Icon size={18} /> {t.label}
                  {t.id === "orders" && orders.length > 0 && <span className="account__count">{orders.length}</span>}
                </button>
              );
            })}
            <button className="account__nav-btn account__nav-btn--danger" onClick={logout}>Sign out</button>
          </nav>
        </aside>

        <div className="account__main">
          {tab === "profile" && (
            <section className="panel">
              <h3>Profile information</h3>
              <p className="muted">Update your personal details below.</p>
              <div className="form-grid">
                <label className="field field--full"><span>Full name</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
                <label className="field field--full"><span>Email address</span><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                <label className="field"><span>Phone</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 555 000 0000" /></label>
                <label className="field"><span>Country</span><input defaultValue="United States" /></label>
              </div>
              <button className="btn btn--primary" onClick={() => notify("Profile updated successfully")}>Save changes</button>
            </section>
          )}

          {tab === "orders" && (
            <section className="panel">
              <h3>Order history</h3>
              {orders.length === 0 ? (
                <div className="empty">
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn btn--primary">Start shopping</Link>
                </div>
              ) : (
                <div className="orders">
                  {orders.map((o) => (
                    <div className="order" key={o.id}>
                      <div className="order__head">
                        <div>
                          <span>Order</span>
                          <strong>{o.id}</strong>
                        </div>
                        <div>
                          <span>Placed</span>
                          <strong>{formatDate(o.date)}</strong>
                        </div>
                        <div>
                          <span>Total</span>
                          <strong>{formatCurrency(o.total)}</strong>
                        </div>
                        <span className="pill pill--processing">{o.status}</span>
                      </div>
                      <div className="order__items">
                        {o.items.map((it, i) => (
                          <div className="order__item" key={i}>
                            <img src={it.image} alt="" />
                            <div>
                              <strong>{it.name}</strong>
                              <span>Qty {it.qty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="order__foot">
                        <Link to={`/order-success/${o.id}`} className="btn btn--ghost btn--sm">View details</Link>
                        <button className="btn btn--ghost btn--sm" onClick={() => notify("Tracking link sent to your email", "info")}>Track order</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "wishlist" && (
            <section className="panel">
              <h3>Saved items</h3>
              {wishProducts.length === 0 ? (
                <div className="empty">
                  <p>Your wishlist is empty.</p>
                  <Link to="/shop" className="btn btn--primary">Browse products</Link>
                </div>
              ) : (
                <div className="grid grid--3">
                  {wishProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </section>
          )}

          {tab === "settings" && (
            <section className="panel">
              <h3>Preferences</h3>
              <div className="setting-row">
                <div>
                  <strong>Dark mode</strong>
                  <span>Switch between light and dark themes.</span>
                </div>
                <button className="btn btn--ghost" onClick={toggleTheme}>
                  {theme === "light" ? <><IconMoon size={16} /> Enable dark</> : <><IconSun size={16} /> Enable light</>}
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Email notifications</strong>
                  <span>Receive order updates and exclusive offers.</span>
                </div>
                <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
              </div>
              <div className="setting-row">
                <div>
                  <strong>SMS notifications</strong>
                  <span>Get delivery alerts on your phone.</span>
                </div>
                <label className="switch"><input type="checkbox" /><span /></label>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
