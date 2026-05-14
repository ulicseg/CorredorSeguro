import { GeoJSON } from 'react-leaflet';

export function RouteLayer({ routeGeometry }) {
  if (!routeGeometry) {
    return null;
  }

  const routeKey = JSON.stringify(routeGeometry.coordinates ?? routeGeometry);

  return (
    <GeoJSON
      key={routeKey}
      data={routeGeometry}
      style={{
        color: '#00ffff',
        weight: 6,
        opacity: 0.95,
      }}
    />
  );
}
