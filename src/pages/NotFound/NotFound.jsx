import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <section className="nf-page">
      <div className="nf-content">
        <span className="nf-code">404</span>
        <h1>Page Not Found</h1>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="nf-actions">
          <Link to="/" className="nf-btn primary">Return Home</Link>
          <Link to="/menu" className="nf-btn secondary">Browse Menu</Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;