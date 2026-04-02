import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { PlaneTakeoff, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50 glass border-b-0 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold text-brand-600 tracking-tight">
            <PlaneTakeoff className="h-8 w-8" />
            <span>Wanderlust</span>
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/plan" className="text-slate-700 hover:text-brand-600 transition-colors font-semibold">Plan Trip</Link>
            <Link to="/saved" className="text-slate-700 hover:text-brand-600 transition-colors font-semibold">Saved</Link>
            
            {currentUser ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-300">
                <div className="flex items-center space-x-2 text-slate-600 text-sm">
                  <User size={16} />
                  <span>{currentUser.email}</span>
                </div>
                <Button variant="ghost" className="!px-3 !py-2" onClick={handleLogout}>
                  <LogOut size={18} className="mr-2" /> Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" className="!px-5 !py-2.5">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
