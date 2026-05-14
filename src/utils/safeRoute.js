function squaredDistance(a, b) {
  const dx = a[1] - b[1];
  const dy = a[0] - b[0];
  return dx * dx + dy * dy;
}

function distancePointToSegment(point, segmentStart, segmentEnd) {
  const px = point[1];
  const py = point[0];
  const x1 = segmentStart[1];
  const y1 = segmentStart[0];
  const x2 = segmentEnd[1];
  const y2 = segmentEnd[0];

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt(squaredDistance(point, segmentStart));
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;

  return Math.sqrt((px - projectionX) ** 2 + (py - projectionY) ** 2);
}

export function selectPoliceWaypoints(origin, destination, policePoints, maxWaypoints = 2) {
  if (!origin || !destination || !Array.isArray(policePoints) || policePoints.length === 0) {
    return [];
  }

  const ranked = policePoints
    .map((point) => {
      const distanceToSegment = distancePointToSegment(point.coordinates, origin, destination);
      const distanceToOrigin = Math.sqrt(squaredDistance(point.coordinates, origin));

      return {
        point,
        // Prioriza cercanía al corredor origen-destino y luego cercanía al origen.
        score: distanceToSegment * 0.75 + distanceToOrigin * 0.25,
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, maxWaypoints)
    .map((item) => item.point.coordinates);

  return ranked;
}
