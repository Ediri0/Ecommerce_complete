module.exports = {
  preset: 'ts-jest', // Usa ts-jest para transformar TypeScript
  testEnvironment: 'jsdom', // Configura el entorno de pruebas para React
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transforma archivos TypeScript
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)', // Transforma axios y otros módulos ESM si es necesario
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock de estilos
  },
};
