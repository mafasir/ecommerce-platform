import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { categories } from "../data/products";
import { IconHeadset, IconShield, IconTruck, IconRefresh, IconArrowRight } from "./Icons";

const perks = [
  { icon: IconTruck, title: "Free Shipping", text: "On all orders over $100" },
  { icon: IconRefresh, title: "Easy Returns", text: "30-day money-back guarantee" },
  { icon: IconShield, title: "Secure Payment", text: "256-bit SSL encryption" },
  { icon: IconHeadset, title: "24/7 Support", text: "We're here to help anytime" },
];

export default function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    notify("Subscribed! Check your inbox 🎉");
    setEmail("");
  };

  return (
    <footer className="footer">
      <section className="perks">
        <div className="container perks__grid">
          {perks.map(({ icon: Icon, title, text }) => (
            <div className="perk" key={title}>
              <span className="perk__icon"><Icon size={26} /></span>
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container footer__main">
        <div className="footer__col footer__brand">
          <Link to="/" className="brand">
            <span className="brand__mark">N</span>
            <span className="brand__name">Nexus<span>Store</span></span>
          </Link>
          <p>
            Your one-stop shop for electronics, fashion, home essentials and more.
            Curated quality, honest prices and fast delivery — every single day.
          </p>
          <form className="footer__subscribe" onSubmit={subscribe}>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button className="btn btn--primary" type="submit" aria-label="Subscribe">
              <IconArrowRight size={18} />
            </button>
          </form>
          <div className="footer__social" aria-label="Social media">
            {["𝕏", "f", "in", "ig", "yt"].map((s) => (
              <button key={s} className="footer__social-btn" aria-label={s}>{s}</button>
            ))}
          </div>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop?tag=featured">Featured</Link></li>
            <li><Link to="/shop?tag=bestseller">Bestsellers</Link></li>
            <li><Link to="/shop?tag=new">New Arrivals</Link></li>
            <li><Link to="/shop?sort=price-asc">Under Budget</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Categories</h4>
          <ul>
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/shop">Track Order</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/about">Help Center</Link></li>
            <li><Link to="/about">Shipping Info</Link></li>
            <li><Link to="/about">Returns</Link></li>
            <li><Link to="/about">Privacy Policy</Link></li>
            <li><Link to="/about">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} NexusStore. All rights reserved.</span>
          <div className="footer__pay">
            <span>VISA</span><span>MC</span><span>AMEX</span><span>PayPal</span><span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
