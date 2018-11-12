const { concurrent, rimraf, series } = require('nps-utils');

module.exports.scripts = {
  default: series.nps('clean', 'dev'),
  clean: rimraf('dist'),
  dev: concurrent({
    tsc: [
      'tsc',
      '--project tsconfig.json',
      '--watch',
      '--preserveWatchOutput',
      '--pretty',
    ].join(' '),
    serve: [
      'nodemon',
      '--watch "dist/*"',
      '--delay 2000ms',
      '--ext "*"',
      '--exec "npm start"',
    ].join(' '),
  }),
  build: series('nps clean', 'tsc --project tsconfig.json'),
};
