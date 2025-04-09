module.exports = {
  preset: 'ts-jest', // Usa ts-jest para transformar TypeScript
  testEnvironment: 'jest-environment-jsdom', // Configura el entorno de pruebas para React
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transforma archivos TypeScript
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)', // Transforma axios y otros módulos ESM si es necesario
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock de estilos
  },
  collectCoverage: true, // Habilita la recolección de cobertura
  coverageDirectory: 'coverage', // Directorio donde se almacenará el informe de cobertura
  coverageReporters: ['html', 'text'], // Genera informes en formato HTML y texto
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // Incluye todos los archivos TypeScript y TSX en la cobertura
    '!src/**/*.d.ts', // Excluye archivos de declaración de TypeScript
  ],
  detectOpenHandles: true, // Detecta fugas de recursos y temporizadores abiertos
  forceExit: true, // Fuerza la salida de los procesos de prueba después de completarlas
};
