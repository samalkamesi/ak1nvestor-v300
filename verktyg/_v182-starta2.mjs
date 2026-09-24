// startare 2: föda modelltest2-noden detachat, avsluta direkt
import { spawn } from 'node:child_process';
const b = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_v182-modelltest2.mjs'], { detached: true, stdio: 'ignore' });
b.unref();
console.log('modelltest2-vakt född pid ' + b.pid);
