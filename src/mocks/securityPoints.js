// src/mocks/securityPoints.js

export const SECURITY_POINTS = [
  // Destinos Universitarios
  {
    id: 'utn',
    name: 'UTN FRRe',
    coordinates: [-27.45105623091541, -58.979113507104366], // [Lat, Lon] para Leaflet
    type: 'university',
    color: '#64748b'
  },
  {
    id: 'unne',
    name: 'UNNE Campus',
    coordinates: [-27.463759265046846, -58.98493279224318],
    type: 'university',
    color: '#64748b'
  },

  // Nodos de seguridad policiales oficiales
  {
    id: 'pol_ddi_resistencia',
    name: 'POLICIA-DDI-RESISTENCIA',
    coordinates: [-27.45556803866831, -58.98323417209615],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_primera_resistencia',
    name: 'COMISARIA PRIMERA RESISTENCIA',
    coordinates: [-27.460099671490596, -58.9795649101921],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_mujer',
    name: 'Comisaria de la mujer',
    coordinates: [-27.456308265987754, -58.99448666181105],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_tercera',
    name: 'Comisaria Tercera',
    coordinates: [-27.456267874477067, -58.99415665202352],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_segunda_resistencia',
    name: 'COMISARIA SEGUNDA RESISTENCIA',
    coordinates: [-27.4451411474283, -58.98439323887247],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_7ma',
    name: 'Comisaria 7ma',
    coordinates: [-27.472167625986433, -58.991285922763],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_octava',
    name: 'Comisaria Octava',
    coordinates: [-27.450201110735403, -58.96465345431407],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'policia_12ma_metropolitana',
    name: 'Policia del Chaco Cria. 12ma. Metropolitana',
    coordinates: [-27.437326571316266, -58.97381964252451],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'jefatura_chaco',
    name: 'Jefatura de Policia del Chaco',
    coordinates: [-27.438671742706457, -58.999441665958],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_undecima_resistencia',
    name: 'Comisaria Undecima Resistencia',
    coordinates: [-27.44623001999957, -59.01546445198217],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_cuarta_resistencia',
    name: 'COMISARIA CUARTA RESISTENCIA',
    coordinates: [-27.450713499128817, -59.01524792878024],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'comisaria_6',
    name: 'Comisaria 6',
    coordinates: [-27.458719258535847, -59.01791839306202],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'pfa_duof_resistencia',
    name: 'Policia Federal Argentina DUOF Resistencia',
    coordinates: [-27.455705248440744, -58.98524790940902],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'policia_comisaria_numero_1',
    name: 'Policia Comisaria Numero 1',
    coordinates: [-27.46028216640169, -58.97946968160145],
    type: 'police',
    color: '#0055FF'
  },
  {
    id: 'gendarmeria_region_viii',
    name: 'Gendarmeria Nacional - Region VIII (Chaco-Formosa)',
    coordinates: [-27.446984629774576, -58.99190786333293],
    type: 'police',
    color: '#0055FF'
  }
];

// Centro de Resistencia para recentrado
export const RESISTENCIA_CENTER = [-27.4514, -58.9839];

export const START_POINTS = [
  {
    id: 'start_1',
    name: 'Punto de salida 1',
    coordinates: [-27.476773471201703, -58.995473122461235],
    type: 'start',
    color: '#f97316'
  },
  {
    id: 'start_2',
    name: 'Punto de salida 2',
    coordinates: [-27.436433105421525, -59.00303274284087],
    type: 'start',
    color: '#fb923c'
  }
];

export const DEFAULT_START_POINT = START_POINTS[0];

export const SOS_POINTS = [
  {
    id: 'sos_1',
    name: 'Punto SOS 1',
    coordinates: [-27.450517629850285, -58.97993415457482],
    type: 'sos',
    color: '#ef4444'
  },
  {
    id: 'sos_2',
    name: 'Punto SOS 2',
    coordinates: [-27.451638858343845, -58.98715912458662],
    type: 'sos',
    color: '#ef4444'
  },
  {
    id: 'sos_3',
    name: 'Punto SOS 3',
    coordinates: [-27.444208015850673, -58.986459790327906],
    type: 'sos',
    color: '#ef4444'
  },
  {
    id: 'sos_4',
    name: 'Punto SOS 4',
    coordinates: [-27.451109422129864, -58.99418248472701],
    type: 'sos',
    color: '#ef4444'
  },
  {
    id: 'sos_5',
    name: 'Punto SOS 5',
    coordinates: [-27.43906262258936, -58.98244414148088],
    type: 'sos',
    color: '#ef4444'
  }
];
