const { concurrent, rimraf, series } = require('nps-utils');

module.exports.scripts = {
  default: series.nps('clean', 'start'),
  clean: rimraf('dist'),
  start: concurrent({
    tsc: [
      'tsc',
      '--project tsconfig.json',
      '--watch',
      '--preserveWatchOutput',
      '--pretty',
    ].join(' '),
    start: [
      'nodemon',
      '--watch "dist/*"',
      '--delay 2000ms',
      '--ext "*"',
      '--exec "npm start"',
    ].join(' '),
  }),
};
