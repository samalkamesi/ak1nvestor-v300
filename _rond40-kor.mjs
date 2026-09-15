import { execSync } from 'node:child_process';
process.env.BEVIS = 'rutter GET 401 + POST 405 live på localhost (monterad+härdad), bygg 21:08 efter commit 2cf13fe5 20:57, 2cf13fe5 ancestor till prod HEAD 91a1a52b, prod HTTPS 200';
execSync('node _rond40-landa.mjs', { cwd: '/home/ak1a/agent/ak1', stdio: 'inherit', timeout: 540_000 });
