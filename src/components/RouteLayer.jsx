import { GeoJSON } from 'react-leaflet';

export function RouteLayer({ routeGeometry }) {
  if (!routeGeometry) {
    return null;
  }

  const routeKey = JSON.stringify(routeGeometry.coordinates ?? routeGeometry);

  const onEachFeature = (feature, layer) => {
    // Aplicar clase para animación
    if (layer.setStyle) {
      layer.setStyle({
        className: 'animated-route-line',
      });
    }
  };

  return (
    <GeoJSON
      key={routeKey}
      data={routeGeometry}
      style={{
        color: '#7BC850',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '10, 5',
      }}
      onEachFeature={onEachFeature}
    />
  );
}
