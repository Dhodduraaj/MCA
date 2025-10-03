import { useEffect, useRef, useState } from 'react';

function Locator() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [atms, setATMs] = useState([]);
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

    const nearby = (type, cb) => {
      placesService.current.nearbySearch(
        {
          location,
          radius: 20000,
          type
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
            };
          });
          cb(mapped.sort((a, b) => a.distance - b.distance).slice(0, 5));
        }
      );
    };

    let banksOut = [];
    let atmsOut = [];
    nearby('bank', (b) => {
      banksOut = b;
      setBanks(banksOut);
      setPlacesLoading(false);
    });
    nearby('atm', (a) => {
      atmsOut = a;
      setATMs(atmsOut);
      setPlacesLoading(false);
    });
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
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

            // Initialize map
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
              center: { lat: coords[0], lng: coords[1] },
              zoom: 15,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false
            });

            placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);

            userMarker.current = new window.google.maps.Marker({
              position: { lat: coords[0], lng: coords[1] },
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

            setLoading(false);
            fetchNearbyPlaces(coords[0], coords[1]);
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
        </div>
      </div>
    </div>
  );
}

export default Locator;
