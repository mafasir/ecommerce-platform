import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { categories } from "../data/products";
import {
  IconSearch,
  IconCart,
  IconHeart,
  IconUser,
  IconMenu,
  IconClose,
  IconSun,
  IconMoon,
  IconChevronDown,
  IconBag,
} from "./Icons";

export default function Navbar() {
  const { cartCount, wishlist, user, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="promo-bar">
        <div className="container promo-bar__inner">
          <span>🚚 Free shipping on orders over $100</span>
          <span className="promo-bar__sep">•</span>
          <span>Use code <strong>WELCOME10</strong> for 10% off</span>
        </div>
      </div>

      <div className="navbar">
        <div className="container navbar__inner">
          <button
            className="icon-btn navbar__burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>

          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand__mark">N</span>
            <span className="brand__name">Nexus<span>Store</span></span>
          </Link>

          <nav className="navbar__links" aria-label="Primary">
            <NavLink to="/" end className="nav-link">Home</NavLink>
            <NavLink to="/shop" className="nav-link">Shop</NavLink>
            <div className="navbar__dd" onMouseLeave={() => setCatsOpen(false)}>
              <button
                className="nav-link nav-link--btn"
                onMouseEnter={() => setCatsOpen(true)}
                onClick={() => setCatsOpen((v) => !v)}
              >
                Categories <IconChevronDown size={16} />
              </button>
              {catsOpen && (
                <div className="dropdown">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/shop?category=${c.id}`}
                      className="dropdown__item"
                      onClick={() => setCatsOpen(false)}
                    >
                      <span className="dropdown__icon">{c.icon}</span>
                      <span>
                        <strong>{c.name}</strong>
                        <em>{c.blurb}</em>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/shop?tag=featured" className="nav-link">Deals</NavLink>
          </nav>

          <form className="navbar__search" onSubmit={submitSearch} role="search">
            <IconSearch size={18} />
            <input
              type="search"
              placeholder="Search products, brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <div className="navbar__actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <IconMoon /> : <IconSun />}
            </button>

            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <IconHeart />
              {wishlist.length > 0 && <span className="icon-btn__badge">{wishlist.length}</span>}
            </Link>

            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && <span className="icon-btn__badge">{cartCount}</span>}
            </Link>

            <div className="navbar__user" ref={userRef}>
              <button
                className="icon-btn"
                onClick={() => setUserOpen((v) => !v)}
                aria-label="Account"
              >
                <IconUser />
              </button>
              {userOpen && (
                <div className="dropdown dropdown--right">
                  {user ? (
                    <>
                      <div className="dropdown__head">
                        <IconBag size={16} /> {user.name}
                      </div>
                      <Link to="/account" className="dropdown__link" onClick={() => setUserOpen(false)}>My Account</Link>
                      <Link to="/account?tab=orders" className="dropdown__link" onClick={() => setUserOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="dropdown__link" onClick={() => setUserOpen(false)}>Wishlist</Link>
                      <button
                        className="dropdown__link dropdown__link--danger"
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown__link" onClick={() => setUserOpen(false)}>Sign In</Link>
                      <Link to="/register" className="dropdown__link" onClick={() => setUserOpen(false)}>Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="navbar__search navbar__search--mobile">
          <form onSubmit={submitSearch} className="navbar__search-inner">
            <IconSearch size={18} />
            <input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`drawer ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer__overlay" onClick={() => setMenuOpen(false)} />
        <aside className="drawer__panel">
          <div className="drawer__head">
            <span className="brand__name">Menu</span>
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <IconClose />
            </button>
          </div>
          <nav className="drawer__nav">
            <NavLink to="/" end className="drawer__link" onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/shop" className="drawer__link" onClick={() => setMenuOpen(false)}>Shop All</NavLink>
            <NavLink to="/wishlist" className="drawer__link" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
            <NavLink to="/cart" className="drawer__link" onClick={() => setMenuOpen(false)}>Cart</NavLink>
            <NavLink to="/account" className="drawer__link" onClick={() => setMenuOpen(false)}>Account</NavLink>
          </nav>
          <div className="drawer__section-title">Categories</div>
          <div className="drawer__cats">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="drawer__cat"
                onClick={() => setMenuOpen(false)}
              >
                <span>{c.icon}</span> {c.name}
              </Link>
            ))}
          </div>
          {!user && (
            <div className="drawer__auth">
              <Link to="/login" className="btn btn--primary btn--block" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn--ghost btn--block" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </div>
          )}
        </aside>
      </div>
    </header>
  );
}
