import { useEffect, useState } from 'react';
import { buildOsrmRouteUrl, toOsrmCoordinate, toLeafletCoordinate } from '../utils/coordinates';
import { policePriorityWaypoints, pointsAlongRoute } from '../utils/routeSafety';

async function fetchRouteCandidates(origin, destination, waypoints, signal, alternatives = true) {
  const response = await fetch(
    buildOsrmRouteUrl(origin, destination, waypoints, { alternatives }),
    { signal },
  );

  if (!response.ok) {
    throw new Error(`OSRM respondió con estado ${response.status}`);
  }

  const data = await response.json();
  const routes = Array.isArray(data?.routes) ? data.routes : [];

  if (routes.length === 0) {
    throw new Error('No se recibieron rutas');
  }

  return routes;
}

function pickBestRoute(routes, policePoints, sosPoints) {
  return [...routes].sort((a, b) => {
    // Umbral más estricto para considerar que una ruta realmente pasa por una comisaría
    const policeA = pointsAlongRoute(a.geometry, policePoints, 60).length;
    const policeB = pointsAlongRoute(b.geometry, policePoints, 60).length;

    if (policeA !== policeB) {
      return policeB - policeA;
    }

    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    const sosA = pointsAlongRoute(a.geometry, sosPoints, 120).length;
    const sosB = pointsAlongRoute(b.geometry, sosPoints, 120).length;

    return sosB - sosA;
  })[0];
}

