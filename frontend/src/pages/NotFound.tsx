import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-8xl text-terracotta mb-4">404</h1>
        <p className="font-body text-2xl text-charcoal mb-8">Page not found</p>
        <Link
          to="/"
          className="font-body text-terracotta hover:text-terracotta/80 underline underline-offset-4 transition-colors text-lg"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
