const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
module.exports = url => {
  const clean = url.split('?')[0];
  const file = path.resolve(root, clean.replace(/^\//, ''));
  if (!file.startsWith(root + path.sep)) throw new Error('Asset path must stay inside the site');
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
  return `${clean}?v=${hash}`;
};
