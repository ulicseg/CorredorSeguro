import { useEffect, useState } from 'react';
import { toOsrmCoordinate, toLeafletCoordinate } from '../utils/coordinates';
import { evaluateAvenues } from '../utils/routeSafety';
import { PREFERRED_AVENUES, AVOID_AVENUES } from '../mocks/avenues';

// ─── Utilidades geométricas ───────────────────────────────────────────────────

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

// Distancia perpendicular de un punto a un segmento [lat,lon]
function pointToSegDist(p, a, b) {
  const latF = 111320;
  const lonF = 111320 * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  const px = p[1] * lonF, py = p[0] * latF;
  const ax = a[1] * lonF, ay = a[0] * latF;
  const bx = b[1] * lonF, by = b[0] * latF;
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// ¿Un punto [lat,lon] está sobre alguna avenida prohibida? (< 40m)
function isOnAvoidAvenue(point) {
  for (const name of Object.keys(AVOID_AVENUES)) {
    const pts = AVOID_AVENUES[name];
    for (let i = 1; i < pts.length; i++) {
      if (pointToSegDist(point, pts[i - 1], pts[i]) <= 40) return true;
    }
  }
  return false;
}

// Encontrar puntos de avenidas preferidas que estén razonablemente cerca
// del corredor entre origin y destination, ordenados por progresión.
function findPreferredWaypoints(origin, destination) {
  const totalDist = haversineMeters(origin, destination);
  // Corredor más estrecho: máximo 800m o 30% de la distancia total
  const corridor = Math.min(Math.max(totalDist * 0.3, 500), 800);

  const candidates = [];

  for (const [avName, avPoints] of Object.entries(PREFERRED_AVENUES)) {
    for (let i = 0; i < avPoints.length; i++) {
      const pt = avPoints[i];
      const dToOrig = haversineMeters(pt, origin);
      const dToDest = haversineMeters(pt, destination);

      // Progresión: 0 = en el origen, 1 = en el destino
      const progress = dToOrig / (dToOrig + dToDest);

      // Solo aceptar puntos que estén entre 10% y 90% del camino
      if (progress < 0.10 || progress > 0.90) continue;

      // El punto NO debe estar más lejos del destino que el origen
      if (dToDest > totalDist * 1.1) continue;

      // Rechazar puntos muy lejos del corredor recto
      const crossTrack = distPointToLine(pt, origin, destination);
      if (crossTrack > corridor) continue;

      // Rechazar si cae sobre avenida prohibida
      if (isOnAvoidAvenue(pt)) continue;

      candidates.push({ point: pt, progress, avenue: avName, crossTrack, dToDest });
    }
  }

  // Ordenar por cercanía al corredor central (crossTrack bajo = mejor)
  // y dentro de eso, por progresión
  candidates.sort((a, b) => {
    // Priorizar los que están más cerca del eje central
    const crossDiff = a.crossTrack - b.crossTrack;
    if (Math.abs(crossDiff) > 100) return crossDiff;
    return a.progress - b.progress;
  });

  // Seleccionar waypoints con espaciado mínimo Y monotonía hacia el destino
  const selected = [];
  let lastProgress = -Infinity;
  let lastDToDest = Infinity;

  // Primero: tomar los candidatos más cercanos al eje, agrupados por zona de progreso
  const zones = [0.25, 0.50, 0.75]; // Queremos ~1 waypoint en cada zona
  for (const zone of zones) {
    // Buscar el candidato más cercano al eje en esta zona
    const zoneCandidates = candidates
      .filter(c => Math.abs(c.progress - zone) < 0.15)
      .filter(c => c.dToDest < lastDToDest) // Debe estar más cerca del destino que el anterior
      .sort((a, b) => a.crossTrack - b.crossTrack);

    if (zoneCandidates.length > 0) {
      const best = zoneCandidates[0];
      selected.push(best.point);
      lastDToDest = best.dToDest;
    }
  }

  return selected;
}

// Distancia perpendicular de un punto a la línea infinita entre A y B (en metros)
function distPointToLine(p, a, b) {
  const latF = 111320;
  const lonF = 111320 * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  const px = p[1] * lonF, py = p[0] * latF;
  const ax = a[1] * lonF, ay = a[0] * latF;
  const bx = b[1] * lonF, by = b[0] * latF;
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs((dy) * (px - ax) - (dx) * (py - ay)) / len;
}

// ─── Ruteo por segmentos encadenados ──────────────────────────────────────────

// Pedir a OSRM un tramo corto entre dos puntos (sin alternativas)
async function fetchSegment(from, to, signal) {
  const [fLon, fLat] = toOsrmCoordinate(from);
  const [tLon, tLat] = toOsrmCoordinate(to);
  const url = `https://router.project-osrm.org/route/v1/foot/${fLon},${fLat};${tLon},${tLat}?geometries=geojson&overview=full&steps=false`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  if (!data.routes?.length) throw new Error('Sin ruta para segmento');
  return data.routes[0];
}

// Concatenar geometrías GeoJSON de segmentos en una sola LineString
function mergeGeometries(segments) {
  const allCoords = [];
  for (const seg of segments) {
    const coords = seg.geometry.coordinates;
    // Evitar duplicar el punto de unión
    if (allCoords.length > 0) {
      allCoords.push(...coords.slice(1));
    } else {
      allCoords.push(...coords);
    }
  }
  return {
    type: 'LineString',
    coordinates: allCoords,
  };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useRoute(origin, destination, policePoints, sosPoints) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadRoute() {
      setLoading(true);
      setError(null);

      try {
        // 1. Encontrar waypoints sobre avenidas preferidas entre origen y destino
        const waypoints = findPreferredWaypoints(origin, destination);

        // 2. Armar la cadena de puntos: origen → wp1 → wp2 → ... → destino
        const chain = [origin, ...waypoints, destination];

        // 3. Rutear cada par de puntos consecutivos por separado
        const segments = [];
        for (let i = 0; i < chain.length - 1; i++) {
          const seg = await fetchSegment(chain[i], chain[i + 1], controller.signal);
          segments.push(seg);
        }

        // 4. Concatenar todas las geometrías en una sola ruta continua
        const mergedGeometry = mergeGeometries(segments);
        const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);

        // 5. Verificar cuántos metros pasan por avenidas prohibidas
        const avoidScore = evaluateAvenues(mergedGeometry, AVOID_AVENUES);

        // 6. Si la ruta concatenada todavía transita >200m por avenidas prohibidas,
        //    intentar una versión sin waypoints y quedarnos con la que menos viole
        if (avoidScore > 200) {
          const directSeg = await fetchSegment(origin, destination, controller.signal);
          const directScore = evaluateAvenues(directSeg.geometry, AVOID_AVENUES);

          if (directScore < avoidScore) {
            setRoute(directSeg.geometry);
          } else {
            setRoute(mergedGeometry);
          }
        } else {
          setRoute(mergedGeometry);
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('No se pudo calcular la ruta');
          setRoute(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRoute();

    return () => controller.abort();
  }, [origin, destination, JSON.stringify(policePoints), JSON.stringify(sosPoints)]);

  return { route, loading, error };
}
