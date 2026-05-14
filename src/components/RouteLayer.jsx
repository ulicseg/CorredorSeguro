import { GeoJSON } from 'react-leaflet';

export function RouteLayer({ routeGeometry }) {
  if (!routeGeometry) {
    return null;
  }

  return (
    <GeoJSON
      data={routeGeometry}
      style={{
        color: '#00ffff',
        weight: 6,
        opacity: 0.95,
      }}
    />
  );
}
