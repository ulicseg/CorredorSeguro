// src/components/Map.jsx
import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SECURITY_POINTS,
  RESISTENCIA_CENTER,
  START_POINTS,
  DEFAULT_START_POINT,
  SOS_POINTS,
} from '../mocks/securityPoints';
import { DestinationSheet } from './DestinationSheet';
import { RouteLayer } from './RouteLayer';
import { MapBoundsController } from './MapBoundsController';
import { useRoute } from '../hooks/useRoute';
import { MapToolsPanel } from './MapToolsPanel';
import { buildRouteCameraPoints, policeAlongRoute } from '../utils/routeSafety';

// Solucionar iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function Map() {
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedStartPoint, setSelectedStartPoint] = useState(DEFAULT_START_POINT);

  const policePoints = useMemo(
    () => SECURITY_POINTS.filter((point) => point.type === 'police'),
    [],
  );
  const routeOrigin = selectedStartPoint?.coordinates ?? RESISTENCIA_CENTER;
  const { route, loading, error } = useRoute(
    routeOrigin,
    selectedDestination?.coordinates ?? null,
    policePoints,
    SOS_POINTS,
  );
  const routeGeometry = useMemo(() => route, [route]);
  const policeNearRoute = useMemo(
    () => policeAlongRoute(routeGeometry, policePoints, 120),
    [routeGeometry, policePoints],
  );
  const policeNearRouteIds = useMemo(
    () => new Set(policeNearRoute.map((point) => point.id)),
    [policeNearRoute],
  );
  const dynamicCameraPoints = useMemo(
    () => buildRouteCameraPoints(routeGeometry),
    [routeGeometry],
  );

  // Crear iconos personalizados para cada tipo de punto
  const createCustomIcon = (color, label = '') => {
    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white" 
             style="background-color: ${color}; box-shadow: 0 0 8px ${color};">
          <div class="text-[10px] font-bold text-white">${label}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: 'custom-marker'
    });
  };

  return (
    <div className="relative h-screen w-full bg-slate-950">
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

        <MapBoundsController routeGeometry={routeGeometry} />

        {/* Renderizar todos los puntos de seguridad */}
        {SECURITY_POINTS.map((point) => (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={createCustomIcon(
              point.color,
              point.type === 'police' ? 'P' : 'U',
            )}
          >
            <Popup>
              <div className="font-semibold text-sm">
                <p className="font-bold">{point.name}</p>
                <p className="text-xs text-gray-500">
                  {point.type === 'police' && policeNearRouteIds.has(point.id)
                    ? 'Comisaría de paso en ruta'
                    : point.type}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {START_POINTS.map((startPoint) => (
          <Marker
            key={startPoint.id}
            position={startPoint.coordinates}
            icon={createCustomIcon(startPoint.id === selectedStartPoint?.id ? '#fb923c' : startPoint.color, 'S')}
          >
            <Popup>
              <div className="font-semibold text-sm">
                <p className="font-bold">{startPoint.name}</p>
                <p className="text-xs text-gray-500">
                  {startPoint.id === selectedStartPoint?.id ? 'Salida activa' : 'Disponible como salida'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {dynamicCameraPoints.map((point) => (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={createCustomIcon('#64748b', 'C')}
          >
            <Popup>
              <div className="font-semibold text-sm">
                <p className="font-bold">Cámara de seguridad</p>
                <p className="text-xs text-gray-500">Monitoreo visual del corredor</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {SOS_POINTS.map((point) => (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={createCustomIcon('#ef4444', 'SOS')}
          >
            <Popup>
              <div className="font-semibold text-sm">
                <p className="font-bold">{point.name}</p>
                <div className="mt-2">
                  <p className="mb-2 text-xs text-gray-500">Botón de contacto con monitoreo</p>
                  <button
                    type="button"
                    className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Conectar con monitoreo
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <RouteLayer routeGeometry={routeGeometry} />
      </MapContainer>

      <MapToolsPanel
        selectedStartPointId={selectedStartPoint?.id}
        onSelectStartPoint={setSelectedStartPoint}
      />

      <div className="pointer-events-none absolute left-3 top-16 z-[900]">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700/40 bg-zinc-950 px-3 text-[11px] font-medium text-zinc-300 shadow-lg shadow-zinc-900/15 backdrop-blur-md transition hover:bg-zinc-900"
        >
          Destinos
        </button>
      </div>

      <div className="pointer-events-none absolute right-4 top-16 z-[900] flex flex-col gap-3">
        {loading && (
          <div className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 shadow-lg backdrop-blur-md">
            Calculando ruta con OSRM...
          </div>
        )}

        {error && (
          <div className="max-w-xs rounded-2xl border border-rose-400/30 bg-rose-950/90 px-4 py-3 text-sm text-rose-100 shadow-lg backdrop-blur-md">
            {error}
          </div>
        )}
      </div>

      <DestinationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelectDestination={(destination) => {
          setSelectedDestination(destination);
          setIsSheetOpen(false);
        }}
      />
    </div>
  );
}
