function distanceMeters(a, b) {
  const latFactor = 111_320;
  const lonFactor = 111_320 * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  const dLat = (b[0] - a[0]) * latFactor;
  const dLon = (b[1] - a[1]) * lonFactor;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

function pointToSegmentDistanceMeters(point, segStart, segEnd) {
  const latFactor = 111_320;
  const lonFactor = 111_320 * Math.cos(((segStart[0] + segEnd[0]) / 2) * (Math.PI / 180));

  const px = point[1] * lonFactor;
  const py = point[0] * latFactor;
  const x1 = segStart[1] * lonFactor;
  const y1 = segStart[0] * latFactor;
  const x2 = segEnd[1] * lonFactor;
  const y2 = segEnd[0] * latFactor;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

function segmentProjectionInfo(point, segStart, segEnd) {
  const latFactor = 111_320;
  const lonFactor = 111_320 * Math.cos(((segStart[0] + segEnd[0]) / 2) * (Math.PI / 180));

  const px = point[1] * lonFactor;
  const py = point[0] * latFactor;
  const x1 = segStart[1] * lonFactor;
  const y1 = segStart[0] * latFactor;
  const x2 = segEnd[1] * lonFactor;
  const y2 = segEnd[0] * latFactor;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return { distance: Number.POSITIVE_INFINITY, t: 0 };
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const distance = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);

  return { distance, t };
}

function nearestSegmentInfo(point, routeLatLon) {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestSegment = 0;
  let bestRatio = 0;

  for (let i = 1; i < routeLatLon.length; i += 1) {
    const segmentStart = routeLatLon[i - 1];
    const segmentEnd = routeLatLon[i];
    const latFactor = 111_320;
    const lonFactor = 111_320 * Math.cos(((segmentStart[0] + segmentEnd[0]) / 2) * (Math.PI / 180));

    const px = point[1] * lonFactor;
    const py = point[0] * latFactor;
    const x1 = segmentStart[1] * lonFactor;
    const y1 = segmentStart[0] * latFactor;
    const x2 = segmentEnd[1] * lonFactor;
    const y2 = segmentEnd[0] * latFactor;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      continue;
    }

    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    const distance = Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestSegment = i;
      bestRatio = t;
    }
  }

  return { distance: bestDistance, segment: bestSegment, ratio: bestRatio };
}

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

export function policeAlongRoute(routeGeometry, policePoints, thresholdMeters = 120) {
  return pointsAlongRoute(routeGeometry, policePoints, thresholdMeters);
}

export function pointsAlongRoute(routeGeometry, points, thresholdMeters = 120) {
  if (!routeGeometry?.coordinates?.length || !Array.isArray(points)) {
    return [];
  }

  const routeLatLon = routeGeometry.coordinates.map(([lon, lat]) => [lat, lon]);

  return points.filter((point) => {
    for (let i = 1; i < routeLatLon.length; i += 1) {
      const segmentDistance = pointToSegmentDistanceMeters(
        point.coordinates,
        routeLatLon[i - 1],
        routeLatLon[i],
      );

      if (segmentDistance <= thresholdMeters) {
        return true;
      }
    }

    return false;
  });
}

export function policePriorityWaypoints(routeGeometry, policePoints, thresholdMeters = 120, maxWaypoints = 4) {
  if (!routeGeometry?.coordinates?.length || !Array.isArray(policePoints) || policePoints.length === 0) {
    return [];
  }

  const routeLatLon = routeGeometry.coordinates.map(([lon, lat]) => [lat, lon]);

  return policePoints
    .map((point) => {
      const info = nearestSegmentInfo(point.coordinates, routeLatLon);

      return {
        point,
        ...info,
      };
    })
    .filter((item) => item.distance <= thresholdMeters)
    .sort((a, b) => {
      if (a.segment !== b.segment) {
        return a.segment - b.segment;
      }

      if (a.ratio !== b.ratio) {
        return a.ratio - b.ratio;
      }

      return a.distance - b.distance;
    })
    .slice(0, maxWaypoints)
    .map((item) => item.point.coordinates);
}

export function forwardPoliceCandidates(origin, destination, policePoints, thresholdMeters = 240, maxCandidates = 6) {
  if (!origin || !destination || !Array.isArray(policePoints) || policePoints.length === 0) {
    return [];
  }

  return policePoints
    .map((point) => {
      const info = segmentProjectionInfo(point.coordinates, origin, destination);

      return {
        point,
        distance: info.distance,
        progress: info.t,
      };
    })
    .filter((item) => item.distance <= thresholdMeters)
    .filter((item) => item.progress >= 0.05 && item.progress <= 0.95)
    .sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }

      return a.progress - b.progress;
    })
    .slice(0, maxCandidates)
    .map((item) => item.point);
}

function interpolatePoint(a, b, ratio) {
  return [
    a[0] + (b[0] - a[0]) * ratio,
    a[1] + (b[1] - a[1]) * ratio,
  ];
}

export function buildRouteCameraPoints(routeGeometry) {
  if (!routeGeometry?.coordinates?.length) {
    return [];
  }

  const routeLatLon = routeGeometry.coordinates.map(([lon, lat]) => [lat, lon]);
  let totalLength = 0;

  for (let i = 1; i < routeLatLon.length; i += 1) {
    totalLength += distanceMeters(routeLatLon[i - 1], routeLatLon[i]);
  }

  if (totalLength <= 0) {
    return [];
  }

  const seed = routeGeometry.coordinates.length + Math.round(totalLength);
  const cameraCount = seededRandom(seed * 1.97) > 0.5 ? 5 : 4;
  const targetDistances = [];
  const minGap = totalLength / (cameraCount + 2.5);

  for (let i = 0; i < cameraCount; i += 1) {
    let attempts = 0;
    let candidate = 0;

    do {
      const randomFactor = seededRandom(seed * (i + 2.17 + attempts));
      candidate = totalLength * (0.08 + randomFactor * 0.84);
      attempts += 1;
    } while (
      attempts < 12
      && targetDistances.some((distance) => Math.abs(distance - candidate) < minGap)
    );

    targetDistances.push(candidate);
  }

  targetDistances.sort((a, b) => a - b);

  const points = [];
  let accumulated = 0;
  let targetIndex = 0;

  for (let i = 1; i < routeLatLon.length; i += 1) {
    if (targetIndex >= targetDistances.length) {
      break;
    }

    const prev = routeLatLon[i - 1];
    const next = routeLatLon[i];
    const segmentLength = distanceMeters(prev, next);

    while (targetIndex < targetDistances.length && accumulated + segmentLength >= targetDistances[targetIndex]) {
      const remaining = targetDistances[targetIndex] - accumulated;
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      const coordinate = interpolatePoint(prev, next, ratio);
      points.push({
        id: `camera_${points.length + 1}`,
        type: 'camera',
        coordinates: coordinate,
      });
      targetIndex += 1;
    }

    accumulated += segmentLength;
  }

  return points;
}
