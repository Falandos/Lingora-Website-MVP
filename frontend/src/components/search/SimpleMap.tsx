import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapProps {
  providers: any[];
}

const SimpleMap = ({ providers }: SimpleMapProps) => {
  console.log('SimpleMap rendering with providers:', providers);
  
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[52.3676, 4.9041]} // Amsterdam
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Test marker */}
        <Marker position={[52.3676, 4.9041]}>
          <Popup>
            Test marker in Amsterdam
          </Popup>
        </Marker>
        
        {/* Provider markers */}
        {providers && providers.map((provider, index) => (
          <Marker 
            key={index}
            position={[
              provider.provider?.lat || 52.3676, 
              provider.provider?.lng || 4.9041
            ]}
          >
            <Popup>
              <div>
                <h3>{provider.provider?.name || 'Unknown Provider'}</h3>
                <p>{provider.provider?.city || 'Unknown City'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;