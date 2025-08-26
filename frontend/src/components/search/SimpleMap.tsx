import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom user location icon (blue/different style)
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzM5ODRGRiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface SimpleMapProps {
  providers: any[];
  userLocation?: {
    lat: number;
    lng: number;
    city?: string;
  } | null;
  searchRadius?: number; // in kilometers
}

const SimpleMap = ({ providers, userLocation, searchRadius = 25 }: SimpleMapProps) => {
  console.log('SimpleMap rendering with providers:', providers);
  console.log('User location:', userLocation);
  console.log('Search radius:', searchRadius);
  
  // Calculate map center and zoom based on user location or default to Amsterdam
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [52.3676, 4.9041]; // Amsterdam default
    
  // Adjust zoom based on search radius
  const getZoomLevel = (radius: number): number => {
    if (radius <= 10) return 12;
    if (radius <= 25) return 10;
    if (radius <= 50) return 9;
    if (radius <= 100) return 8;
    return 7;
  };
  
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={getZoomLevel(searchRadius)}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker and search radius */}
        {userLocation && (
          <>
            {/* Search radius circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={searchRadius * 1000} // Convert km to meters
              pathOptions={{
                fillColor: '#3984FF',
                fillOpacity: 0.1,
                color: '#3984FF',
                weight: 2,
                opacity: 0.8,
                dashArray: '5, 5'
              }}
            />
            
            {/* User location marker */}
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-blue-700">Your Location</span>
                  </div>
                  {userLocation.city && (
                    <p className="text-sm text-gray-600 mb-2">{userLocation.city}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Searching within {searchRadius}km radius
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Provider markers */}
        {providers && providers.map((provider, index) => {
          // Handle both provider.lat/lng and provider.latitude/longitude formats
          const lat = provider.latitude || provider.lat || provider.provider?.lat || 52.3676;
          const lng = provider.longitude || provider.lng || provider.provider?.lng || 4.9041;
          
          return (
            <Marker 
              key={provider.id || index}
              position={[lat, lng]}
            >
            <Popup maxWidth={320} minWidth={280}>
              <div className="p-0 m-0 min-w-[280px]">
                {/* Header with business name and city */}
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
                    {provider.business_name || 'Unknown Provider'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{provider.city || 'Unknown City'}</span>
                    {provider.distance && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {provider.distance}km away
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {provider.languages && provider.languages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Languages:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.languages.slice(0, 4).map((lang, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          <img 
                            src={`https://flagcdn.com/16x12/${lang.language_code === 'en' ? 'gb' : lang.language_code === 'ar' ? 'sa' : lang.language_code === 'zgh' ? 'ma' : lang.language_code === 'uk' ? 'ua' : lang.language_code === 'zh' ? 'cn' : lang.language_code === 'yue' ? 'hk' : lang.language_code === 'ti' ? 'er' : lang.language_code === 'so' ? 'so' : lang.language_code === 'hi' ? 'in' : lang.language_code}.png`}
                            alt={`${lang.language_code} flag`}
                            className="w-3 h-2 mr-1"
                          />
                          {lang.name_en}
                        </span>
                      ))}
                      {provider.languages.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{provider.languages.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Services */}
                {provider.services && provider.services.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md">
                          {service.title}
                        </span>
                      ))}
                      {provider.services.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{provider.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {(provider.bio_en || provider.bio_nl) && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {provider.bio_en || provider.bio_nl}
                    </p>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-3 border-t border-gray-100">
                  <button 
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                    onClick={() => {
                      const slug = provider.slug || provider.business_name?.toLowerCase().replace(/\s+/g, '-');
                      if (slug) {
                        window.location.href = `/provider/${slug}`;
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Profile
                  </button>
                </div>
              </div>
            </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;