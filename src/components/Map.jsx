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
  const [preferPolice, setPreferPolice] = useState(true);

  const policePoints = useMemo(
    () => SECURITY_POINTS.filter((point) => point.type === 'police'),
    [],
  );
  const routeOrigin = selectedStartPoint?.coordinates ?? RESISTENCIA_CENTER;
  const { route, loading, error, usedWaypoints, debugCandidates } = useRoute(
    routeOrigin,
    selectedDestination?.coordinates ?? null,
    policePoints,
    SOS_POINTS,
    preferPolice,
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

        {/* Debug: mostrar waypoints usados para candidatos vía (si existen) */}
        {usedWaypoints?.map((wp, idx) => (
          <Marker
            key={`debug-wp-${idx}`}
            position={wp}
            icon={createCustomIcon('#fb923c', 'WP')}
          >
            <Popup>
              <div className="font-semibold text-sm">
                <p className="font-bold">Waypoint forzado</p>
                <p className="text-xs text-gray-400">{wp[0].toFixed(6)}, {wp[1].toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <RouteLayer routeGeometry={routeGeometry} />
      </MapContainer>

      {/* Toggle preferencia por comisarías */}
      <div className="pointer-events-auto absolute left-4 top-4 z-[999]">
        <button
          type="button"
          onClick={() => setPreferPolice((s) => !s)}
          className="rounded-md bg-zinc-900/80 px-3 py-1 text-xs text-zinc-200"
        >
          {preferPolice ? 'Priorizar comisarías: ON' : 'Priorizar comisarías: OFF'}
        </button>
      </div>

      {/* Panel debug de candidatos (solo para QA) */}
      {debugCandidates && debugCandidates.length > 0 && (
        <div className="pointer-events-auto absolute left-4 top-4 z-[999] w-64 rounded-lg bg-zinc-900/80 p-3 text-xs text-zinc-200 backdrop-blur-md">
          <div className="font-semibold mb-1">Candidatos (depuración)</div>
          <div className="max-h-40 overflow-auto">
            {debugCandidates.map((c, i) => (
              <div key={i} className="flex justify-between border-b border-zinc-800 py-1">
                <div>{c.viaWaypoint ? 'Via' : 'Base'}</div>
                <div>{Math.round(c.distance)}m</div>
                <div>{c.policeCount} P</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
