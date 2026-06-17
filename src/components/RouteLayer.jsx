import { GeoJSON } from 'react-leaflet';

export function RouteLayer({ routeGeometry }) {
  if (!routeGeometry) {
    return null;
  }

  // react-leaflet GeoJSON espera un Feature/FeatureCollection, no una geometría cruda
  const geoData = routeGeometry.type === 'LineString'
    ? { type: 'Feature', geometry: routeGeometry, properties: {} }
    : routeGeometry;

  const routeKey = JSON.stringify(geoData.geometry?.coordinates ?? geoData.coordinates ?? geoData);

  const onEachFeature = (feature, layer) => {
    if (layer.setStyle) {
      layer.setStyle({
        className: 'animated-route-line',
      });
    }
  };

  return (
    <GeoJSON
      key={routeKey}
      data={geoData}
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
