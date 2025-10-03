import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: bold;
    ">${color === '#2e7d32' ? '🌳' : '🍃'}</div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const bankIcon = createCustomIcon('#2e7d32');
const atmIcon = createCustomIcon('#4caf50');

function PanTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16);
  }, [position, map]);
  return null;
}

function Locator() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [banks, setBanks] = useState([]);
  const [atms, setATMs] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [panPosition, setPanPosition] = useState(null);

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

  const fetchNearbyPlaces = async (lat, lon) => {
    setPlacesLoading(true);
    try {
      const radius = 20000;
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="atm"](around:${radius},${lat},${lon});
          node["amenity"="bank"](around:${radius},${lat},${lon});
          way["amenity"="atm"](around:${radius},${lat},${lon});
          way["amenity"="bank"](around:${radius},${lat},${lon});
        );
        out center;
      `;
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const bankList = [];
      const atmList = [];
      data.elements.forEach((el) => {
        const coords = el.center ? [el.center.lat, el.center.lon] : [el.lat, el.lon];
        const distance = calculateDistance(lat, lon, coords[0], coords[1]);
        const place = {
          id: el.id,
          name: el.tags?.name || (el.tags?.amenity === 'bank' ? `Bank #${el.id}` : `ATM #${el.id}`),
          position: coords,
          distance,
          tags: el.tags,
          amenity: el.tags?.amenity,
        };
        if (el.tags?.amenity === 'bank') bankList.push(place);
        else if (el.tags?.amenity === 'atm') atmList.push(place);
      });

      setBanks(bankList.sort((a, b) => a.distance - b.distance).slice(0, 5));
      setATMs(atmList.sort((a, b) => a.distance - b.distance).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setPlacesLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setLoading(false);
        fetchNearbyPlaces(coords[0], coords[1]);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
        <div className="flex-none w-full lg:w-2/3 bg-white rounded-lg shadow-lg overflow-hidden flex-1">
          <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <strong>📍 You are here!</strong>
                <br />
                Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
              </Popup>
            </Marker>

            {banks.map((bank) => (
              <Marker key={bank.id} position={bank.position} icon={bankIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌳</div>
                    <strong>{bank.name}</strong>
                    <br />
                    {bank.distance.toFixed(2)} km away
                    {bank.tags?.addr_street && <div>{bank.tags.addr_street}</div>}
                  </div>
                </Popup>
              </Marker>
            ))}

            {atms.map((atm) => (
              <Marker key={atm.id} position={atm.position} icon={atmIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏧</div>
                    <strong>{atm.name}</strong>
                    <br />
                    {atm.distance.toFixed(2)} km away
                    {atm.tags?.addr_street && <div>{atm.tags.addr_street}</div>}
                  </div>
                </Popup>
              </Marker>
            ))}

            {panPosition && <PanTo position={panPosition} />}
          </MapContainer>
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
                onClick={() => setPanPosition(bank.position)}
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
                {bank.tags?.addr_street && <p className="text-xs text-gray-500 ml-11">{bank.tags.addr_street}</p>}
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
                onClick={() => setPanPosition(atm.position)}
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
                {atm.tags?.addr_street && <p className="text-xs text-gray-500 ml-11">{atm.tags.addr_street}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locator;
