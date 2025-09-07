import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet - PLACEHOLDER for production
// TODO: In production, use proper asset management
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Provider {
  id: number;
  business_name: string;
  slug: string;
  city: string;
  address: string;
  bio_nl: string;
  bio_en: string;
  latitude: string;
  longitude: string;
  profile_completeness_score: number;
  gallery: any[];
  languages: Array<{
    language_code: string;
    cefr_level: string;
    name_en: string;
    name_native: string;
  }>;
  services: Array<{
    title: string;
    service_mode: string;
    category_name: string;
  }>;
}

interface MapViewProps {
  providers: Provider[];
  onProviderClick?: (provider: Provider) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Component to fit map bounds to markers
function MapBounds({ providers }: { providers: Provider[] }) {
  const map = useMap();

  useEffect(() => {
    if (providers.length > 0) {
      console.log(`MapBounds: Setting bounds for ${providers.length} providers`);
      const coordinates = providers.map(p => {
        const coords = [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number];
        console.log(`Provider ${p.business_name} coordinates:`, coords);
        return coords;
      });
      
      const bounds = L.latLngBounds(coordinates
      );
      
      // Add padding and fit to bounds
      map.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 13
      });
    }
  }, [providers, map]);

  return null;
}

const MapView = ({ 
  providers, 
  onProviderClick, 
  center = [52.1326, 5.2913], // Default to Netherlands center (shows entire country + borders)
  zoom = 7, // Country-wide view
  className = ''
}: MapViewProps) => {
  const mapRef = useRef<L.Map>(null);

  // Get provider coordinates from API data
  const getProviderCoordinates = (provider: Provider): [number, number] => {
    const lat = parseFloat(provider.latitude);
    const lng = parseFloat(provider.longitude);
    
    // Validate coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Invalid coordinates for provider ${provider.business_name}:`, provider.latitude, provider.longitude);
      return [52.1326, 5.2913]; // Default to Netherlands center
    }
    
    return [lat, lng];
  };

  // Create custom icons for different provider types
  const createProviderIcon = (provider: Provider) => {
    // PLACEHOLDER: Basic icons, can be enhanced with category-specific icons
    const iconHtml = `
      <div style="
        background-color: #0ea5e9; 
        border: 2px solid white; 
        border-radius: 50%; 
        width: 30px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${provider.business_name.charAt(0)}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-provider-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        ref={mapRef}
        zoomControl={false}
      >
        {/* OpenStreetMap tiles - Free and no API key required */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Add zoom controls */}
        <ZoomControl position="topright" />
        
        {/* Fit bounds to show all providers */}
        <MapBounds providers={providers} />

        {/* Provider markers */}
        {providers.map((provider) => {
          const position = getProviderCoordinates(provider);
          
          // Debug logging
          console.log(`Rendering marker for ${provider.business_name} at position:`, position);
          
          return (
            <Marker
              key={provider.id}
              position={position}
              icon={createProviderIcon(provider)}
              eventHandlers={{
                click: () => {
                  if (onProviderClick) {
                    onProviderClick(provider);
                  }
                },
              }}
            >
              <Popup closeButton={true} offset={[0, -10]}>
                <div className="min-w-[250px]">
                  {/* Provider image */}
                  {provider.gallery && provider.gallery.length > 0 && (
                    <img
                      src={provider.gallery[0].url}
                      alt={provider.business_name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  {/* Provider info */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {provider.business_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📍 {provider.city}
                    </p>

                    {/* Services */}
                    {provider.services && provider.services.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Services:
                        </p>
                        <div className="space-y-1">
                          {provider.services.slice(0, 2).map((service, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{service.title}</span>
                              <span className="text-primary-600 font-medium">
                                €{service.price_min}-{service.price_max}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {provider.languages && provider.languages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Languages:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {provider.languages.slice(0, 4).map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {lang.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View details button */}
                    <div className="pt-2 border-t border-gray-100">
                      <a
                        href={`/provider/${provider.provider.slug}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/provider/${provider.provider.slug}`;
                        }}
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-2">
        <div className="text-xs text-gray-500 text-center">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} shown
        </div>
      </div>
    </div>
  );
};

export default MapView;