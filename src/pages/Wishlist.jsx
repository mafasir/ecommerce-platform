import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { getProductById } from "../data/products";
import ProductCard from "../components/ProductCard";
import { IconHeart } from "../components/Icons";

export default function Wishlist() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProductById).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="container page empty empty--lg">
        <span className="empty__icon"><IconHeart size={48} /></span>
        <h2>Your wishlist is empty</h2>
        <p>Save your favourite products to revisit them later.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Discover products</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs"><Link to="/">Home</Link> <span>/</span> <span>Wishlist</span></nav>
      <h1 className="page__title">My Wishlist</h1>
      <p className="page__sub">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
      <div className="grid grid--4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
