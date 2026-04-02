import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Compass, MapPin, Calendar, CreditCard } from 'lucide-react';

const FeatureCard = ({ icon: _Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
        <_Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
};

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" 
            alt="Travel background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
            Discover Your Next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200 mt-2">
              Great Adventure
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto text-slate-100 mb-10 leading-relaxed drop-shadow-sm">
            AI-powered itineraries tailored perfectly to your preferences, budget, and travel style. Plan your dream trip in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/plan">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-xl shadow-brand-500/30">
                Plan Your Trip <Compass className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="glass" className="w-full sm:w-auto text-lg px-8 py-4 font-semibold text-white border-white/40">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Three simple steps to your perfect getaway.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={MapPin} 
              title="1. Tell us where" 
              description="Enter your dream destination and how many days you want to spend exploring." 
            />
            <FeatureCard 
              icon={CreditCard} 
              title="2. Set your budget" 
              description="From backpacking to luxury, we tailor recommendations to fit your wallet." 
            />
            <FeatureCard 
              icon={Calendar} 
              title="3. Get your itinerary" 
              description="Receive a complete day-by-day plan with activities, food, and accommodation ideas." 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
