// TEST FIXTURES: synthetic process results below are never recorded as real scans.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { doctor, parseScan, redact, record, events, manifest, ROOT, SAMPLE, run, invokeScanner, handoverText, writeHandover, requiredChecks, scanVerified, packageChecks, remediationCheck } from '../src/core.js';
const clean = {ok:true,vulnerabilities:[],dependencyCount:1,packageManager:'npm'};
const fixture = (code,data=clean) => ({code,stdout:JSON.stringify(data),stderr:'',error:null});
const fakeDoctor = exec => doctor(exec, {});
const temp = () => mkdtempSync(join(tmpdir(),'onboardkit-test-'));
test('preflight detects missing tools without inventing readiness',()=>{
 const calls=[]; const d=fakeDoctor((tool,args)=>{calls.push([tool,args]);return {code:null,stdout:'',error:'ENOENT'};});
 assert.equal(d.state,'blocked'); assert.equal(d.checks.find(c=>c.check==='snyk').status,'BLOCKED');
 assert.deepEqual(calls.map(c=>c[0]),['node','npm','git','snyk']); assert.ok(calls.every(c=>c[1][0]==='--version'));
});
test('preflight detects old Node and treats credentials only as presence',()=>{
 const d=fakeDoctor((tool)=>({code:0,stdout:tool==='node'?'v18.0.0':'1.0.0'}));
 assert.equal(d.checks[0].status,'BLOCKED'); assert.notEqual(d.checks.at(-1).status,'PASS');
});
test('ready tools still require authentication verification',()=>{
 const d=fakeDoctor((tool)=>({code:0,stdout:tool==='node'?'v24.0.0':'1.0.0'}));
 assert.equal(d.state,'action-required');
});
test('exit 0 is completed clean scan',()=>{const p=parseScan(fixture(0));assert.equal(p.completed,true);assert.equal(p.findingCount,0);assert.equal(p.status,'PASS');});
test('exit 1 is completed findings, not execution failure',()=>{
 const p=parseScan(fixture(1,{...clean,ok:false,vulnerabilities:[{id:'TEST-ONLY',severity:'high',packageName:'fixture'}]}));
 assert.equal(p.completed,true);assert.equal(p.status,'ACTION REQUIRED');assert.equal(p.severities.high,1);
});
for (const code of [2,3]) test(`exit ${code} is not completed`,()=>assert.equal(parseScan(fixture(code)).completed,false));
test('authentication and configuration errors cannot masquerade as completed scans',()=>{
 for (const code of [0,1,2]) for (const data of [{error:'Authentication failed'},{...clean,error:'Bad config'}]) assert.equal(parseScan(fixture(code,data)).completed,false);
});
test('malformed, empty, partial, multi-project and contradictory responses fail closed',()=>{
 for (const stdout of ['','not json','null','{}','[]',JSON.stringify({...clean,dependencyCount:-1}),JSON.stringify({...clean,vulnerabilities:[{}]})]) assert.equal(parseScan({code:0,stdout}).completed,false);
 assert.equal(parseScan(fixture(1)).completed,false);
 assert.equal(parseScan(fixture(0,{...clean,ok:false})).completed,false);
 assert.equal(parseScan({code:0,stdout:JSON.stringify(clean),error:'ETIMEDOUT'}).completed,false);
 assert.equal(parseScan(fixture(7)).completed,false);
});
test('missing and malformed manifests yield corrective steps',()=>{
 const dir=temp();try{assert.match(manifest(dir).diagnostic,/Missing/);writeFileSync(join(dir,'package.json'),'{');assert.match(manifest(dir).diagnostic,/Invalid/);writeFileSync(join(dir,'package.json'),'{}');assert.equal(manifest(dir).status,'FAIL');assert.equal(manifest(SAMPLE).status,'PASS');}finally{rmSync(dir,{recursive:true});}
});
test('redaction covers nested credentials, environment values, bearer and URL auth',()=>{
 const previous=process.env.ONBOARDKIT_TEST_TOKEN;process.env.ONBOARDKIT_TEST_TOKEN='known-sensitive-value';
 try { const result=redact({token:'hidden',nested:[{password:'hidden'}],text:'known-sensitive-value Bearer abc123 token=xyz https://user:pass@example.com'});const s=JSON.stringify(result);for(const secret of ['hidden','known-sensitive-value','abc123','xyz','user:pass']) assert.ok(!s.includes(secret)); }
 finally {if(previous===undefined)delete process.env.ONBOARDKIT_TEST_TOKEN;else process.env.ONBOARDKIT_TEST_TOKEN=previous;}
});
test('evidence records metadata, redacts before hashing and detects tampering',()=>{
 const dir=temp();try{const e=record('fixture',{token:'never-save',status:'PASS'},dir);assert.ok(e.timestamp);assert.equal(events(dir).length,1);const f=join(dir,readdirSync(dir)[0]); const raw=JSON.parse(readFileSync(f,'utf8')); assert.ok(!readFileSync(f,'utf8').includes('never-save')); raw.data.status='FAIL'; writeFileSync(f,JSON.stringify(raw)); assert.throws(()=>events(dir),/integrity/);}finally{rmSync(dir,{recursive:true});}
});
test('corrupt evidence and malformed JSON are rejected',()=>{
 const dir=temp();try{writeFileSync(join(dir,'bad.json'),JSON.stringify({data:{schema:1},sha256:'wrong'}));assert.throws(()=>events(dir),/integrity/);writeFileSync(join(dir,'bad.json'),'{');assert.throws(()=>events(dir));}finally{rmSync(dir,{recursive:true});}
});
test('real process runner reports missing binaries and exit codes',()=>{
 assert.equal(run('onboardkit-nonexistent-binary-123',[]).error,'ENOENT');assert.equal(run(process.execPath,['-e','process.exit(3)']).code,3);
});
test('scanner adapter is isolated and consent gated; does not use monitor',()=>{
 const source=readFileSync(join(ROOT,'src/core.js'),'utf8');
 assert.ok(!source.includes("['monitor'"));
 const dir=temp(); try { mkdirSync(join(dir,'src')); cpSync(join(ROOT,'src/core.js'),join(dir,'src/core.js')); cpSync(join(ROOT,'src/cli.js'),join(dir,'src/cli.js')); writeFileSync(join(dir,'package.json'),'{"type":"module"}');
 const p=spawnSync(process.execPath,['src/cli.js','scan'],{cwd:dir,encoding:'utf8'});
 assert.equal(p.status,2);const e=JSON.parse(p.stdout);assert.equal(e.completed,false);assert.equal(e.status,'BLOCKED');
 } finally {rmSync(dir,{recursive:true});}
});
test('CLI rejects unsupported options without executing scanner',()=>{
 const p=spawnSync(process.execPath,['src/cli.js','scan','--all-projects'],{cwd:ROOT,encoding:'utf8'});assert.equal(p.status,1);assert.match(p.stderr,/Unsupported/);
});
test('CI keeps scanner secrets out of PR event workflow',()=>{
 const ci=readFileSync(join(ROOT,'.github/workflows/ci.yml'),'utf8');const security=readFileSync(join(ROOT,'.github/workflows/security.yml'),'utf8');
 assert.ok(!ci.includes('secrets.'));assert.ok(!security.includes('pull_request'));assert.match(security,/environment: snyk-security/);assert.match(security,/persist-credentials: false/);assert.match(security,/contents: read/);assert.match(security,/NOT VERIFIED/);
});

