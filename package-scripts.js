const { concurrent } = require('nps-utils');

module.exports.scripts = {
  default: concurrent({
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
