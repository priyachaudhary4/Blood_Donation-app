import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Info } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map view when center changes
function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
}

const LocateMap = ({ donations }) => {
    // Default location (e.g., Hospital Center) - Initially New Delhi
    const [center, setCenter] = useState([28.6139, 77.2090]);
    const [userLocation, setUserLocation] = useState(null);

    // Get User Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCenter([latitude, longitude]);
                    setUserLocation([latitude, longitude]);
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    // Fallback or keep default center
                }
            );
        }
    }, []);

    // Filter requests that have valid coordinates
    const mapLocations = donations.filter(d => (d.latitude && d.longitude && d.status !== 'Completed'));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-600" />
                Find Blood Drives & Bank
            </h2>

            <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-200">
                <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <RecenterAutomatically lat={center[0]} lng={center[1]} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker position={userLocation}>
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-blue-600">You are Here</h3>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Main Blood Bank Marker (Static for now, could be dynamic) */}
                    <Marker position={[28.6139, 77.2090]}>
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-red-600">Main Blood Bank</h3>
                                <p>Open 24/7 for Emergency</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Active Drive Markers */}
                    {mapLocations.map((loc) => (
                        <Marker key={loc._id} position={[loc.latitude, loc.longitude]}>
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="font-bold text-red-600 mb-1">Blood Drive</h3>
                                    <p className="font-semibold text-sm">{loc.type === 'Drive' ? 'Scheduled Camp' : 'Emergency Request'}</p>
                                    <p className="text-xs text-gray-600 mt-1">{loc.location}</p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(loc.scheduledDate).toLocaleDateString()} ({loc.startTime} - {loc.endTime})
                                    </p>
                                    <div className="mt-2 text-xs font-bold text-gray-800">
                                        Needed: {loc.bloodType}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded">
                <Info className="w-5 h-5 text-blue-500" />
                <p>Click on the pins to see details about the Blood Bank or Active Donation Drives.</p>
            </div>
        </div>
    );
};

export default LocateMap;