test('scanner invocation passes only documented arguments to isolated sample',()=>{
 let called=false; const result=invokeScanner((cmd,args,cwd)=>{called=true;assert.equal(cmd,'snyk');assert.deepEqual(args,['test','--json','--file=package.json']);assert.equal(cwd,SAMPLE);return fixture(1);}); assert.equal(called,true);assert.equal(result.code,1);
});
test('handover includes actual statuses and keeps missing scans explicit',()=>{
 const text=handoverText({disclosure:'AI-assisted',state:'PARTIALLY VERIFIED',verification:{checks:[{check:'real security scan',status:'BLOCKED',detail:'No authentication'}]},scans:[],exercises:[]});
 assert.match(text,/BLOCKED/);assert.match(text,/No real scanner execution recorded/);assert.match(text,/Hosted CI is NOT VERIFIED/);assert.match(text,/AI-assisted/);
});
test('handover preserves completed findings and observed exercise output',()=>{
 const text=handoverText({disclosure:'TEST FIXTURE',state:'PARTIALLY VERIFIED',verification:{checks:[]},scans:[{timestamp:'TEST',status:'ACTION REQUIRED',completed:true,reason:'Findings',findingCount:2}],exercises:[{cause:'Missing manifest',correctiveAction:'Restore manifest',failure:{stdout:'Missing package.json'},rerun:{code:0},status:'PASS'}]});assert.match(text,/findings=2/);assert.match(text,/Missing package.json/);assert.match(text,/Rerun exit: 0/);
});

