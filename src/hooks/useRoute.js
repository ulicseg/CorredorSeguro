import { useEffect, useState } from 'react';
import { buildOsrmRouteUrl } from '../utils/coordinates';
import { forwardPoliceCandidates, pointsAlongRoute } from '../utils/routeSafety';

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
    const policeA = pointsAlongRoute(a.geometry, policePoints, 120).length;
    const policeB = pointsAlongRoute(b.geometry, policePoints, 120).length;

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

export function useRoute(origin, destination, policePoints = [], sosPoints = []) {
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
        const baseCandidates = await fetchRouteCandidates(origin, destination, [], controller.signal, true);
        const baseShortest = [...baseCandidates].sort((a, b) => a.distance - b.distance)[0];
        let allCandidates = [...baseCandidates];

        const corridorPolice = forwardPoliceCandidates(origin, destination, policePoints, 240, 6);

        for (const police of corridorPolice) {
          try {
            const viaPoliceCandidates = await fetchRouteCandidates(
              origin,
              destination,
              [police.coordinates],
              controller.signal,
              false,
            );

            const constrained = viaPoliceCandidates.filter(
              (candidate) => candidate.distance <= baseShortest.distance * 1.15,
            );

            if (constrained.length > 0) {
              allCandidates = [...allCandidates, ...constrained];
            }
          } catch {
            // Si falla un candidato puntual, se ignora y se sigue con los demás.
          }
        }

        const bestRoute = pickBestRoute(allCandidates, policePoints, sosPoints);

        if (!bestRoute?.geometry) {
          throw new Error('No se pudo determinar una ruta válida');
        }

        setRoute(bestRoute.geometry);
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
