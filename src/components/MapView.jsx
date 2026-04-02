import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to fly the map to new coordinates when they change
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 12, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export function MapView({ destination }) {
  const [coords, setCoords] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Geocode the destination using the free Nominatim API (no key required)
  useEffect(() => {
    if (!destination) return;
    Promise.resolve().then(() => {
      setLoading(true);
      setError('');
    });

    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError(`Could not find "${destination}" on the map.`);
        }
      })
      .catch(() => setError('Map geocoding failed. Please check your internet connection.'))
      .finally(() => setLoading(false));
  }, [destination]);

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        alert("Unable to retrieve your location. Please check permissions.");
      }
    );
  };

  if (loading) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div className="w-full h-72 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
        {error || 'No map data available.'}
      </div>
    );
  }

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
      <MapContainer center={coords} zoom={12} className="w-full h-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>
            <span className="font-semibold">{destination}</span>
          </Popup>
        </Marker>
        
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here!</Popup>
          </Marker>
        )}
        
        <FlyTo coords={coords} />
      </MapContainer>
      
      <button 
        onClick={findMyLocation}
        className="absolute top-4 right-4 z-[400] bg-white p-2 rounded-lg shadow-lg hover:bg-slate-50 transition-colors border border-slate-200"
        title="Find my location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
