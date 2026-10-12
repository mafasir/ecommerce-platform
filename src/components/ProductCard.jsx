import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";
import Rating from "./Rating";
import { IconHeart, IconCart } from "./Icons";

export default function ProductCard({ product, view = "grid" }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const saved = wishlist.includes(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <article className={`product-card product-card--${view}`}>
      <Link to={`/product/${product.slug}`} className="product-card__media">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {product.images[1] && (
          <img className="product-card__media-alt" src={product.images[1]} alt="" loading="lazy" />
        )}
        <div className="product-card__badges">
          {product.badge && <span className={`badge badge--${product.badge.toLowerCase()}`}>{product.badge}</span>}
          {discount > 0 && <span className="badge badge--sale">-{discount}%</span>}
        </div>
      </Link>

      <button
        className={`product-card__wish ${saved ? "is-saved" : ""}`}
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      >
        <IconHeart size={18} filled={saved} />
      </button>

      <div className="product-card__body">
        <span className="product-card__brand">{product.brand}</span>
        <h3 className="product-card__title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <Rating value={product.rating} count={product.reviews} size={14} />
        <div className="product-card__foot">
          <div className="product-card__price">
            <span className="price">{formatCurrency(product.price)}</span>
            {product.oldPrice && <span className="price price--old">{formatCurrency(product.oldPrice)}</span>}
          </div>
          <button
            className="btn btn--primary btn--icon"
            onClick={() => addToCart(product.id, { qty: 1 })}
            aria-label={`Add ${product.name} to cart`}
            disabled={product.stock === 0}
          >
            <IconCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