export function useRoute(origin, destination, policePoints = [], sosPoints = [], preferPolice = true) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedWaypoints, setUsedWaypoints] = useState([]);
  const [debugCandidates, setDebugCandidates] = useState([]);

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
        const baseCandidates = await fetchRouteCandidates(origin, destination, [], controller.signal, true);
        const baseShortest = [...baseCandidates].sort((a, b) => a.distance - b.distance)[0];
        let allCandidates = [...baseCandidates];
        // Si alguna de las rutas alternativas base ya pasa por comisarías cercanas,
        // evitamos forzar waypoints para no introducir giros innecesarios.
        const baseHasPolice = baseCandidates.some((r) => pointsAlongRoute(r.geometry, policePoints, 60).length > 0);
        const baseShortestPoliceCount = pointsAlongRoute(baseShortest.geometry, policePoints, 60).length;

        // Seleccionar comisarías cercanas a la ruta base (no a la línea recta)
        const corridorPolice = policePriorityWaypoints(baseShortest.geometry, policePoints, 120, 4);
        // Sólo aceptar candidatos via-comisaría que no añadan desvíos significativos.
        // Más restrictivo: máximo 3% adicional o 100m extra absoluto.
        const MAX_DETOUR_FACTOR = 1.03; // máximo 3% más de distancia
        const MAX_DETOUR_METERS = 100; // o máximo 100m extra absoluto

        // Helper: snap a coordinate to the routing network using OSRM `nearest`.
        async function snapToNetwork(coordinate, signal) {
          try {
            const [lat, lon] = coordinate;
            const [osrmLon, osrmLat] = toOsrmCoordinate([lat, lon]);
            const url = `https://router.project-osrm.org/nearest/v1/foot/${osrmLon},${osrmLat}?number=1`;
            const res = await fetch(url, { signal });
            if (!res.ok) return coordinate;
            const json = await res.json();
            const loc = json?.waypoints?.[0]?.location;
            if (!loc || !Array.isArray(loc)) return coordinate;
            // loc is [lon, lat]
            return toLeafletCoordinate(loc);
          } catch (e) {
            return coordinate;
          }
        }

        if (preferPolice && !baseHasPolice) {
          for (const policeCoords of corridorPolice) {
          try {
            // Snap candidate waypoint to nearest routable point on OSRM network
            const snapped = await snapToNetwork(policeCoords, controller.signal);
            const viaPoliceCandidates = await fetchRouteCandidates(
              origin,
              destination,
              [snapped],
              controller.signal,
              false,
            );

            // helper para detectar giros bruscos alrededor del waypoint
            function degreesBetweenVectors(ax, ay, bx, by) {
              const dot = ax * bx + ay * by;
              const magA = Math.sqrt(ax * ax + ay * ay);
              const magB = Math.sqrt(bx * bx + by * by);
              if (magA === 0 || magB === 0) return 0;
              const cos = Math.max(-1, Math.min(1, dot / (magA * magB)));
              return Math.acos(cos) * (180 / Math.PI);
            }

            function hasSharpTurn(candidateGeometry, waypoint, windowPoints = 3, angleThreshold = 120) {
              if (!candidateGeometry?.coordinates?.length) return false;
              const coords = candidateGeometry.coordinates.map(([lon, lat]) => [lat, lon]);
              // encontrar índice más cercano
              let bestIdx = 0;
              let bestDist = Infinity;
              for (let i = 0; i < coords.length; i++) {
                const dx = coords[i][0] - waypoint[0];
                const dy = coords[i][1] - waypoint[1];
                const d = dx * dx + dy * dy;
                if (d < bestDist) { bestDist = d; bestIdx = i; }
              }

              const beforeIdx = Math.max(0, bestIdx - windowPoints);
              const afterIdx = Math.min(coords.length - 1, bestIdx + windowPoints);

              if (beforeIdx === bestIdx || afterIdx === bestIdx) return false;

              const before = coords[beforeIdx];
              const mid = coords[bestIdx];
              const after = coords[afterIdx];

              const v1x = mid[0] - before[0];
              const v1y = mid[1] - before[1];
              const v2x = after[0] - mid[0];
              const v2y = after[1] - mid[1];

              const angle = degreesBetweenVectors(v1x, v1y, v2x, v2y);
              return angle > angleThreshold;
            }

            const constrained = viaPoliceCandidates.filter((candidate) => {
              const relativeFactor = candidate.distance / baseShortest.distance;
              const absoluteExtra = candidate.distance - baseShortest.distance;

              // Verificar que la ruta resultante realmente pase cerca de la comisaría
              const passesPolice = pointsAlongRoute(candidate.geometry, [{ coordinates: snapped }], 120).length > 0;

              // Descarta candidatos que introduzcan giros bruscos alrededor del waypoint
              const sharp = hasSharpTurn(candidate.geometry, snapped, 4, 110);

              // Requerir que el candidato aporte al menos N comisarías adicionales
              const candidatePoliceCount = pointsAlongRoute(candidate.geometry, policePoints, 60).length;
              const addsEnoughPolice = candidatePoliceCount >= (baseShortestPoliceCount + 1);

              return passesPolice && !sharp && addsEnoughPolice && relativeFactor <= MAX_DETOUR_FACTOR && absoluteExtra <= MAX_DETOUR_METERS;
            });

            if (constrained.length > 0) {
              const withMeta = constrained.map((c) => ({ ...c, _viaWaypoint: snapped }));
              allCandidates = [...allCandidates, ...withMeta];
            }
          } catch {
            // Si falla un candidato puntual, se ignora y se sigue con los demás.
          }
        }
        }

        // Preparar métricas de depuración para entender la selección
        const debugList = allCandidates.map((c) => ({
          distance: c.distance,
          policeCount: pointsAlongRoute(c.geometry, policePoints, 60).length,
          viaWaypoint: !!c._viaWaypoint,
          extraMeters: c.distance - baseShortest.distance,
        }));
        setDebugCandidates(debugList);

        const bestRoute = pickBestRoute(allCandidates, policePoints, sosPoints);

        if (!bestRoute?.geometry) {
          throw new Error('No se pudo determinar una ruta válida');
        }

        // Si la ruta seleccionada viene de un candidato vía-comisaría, puede incluir
        // la propiedad `_viaWaypoint` que añadimos al crear candidatos; devolverla
        // para debug/visualización.
        const finalWaypoints = bestRoute._viaWaypoint ? [bestRoute._viaWaypoint] : [];

        // Post-procesado: eliminar pequeñas inversiones (u-turns) locales en la geometría
        function removeSharpReversals(geometry) {
          if (!geometry?.coordinates?.length) return geometry;
          const coords = geometry.coordinates.slice();
          const filtered = [];

          function angleBetween(a, b, c) {
            // a,b,c are [lon,lat]
            const ax = a[0], ay = a[1];
            const bx = b[0], by = b[1];
            const cx = c[0], cy = c[1];
            const v1x = bx - ax; const v1y = by - ay;
            const v2x = cx - bx; const v2y = cy - by;
            const dot = v1x * v2x + v1y * v2y;
            const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
            const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
            if (mag1 === 0 || mag2 === 0) return 0;
            const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
            return Math.acos(cos) * (180 / Math.PI);
          }

          filtered.push(coords[0]);
          for (let i = 1; i < coords.length - 1; i++) {
            const a = coords[i - 1];
            const b = coords[i];
            const c = coords[i + 1];
            const ang = angleBetween(a, b, c);
            // Si el ángulo es mayor a 160º y los segmentos son cortos, omitimos el punto b
            if (ang > 160) {
              // medir distancia entre a-b y b-c en grados (aprox)
              const dab = Math.hypot(b[0] - a[0], b[1] - a[1]);
              const dbc = Math.hypot(c[0] - b[0], c[1] - b[1]);
              if (dab < 0.0006 && dbc < 0.0006) {
                // salto: no añadir b
                continue;
              }
            }
            filtered.push(b);
          }
          filtered.push(coords[coords.length - 1]);
          return { ...geometry, coordinates: filtered };
        }

        const cleaned = removeSharpReversals(bestRoute.geometry);

        setRoute(cleaned);
        setUsedWaypoints(finalWaypoints);
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

  return { route, loading, error, usedWaypoints };
}
