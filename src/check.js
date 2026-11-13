import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './core.js';
let failed = false;
for (const dir of ['src','sample','test']) for (const f of readdirSync(join(ROOT,dir)).filter(f=>f.endsWith('.js'))) {
  const p=spawnSync(process.execPath,['--check',join(ROOT,dir,f)],{encoding:'utf8'});
  if (p.status!==0) { console.error(p.stderr); failed=true; }
}
console.log(failed?'Syntax checks failed':'Syntax checks passed'); process.exitCode=failed?1:0;
