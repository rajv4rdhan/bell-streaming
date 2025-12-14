import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@bell-streaming/shared-ui';

export const Layout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl">🎬</div>
            <span className="text-xl font-bold">Bell Streaming</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 px-4 py-2 bg-[#121212] border border-gray-700 rounded-l-full focus:outline-none focus:border-blue-500 text-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#272727] border border-gray-700 border-l-0 rounded-r-full hover:bg-[#3f3f3f] transition-colors"
              >
                🔍
              </button>
            </div>
          </form>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-300">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-800 bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3 text-lg">Bell Streaming</h3>
              <p className="text-gray-400 text-sm">
                Your destination for quality video streaming content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/search" className="hover:text-white">Browse</Link></li>
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2025 Bell Streaming. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
