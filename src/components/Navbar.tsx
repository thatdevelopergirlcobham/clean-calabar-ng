import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    navigate('/logout');
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-green-900 top-0 z-50 ">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          {/* Logo - Left Side */}
          <div className="text-2xl font-bold text-lime-500 hidden md:block">CleanCal</div>

          {/* Center Navigation Links */}
          <div className="flex-1 flex items-center justify-center">
            {user ? (
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/home" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  Home
                </Link>
                <Link to="/my-reports" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  My Reports
                </Link>
                <Link to="/reports-map" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  Report Map
                </Link>
                <Link to="/recyclables" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  Recyclables
                </Link>
                <Link to="/hire-cleaners" className="text-white hover:text-lime-300 flex items-center transition-colors">
                  Hire Cleaners
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-white hover:text-lime-300">
                  Home
                </Link>
                <Link to="/about" className="text-white hover:text-lime-300">
                  About
                </Link>
              </div>
            )}
          </div>

          {/* Right Side - Profile / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-600 hover:bg-lime-700 text-white focus:outline-none"
                  title={user.email || 'Profile'}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="font-medium">{getInitials(user.email)}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-reports"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Reports
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-white hover:text-lime-300 flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-2 bg-lime-500 text-white rounded-full hover:bg-lime-600 transition flex items-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
