// src/components/Map.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SECURITY_POINTS, RESISTENCIA_CENTER } from '../mocks/securityPoints';

// Solucionar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function Map() {
  // Crear iconos personalizados para cada tipo de punto
  const createCustomIcon = (color) => {
    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white" 
             style="background-color: ${color}; box-shadow: 0 0 8px ${color};">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: 'custom-marker'
    });
  };

  return (
    <MapContainer
      center={RESISTENCIA_CENTER}
      zoom={13}
      style={{ width: '100%', height: '100vh' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        maxZoom={19}
      />
      
      {/* Renderizar todos los puntos de seguridad */}
      {SECURITY_POINTS.map((point) => (
        <Marker
          key={point.id}
          position={point.coordinates}
          icon={createCustomIcon(point.color)}
        >
          <Popup>
            <div className="font-semibold text-sm">
              <p className="font-bold">{point.name}</p>
              <p className="text-xs text-gray-500">{point.type}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
