import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Safety check for Firebase config placeholder
    if (!login || !signup) {
      setError('Authentication is currently unavailable. Please setup Firebase configuration.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/plan');
    } catch (err) {
      console.error(err);
      setError(isLogin ? 'Failed to log in. Check your credentials.' : 'Failed to create an account. Password should be at least 6 characters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 pt-16">
      {/* Subtle Background Pattern/Image */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80" 
          alt="Beach Background" 
          className="w-full h-full object-cover blur-sm opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/40 to-slate-900/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <GlassCard className="!p-8 sm:!p-10 backdrop-blur-2xl bg-white/10 border-white/20 shadow-2xl rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Wanderlust'}
            </h2>
            <p className="text-slate-200 mt-2 text-sm">
              {isLogin ? 'Sign in to access your saved trips' : 'Create an account to save your itineraries'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start space-x-3 text-red-100 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-300" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-white/10 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 sm:text-sm transition-colors duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl leading-5 bg-white/10 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 sm:text-sm transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 !py-3 bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-500/20 text-lg rounded-xl"
              isLoading={loading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-300">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-white hover:text-brand-300 transition-colors underline decoration-brand-400 underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
