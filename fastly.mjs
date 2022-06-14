import fs from 'fs';

const ftext = fs.readFileSync('./fastly.json', 'utf8');
const fjson = JSON.parse(ftext);

function strip(obj) {
  return Object.entries(obj)
    .filter(([key, value]) => (typeof value === 'string' && value.startsWith('$')) || typeof value === 'object')
    .reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value;
      } else if (typeof value === 'object' && Object.keys(strip(value)).length > 0) {
        acc[key] = strip(value);
      }
      return acc;
    }, {});
}

console.log(JSON.stringify(strip(fjson)));