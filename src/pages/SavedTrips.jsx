import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserTrips } from '../services/db';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { MapPin, CalendarDays, Wallet, Clock, ArrowRight } from 'lucide-react';

const SavedTrips = () => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTrips() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const userTrips = await getUserTrips(currentUser.uid);
        setTrips(userTrips);
      } catch (err) {
        console.error("Failed to fetch trips", err);
        setError("Could not load your saved trips. Firebase configuration might be missing or rules are restricted.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 py-20 text-center animate-in fade-in zoom-in duration-500">
        <GlassCard className="!p-12 border-brand-100 shadow-xl inline-block max-w-2xl bg-white/60">
          <div className="w-20 h-20 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">You need an account</h2>
          <p className="text-lg text-slate-600 mb-8">Sign in or create an account to view and manage your saved itineraries.</p>
          <Link to="/login">
            <Button size="lg" className="px-10 text-lg shadow-brand-500/20 shadow-xl">Sign In Now</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Saved Trips</h1>
          <p className="text-slate-500 mt-2 font-medium">Revisit your dream itineraries and start planning for real.</p>
        </div>
        <Link to="/plan">
          <Button variant="outline" className="border-slate-300 text-slate-700 hover:text-brand-600 hover:border-brand-300">
            Plan New Trip
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center">
          <Spinner className="mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading your adventures...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl">
          <p className="font-semibold">{error}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <h3 className="text-2xl font-bold text-slate-700 mb-2">No trips saved yet</h3>
          <p className="text-slate-500 mb-6">Looks like you haven't planned any trips!</p>
          <Link to="/plan">
            <Button>Start Planning</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <GlassCard key={trip.id} className="flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 shadow-lg border-white bg-white/70">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-slate-900 line-clamp-2 leading-tight">
                    {trip.destination}
                  </h3>
                  <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-3">
                    {trip.days} Days
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <CalendarDays size={16} className="mr-2 text-brand-500" />
                    Generated: {new Date(trip.createdAt || trip.generatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <Wallet size={16} className="mr-2 text-brand-500" />
                    Est. Budget: ${trip.budgetBreakdown?.total}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-medium capitalize">
                    <Clock size={16} className="mr-2 text-brand-500" />
                    {trip.travelType} • {trip.budget}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Button className="w-full justify-between group bg-slate-100 text-brand-700 hover:bg-brand-50 hover:text-brand-800 border-0 shadow-none">
                  View Full Itinerary
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;
