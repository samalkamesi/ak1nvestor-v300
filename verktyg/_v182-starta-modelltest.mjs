// startare: föder modelltest-noden detachat och avslutar OMEDELBART (studiofönstret får aldrig vänta)
import { spawn } from 'node:child_process';
const b = spawn('node', ['/home/ak1a/agent/ak1/verktyg/_v182-modelltest.mjs'], { detached: true, stdio: 'ignore' });
b.unref();
console.log('modelltest-vakt född pid ' + b.pid);
