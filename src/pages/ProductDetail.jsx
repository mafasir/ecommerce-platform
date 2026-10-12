import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductBySlug, getRelated } from "../data/products";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";
import Rating from "../components/Rating";
import QuantityStepper from "../components/QuantityStepper";
import ProductRail from "../components/ProductRail";
import {
  IconHeart,
  IconCart,
  IconTruck,
  IconShield,
  IconRefresh,
  IconCheck,
  IconChevronRight,
} from "../components/Icons";

const sampleReviews = [
  { name: "Priya S.", rating: 5, date: "2 weeks ago", title: "Exceeded expectations", text: "The build quality is fantastic and it arrived beautifully packaged. Would buy again in a heartbeat." },
  { name: "Marcus L.", rating: 4, date: "1 month ago", title: "Great value", text: "Does everything advertised. Docked one star only because shipping took an extra day." },
  { name: "Elena R.", rating: 5, date: "1 month ago", title: "My favourite purchase", text: "I use it every single day. The design is sleek and it feels premium." },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = getProductBySlug(slug);
  const { addToCart, toggleWishlist, wishlist, notify } = useStore();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product?.colors?.[0] || "");
  const [size, setSize] = useState(product?.sizes?.[0] || "");
  const [tab, setTab] = useState("description");

  const related = useMemo(() => (product ? getRelated(product, 8) : []), [product]);

  if (!product) {
    return (
      <div className="container page empty">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn--primary">Back to shop</Link>
      </div>
    );
  }

  const saved = wishlist.includes(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const inStock = product.stock > 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: star === Math.round(product.rating) ? 62 : star === Math.round(product.rating) - 1 ? 24 : 5 + (5 - star),
  }));

  const add = () => addToCart(product.id, { qty, color, size });
  const buyNow = () => {
    addToCart(product.id, { qty, color, size });
    navigate("/checkout");
  };

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span>
        <Link to="/shop">Shop</Link> <span>/</span>
        <Link to={`/shop?category=${product.category}`}>{product.category}</Link> <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp__gallery">
          <div className="pdp__thumbs">
            {product.images.map((src, i) => (
              <button
                key={src}
                className={`pdp__thumb ${i === activeImg ? "is-active" : ""}`}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="pdp__main">
            <img src={product.images[activeImg]} alt={product.name} />
            {product.badge && <span className={`badge badge--${product.badge.toLowerCase()} pdp__badge`}>{product.badge}</span>}
            {discount > 0 && <span className="badge badge--sale pdp__badge pdp__badge--right">-{discount}%</span>}
          </div>
        </div>

        <div className="pdp__info">
          <span className="pdp__brand">{product.brand}</span>
          <h1 className="pdp__title">{product.name}</h1>
          <div className="pdp__rating">
            <Rating value={product.rating} count={product.reviews} showValue />
            <a href="#reviews" onClick={() => setTab("reviews")} className="pdp__reviews-link">
              {product.reviews} reviews
            </a>
          </div>

          <div className="pdp__price">
            <span className="price price--xl">{formatCurrency(product.price)}</span>
            {product.oldPrice && <span className="price price--old">{formatCurrency(product.oldPrice)}</span>}
            {discount > 0 && <span className="pdp__save">Save {formatCurrency(product.oldPrice - product.price)}</span>}
          </div>

          <p className="pdp__desc">{product.description}</p>

          <div className={`pdp__stock ${inStock ? "is-in" : "is-out"}`}>
            {inStock ? (
              <><IconCheck size={16} /> In stock{product.stock < 20 ? ` — only ${product.stock} left` : ""}</>
            ) : (
              <>Out of stock</>
            )}
          </div>

          {product.colors.length > 0 && (
            <div className="pdp__option">
              <span className="pdp__option-label">Colour</span>
              <div className="swatches">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`swatch ${color === c ? "is-active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Colour ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="pdp__option">
              <span className="pdp__option-label">Size</span>
              <div className="sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-chip ${size === s ? "is-active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__actions">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            <button className="btn btn--primary btn--lg pdp__add" onClick={add} disabled={!inStock}>
              <IconCart size={18} /> Add to cart
            </button>
            <button className="btn btn--dark btn--lg" onClick={buyNow} disabled={!inStock}>
              Buy now
            </button>
            <button
              className={`icon-btn icon-btn--lg ${saved ? "is-saved" : ""}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Save to wishlist"
            >
              <IconHeart filled={saved} />
            </button>
          </div>

          <div className="pdp__assurances">
            <div><IconTruck size={18} /> <span><strong>Free delivery</strong> on orders over $100</span></div>
            <div><IconRefresh size={18} /> <span><strong>30-day returns</strong> no questions asked</span></div>
            <div><IconShield size={18} /> <span><strong>2-year warranty</strong> included</span></div>
          </div>

          <div className="pdp__meta">
            <span>SKU: {product.id.toUpperCase()}-{product.category.slice(0, 3).toUpperCase()}</span>
            <span>Category: <Link to={`/shop?category=${product.category}`}>{product.category}</Link></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" id="reviews">
        <div className="tabs__nav" role="tablist">
          {[
            { id: "description", label: "Description" },
            { id: "specs", label: "Specifications" },
            { id: "reviews", label: `Reviews (${product.reviews})` },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`tabs__btn ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tabs__panel">
          {tab === "description" && (
            <div className="prose">
              <p>{product.description}</p>
              <h4>Key features</h4>
              <ul className="feature-list">
                {product.features.map((f) => (
                  <li key={f}><IconCheck size={16} /> {f}</li>
                ))}
              </ul>
            </div>
          )}

          {tab === "specs" && (
            <table className="spec-table">
              <tbody>
                {Object.entries(product.specs).map(([k, v]) => (
                  <tr key={k}><th>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "reviews" && (
            <div className="reviews">
              <div className="reviews__summary">
                <div className="reviews__score">
                  <strong>{product.rating.toFixed(1)}</strong>
                  <Rating value={product.rating} size={18} />
                  <span>Based on {product.reviews} reviews</span>
                </div>
                <div className="reviews__bars">
                  {ratingBreakdown.map((r) => (
                    <div className="reviews__bar" key={r.star}>
                      <span>{r.star}★</span>
                      <div className="reviews__track"><i style={{ width: `${r.pct}%` }} /></div>
                      <span>{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reviews__list">
                {sampleReviews.map((r) => (
                  <article className="review" key={r.name}>
                    <div className="review__head">
                      <span className="avatar">{r.name.charAt(0)}</span>
                      <div>
                        <strong>{r.name}</strong>
                        <Rating value={r.rating} size={13} />
                      </div>
                      <time>{r.date}</time>
                    </div>
                    <h5>{r.title}</h5>
                    <p>{r.text}</p>
                  </article>
                ))}
              </div>
              <button className="btn btn--ghost" onClick={() => notify("Thanks for your interest!", "info")}>
                Write a review
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductRail title="You may also like" products={related} linkTo={`/shop?category=${product.category}`} />

      <div className="pdp__back">
        <Link to="/shop" className="btn btn--ghost"><IconChevronRight size={16} /> Continue shopping</Link>
      </div>
    </div>
  );
}
