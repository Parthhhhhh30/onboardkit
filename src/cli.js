import { doctor, scan, verify, report, demo, record, redact } from './core.js';
const [command,...args] = process.argv.slice(2);
try {
  if (args.some(a=>a!=='--approve-service-use') || (args.length && !['scan','verify'].includes(command))) throw Error('Unsupported option');
  let result;
  switch(command) {
    case 'doctor': result=record('doctor',doctor()); break;
    case 'scan': result=scan(args.includes('--approve-service-use')); break;
    case 'verify': result=verify(args.includes('--approve-service-use')); break;
    case 'report': result=report(); break;
    case 'demo': result=demo(); break;
    default: throw Error('Usage: node src/cli.js doctor|scan|verify|report|demo [--approve-service-use (scan/verify only)]');
  }
  console.log(JSON.stringify(redact(result),null,2));
  // 0 complete, 1 findings/failures, 2 blocked/partial/not verified.
  process.exitCode = result.completed ? (result.findingCount ? 1 : 0) : result.status==='FAIL'||result.state==='FAIL'?1:['BLOCKED','PARTIALLY VERIFIED'].includes(result.status)||['blocked','action-required','PARTIALLY VERIFIED'].includes(result.state)?2:0;
} catch(e) { console.error(redact(e.message)); process.exitCode=1; }
