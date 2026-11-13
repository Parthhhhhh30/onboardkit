import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
export const ROOT = resolve(import.meta.dirname, '..');
export const SAMPLE = join(ROOT, 'sample');
export function run(cmd, args, cwd = ROOT) {
  const env = cmd === 'snyk' ? {...process.env,SNYK_CACHE_PATH:process.env.SNYK_CACHE_PATH || join(ROOT,'.cache/snyk'),SNYK_DISABLE_ANALYTICS:'1'} : process.env;
  if (cmd === 'snyk' && existsSync(join(ROOT,'node_modules/.bin/snyk'))) cmd = join(ROOT,'node_modules/.bin/snyk');
  const p = spawnSync(cmd, args, { cwd, env, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024, shell: false });
  return { code: p.status, stdout: p.stdout || '', stderr: p.stderr || '', error: p.error?.code || (p.signal ? `SIGNAL_${p.signal}` : null) };
}
export function redact(value) {
  const secrets = Object.entries(process.env).filter(([k,v]) => /token|secret|password|credential|api.?key/i.test(k) && v && v.length >= 4).map(([,v]) => v);
  function clean(v, key = '') {
    if (/token|secret|password|credential|authorization|^api$/i.test(key)) return '[REDACTED]';
    if (Array.isArray(v)) return v.map(x => clean(x));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k,x]) => [k,clean(x,k)]));
    if (typeof v !== 'string') return v;
    for (const s of secrets) v = v.split(s).join('[REDACTED]');
    return v.replace(/Bearer\s+[^\s"']+/gi,'Bearer [REDACTED]').replace(/((?:token|password|secret|api[_-]?key)\s*[=:]\s*)[^\s,"'}]+/gi,'$1[REDACTED]').replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/gi,'https://[REDACTED]@');
  }
  return clean(value);
}
export function fingerprint(dir = SAMPLE) {
  return createHash('sha256').update(['package.json','package-lock.json','app.js'].map(f => readFileSync(join(dir,f))).join('\n')).digest('hex');
}
export function manifest(dir) {
  try {
    const p = JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));
    if (!p.name || typeof p.name !== 'string' || !p.version || !p.dependencies || !Object.keys(p.dependencies).length) throw Error('manifest requires name, version and dependencies');
    return { status: 'PASS', project: p.name, version: p.version };
  } catch (e) { return { status: 'FAIL', diagnostic: e.code === 'ENOENT' ? 'Missing package.json' : `Invalid manifest: ${e.message}`, next: 'Restore the sample package.json and run npm ci --prefix sample --ignore-scripts.' }; }
}
export function doctor(exec = run, environment = process.env) {
  const checks = ['node','npm','git','snyk'].map(tool => {
    const p = exec(tool,['--version']);
    return { check: tool, status: p.code === 0 ? 'PASS' : 'BLOCKED', version: p.code === 0 ? p.stdout.trim() : null, next: p.code === 0 ? null : `Install or repair ${tool}; check the diagnostic and rerun doctor.`, diagnostic:p.code===0?null:redact(p.error || p.stderr || p.stdout).slice(0,4000) };
  });
  if (Number(checks[0].version?.replace(/^v/,'').split('.')[0]) < 22) checks[0] = { check: 'node', status: 'BLOCKED', next: 'Install Node.js 22 or newer.' };
  checks.push({ check:'sample manifest', ...manifest(SAMPLE) });
  checks.push({ check:'sample dependencies', status: existsSync(join(SAMPLE,'node_modules/picocolors/package.json')) ? 'PASS' : 'BLOCKED', next:'Run npm ci --prefix sample --ignore-scripts.' });
  // Presence only: deliberately do not read local Snyk credential files or query an account.
  checks.push({ check:'authentication', status: environment.SNYK_TOKEN || environment.SNYK_OAUTH_TOKEN ? 'NOT VERIFIED' : 'ACTION REQUIRED', detail: environment.SNYK_TOKEN || environment.SNYK_OAUTH_TOKEN ? 'Credential environment variable present; validity requires an approved real scan.' : 'No credential environment variable detected. A secure snyk auth session may exist but is not inspected.', next:'After approving Snyk service use, run snyk auth in your terminal. Never paste credentials into chat.' });
  return { state: checks.some(c=>c.status==='BLOCKED'||c.status==='FAIL') ? 'blocked' : environment.SNYK_TOKEN || environment.SNYK_OAUTH_TOKEN ? 'ready' : 'action-required', readiness:'Ready means tools and environment credential presence only; authentication validity still requires an approved real scan.', checks };
}
export function parseScan(p) {
  if (p.error || ![0,1,2,3].includes(p.code)) return { status:'FAIL', completed:false, reason:p.error || 'Unexpected scanner exit code' };
  if (p.code === 2 || p.code === 3) return { status:'FAIL', completed:false, reason:p.code === 3 ? 'Supported project not detected' : 'Scanner execution failure; check authentication, network and configuration' };
  let data;
  try { data = JSON.parse(p.stdout); } catch { return { status:'FAIL', completed:false, reason:'Malformed scanner JSON' }; }
  if (!data || Array.isArray(data) || data.error || typeof data.ok !== 'boolean' || !Array.isArray(data.vulnerabilities) || typeof data.dependencyCount !== 'number' || !Number.isInteger(data.dependencyCount) || data.dependencyCount < 0 || typeof data.packageManager !== 'string') return { status:'FAIL', completed:false, reason:'Incomplete or error scanner response' };
  if ((p.code===0 && (!data.ok || data.vulnerabilities.length)) || (p.code===1 && (data.ok || !data.vulnerabilities.length))) return { status:'FAIL', completed:false, reason:'Exit code and findings disagree' };
  const counts = Object.create(null);
  for (const v of data.vulnerabilities) { if (!v || typeof v.id !== 'string' || !['low','medium','high','critical'].includes(v.severity)) return { status:'FAIL',completed:false,reason:'Malformed finding' }; counts[v.severity]=(counts[v.severity]||0)+1; }
  return { status: p.code === 0 ? 'PASS' : 'ACTION REQUIRED', completed:true, reason:p.code===0?'Scan completed; no vulnerabilities reported':'Scan completed; vulnerabilities detected', dependencyCount:data.dependencyCount, packageManager:data.packageManager, findingCount:data.vulnerabilities.length, severities:counts, findings:data.vulnerabilities.map(v=>({id:v.id,severity:v.severity,packageName:v.packageName,version:v.version})) };
}
const digest = data => createHash('sha256').update(JSON.stringify(data)).digest('hex');
export function record(kind, payload, dir = join(ROOT,'evidence')) {
  mkdirSync(dir,{recursive:true});
  const data = redact({ ...payload, schema:1, id:randomUUID(), timestamp:new Date().toISOString(), kind });
  const event = { data, sha256:digest(data) };
  writeFileSync(join(dir,`${data.timestamp.replaceAll(':','-')}-${data.id}.json`),JSON.stringify(event,null,2)+'\n',{flag:'wx',mode:0o600});
  return data;
}
export function events(dir = join(ROOT,'evidence')) {
  return readdirSync(dir).filter(f=>f.endsWith('.json')).sort().map(f=>{
    const e = JSON.parse(readFileSync(join(dir,f),'utf8'));
    if (!e.data || e.sha256 !== digest(e.data) || e.data.schema!==1 || !e.data.kind || !e.data.timestamp) throw Error(`Evidence integrity failure: ${f}`);
    return e.data;
  });
}
export function invokeScanner(exec = run) {
  return exec('snyk',['test','--json','--file=package.json'],SAMPLE);
}
export function scan(approved = false) {
  const base = { category:'snyk-open-source-test', origin:'REAL ADAPTER', project:manifest(SAMPLE), command:['snyk','test','--json','--file=package.json'], executed:false, completed:false };
  if (!approved) return record('scan',{...base,status:'BLOCKED',reason:'Snyk service use not approved for this invocation. Rerun scan --approve-service-use only after approving dependency metadata transmission.'});
  if (base.project.status !== 'PASS') return record('scan',{...base,status:'FAIL',reason:'Sample manifest invalid'});
  const version = run('snyk',['--version']);
  if (version.code!==0) return record('scan',{...base,status:'BLOCKED',reason:'Snyk CLI cannot execute. Check installation, writable cache and required loopback permissions.', diagnostic:redact(version.error || version.stderr || version.stdout).slice(0,4000)});
  let projectHash;
  try { projectHash=fingerprint(); } catch { return record('scan',{...base,status:'FAIL',reason:'Sample source or lockfile missing'}); }
  const p = invokeScanner();
  const result = parseScan(p);
  return record('scan',{...base,executed:true,projectHash,toolVersion:version.stdout.trim(),exitCode:p.code,...result,diagnostic:redact(p.stderr || (!result.completed ? p.stdout : '')).slice(0,4000)});
}
export function demo() {
  const dir = mkdtempSync(join(tmpdir(),'onboardkit-exercise-'));
  try {
    const command = [process.execPath,join(ROOT,'src/manifest-check.js'),dir];
    const failure = run(command[0],command.slice(1));
    writeFileSync(join(dir,'package.json'),readFileSync(join(SAMPLE,'package.json')));
    const rerun = run(command[0],command.slice(1));
    return record('exercise',{ category:'LOCAL CONFIGURATION EXERCISE — NOT A SECURITY SCAN',status:failure.code===1&&rerun.code===0?'PASS':'FAIL',command:['node','src/manifest-check.js','<temporary-directory>'], failure, cause:'Isolated temporary project has no package.json', correctiveAction:'Restore a valid manifest from the isolated sample', rerun });
  } finally { rmSync(dir,{recursive:true,force:true}); }
}
export const required = ['package.json','package-lock.json','sample/package.json','sample/package-lock.json','sample/app.js','sample/app.test.js','src/cli.js','src/core.js','src/check.js','src/manifest-check.js','test/core.test.js','.github/workflows/ci.yml','.github/workflows/security.yml','README.md','PLAN.md','STATUS.md','EVIDENCE.md','docs/TROUBLESHOOTING.md','docs/LIMITATIONS.md','docs/DEMO.md','docs/IMPLEMENTATION-HANDOVER.md'];
export function requiredChecks(root = ROOT) {
  return required.map(f=>({check:f,status:existsSync(join(root,f))?'PASS':'FAIL'}));
}
export function packageChecks(root = ROOT) {
  return ['.', 'sample'].map(dir => {
    try {
      const p = JSON.parse(readFileSync(join(root,dir,'package.json'),'utf8'));
      const lock = JSON.parse(readFileSync(join(root,dir,'package-lock.json'),'utf8'));
      const meta = lock.packages?.[''];
      if (lock.lockfileVersion !== 3 || !meta || meta.name !== p.name || meta.version !== p.version) throw Error('Lockfile identity mismatch');
      for (const field of ['dependencies','devDependencies']) if (JSON.stringify(meta[field] || {}) !== JSON.stringify(p[field] || {})) throw Error('Lockfile dependency mismatch');
      return {check:`${dir} package configuration`,status:'PASS'};
    } catch(e) { return {check:`${dir} package configuration`,status:'FAIL',detail:`Invalid or inconsistent manifest/lockfile: ${e.message}`}; }
  });
}
export function scanVerified(last, projectHash) {
  return Boolean(last?.executed === true && last.completed === true && last.origin==='REAL ADAPTER' && last.projectHash===projectHash && ((last.exitCode===0 && last.status==='PASS' && last.findingCount===0) || (last.exitCode===1 && last.status==='ACTION REQUIRED' && Number.isInteger(last.findingCount) && last.findingCount>0)));
}
export function remediationCheck(last, current) {
  return {check:'vulnerability remediation',status:'NOT VERIFIED',detail:current && last.findingCount===0
    ? 'No vulnerabilities were reported; no remediation was required or performed. Remediation capability has not been verified.'
    : current ? 'Findings were reported, but no corrective action and rescan have been verified.'
    : 'No valid current scan establishes whether remediation is needed; no remediation has been verified.'};
}
export function verify(approved = false) {
  const checks=[...requiredChecks(),...packageChecks()];
  for (const [name,args] of [['syntax',['src/check.js']],['workbench tests',['--test','test/core.test.js']],['sample tests',['--test','sample/app.test.js']]]) {
    const p = run(process.execPath,args); checks.push({check:name,status:p.code===0?'PASS':'FAIL',exitCode:p.code,diagnostic:(p.stdout+p.stderr).slice(-8000)});
  }
  if (approved) scan(true);
  let all=[];
  try { all=events(); checks.push({check:'evidence integrity',status:all.length?'PASS':'NOT VERIFIED',detail:'SHA-256 detects accidental edits; it is not a signature or proof of authenticity.'}); }
  catch(e) { checks.push({check:'evidence integrity',status:'FAIL',detail:e.message}); }
  const last = all.filter(e=>e.kind==='scan').at(-1);
  let current = false;
  try { current = scanVerified(last,fingerprint()); } catch { /* required file check reports failure */ }
  checks.push({check:'real security scan',status:current?'PASS':last?.status==='FAIL'?'FAIL':'BLOCKED',detail:last?.completed&&current?last.reason:(last?.reason||'No real scan; approve service use and authenticate. A matching current sample fingerprint is required.')});
  checks.push(remediationCheck(last,current));
  checks.push({check:'failure exercise',status:all.filter(e=>e.kind==='exercise').at(-1)?.status==='PASS'?'PASS':'NOT VERIFIED'});
  checks.push({check:'hosted CI',status:'NOT VERIFIED',detail:'No hosted run is verified by this local tool. Review an actual GitHub Actions run separately.'});
  const state = checks.some(c=>c.status==='FAIL')?'FAIL':checks.some(c=>c.status!=='PASS')?'PARTIALLY VERIFIED':'VERIFIED';
  return record('verification',{state,checks});
}
export function report() {
  // Recheck current execution and evidence rather than trusting an old green report.
  const verification = verify();
  const all = events();
  const data = redact({ title:'ONBOARDKIT implementation handover', generatedAt:new Date().toISOString(), disclosure:'Independent AI-assisted portfolio demonstration; not Snyk employment or customer delivery.', state:verification.state, verification, preflight:all.filter(e=>e.kind==='doctor').at(-1) || null, scans:all.filter(e=>e.kind==='scan'), exercises:all.filter(e=>e.kind==='exercise') });
  return writeHandover(data, ROOT);
}
export function writeHandover(data, root) {
  const safe = redact(data);
  mkdirSync(join(root,'docs'),{recursive:true});
  writeFileSync(join(root,'docs/IMPLEMENTATION-HANDOVER.json'),JSON.stringify(safe,null,2)+'\n');
  writeFileSync(join(root,'docs/IMPLEMENTATION-HANDOVER.md'),handoverText(safe));
  return {status:safe.state,markdown:'docs/IMPLEMENTATION-HANDOVER.md',json:'docs/IMPLEMENTATION-HANDOVER.json'};
}
export function handoverText(data) {
  const verification = data.verification;
  return `# ONBOARDKIT implementation handover\n\n${data.disclosure}\n\nStatus: **${data.state}**\n\n## Implementation summary\nA local Node.js CLI checks prerequisites, invokes the official Snyk scanner only with explicit consent, records redacted hash-checked evidence, reproduces a local manifest error and generates this handover.\n\n## Prerequisites and configuration\nNode.js 22+, npm, Git. Run npm ci --ignore-scripts and npm ci --prefix sample --ignore-scripts. Install the official Snyk CLI and authenticate using snyk auth after approving service use.\n\n## Last observed preflight (historical credential-presence check)\n${data.preflight ? data.preflight.checks.map(c=>`- ${c.check}: ${c.status}${c.version?` (${c.version})`:''}`).join('\n') : 'No preflight recorded.'}\n\n## What was actually tested and observed\n${verification.checks.map(c=>`- ${c.check}: **${c.status}**${c.detail?` — ${c.detail}`:''}`).join('\n')}\n\nA later completed scan can establish usable authentication at its timestamp even if this earlier presence-only preflight requested action.\n\n## Scan observations\n${data.scans.length?data.scans.map(s=>`- ${s.timestamp}: ${s.status}; completed=${s.completed}; ${s.reason}; findings=${s.findingCount??'unknown'}`).join('\n'):'No real scanner execution recorded.'}\n\n## Problems and corrective actions\n${data.exercises.map(e=>`- ${e.cause}. Action: ${e.correctiveAction}. Observed failure: ${e.failure.stdout.trim()}. Rerun exit: ${e.rerun.code}; ${e.status}.`).join('\n')||'Exercise not yet run.'}\n\n## Remaining limitations\nHosted CI is NOT VERIFIED. Credential presence does not establish authentication validity. Scan evidence is bound to sample inputs, not the entire repository. Hashes detect accidental edits but are not signed audit records. Unit fixtures are not scanner evidence. No production, exploitability or compliance claim is made.\n\n## Reproduction and next actions\nRun npm run doctor, npm test, npm run demo, npm run verify, npm run report. After approving Snyk service use and completing snyk auth, run npm run scan -- --approve-service-use then npm run report. Review findings if present. With separate authorization, publish to GitHub, configure the protected security environment and run Actions; inspect the actual hosted result.\n\nSee docs/TROUBLESHOOTING.md, docs/LIMITATIONS.md and docs/DEMO.md. Machine-readable diagnostics and timestamps are in IMPLEMENTATION-HANDOVER.json and evidence/*.json.\n`;
}
