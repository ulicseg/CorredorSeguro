export function toOsrmCoordinate([lat, lon]) {
  return [lon, lat];
}

export function toLeafletCoordinate([lon, lat]) {
  return [lat, lon];
}

export function buildOsrmRouteUrl(origin, destination, waypoints = [], options = {}) {
  const { alternatives = false } = options;
  const routePoints = [origin, ...waypoints, destination]
    .map((coordinate) => {
      const [lon, lat] = toOsrmCoordinate(coordinate);
      return `${lon},${lat}`;
    })
    .join(';');

  // Usamos 'foot' para evitar que OSRM se sienta atraido a las grandes avenidas de trafico vehicular.
  return `https://router.project-osrm.org/route/v1/foot/${routePoints}?geometries=geojson&overview=full&alternatives=${alternatives ? 'true' : 'false'}&steps=false`;
}
