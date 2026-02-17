import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { getImageUrl } from '../../utils/helpers';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '#';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">LifeLink</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2 text-gray-700">
                {user.profilePicture ? (
                  <img src={getImageUrl(user.profilePicture)} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="capitalize">{user.name}</span>
                <span className="text-gray-400">({user.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
