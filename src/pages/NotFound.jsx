import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page empty empty--lg">
      <h1 className="notfound__code">404</h1>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="empty__actions">
        <Link to="/" className="btn btn--primary btn--lg">Back to home</Link>
        <Link to="/shop" className="btn btn--ghost btn--lg">Browse products</Link>
      </div>
    </div>
  );
}