test('missing repository files fail individual acceptance checks',()=>{
 const dir=temp();try{const checks=requiredChecks(dir);assert.ok(checks.every(c=>c.status==='FAIL'));writeFileSync(join(dir,'README.md'),'demo');assert.equal(requiredChecks(dir).find(c=>c.check==='README.md').status,'PASS');assert.equal(requiredChecks(dir).find(c=>c.check==='package.json').status,'FAIL');}finally{rmSync(dir,{recursive:true});}
});
test('only completed real scan for current sample can verify integration',()=>{
 const good={executed:true,completed:true,origin:'REAL ADAPTER',status:'PASS',projectHash:'current',exitCode:0,findingCount:0};assert.equal(scanVerified(good,'current'),true);for(const bad of [undefined,{...good,projectHash:'old'},{...good,completed:false},{...good,status:'FAIL'},{...good,origin:'TEST FIXTURE'}])assert.equal(scanVerified(bad,'current'),false);
});
test('Markdown and JSON report files preserve observed statuses and redact secrets',()=>{
 const dir=temp();try{const data={disclosure:'TEST FIXTURE',state:'PARTIALLY VERIFIED',verification:{checks:[{check:'test',status:'PASS'}]},scans:[],exercises:[],token:'do-not-save'};const result=writeHandover(data,dir);const json=JSON.parse(readFileSync(join(dir,result.json),'utf8'));const md=readFileSync(join(dir,result.markdown),'utf8');assert.equal(json.state,'PARTIALLY VERIFIED');assert.equal(json.token,'[REDACTED]');assert.match(md,/PARTIALLY VERIFIED/);assert.match(md,/test: \*\*PASS/);assert.ok(!JSON.stringify(json).includes('do-not-save'));}finally{rmSync(dir,{recursive:true});}
});

test('preflight distinguishes ready-to-attempt from verified authentication',()=>{
 const d=doctor(tool=>({code:0,stdout:tool==='node'?'v24.0.0':'1.0.0'}),{SNYK_TOKEN:'TEST-FIXTURE-ONLY'});assert.equal(d.state,'ready');assert.equal(d.checks.at(-1).status,'NOT VERIFIED');
});

test('package configuration rejects malformed and inconsistent lockfiles',()=>{
 assert.ok(packageChecks().every(c=>c.status==='PASS'));const dir=temp();try{writeFileSync(join(dir,'package.json'),JSON.stringify({name:'test',version:'1.0.0',dependencies:{a:'1.0.0'}}));writeFileSync(join(dir,'package-lock.json'),'{');assert.equal(packageChecks(dir)[0].status,'FAIL');writeFileSync(join(dir,'package-lock.json'),JSON.stringify({lockfileVersion:3,packages:{'':{name:'test',version:'1.0.0',dependencies:{a:'2.0.0'}}}}));assert.match(packageChecks(dir)[0].detail,/dependency mismatch/);}finally{rmSync(dir,{recursive:true});}
});

test('a clean scan never claims vulnerability remediation was performed',()=>{
 const cleanCheck=remediationCheck({findingCount:0},true);
 assert.equal(cleanCheck.status,'NOT VERIFIED');assert.match(cleanCheck.detail,/no remediation was required or performed/);
 for (const [last,current] of [[{findingCount:2},true],[undefined,false]]) assert.equal(remediationCheck(last,current).status,'NOT VERIFIED');
 const text=handoverText({disclosure:'TEST FIXTURE',state:'PARTIALLY VERIFIED',verification:{checks:[cleanCheck]},scans:[],exercises:[]});
 assert.match(text,/vulnerability remediation: \*\*NOT VERIFIED/);assert.ok(!text.includes('vulnerability remediation: **PASS**'));
});
test('scan verification requires execution and consistent scanner exit metadata',()=>{
 const cleanRecord={executed:true,completed:true,origin:'REAL ADAPTER',status:'PASS',projectHash:'current',exitCode:0,findingCount:0};
 for (const bad of [{...cleanRecord,executed:false},{...cleanRecord,executed:undefined},{...cleanRecord,exitCode:2},{...cleanRecord,exitCode:undefined},{...cleanRecord,findingCount:1}])assert.equal(scanVerified(bad,'current'),false);
 assert.equal(scanVerified({...cleanRecord,status:'ACTION REQUIRED',exitCode:1,findingCount:1},'current'),true);
});
