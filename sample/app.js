import pc from 'picocolors';
import { pathToFileURL } from 'node:url';
export function onboardingChecklist(name) {
  if (typeof name !== 'string' || !name.trim() || name.length > 80) throw new TypeError('Name must contain 1–80 characters');
  return { project: name.trim(), steps: ['Confirm prerequisites', 'Configure scanner', 'Run verification', 'Deliver handover'] };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(pc.green(JSON.stringify(onboardingChecklist(process.argv[2] || 'Sample project'), null, 2)));
