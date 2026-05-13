// src/mocks/securityPoints.js

export const SECURITY_POINTS = [
  // Destinos Universitarios
  {
    id: 'utn',
    name: 'UTN FRRe',
    coordinates: [-27.4474, -58.9723], // [Lat, Lon] para Leaflet
    type: 'university',
    color: '#00FFFF'
  },
  {
    id: 'unne',
    name: 'UNNE Campus',
    coordinates: [-27.4612, -58.9818],
    type: 'university',
    color: '#00FFFF'
  },

  // Nodos de Seguridad - Comisarías de Resistencia (Coordenadas Reales)
  {
    id: 'com_1',
    name: 'Comisaría 1ra (Arturo Illia 979)',
    coordinates: [-27.4533, -58.9734],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_2',
    name: 'Comisaría 2da (Av. Rivadavia 260)',
    coordinates: [-27.4475, -58.9858],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_3',
    name: 'Comisaría 3ra (Santa María de Oro 771)',
    coordinates: [-27.4611, -58.9906],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_4',
    name: 'Comisaría 4ta (Av. Marconi 1585)',
    coordinates: [-27.4723, -59.0067],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_5',
    name: 'Comisaría 5ta (Av. Urquiza 2390)',
    coordinates: [-27.4812, -58.9865],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_6',
    name: 'Comisaría 6ta (C. 2 de Abril de 1982)',
    coordinates: [-27.4665, -59.0142],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_7',
    name: 'Comisaría 7ma (Av. Edison 1100)',
    coordinates: [-27.4735, -58.9822],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_8',
    name: 'Comisaría 8va (Alice Le Saige 1203)',
    coordinates: [-27.4418, -58.9649],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_9',
    name: 'Comisaría 9na (Barrio Golf Club)',
    coordinates: [-27.4389, -58.9515],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_10',
    name: 'Comisaría 10ma (Andreani 398)',
    coordinates: [-27.4325, -58.9958],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_11',
    name: 'Comisaría 11ma (Barrio Provincias Unidas)',
    coordinates: [-27.4519, -59.0257],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_12',
    name: 'Comisaría 12ma (Feldman 82)',
    coordinates: [-27.4285, -58.9814],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_13',
    name: 'Comisaría 13ra (Av. Int. Borrini)',
    coordinates: [-27.4426, -58.9715],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_14',
    name: 'Comisaría 14ta (Soberanía Nacional)',
    coordinates: [-27.4855, -58.9918],
    type: 'police',
    color: '#00FF00'
  },
  {
    id: 'com_mujer',
    name: 'Comisaría de la Mujer (Av. Alvear 123)',
    coordinates: [-27.4502, -58.9886],
    type: 'police',
    color: '#00FF00'
  }
];

// Centro de Resistencia para recentrado
export const RESISTENCIA_CENTER = [-27.4514, -58.9839];

// Origen por defecto para ruteo (Plaza 25 de Mayo - aprox.)
export const DEFAULT_ORIGIN = [-27.4510, -58.9840];
