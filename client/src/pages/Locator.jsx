import { useEffect, useRef, useState } from 'react';

function Locator() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [atms, setATMs] = useState([]);
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [wasteSites, setWasteSites] = useState([]);
  const [vegRestaurants, setVegRestaurants] = useState([]);
  const [nonVegRestaurants, setNonVegRestaurants] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const placesService = useRef(null);
  const userMarker = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyPlaces = (lat, lon) => {
    if (!placesService.current) return;
    setPlacesLoading(true);

    const location = new window.google.maps.LatLng(lat, lon);

    const nearby = (type, cb, extra = {}) => {
      placesService.current.nearbySearch(
        {
          location,
          radius: 20000,
          type,
          ...extra
        },
        (results, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
            cb([]);
            return;
          }
          const mapped = results.map((r) => {
            const coords = [r.geometry.location.lat(), r.geometry.location.lng()];
            return {
              id: r.place_id,
              name: r.name,
              position: coords,
              distance: calculateDistance(lat, lon, coords[0], coords[1]),
              address: r.vicinity || r.formatted_address || "",
              types: r.types || []
            };
          });
          cb(mapped.sort((a, b) => a.distance - b.distance).slice(0, 5));
        }
      );
    };

    // Banks and ATMs
    nearby('bank', (b) => setBanks(b));
    nearby('atm', (a) => setATMs(a));

    // Recycling centers (Google category: recycling_center)
    nearby('recycling_center', (r) => setRecyclingCenters(r));

    // Garbage collection areas: Google Places has no direct "garbage" type.
    // Use waste_management and local_government_office heuristics
    nearby('waste_management', (w) => setWasteSites(w));

    // Restaurants - Veg / Non-Veg filters using keyword
    nearby('restaurant', (r) => setVegRestaurants(r.filter(x => /veg|vegetarian/i.test(x.name)).slice(0, 5)), { keyword: 'vegetarian veg' });
    nearby('restaurant', (r) => setNonVegRestaurants(r.filter(x => !/veg|vegetarian/i.test(x.name)).slice(0, 5)));

    setPlacesLoading(false);
  };

  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }
      const existing = document.getElementById('google-maps');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
        return;
      }
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Maps failed to load'));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadGoogleMaps();
        if (cancelled) return;

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
            if (cancelled) return;
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
      } catch (e) {
        setError(e.message || 'Failed to load map');
        setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Initialize map only after container is mounted and position is known
  useEffect(() => {
    if (!position) return;
    if (!mapRef.current) return;
    if (!(window.google && window.google.maps)) return;
    if (mapInstance.current) return; // already initialized

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: position[0], lng: position[1] },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);

    userMarker.current = new window.google.maps.Marker({
      position: { lat: position[0], lng: position[1] },
      map: mapInstance.current,
      title: 'You are here',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#1e88e5',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    fetchNearbyPlaces(position[0], position[1]);
  }, [position]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">Getting your location...</div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">Error: {error}</div>
    );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-64px)]">
        {/* Map */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-lg overflow-hidden min-h-[60vh] lg:min-h-[calc(100vh-160px)]">
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Banks & ATMs List */}
        <div className="flex-1 flex flex-col gap-6 max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Banks */}
          <div>
            <h4 className="text-md font-semibold text-blue-600 mb-3 flex items-center">
              <span className="text-xl mr-2">🌳</span> Eco-Friendly Banks
            </h4>
            {banks.map((bank, i) => (
              <div
                key={bank.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: bank.position[0], lng: bank.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: bank.position[0], lng: bank.position[1] },
                      map: mapInstance.current,
                      title: bank.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#2e7d32',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">🌳</div>
                  <div>
                    <h4 className="font-medium">{bank.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-blue-600">{bank.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {bank.address && <p className="text-xs text-gray-500 ml-11">{bank.address}</p>}
              </div>
            ))}
          </div>

          {/* ATMs */}
          <div>
            <h4 className="text-md font-semibold text-green-600 mb-3 flex items-center">
              <span className="text-xl mr-2">🏧</span> ATMs
            </h4>
            {atms.map((atm, i) => (
              <div
                key={atm.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: atm.position[0], lng: atm.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: atm.position[0], lng: atm.position[1] },
                      map: mapInstance.current,
                      title: atm.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4caf50',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🏧</div>
                  <div>
                    <h4 className="font-medium">{atm.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-green-600">{atm.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {atm.address && <p className="text-xs text-gray-500 ml-11">{atm.address}</p>}
              </div>
            ))}
          </div>

          {/* Recycling Centers */}
          <div>
            <h4 className="text-md font-semibold text-emerald-600 mb-3 flex items-center">
              <span className="text-xl mr-2">♻️</span> Recycling Centers
            </h4>
            {recyclingCenters.map((rc, i) => (
              <div
                key={rc.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: rc.position[0], lng: rc.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: rc.position[0], lng: rc.position[1] },
                      map: mapInstance.current,
                      title: rc.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#10b981',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">♻️</div>
                  <div>
                    <h4 className="font-medium">{rc.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-emerald-600">{rc.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {rc.address && <p className="text-xs text-gray-500 ml-11">{rc.address}</p>}
              </div>
            ))}
          </div>

          {/* Garbage Collection / Waste Sites */}
          <div>
            <h4 className="text-md font-semibold text-orange-600 mb-3 flex items-center">
              <span className="text-xl mr-2">🗑️</span> Waste Management
            </h4>
            {wasteSites.map((ws, i) => (
              <div
                key={ws.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: ws.position[0], lng: ws.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: ws.position[0], lng: ws.position[1] },
                      map: mapInstance.current,
                      title: ws.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#f59e0b',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🗑️</div>
                  <div>
                    <h4 className="font-medium">{ws.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-orange-600">{ws.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {ws.address && <p className="text-xs text-gray-500 ml-11">{ws.address}</p>}
              </div>
            ))}
          </div>

          {/* Restaurants - Vegetarian */}
          <div>
            <h4 className="text-md font-semibold text-lime-700 mb-3 flex items-center">
              <span className="text-xl mr-2">🥗</span> Vegetarian Restaurants
            </h4>
            {vegRestaurants.map((vr, i) => (
              <div
                key={vr.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: vr.position[0], lng: vr.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: vr.position[0], lng: vr.position[1] },
                      map: mapInstance.current,
                      title: vr.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#84cc16',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-lime-50 border-lime-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-lime-600 rounded-full flex items-center justify-center text-white text-sm font-bold">🥗</div>
                  <div>
                    <h4 className="font-medium">{vr.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-lime-700">{vr.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {vr.address && <p className="text-xs text-gray-500 ml-11">{vr.address}</p>}
              </div>
            ))}
          </div>

          {/* Restaurants - Non-Vegetarian */}
          <div>
            <h4 className="text-md font-semibold text-red-600 mb-3 flex items-center">
              <span className="text-xl mr-2">🍗</span> Non-Vegetarian Restaurants
            </h4>
            {nonVegRestaurants.map((nr, i) => (
              <div
                key={nr.id}
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.panTo({ lat: nr.position[0], lng: nr.position[1] });
                    new window.google.maps.Marker({
                      position: { lat: nr.position[0], lng: nr.position[1] },
                      map: mapInstance.current,
                      title: nr.name,
                      icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                      }
                    });
                  }
                }}
                className={`p-4 rounded-lg shadow-sm border mb-2 cursor-pointer flex flex-col ${
                  i === 0 ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🍗</div>
                  <div>
                    <h4 className="font-medium">{nr.name}{i === 0 && ' (Nearest)'}</h4>
                    <p className="text-sm font-semibold text-red-600">{nr.distance.toFixed(2)} km away</p>
                  </div>
                </div>
                {nr.address && <p className="text-xs text-gray-500 ml-11">{nr.address}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locator;
