module.exports = {
  preset: 'ts-jest',
  reporters: ['default'],
  transformIgnorePatterns: [
    '/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)',
  ],
};