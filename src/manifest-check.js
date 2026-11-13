import { manifest } from './core.js';
const result = manifest(process.argv[2]);
console.log(JSON.stringify(result));
process.exitCode = result.status === 'PASS' ? 0 : 1;
