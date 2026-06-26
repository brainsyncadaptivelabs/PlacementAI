const fs = require('fs');
const p = '/usr/local/lib/node_modules/piston-cli/bin/index.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
    'import pkg from "../package.json" assert { type: "json" };',
    'import { createRequire } from "module"; const require = createRequire(import.meta.url); const pkg = require("../package.json");'
);
fs.writeFileSync(p, c);
