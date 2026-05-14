import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapBoundsController({ routeGeometry }) {
  const map = useMap();

  useEffect(() => {
    if (!routeGeometry?.coordinates?.length) {
      return;
    }

    const bounds = routeGeometry.coordinates.map(([lon, lat]) => [lat, lon]);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [map, routeGeometry]);

  return null;
}
