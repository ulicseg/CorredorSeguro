# Corredor Seguro MVP

Prototipo frontend-only de una PWA para estudiantes universitarios en Resistencia, Chaco. El objetivo es mostrar un mapa visual de seguridad, elegir puntos de salida y destinos universitarios, y simular rutas seguras con una experiencia visual fuerte para demo/presentación.

## Estado actual

- Phase 1: completada
- Phase 2: completada
- Phase 3: completada
- Ruta actual: peatonal, usando OSRM público
- Datos: frontend-only, sin backend propio
- Stack: React + Vite + Tailwind + Leaflet + React-Leaflet + Framer Motion + Lucide React

## Qué hace la app

- Muestra un mapa a pantalla completa con CartoDB Dark Matter.
- Renderiza universidades, comisarías, puntos de salida, puntos SOS y cámaras.
- Permite elegir entre dos puntos de salida.
- Permite elegir UTN o UNNE como destino.
- Calcula rutas peatonales con OSRM.
- Prioriza rutas que pasen por comisarías de ida cuando no generan desvíos excesivos.
- Muestra cámaras de seguridad distribuidas sobre la ruta.
- Muestra puntos SOS fijos como botones/puntos de monitoreo.
- Tiene botón SOS flotante con modal de emergencia.
- Incluye manifest PWA básico para instalación móvil.

## Stack técnico

- React 18
- Vite 5
- Tailwind CSS 3
- Leaflet 1.9
- React-Leaflet 4
- Framer Motion 10
- Lucide React

## Estructura principal

```text
src/
  components/
    Map.jsx
    DestinationSheet.jsx
    MapLegend.jsx
    MapBoundsController.jsx
    RouteLayer.jsx
    SOSEmergency.jsx
    StartPointSelector.jsx
  hooks/
    useRoute.js
  mocks/
    securityPoints.js
  utils/
    coordinates.js
    routeSafety.js
    safeRoute.js
```

## Flujo funcional

1. El usuario elige un punto de salida.
2. El usuario elige un destino universitario.
3. La app calcula una ruta peatonal con OSRM.
4. Se evalúan rutas candidatas priorizando:
   - comisarías de paso sobre el corredor de ida,
   - menor distancia total en metros,
   - puntos SOS como tercer criterio.
5. Si una ruta con comisaría implica un rodeo grande, se descarta.
6. Se dibuja la ruta elegida y se muestran cámaras y SOS sobre el mapa.

## Datos importantes

### Universidades
- UTN FRRe
- UNNE Campus

### Puntos de salida
- Punto de salida 1
- Punto de salida 2

### Puntos SOS
Hay 5 puntos SOS fijos definidos en `src/mocks/securityPoints.js`.

### Comisarías y nodos policiales
Los puntos policiales están cargados con coordenadas reales provistas manualmente en `src/mocks/securityPoints.js`.

## Decisiones de diseño

- Se usa OSRM con perfil `foot` porque la experiencia está pensada para caminantes.
- No se modela mano/contramano vehicular.
- La prioridad no es tiempo de viaje, sino distancia y proximidad al corredor seguro.
- Se evita el rodeo tipo “vuelta de manzana” con un umbral de desvío.
- La UI está pensada para mobile-first.
- La experiencia se diseñó como prototipo de alta fidelidad, no como producto productivo conectado a backend.

## Variables y archivos clave

### Mapa y UI
- [src/components/Map.jsx](src/components/Map.jsx)
- [src/components/DestinationSheet.jsx](src/components/DestinationSheet.jsx)
- [src/components/SOSEmergency.jsx](src/components/SOSEmergency.jsx)
- [src/components/MapLegend.jsx](src/components/MapLegend.jsx)
- [src/components/StartPointSelector.jsx](src/components/StartPointSelector.jsx)

### Lógica de rutas
- [src/hooks/useRoute.js](src/hooks/useRoute.js)
- [src/utils/coordinates.js](src/utils/coordinates.js)
- [src/utils/routeSafety.js](src/utils/routeSafety.js)
- [src/utils/safeRoute.js](src/utils/safeRoute.js)

### Datos
- [src/mocks/securityPoints.js](src/mocks/securityPoints.js)

### PWA
- [public/manifest.json](public/manifest.json)
- [index.html](index.html)
- [public/icon-192.svg](public/icon-192.svg)
- [public/icon-512.svg](public/icon-512.svg)

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Para validar build:

```bash
npm run build
```

## Contexto para otra IA o para seguir en otro IDE

Este repositorio está listo para continuar en otro entorno. Si otra IA va a trabajar acá, conviene que lea primero:

1. [README.md](README.md)
2. [src/mocks/securityPoints.js](src/mocks/securityPoints.js)
3. [src/hooks/useRoute.js](src/hooks/useRoute.js)
4. [src/utils/routeSafety.js](src/utils/routeSafety.js)
5. [src/components/Map.jsx](src/components/Map.jsx)

### Reglas de comportamiento recomendadas para continuidad

- No cambiar el stack base sin necesidad.
- Mantener el enfoque frontend-only.
- No introducir backend salvo que el proyecto cambie de alcance.
- No priorizar minutos de viaje: usar distancia y corredor seguro.
- No hacer rodeos excesivos para pasar por comisarías.
- Mantener el estilo visual oscuro/neón.
- Cualquier cambio de ruteo debe validar primero build y luego prueba visual.

### Prompt de handoff sugerido

```text
Este proyecto es un prototipo frontend-only en React + Vite.

Objetivo:
- mostrar un mapa oscuro de Resistencia
- marcar universidades, comisarías, puntos SOS, cámaras y salidas
- calcular rutas peatonales con OSRM
- priorizar comisarías de paso sin hacer desvíos grandes
- conservar una UX mobile-first

Archivos clave:
- src/components/Map.jsx
- src/hooks/useRoute.js
- src/utils/routeSafety.js
- src/mocks/securityPoints.js

Antes de modificar ruteo, revisa la lógica actual de prioridad:
1. comisarías de ida
2. distancia más corta
3. puntos SOS

No convertir esto en un stack con backend salvo que se pida explícitamente.
```

## Estado de implementación resumido

- Map base operativo.
- Selector de destinos operativo.
- Selector de punto de salida operativo.
- Ruta OSRM operativa.
- Puntos SOS fijos operativos.
- Cámaras dinámicas sobre la ruta operativas.
- Leyenda visible con colores e íconos.
- Botón SOS y modal de emergencia operativos.
- Manifest PWA enlazado.

## Próximo paso natural

Si se sigue el proyecto, lo siguiente más útil sería:

- afinar umbrales de proximidad de comisarías,
- mejorar la visualización de la ruta elegida,
- o agregar un botón de recentrado/recalcular.
