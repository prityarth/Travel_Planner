import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { saveTrip } from '../services/db';
import { generateItinerary } from '../utils/itineraryGenerator';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Map, MapPin, CalendarDays, Wallet, Users, Sparkles, CheckCircle2, ChevronRight, Clock, Edit2, Check, X } from 'lucide-react';
import { MapView } from '../components/MapView';

const PlanTrip = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [editingActivity, setEditingActivity] = useState(null);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes || 0);
    if (modifier === 'PM') totalMinutes += 12 * 60;
    return totalMinutes;
  };

  const sortActivities = (dayIndex, currentResult) => {
    const sortedActivities = [...currentResult.itinerary[dayIndex].activities].sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
    const newResult = { ...currentResult };
    newResult.itinerary[dayIndex].activities = sortedActivities;
    return newResult;
  };

  const handleActivityEdit = (dayIndex, actIndex, field, value) => {
    const newResult = { ...result };
    newResult.itinerary[dayIndex].activities[actIndex][field] = value;
    setResult(newResult);
  };

  const handleSaveEdit = async (dayIdx) => {
    setEditingActivity(null);
    let sortedResult = result;
    if (dayIdx !== undefined) {
      sortedResult = sortActivities(dayIdx, result);
      setResult(sortedResult);
    }
    
    if (currentUser) {
      try {
        await saveTrip(currentUser.uid, sortedResult);
        setSaveSuccess(true);
      } catch (error) {
        console.error("Failed to update saved trip", error);
      }
    }
  };

  const [formData, setFormData] = useState({
    fromDestination: '',
    destination: '',
    days: 3,
    budget: 'moderate',
    travelType: 'solo',
    peopleCount: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'days' ? parseInt(value) || '' : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const generatedTrip = await generateItinerary(formData);
      setResult(generatedTrip);

      // Auto-save if logged in
      if (currentUser) {
        try {
          await saveTrip(currentUser.uid, generatedTrip);
          setSaveSuccess(true);
        } catch (saveError) {
          console.error("Could not save trip to Firestore", saveError);
        }
      }
    } catch (error) {
      console.error("Generator failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityDelete = (dayIndex, actIndex) => {
    const newResult = { ...result };
    newResult.itinerary[dayIndex].activities.splice(actIndex, 1);
    setResult(newResult);
    handleSaveEdit(); // Auto-save after delete if logged in
  };

  const handleAddActivity = (dayIndex) => {
    const newResult = { ...result };
    newResult.itinerary[dayIndex].activities.push({
      time: "09:00 AM",
      endTime: "10:00 AM",
      title: "New Activity",
      description: "Description of your new activity"
    });
    setResult(newResult);
    setEditingActivity({ dayIdx: dayIndex, actIdx: newResult.itinerary[dayIndex].activities.length - 1 });
  };

  const handleBudgetChange = (category, value) => {
    const newResult = { ...result };
    const numValue = parseInt(value) || 0;
    newResult.budgetBreakdown[category] = numValue;
    
    // Auto-calculate total from categories
    const { total: _, ...categories } = newResult.budgetBreakdown;
    const newTotal = Object.values(categories).reduce((sum, val) => {
      return typeof val === 'number' ? sum + val : sum;
    }, 0);
    newResult.budgetBreakdown.total = newTotal;
    
    setResult(newResult);
  };

  const handleDailyBudgetChange = (dayIndex, value) => {
    const newResult = { ...result };
    const numValue = parseInt(value) || 0;
    
    // Calculate difference
    const diff = numValue - (newResult.itinerary[dayIndex].dailySpend || 0);
    newResult.itinerary[dayIndex].dailySpend = numValue;
    
    // Distribute difference to Food and Activities in breakdown (50/50 split)
    newResult.budgetBreakdown.food = (newResult.budgetBreakdown.food || 0) + Math.round(diff * 0.6);
    newResult.budgetBreakdown.activities = (newResult.budgetBreakdown.activities || 0) + Math.round(diff * 0.4);
    
    // Update total
    const { total: _, ...categories } = newResult.budgetBreakdown;
    newResult.budgetBreakdown.total = Object.values(categories).reduce((sum, val) => {
      return typeof val === 'number' ? sum + val : sum;
    }, 0);
    
    setResult(newResult);
  };

  const handleAddBudgetCategory = () => {
    const categoryName = prompt("Enter new budget category name:");
    if (categoryName && !result.budgetBreakdown[categoryName]) {
      const newResult = { ...result };
      newResult.budgetBreakdown[categoryName] = 0;
      setResult(newResult);
    }
  };

  const handleNavigate = (activity, destination) => {
    const query = encodeURIComponent(`${activity} ${destination}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (result) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl group">
          <img 
            src={result.imageUrl} 
            alt={result.destination}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-brand-300 uppercase tracking-widest mb-1 flex items-center">
                  <MapPin size={14} className="mr-1" /> {result.fromDestination} → {result.destination}
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Exploring {result.destination}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {result.imageGallery && result.imageGallery.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.imageGallery.slice(1, 5).map((img, i) => (
              <div key={i} className="h-32 md:h-40 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <img src={img} alt={`${result.destination} ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 hidden">Your Trip to {result.destination}</h2>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full">{result.days} Days</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full capitalize">{result.budget} Budget</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full capitalize">
                {result.travelType} ({result.peopleCount} {result.peopleCount === 1 ? 'Person' : 'People'})
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {saveSuccess && (
              <span className="flex items-center text-emerald-600 font-medium text-sm bg-emerald-50 px-3 py-1.5 rounded-full">
                <CheckCircle2 size={16} className="mr-1.5" /> Saved to Profile
              </span>
            )}
            <Button onClick={() => setResult(null)} variant="outline">Plan Another</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-slate-800">
              <Map className="mr-2 text-brand-600" /> Itinerary
            </h2>
            {result.itinerary.map((day, dayIdx) => (
              <GlassCard key={day.day} className="bg-white/60 hover:bg-white/80 transition-colors">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <span className="bg-brand-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                      {day.day}
                    </span>
                    {day.title}
                  </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-brand-100 shadow-sm hover:border-brand-300 transition-colors group/budget">
                        <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase tracking-tight group-hover/budget:text-brand-500 transition-colors">Day Budget</span>
                        <div className="flex items-center">
                          <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                          <input 
                            type="number"
                            className="w-20 bg-transparent text-sm font-bold text-brand-600 outline-none"
                            value={day.dailySpend || 0}
                            onChange={(e) => handleDailyBudgetChange(dayIdx, e.target.value)}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddActivity(dayIdx)}
                        className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-xl hover:bg-brand-100 font-bold border border-brand-200 transition-all active:scale-95"
                      >
                        + Add Activity
                      </button>
                    </div>
                </div>
                <div className="space-y-6 pl-4 border-l-2 border-brand-100 ml-4 mt-4">
                  {day.activities.map((act, i) => {
                    const isEditing = editingActivity?.dayIdx === dayIdx && editingActivity?.actIdx === i;

                    return (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[25px] top-1 bg-white border-2 border-brand-300 w-4 h-4 rounded-full"></div>
                        <div className="flex items-start">
                          <span className="text-xs font-bold text-brand-600 w-24 flex-shrink-0 flex flex-col pt-1">
                            <div className="flex items-center"><Clock size={12} className="mr-1" /> {act.time}</div>
                            <div className="ml-4 text-[10px] text-brand-400">to {act.endTime || 'End'}</div>
                          </span>
                          <div className="flex-grow">
                            {isEditing ? (
                              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex flex-wrap gap-2">
                                  <div className="flex items-center gap-1">
                                    <input
                                      className="w-20 text-xs font-bold text-brand-600 bg-white px-2 py-1 border rounded"
                                      value={act.time}
                                      onChange={(e) => handleActivityEdit(dayIdx, i, 'time', e.target.value)}
                                      placeholder="Start"
                                    />
                                    <span className="text-xs text-slate-400">to</span>
                                    <input
                                      className="w-20 text-xs font-bold text-brand-600 bg-white px-2 py-1 border rounded"
                                      value={act.endTime}
                                      onChange={(e) => handleActivityEdit(dayIdx, i, 'endTime', e.target.value)}
                                      placeholder="End"
                                    />
                                  </div>
                                  <input
                                    className="flex-grow font-semibold text-slate-900 bg-white px-2 py-1 border rounded"
                                    value={act.title}
                                    onChange={(e) => handleActivityEdit(dayIdx, i, 'title', e.target.value)}
                                    placeholder="Activity Title"
                                    autoFocus
                                  />
                                </div>
                                <textarea
                                  className="w-full text-slate-600 text-sm bg-white px-2 py-1 border rounded h-20"
                                  value={act.description}
                                  onChange={(e) => handleActivityEdit(dayIdx, i, 'description', e.target.value)}
                                  placeholder="Activity Description"
                                />
                                <div className="flex justify-between items-center">
                                  <button
                                    onClick={() => handleActivityDelete(dayIdx, i)}
                                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                                  >
                                    Delete Activity
                                  </button>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSaveEdit(dayIdx)}
                                      className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                                      title="Save changes"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingActivity(null)}
                                      className="p-1.5 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{act.title}</h4>
                                    <p className="text-slate-600 text-sm mt-1">{act.description}</p>
                                    <button
                                      onClick={() => handleNavigate(act.title, result.destination)}
                                      className="mt-2 text-xs flex items-center text-brand-600 hover:text-brand-700 font-bold group/nav"
                                    >
                                      <Map size={12} className="mr-1 group-hover/nav:scale-110 transition-transform" />
                                      Navigate in Google Maps
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setEditingActivity({ dayIdx, actIdx: i })}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-brand-600"
                                    title="Edit activity"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center text-slate-800">
              <Wallet className="mr-2 text-brand-600" /> Estimated Budget
            </h2>

            <div className="mb-6">
              <MapView destination={result.destination} />
            </div>

            <GlassCard className="bg-blue-50/50 border-blue-100/50">
              <div className="flex justify-between items-center mb-6 border-b border-blue-100 pb-2">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <Wallet size={16} className="mr-2 text-brand-600" /> Breakdown
                </h3>
                <button 
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-bold"
                >
                  {isEditingBudget ? 'Finish Editing' : 'Edit Budget'}
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(result.budgetBreakdown).map(([category, value]) => {
                  if (category === 'total') return null;
                  return (
                    <div key={category} className="flex justify-between items-center pb-3 border-b border-blue-100/50">
                      <span className="text-slate-600 text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {isEditingBudget ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs">₹</span>
                          <input 
                            type="number"
                            className="w-24 text-right font-semibold text-slate-900 bg-white border border-blue-200 rounded px-2 py-0.5 text-sm"
                            value={value}
                            onChange={(e) => handleBudgetChange(category, e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-900">₹{value}</span>
                      )}
                    </div>
                  );
                })}
                
                {isEditingBudget && (
                  <button 
                    onClick={handleAddBudgetCategory}
                    className="w-full py-2 border-2 border-dashed border-blue-200 rounded-lg text-xs text-blue-500 hover:bg-blue-100/50 font-bold transition-colors"
                  >
                    + Add Custom Expense
                  </button>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-slate-900">Total Est.</span>
                  <span className="text-2xl font-extrabold text-brand-600">₹{result.budgetBreakdown.total}</span>
                </div>
              </div>
            </GlassCard>

            {!currentUser && (
              <GlassCard className="bg-orange-50/80 border-orange-200">
                <p className="text-sm text-orange-800 font-medium text-center">
                  Sign in to automatically save this and future itineraries to your account!
                </p>
                <Button variant="primary" className="w-full mt-4 bg-orange-500 hover:bg-orange-600 shadow-orange-500/30" onClick={() => window.location.href = '/login'}>
                  Log In Now
                </Button>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Design Your Dream Trip</h1>
        <p className="text-lg text-slate-600">Tell us what you want, and our AI will craft the perfect itinerary.</p>
      </div>

      <GlassCard className="!p-8 sm:!p-10 shadow-xl border-white/50 bg-white/40">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" /> Starting Location
                </label>
                <input
                  type="text"
                  name="fromDestination"
                  required
                  placeholder="e.g. Mumbai, India"
                  value={formData.fromDestination}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-lg outline-none bg-white/80"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-brand-500" /> Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  required
                  placeholder="e.g. Kyoto, Japan"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-lg outline-none bg-white/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <CalendarDays className="w-4 h-4 mr-2 text-brand-500" /> Duration (Days)
                </label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  max="30"
                  required
                  value={formData.days}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-lg outline-none bg-white/80"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  <Wallet className="w-4 h-4 mr-2 text-brand-500" /> Budget Style
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-lg outline-none bg-white/80 appearance-none"
                >
                  <option value="budget">Backpacker / Budget</option>
                  <option value="moderate">Moderate / Standard</option>
                  <option value="luxury">Luxury / Premium</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                <Users className="w-4 h-4 mr-2 text-brand-500" /> Travel Group
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['solo', 'couple', 'friends', 'family'].map((type) => (
                  <label
                    key={type}
                    className={`
                      cursor-pointer border-2 rounded-xl p-3 text-center transition-all duration-200 font-medium capitalize
                      ${formData.travelType === type
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-white/50 text-slate-600 hover:border-brand-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="travelType"
                      value={type}
                      checked={formData.travelType === type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({ 
                          ...prev, 
                          travelType: val,
                          peopleCount: val === 'solo' ? 1 : val === 'couple' ? 2 : prev.peopleCount 
                        }));
                      }}
                      className="hidden"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {(formData.travelType === 'friends' || formData.travelType === 'family') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                  Number of People
                </label>
                <input
                  type="number"
                  name="peopleCount"
                  min="1"
                  max="50"
                  required
                  value={formData.peopleCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-lg outline-none bg-white/80"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full text-lg py-4 shadow-xl shadow-brand-500/20 group"
          >
            {loading ? 'Crafting Itinerary...' : (
              <>
                Generate Magic Itinerary
                <Sparkles className="ml-2 group-hover:scale-110 transition-transform" size={20} />
              </>
            )}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default PlanTrip;
